const apiBase = "https://v3.football.api-sports.io";
const directusUrl = (process.env.DIRECTUS_URL || process.env.CMS_ORIGIN || "http://localhost:8055").replace(/\/$/, "");
const apiKey = process.env.API_FOOTBALL_KEY;
const leagueId = Number(process.env.API_FOOTBALL_LEAGUE_ID || 86);
if (!apiKey) throw new Error("API_FOOTBALL_KEY fehlt.");
if (!Number.isInteger(leagueId)) throw new Error("API_FOOTBALL_LEAGUE_ID ist ungültig.");

function currentSeason() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Berlin", year: "numeric", month: "numeric" }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year").value);
  const month = Number(parts.find((part) => part.type === "month").value);
  return month >= 7 ? year : year - 1;
}

let apiRequests = 0;
async function football(path) {
  apiRequests += 1;
  const response = await fetch(`${apiBase}${path}`, { headers: { "x-apisports-key": apiKey } });
  const payload = await response.json();
  if (!response.ok || payload.errors && Object.keys(payload.errors).length) throw new Error(`API-Football Fehler: ${JSON.stringify(payload.errors || payload)}`);
  return payload.response || [];
}

async function directus(path, options = {}, token) {
  const response = await fetch(`${directusUrl}${path}`, {
    ...options,
    headers: { "content-type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Directus Fehler ${response.status}: ${JSON.stringify(payload)}`);
  return payload;
}

async function login() {
  const payload = await directus("/auth/login", { method: "POST", body: JSON.stringify({ email: process.env.DIRECTUS_ADMIN_EMAIL, password: process.env.DIRECTUS_ADMIN_PASSWORD }) });
  return payload.data.access_token;
}

function roundNumber(label) {
  const match = String(label || "").match(/(?:-|\s)(\d+)\s*$/);
  return match ? Number(match[1]) : null;
}

function normalizeFixture(entry, season) {
  const fixture = entry.fixture || {};
  const home = entry.teams?.home || {};
  const away = entry.teams?.away || {};
  return {
    api_fixture_id: fixture.id,
    league_id: entry.league?.id || leagueId,
    season,
    matchday: roundNumber(entry.league?.round),
    round_label: entry.league?.round || null,
    match_date: fixture.date || null,
    match_time: fixture.date ? new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" }).format(new Date(fixture.date)) : null,
    venue: fixture.venue?.name || null,
    home_team_id: home.id || null,
    home_team: home.name || "",
    home_logo: home.logo || null,
    away_team_id: away.id || null,
    away_team: away.name || "",
    away_logo: away.logo || null,
    home_score: entry.goals?.home ?? null,
    away_score: entry.goals?.away ?? null,
    status: fixture.status?.long || null,
    status_short: fixture.status?.short || null,
  };
}

function normalizeStanding(entry, season) {
  const all = entry.all || {}, home = entry.home || {}, away = entry.away || {};
  return {
    league_id: leagueId, season, rank: entry.rank, api_team_id: entry.team?.id, team_name: entry.team?.name || "", team_logo: entry.team?.logo || null,
    played: all.played ?? 0, wins: all.win ?? 0, draws: all.draw ?? 0, losses: all.lose ?? 0,
    goals_for: all.goals?.for ?? 0, goals_against: all.goals?.against ?? 0, goal_diff: (all.goals?.for ?? 0) - (all.goals?.against ?? 0), points: entry.points ?? 0,
    form: entry.form || null, description: entry.description || null,
    home_played: home.played ?? null, home_wins: home.win ?? null, home_draws: home.draw ?? null, home_losses: home.lose ?? null,
    home_goals_for: home.goals?.for ?? null, home_goals_against: home.goals?.against ?? null,
    away_played: away.played ?? null, away_wins: away.win ?? null, away_draws: away.draw ?? null, away_losses: away.lose ?? null,
    away_goals_for: away.goals?.for ?? null, away_goals_against: away.goals?.against ?? null,
  };
}

async function replaceCollection(token, collection, season, rows) {
  await directus(`/items/${collection}?filter[season][_eq]=${season}`, { method: "DELETE" }, token);
  if (rows.length > 0) await directus(`/items/${collection}`, { method: "POST", body: JSON.stringify(rows) }, token);
}

const season = currentSeason();
console.log(`Synchronisiere Regionalliga Südwest, Saison ${season}/${String(season + 1).slice(-2)} ...`);
const [fixturesResponse, standingsResponse] = await Promise.all([
  football(`/fixtures?league=${leagueId}&season=${season}`),
  football(`/standings?league=${leagueId}&season=${season}`),
]);
const fixtures = fixturesResponse.map((entry) => normalizeFixture(entry, season)).filter((entry) => entry.api_fixture_id);
const standingsGroup = standingsResponse[0]?.league?.standings?.[0] || [];
const standings = standingsGroup.map((entry) => normalizeStanding(entry, season)).filter((entry) => entry.api_team_id);
if (!fixtures.length || !standings.length) throw new Error(`Keine vollständigen Daten erhalten (Spiele: ${fixtures.length}, Tabelle: ${standings.length}). Bestehende Daten bleiben erhalten.`);

const token = await login();
await replaceCollection(token, "football_fixtures", season, fixtures);
await replaceCollection(token, "football_standings", season, standings);
console.log(`Synchronisation abgeschlossen: ${fixtures.length} Spiele, ${standings.length} Tabellenzeilen, ${apiRequests} API-Football-Requests.`);
