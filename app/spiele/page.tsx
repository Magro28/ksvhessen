"use client";

import { useEffect, useState } from "react";
import { getMatches, getStandings } from "../lib/directus";

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

export default function SpielePage() {
  const [matches, setMatches] = useState(fallbackMatches);
  const [table, setTable] = useState(fallbackTable);
  const [view, setView] = useState<"spielplan" | "tabelle">("spielplan");
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    getMatches().then((items) => {
      if (items.length === 0) return;
      setMatches(items.map((match) => ({
        round: String(match.matchday), date: new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(match.match_date)), time: match.match_time ?? "14:00",
        home: match.home_team, away: match.away_team, venue: match.venue ?? "", state: match.status === "played" ? "played" : match.matchday === 1 ? "next" : "upcoming",
        score: match.home_score === null || match.home_score === undefined ? "— : —" : `${match.home_score} : ${match.away_score ?? 0}`,
      })));
    });
    getStandings().then((items) => {
      if (items.length > 0) setTable(items.map((row) => [String(row.rank), row.team, String(row.played), String(row.wins), String(row.draws), String(row.losses), `${row.goals_for}:${row.goals_against}`, String(row.points)]));
    });
  }, []);
  const currentMatchday = Math.max(0, matches.findIndex((match) => match.state === "next"));
  const [activeMatchday, setActiveMatchday] = useState(currentMatchday);
  const activeMatch = matches[activeMatchday];
  const carouselMatches = [-1, 0, 1].map((offset) => ({ ...matches[(activeMatchday + offset + matches.length) % matches.length], position: offset === 0 ? "current" : offset < 0 ? "previous" : "following" }));
  const pageStart = Math.floor(activeMatchday / 5) * 5;
  const pageMatches = matches.slice(pageStart, pageStart + 5);

  const renderMatchdayCard = (match: (typeof carouselMatches)[number]) => (
    <article className={`game-card ${match.position} ${match.state}`} key={`${match.position}-${match.round}`}>
      <div className="game-card-top"><span>{match.state === "played" ? "Ergebnis" : match.state === "next" ? "Nächstes Spiel" : "Spieltag"}</span><small>Spieltag {match.round.padStart(2, "0")}</small></div>
      <div className="game-card-date">{match.date} · {match.time} Uhr <span>{match.venue}</span></div>
      <div className="game-card-teams">
        <div className="game-card-team"><span className="game-card-badge">{match.home === "KSV Hessen Kassel" ? <img src="/ksv-logo.svg" alt="" /> : match.home.slice(0, 3).toUpperCase()}</span><strong>{match.home}</strong></div>
        <b className={match.state === "played" ? "score" : "vs"}>{match.score}</b>
        <div className="game-card-team"><span className="game-card-badge">{match.away === "KSV Hessen Kassel" ? <img src="/ksv-logo.svg" alt="" /> : match.away.slice(0, 3).toUpperCase()}</span><strong>{match.away}</strong></div>
      </div>
    </article>
  );

  return (
    <main className="fixtures-page">
      <header className="site-header fixtures-page-header"><a className="brand" href="/" aria-label="KSV Hessen Kassel Startseite"><img className="brand-logo" src="/ksv-logo.svg" alt="KSV Hessen Kassel" /><span><b>KSV</b><small>HESSEN KASSEL</small></span></a><nav className="desktop-nav" aria-label="Hauptnavigation"><a href="/">Startseite</a><a href="/#news">News</a><a href="/mannschaften">Mannschaften</a><a className="active" href="/spiele">Spiele</a><a href="/#verein">Verein</a></nav><div className="header-actions"><a className="radio-pill" href="/#ticker"><span className="live-dot" /> Löwenradio</a><button className="menu-button" aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button></div></header>
      {menuOpen && <div className="mobile-menu-overlay"><div className="mobile-menu-inner"><span className="section-kicker">Navigation</span><a href="/">Startseite <span>↗</span></a><a href="/mannschaften">Mannschaften <span>↗</span></a><a href="/verein">Verein <span>↗</span></a><button onClick={() => setMenuOpen(false)}>Menü schließen ×</button></div></div>}

      <section className="matchday-carousel" aria-label="Spieltag-Karussell"><div className="matchday-cards">{carouselMatches.map(renderMatchdayCard)}</div><div className="matchday-controls"><button aria-label="Vorheriger Spieltag" onClick={() => setActiveMatchday((activeMatchday - 1 + matches.length) % matches.length)}>←</button><div className="matchday-page-buttons">{pageMatches.map((match, index) => { const absoluteIndex = pageStart + index; return <button key={match.round} className={`${activeMatchday === absoluteIndex ? "active" : ""} ${match.state === "played" ? "played" : ""}`} aria-label={`Spieltag ${match.round}`} onClick={() => setActiveMatchday(absoluteIndex)}><span>{match.round.padStart(2, "0")}</span></button>; })}</div><span className="matchday-page-label">{String(pageStart + 1).padStart(2, "0")}–{String(Math.min(pageStart + 5, matches.length)).padStart(2, "0")} / 34</span><button aria-label="Nächster Spieltag" onClick={() => setActiveMatchday((activeMatchday + 1) % matches.length)}>→</button></div></section>

      <section className="fixtures-content"><div className="shell"><div className="fixtures-switcher" role="tablist" aria-label="Spiele oder Tabelle anzeigen"><button className={view === "spielplan" ? "active" : ""} onClick={() => setView("spielplan")} role="tab" aria-selected={view === "spielplan"}>Spielplan</button><button className={view === "tabelle" ? "active" : ""} onClick={() => setView("tabelle")} role="tab" aria-selected={view === "tabelle"}>Tabelle</button></div>{view === "spielplan" ? <div className="schedule-layout schedule-layout-single"><div className="schedule-main"><div className="fixtures-title"><div><div className="section-kicker">Saison 2026/27</div><h2>Der <em>Spielplan.</em></h2></div><span>Alle Termine & Ergebnisse</span></div><div className="schedule-list">{matches.map((match) => <article className={`schedule-card ${match.state}`} key={`${match.date}-${match.home}`}><div className="schedule-round">{match.round}<small>Spieltag</small></div><div className="schedule-date"><time>{match.date}</time><span>{match.time} Uhr · {match.venue}</span></div><div className="schedule-teams"><strong>{match.home}</strong><b>{match.score}</b><strong>{match.away}</strong></div><a href="#match" aria-label={`Details ${match.home} gegen ${match.away}`}>↗</a></article>)}</div></div></div> : <div className="standings"><div className="fixtures-title"><div><div className="section-kicker">Regionalliga Südwest</div><h2>Die <em>Tabelle.</em></h2></div><span>Stand: Saisonstart</span></div><div className="table-wrap"><table><thead><tr><th>#</th><th>Verein</th><th>Sp.</th><th>S</th><th>U</th><th>N</th><th>Torverhältnis</th><th>Pkt.</th></tr></thead><tbody>{table.map(([rank, team, games, wins, draws, losses, goals, points]) => <tr className={team === "Hessen Kassel" ? "highlight" : ""} key={team}><td>{rank}</td><td><span className="table-dot" />{team}</td><td>{games}</td><td>{wins}</td><td>{draws}</td><td>{losses}</td><td>{goals}</td><td><strong>{points}</strong></td></tr>)}</tbody></table></div></div>}</div></section>

      <footer className="footer"><div className="shell footer-top"><div className="brand footer-brand"><img className="brand-logo" src="/ksv-logo.svg" alt="" /><span><b>KSV</b><small>HESSEN KASSEL</small></span></div><div><span className="footer-label">Immer informiert</span><h3>Dein Platz im Rudel.</h3></div><a className="button button-red" href="/#newsletter">Newsletter abonnieren <span>↗</span></a></div><div className="shell footer-bottom"><span>© 2026 KSV Hessen Kassel e.V.</span><span>Impressum · Datenschutz · Kontakt</span><span>Made for the Löwen <b>♥</b></span></div></footer>
    </main>
  );
}
