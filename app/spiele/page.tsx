"use client";

import { useEffect, useState } from "react";
import { currentFootballSeason, getFootballFixtures, getFootballStandings, type DirectusFootballStanding } from "../lib/directus";

const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "";
const siteHref = (path: string) => siteOrigin || (typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:3000" : "") ? `${siteOrigin || "http://localhost:3000"}${path}` : path;

const opponents = ["Eintracht Frankfurt II", "TSV Steinbach-Haiger", "SG Barockstadt", "FC Homburg", "FSV Frankfurt", "SV Eintracht Trier", "SG Sonnenhof Großaspach", "Kickers Offenbach", "FC Gießen", "Hessen Dreieich", "TSG Balingen", "Bahlinger SC", "Schott Mainz", "Stuttgarter Kickers", "Freiberg", "Wormatia Worms", "TuS Koblenz"];
const resultScores = ["2 : 1", "1 : 2", "3 : 1", "0 : 0"];
const formatMatchDate = (round: number) => {
  const date = new Date(2026, 6, 25 + (round - 1) * 7);
  return `Sa. ${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
};
const fallbackMatches = Array.from({ length: 34 }, (_, index) => {
  const round = index + 1;
  const secondHalf = round > 17;
  const opponent = opponents[index % opponents.length];
  const ksvHome = secondHalf ? round % 2 === 0 : round % 2 === 1;
  const played = round <= 4;
  return {
    round: String(round), date: formatMatchDate(round), time: "14:00",
    home: ksvHome ? "KSV Hessen Kassel" : opponent,
    away: ksvHome ? opponent : "KSV Hessen Kassel",
    venue: ksvHome ? "Auestadion" : "Stadion am Bieberer Berg",
    state: played ? "played" : round === 5 ? "next" : "upcoming",
    score: played ? resultScores[index % resultScores.length] : "— : —",
  };
});

const results = [
  { date: "16.05.2026", home: "Kickers Offenbach", away: "KSV Hessen Kassel", score: "1 : 3", result: "win" },
  { date: "09.05.2026", home: "KSV Hessen Kassel", away: "TSV Steinbach-Haiger", score: "2 : 1", result: "win" },
  { date: "02.05.2026", home: "SV Eintracht Trier", away: "KSV Hessen Kassel", score: "0 : 2", result: "win" },
];

const fallbackTable = [
  ["1", "SG Sonnenhof Großaspach", "34", "20", "8", "6", "61:32", "68"], ["2", "Hessen Kassel", "34", "17", "7", "10", "53:39", "58"], ["3", "FC Homburg", "34", "16", "8", "10", "49:36", "56"],
  ["4", "FSV Frankfurt", "34", "15", "9", "10", "48:38", "54"], ["5", "TSV Steinbach-Haiger", "34", "14", "9", "11", "45:37", "51"], ["6", "Eintracht Frankfurt II", "34", "13", "10", "11", "52:44", "49"],
  ["7", "SV Eintracht Trier", "34", "13", "8", "13", "42:40", "47"], ["8", "SG Barockstadt", "34", "12", "8", "14", "39:42", "44"],
];

type TableRow = Pick<DirectusFootballStanding, "rank" | "team_name" | "played" | "wins" | "draws" | "losses" | "goals_for" | "goals_against" | "goal_diff" | "points"> & Partial<DirectusFootballStanding>;
const fallbackTableRows: TableRow[] = fallbackTable.map(([rank, team, played, wins, draws, losses, goals, points]) => {
  const [goalsFor, goalsAgainst] = goals.split(":").map(Number);
  return { rank: Number(rank), team_name: team, played: Number(played), wins: Number(wins), draws: Number(draws), losses: Number(losses), goals_for: goalsFor, goals_against: goalsAgainst, goal_diff: goalsFor - goalsAgainst, points: Number(points), form: "—" };
});

export default function SpielePage() {
  const [matches, setMatches] = useState(fallbackMatches);
  const [table, setTable] = useState<TableRow[]>(fallbackTableRows);
  const [view, setView] = useState<"spielplan" | "tabelle">("spielplan");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMatchday, setActiveMatchday] = useState(0);
  useEffect(() => {
    getFootballFixtures().then((items) => {
      if (items.length === 0) return;
      const finished = new Set(["FT", "AET", "PEN"]);
      const mapped = items.map((match) => ({
        round: String(match.matchday ?? 0), date: new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(match.match_date)), time: match.match_time ?? "14:00",
        home: match.home_team, away: match.away_team, homeLogo: match.home_logo, awayLogo: match.away_logo, venue: match.venue ?? "", status: match.status_short,
        state: finished.has(match.status_short ?? "") || match.home_score !== null && match.home_score !== undefined ? "played" : "upcoming",
        score: match.home_score === null || match.home_score === undefined ? "— : —" : `${match.home_score} : ${match.away_score ?? 0}`,
      }));
      const next = mapped.findIndex((match) => match.state !== "played");
      if (next >= 0) mapped[next].state = "next";
      setMatches(mapped);
      setActiveMatchday(Math.max(0, next));
    });
    getFootballStandings().then((items) => {
      if (items.length > 0) setTable(items);
    });
  }, []);
  const activeMatch = matches[activeMatchday];
  const carouselMatches = [-1, 0, 1].map((offset) => ({ ...matches[(activeMatchday + offset + matches.length) % matches.length], position: offset === 0 ? "current" : offset < 0 ? "previous" : "following" }));
  const pageStart = Math.floor(activeMatchday / 5) * 5;
  const pageMatches = matches.slice(pageStart, pageStart + 5);

  const renderMatchdayCard = (match: (typeof carouselMatches)[number]) => (
    <article className={`game-card ${match.position} ${match.state}`} key={`${match.position}-${match.round}`}>
      <div className="game-card-top"><span>{match.state === "played" ? "Ergebnis" : match.state === "next" ? "Nächstes Spiel" : "Spieltag"}</span><small>Spieltag {match.round.padStart(2, "0")}</small></div>
      <div className="game-card-date">{match.date} · {match.time} Uhr <span>{match.venue}</span></div>
        <div className="game-card-teams">
        <div className="game-card-team"><span className="game-card-badge">{match.homeLogo ? <img src={match.homeLogo} alt="" /> : match.home === "KSV Hessen Kassel" ? <img src="/ksv-logo.svg" alt="" /> : match.home.slice(0, 3).toUpperCase()}</span><strong>{match.home}</strong></div>
        <b className={match.state === "played" ? "score" : "vs"}>{match.score}</b>
        <div className="game-card-team"><span className="game-card-badge">{match.awayLogo ? <img src={match.awayLogo} alt="" /> : match.away === "KSV Hessen Kassel" ? <img src="/ksv-logo.svg" alt="" /> : match.away.slice(0, 3).toUpperCase()}</span><strong>{match.away}</strong></div>
      </div>
    </article>
  );

  return (
    <main className="fixtures-page">
      <header className="site-header fixtures-page-header"><a className="brand" href={siteHref("/")} aria-label="KSV Hessen Kassel Startseite"><img className="brand-logo" src="/ksv-logo.svg" alt="KSV Hessen Kassel" /><span><b>KSV</b><small>HESSEN KASSEL</small></span></a><nav className="desktop-nav" aria-label="Hauptnavigation"><a href={siteHref("/")}>Startseite</a><a href={siteHref("/#news")}>News</a><a href={siteHref("/mannschaften")}>Mannschaften</a><a className="active" href={siteHref("/spiele")}>Spiele</a><a href={siteHref("/#verein")}>Verein</a><a href={siteHref("/sponsoren")}>Sponsoren</a></nav><div className="header-actions"><a className="radio-pill" href={siteHref("/#ticker")}><span className="live-dot" /> Löwenradio</a><button className="menu-button" aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button></div></header>
      {menuOpen && <div className="mobile-menu-overlay"><div className="mobile-menu-inner"><span className="section-kicker">Navigation</span><a href={siteHref("/")}>Startseite <span>↗</span></a><a href={siteHref("/mannschaften")}>Mannschaften <span>↗</span></a><a href={siteHref("/verein")}>Verein <span>↗</span></a><a href={siteHref("/sponsoren")}>Sponsoren <span>↗</span></a><button onClick={() => setMenuOpen(false)}>Menü schließen ×</button></div></div>}

      <section className="matchday-carousel" aria-label="Spieltag-Karussell"><div className="matchday-cards">{carouselMatches.map(renderMatchdayCard)}</div><div className="matchday-controls"><button aria-label="Vorheriger Spieltag" onClick={() => setActiveMatchday((activeMatchday - 1 + matches.length) % matches.length)}>←</button><div className="matchday-page-buttons">{pageMatches.map((match, index) => { const absoluteIndex = pageStart + index; return <button key={match.round} className={`${activeMatchday === absoluteIndex ? "active" : ""} ${match.state === "played" ? "played" : ""}`} aria-label={`Spieltag ${match.round}`} onClick={() => setActiveMatchday(absoluteIndex)}><span>{match.round.padStart(2, "0")}</span></button>; })}</div><span className="matchday-page-label">{String(pageStart + 1).padStart(2, "0")}–{String(Math.min(pageStart + 5, matches.length)).padStart(2, "0")} / 34</span><button aria-label="Nächster Spieltag" onClick={() => setActiveMatchday((activeMatchday + 1) % matches.length)}>→</button></div></section>

      <section className="fixtures-content"><div className="shell"><div className="fixtures-switcher" role="tablist" aria-label="Spiele oder Tabelle anzeigen"><button className={view === "spielplan" ? "active" : ""} onClick={() => setView("spielplan")} role="tab" aria-selected={view === "spielplan"}>Spielplan</button><button className={view === "tabelle" ? "active" : ""} onClick={() => setView("tabelle")} role="tab" aria-selected={view === "tabelle"}>Tabelle</button></div>{view === "spielplan" ? <div className="schedule-layout schedule-layout-single"><div className="schedule-main"><div className="fixtures-title"><div><div className="section-kicker">Saison {currentFootballSeason()}/{String(currentFootballSeason() + 1).slice(-2)}</div><h2>Der <em>Spielplan.</em></h2></div><span>Alle Termine & Ergebnisse</span></div><div className="schedule-list">{matches.map((match) => <article className={`schedule-card ${match.state}`} key={`${match.date}-${match.home}`}><div className="schedule-round">{match.round}<small>Spieltag</small></div><div className="schedule-date"><time>{match.date}</time><span>{match.time} Uhr · {match.venue}</span></div><div className="schedule-teams"><strong>{match.home}</strong><b>{match.score}</b><strong>{match.away}</strong></div><a href="#match" aria-label={`Details ${match.home} gegen ${match.away}`}>↗</a></article>)}</div></div></div> : <div className="standings"><div className="fixtures-title"><div><div className="section-kicker">Regionalliga Südwest</div><h2>Die <em>Tabelle.</em></h2></div><span>Automatisch synchronisiert</span></div><div className="table-wrap"><table><thead><tr><th>#</th><th>Verein</th><th>Sp.</th><th>S</th><th>U</th><th>N</th><th>Tore</th><th>Gegentore</th><th>Diff.</th><th>Pkt.</th><th>Form</th><th>Heim Sp.</th><th>Heim S</th><th>Heim U</th><th>Heim N</th><th>Heim Tore</th><th>Heim GT</th><th>Ausw. Sp.</th><th>Ausw. S</th><th>Ausw. U</th><th>Ausw. N</th><th>Ausw. Tore</th><th>Ausw. GT</th><th>Beschreibung</th></tr></thead><tbody>{table.map((row) => <tr className={row.team_name.includes("Kassel") ? "highlight" : ""} key={row.api_team_id}><td>{row.rank}</td><td><span className="table-dot" />{row.team_name}</td><td>{row.played}</td><td>{row.wins}</td><td>{row.draws}</td><td>{row.losses}</td><td>{row.goals_for}</td><td>{row.goals_against}</td><td>{row.goal_diff ?? row.goals_for - row.goals_against}</td><td><strong>{row.points}</strong></td><td>{row.form || "—"}</td><td>{row.home_played ?? "—"}</td><td>{row.home_wins ?? "—"}</td><td>{row.home_draws ?? "—"}</td><td>{row.home_losses ?? "—"}</td><td>{row.home_goals_for ?? "—"}</td><td>{row.home_goals_against ?? "—"}</td><td>{row.away_played ?? "—"}</td><td>{row.away_wins ?? "—"}</td><td>{row.away_draws ?? "—"}</td><td>{row.away_losses ?? "—"}</td><td>{row.away_goals_for ?? "—"}</td><td>{row.away_goals_against ?? "—"}</td><td>{row.description || "—"}</td></tr>)}</tbody></table></div></div>}</div></section>

      <footer className="footer"><div className="shell footer-top"><div className="brand footer-brand"><img className="brand-logo" src="/ksv-logo.svg" alt="" /><span><b>KSV</b><small>HESSEN KASSEL</small></span></div><div><span className="footer-label">Immer informiert</span><h3>Dein Platz im Rudel.</h3></div><a className="button button-red" href="/#newsletter">Newsletter abonnieren <span>↗</span></a></div><div className="shell footer-bottom"><span>© 2026 KSV Hessen Kassel e.V.</span><span>Impressum · Datenschutz · Kontakt</span><span>Made for the Löwen <b>♥</b></span></div></footer>
    </main>
  );
}
