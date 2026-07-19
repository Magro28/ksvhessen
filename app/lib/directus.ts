const directusUrl = (process.env.NEXT_PUBLIC_DIRECTUS_URL ?? "http://localhost:8055").replace(/\/$/, "");

export type DirectusFile = {
  id: string;
  filename_download?: string;
};

export type DirectusNews = {
  id: number;
  title: string;
  excerpt?: string | null;
  category?: string | null;
  image_url?: string | null;
  image?: DirectusFile | null;
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

export function directusAsset(file: DirectusFile | string | null | undefined, fallback?: string) {
  const fileId = typeof file === "string" ? file : file?.id;
  return fileId ? `${directusUrl}/assets/${fileId}` : fallback;
}

export async function getPublishedNews(): Promise<DirectusNews[]> {
  try {
    const params = new URLSearchParams({
      "filter[is_published][_eq]": "true",
      fields: "*,image.*",
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
      fields: "*,image.*",
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

export function getStandings() {
  return getItems<DirectusStanding>("standings", new URLSearchParams({ limit: "-1" }));
}
