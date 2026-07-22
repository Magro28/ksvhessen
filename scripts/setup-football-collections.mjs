const directusUrl = (process.env.DIRECTUS_URL || process.env.CMS_ORIGIN || "http://localhost:8055").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${directusUrl}${path}`, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${options.method || "GET"} ${path} failed (${response.status}): ${JSON.stringify(payload)}`);
  return payload;
}

async function login() {
  const payload = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: process.env.DIRECTUS_ADMIN_EMAIL, password: process.env.DIRECTUS_ADMIN_PASSWORD }),
  });
  return payload.data.access_token;
}

const collections = [
  {
    name: "football_fixtures",
    note: "Automatisch synchronisierte Regionalliga-Südwest-Spiele aus API-Football",
    fields: [
      ["api_fixture_id", "integer", true], ["league_id", "integer", true], ["season", "integer", true], ["matchday", "integer", true],
      ["round_label", "string", false], ["match_date", "timestamp", true], ["match_time", "string", false], ["venue", "string", false],
      ["home_team_id", "integer", false], ["home_team", "string", false], ["home_logo", "string", false],
      ["away_team_id", "integer", false], ["away_team", "string", false], ["away_logo", "string", false],
      ["home_score", "integer", false], ["away_score", "integer", false], ["status", "string", false], ["status_short", "string", false],
    ],
  },
  {
    name: "football_standings",
    note: "Automatisch synchronisierte Regionalliga-Südwest-Tabelle aus API-Football",
    fields: [
      ["league_id", "integer", true], ["season", "integer", true], ["rank", "integer", true], ["api_team_id", "integer", true],
      ["team_name", "string", true], ["team_logo", "string", false], ["played", "integer", true], ["wins", "integer", true],
      ["draws", "integer", true], ["losses", "integer", true], ["goals_for", "integer", true], ["goals_against", "integer", true],
      ["goal_diff", "integer", false], ["points", "integer", true], ["form", "string", false], ["description", "string", false],
      ["home_played", "integer", false], ["home_wins", "integer", false], ["home_draws", "integer", false], ["home_losses", "integer", false],
      ["home_goals_for", "integer", false], ["home_goals_against", "integer", false], ["away_played", "integer", false], ["away_wins", "integer", false],
      ["away_draws", "integer", false], ["away_losses", "integer", false], ["away_goals_for", "integer", false], ["away_goals_against", "integer", false],
    ],
  },
];

function fieldSchema(type, required) {
  const schema = { is_nullable: !required };
  if (type === "string") { schema.data_type = "character varying"; schema.max_length = 255; }
  if (type === "integer") schema.data_type = "integer";
  if (type === "timestamp") schema.data_type = "timestamp with time zone";
  return schema;
}

async function ensureCollection(token, definition) {
  const headers = { Authorization: `Bearer ${token}` };
  const collectionsResponse = await request("/collections?fields=collection&limit=-1", { headers });
  const exists = (collectionsResponse.data || []).some((collection) => collection.collection === definition.name);
  if (!exists) {
    await request("/collections", { method: "POST", headers, body: JSON.stringify({
      collection: definition.name,
      meta: { icon: "sports_soccer", note: definition.note, hidden: false },
      schema: { name: definition.name },
    }) });
    console.log(`Collection angelegt: ${definition.name}`);
  } else console.log(`Collection vorhanden: ${definition.name}`);

  const fieldsResponse = await request(`/fields/${definition.name}?limit=-1`, { headers });
  const existingFields = new Set((fieldsResponse.data || []).map((field) => field.field));
  for (const [field, type, required] of definition.fields) {
    if (!existingFields.has(field)) {
      await request(`/fields/${definition.name}`, { method: "POST", headers, body: JSON.stringify({
        field, type, schema: fieldSchema(type, required), meta: { required, width: "half" },
      }) });
      console.log(`  Feld angelegt: ${definition.name}.${field}`);
    }
  }
}

async function ensurePublicRead(token, collection) {
  const headers = { Authorization: `Bearer ${token}` };
  const policies = await request("/policies?limit=-1", { headers });
  const publicPolicy = (policies.data || []).find((policy) => policy.name === "$t:public_label" || policy.name === "Public");
  if (!publicPolicy) throw new Error("Public-Policy in Directus nicht gefunden.");
  const existing = await request(`/permissions?filter[collection][_eq]=${collection}&filter[action][_eq]=read&limit=100`, { headers });
  const alreadyPublic = (existing.data || []).some((permission) => permission.policy === publicPolicy.id);
  if (!alreadyPublic) {
    await request("/permissions", { method: "POST", headers, body: JSON.stringify({ policy: publicPolicy.id, collection, action: "read", fields: "*" }) });
    console.log(`  Öffentlicher Lesezugriff aktiviert: ${collection}`);
  }
}

const token = await login();
for (const collection of collections) {
  await ensureCollection(token, collection);
  await ensurePublicRead(token, collection.name);
}
console.log("Football-Collections sind bereit.");
