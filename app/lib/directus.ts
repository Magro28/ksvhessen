const directusUrl = (process.env.NEXT_PUBLIC_DIRECTUS_URL ?? "http://localhost:8055").replace(/\/$/, "");

export type DirectusFile = {
  id: string;
  filename_download?: string;
};

export type DirectusNews = {
  id: number;
  title: string;
  slug?: string | null;
  body?: string | null;
  excerpt?: string | null;
  category?: string | null;
  published_at?: string | null;
  image_url?: string | null;
  image?: DirectusFile | string | null;
  detail_image?: DirectusFile | string | null;
  created_on?: string;
};

export type DirectusMatch = {
  matchday: number;
  match_date: string;
  match_time?: string | null;
  venue?: string | null;
  home_team: string;
  away_team: string;
  home_score?: number | null;
  away_score?: number | null;
  status?: string | null;
};

export type DirectusTeam = {
  id: number;
  name: string;
  season?: string | null;
  photo_url?: string | null;
  photo?: DirectusFile | null;
  description?: string | null;
  sort?: number | null;
};

export type DirectusPlayer = {
  id: number;
  team: string;
  name: string;
  position: string;
  number: number;
  photo_url?: string | null;
  photo?: DirectusFile | null;
};

export type DirectusStaff = {
  id: number;
  team?: string | null;
  name: string;
  role: string;
  photo_url?: string | null;
  photo?: DirectusFile | string | null;
  bio?: string | null;
  sort?: number | null;
  is_active?: boolean;
};

export type DirectusClubPerson = {
  id: number;
  department: string;
  name: string;
  role: string;
  email?: string | null;
  phone?: string | null;
  sort?: number | null;
  is_active?: boolean;
};

export type DirectusSponsor = {
  id: number;
  name: string;
  tier?: string | null;
  logo_url?: string | null;
  logo?: DirectusFile | string | null;
  website?: string | null;
  industry?: string | null;
  address?: string | null;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  is_active?: boolean;
  sort?: number | null;
};

export type DirectusStanding = {
  rank: number;
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
};

export type DirectusFootballFixture = {
  api_fixture_id: number;
  league_id: number;
  season: number;
  matchday: number | null;
  round_label?: string | null;
  match_date: string;
  match_time?: string | null;
  venue?: string | null;
  home_team_id?: number | null;
  home_team: string;
  home_logo?: string | null;
  away_team_id?: number | null;
  away_team: string;
  away_logo?: string | null;
  home_score?: number | null;
  away_score?: number | null;
  status?: string | null;
  status_short?: string | null;
};

export type DirectusFootballStanding = {
  id?: number;
  league_id: number;
  season: number;
  rank: number;
  api_team_id: number;
  team_name: string;
  team_logo?: string | null;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_diff?: number | null;
  points: number;
  form?: string | null;
  description?: string | null;
  home_played?: number | null;
  home_wins?: number | null;
  home_draws?: number | null;
  home_losses?: number | null;
  home_goals_for?: number | null;
  home_goals_against?: number | null;
  away_played?: number | null;
  away_wins?: number | null;
  away_draws?: number | null;
  away_losses?: number | null;
  away_goals_for?: number | null;
  away_goals_against?: number | null;
};

export function currentFootballSeason(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Berlin", year: "numeric", month: "numeric" }).formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  return month >= 7 ? year : year - 1;
}

export function directusAsset(file: DirectusFile | string | null | undefined, fallback?: string) {
  const fileId = typeof file === "string" ? file : file?.id;
  return fileId ? `${directusUrl}/assets/${fileId}` : fallback;
}

export async function getPublishedNews(): Promise<DirectusNews[]> {
  try {
    const params = new URLSearchParams({
      "filter[is_published][_eq]": "true",
      fields: "*,image.*,detail_image.*",
      sort: "-published_at",
      limit: "3",
    });
    const response = await fetch(`${directusUrl}/items/news?${params.toString()}`);
    if (!response.ok) return [];
    const payload = (await response.json()) as { data?: DirectusNews[] };
    return payload.data ?? [];
  } catch {
    return [];
  }
}

export async function getHeroNews(): Promise<DirectusNews[]> {
  try {
    const params = new URLSearchParams({
      "filter[is_published][_eq]": "true",
      "filter[is_hero][_eq]": "true",
      fields: "*,image.*,detail_image.*",
      sort: "-published_at",
      limit: "5",
    });
    const response = await fetch(`${directusUrl}/items/news?${params.toString()}`);
    if (!response.ok) return [];
    const payload = (await response.json()) as { data?: DirectusNews[] };
    return payload.data ?? [];
  } catch {
    return [];
  }
}

export function getNewsItem(id: number) {
  return getItems<DirectusNews>("news", new URLSearchParams({ "filter[id][_eq]": String(id), fields: "*,image.*,detail_image.*", limit: "1" }));
}

async function getItems<T>(collection: string, params: URLSearchParams) {
  try {
    const response = await fetch(`${directusUrl}/items/${collection}?${params.toString()}`);
    if (!response.ok) return [] as T[];
    const payload = (await response.json()) as { data?: T[] };
    return payload.data ?? [];
  } catch {
    return [] as T[];
  }
}

export function getMatches() {
  return getItems<DirectusMatch>("matches", new URLSearchParams({ limit: "-1" }));
}

export function getTeams() {
  return getItems<DirectusTeam>("teams", new URLSearchParams({ limit: "-1" }));
}

export function getPlayers() {
  return getItems<DirectusPlayer>("players", new URLSearchParams({ limit: "-1" }));
}

export function getStaff() {
  return getItems<DirectusStaff>("staff", new URLSearchParams({ limit: "-1", sort: "sort" }));
}

export function getClubPeople() {
  return getItems<DirectusClubPerson>("club_people", new URLSearchParams({ limit: "-1", sort: "sort" }));
}

export function getPlayer(id: number) {
  return getItems<DirectusPlayer>("players", new URLSearchParams({ "filter[id][_eq]": String(id), "limit": "1" }));
}

export function getSponsors() {
  return getItems<DirectusSponsor>("sponsors", new URLSearchParams({ limit: "-1" }));
}

export function getStandings() {
  return getItems<DirectusStanding>("standings", new URLSearchParams({ limit: "-1" }));
}

export function getFootballFixtures() {
  return getItems<DirectusFootballFixture>("football_fixtures", new URLSearchParams({
    "filter[season][_eq]": String(currentFootballSeason()), sort: "matchday,match_date", limit: "-1",
  }));
}

export function getFootballStandings() {
  return getItems<DirectusFootballStanding>("football_standings", new URLSearchParams({
    "filter[season][_eq]": String(currentFootballSeason()), sort: "rank", limit: "-1",
  }));
}
