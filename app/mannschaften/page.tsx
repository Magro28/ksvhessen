"use client";

import { useEffect, useState } from "react";
import { directusAsset, getPlayers, getStaff, getTeams, type DirectusPlayer, type DirectusStaff } from "../lib/directus";

const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "";
const siteHref = (path: string) => siteOrigin || (typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:3000" : "") ? `${siteOrigin || "http://localhost:3000"}${path}` : path;

const teams = ["1. Mannschaft", "Frauen", "U23", "Nachwuchs"];
const fallbackSquad: DirectusPlayer[] = [
  { id: 1, position: "Torhüter", name: "Jonas Weyand", number: 1, team: "1. Mannschaft" }, { id: 2, position: "Torhüter", name: "Nicolas Gröteke", number: 12, team: "1. Mannschaft" }, { id: 3, position: "Abwehr", name: "Frederic Brill", number: 3, team: "1. Mannschaft" }, { id: 4, position: "Abwehr", name: "Maurice Springfield", number: 5, team: "1. Mannschaft" },
  { id: 5, position: "Abwehr", name: "Tyron Duah", number: 15, team: "1. Mannschaft" }, { id: 6, position: "Abwehr", name: "Tobias Boche", number: 17, team: "1. Mannschaft" }, { id: 7, position: "Mittelfeld", name: "Yannick Stark", number: 8, team: "1. Mannschaft" }, { id: 8, position: "Mittelfeld", name: "Adrian Bravo Sanchez", number: 10, team: "1. Mannschaft" },
  { id: 9, position: "Mittelfeld", name: "Cornelius Bräunling", number: 21, team: "1. Mannschaft" }, { id: 10, position: "Sturm", name: "Nael Najjar", number: 11, team: "1. Mannschaft" }, { id: 11, position: "Sturm", name: "Phinees Bonianga", number: 19, team: "1. Mannschaft" }, { id: 12, position: "Sturm", name: "Joshua Kopf", number: 23, team: "1. Mannschaft" },
];
const positions = ["Torhüter", "Abwehr", "Mittelfeld", "Sturm"];
const fallbackTeamImages: Record<string, string> = {
  "1. Mannschaft": "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=2200&q=90",
  Frauen: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=2200&q=90",
  U23: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=2200&q=90",
  Nachwuchs: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=2200&q=90",
};
const fallbackStaff: DirectusStaff[] = [
  { id: 1, team: "1. Mannschaft", role: "Cheftrainer", name: "René Klingbeil", sort: 1, is_active: true },
  { id: 2, team: "1. Mannschaft", role: "Sportlicher Leiter", name: "Alban Meha", sort: 2, is_active: true },
  { id: 3, team: "1. Mannschaft", role: "Torwarttrainer", name: "Michael Voss", sort: 3, is_active: true },
];

export default function MannschaftenPage() {
  const [activeTeam, setActiveTeam] = useState(teams[0]);
  const [teamImages, setTeamImages] = useState(fallbackTeamImages);
  const [squad, setSquad] = useState(fallbackSquad);
  const [staff, setStaff] = useState(fallbackStaff);
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleSquad = squad.filter((player) => player.team === activeTeam);

  useEffect(() => {
    getTeams().then((items) => {
      if (items.length === 0) return;
      setTeamImages(Object.fromEntries(items.map((team) => [team.name, directusAsset(team.photo, team.photo_url ?? fallbackTeamImages[team.name]) ?? fallbackTeamImages[teams[0]]] )));
    });
    getPlayers().then((items) => {
      if (items.length === 0) return;
      setSquad(items);
    });
    getStaff().then((items) => {
      if (items.length > 0) setStaff(items.filter((person) => person.is_active !== false));
    });
  }, []);

  return (
    <main className="teams-page">
      <header className="site-header teams-page-header">
        <a className="brand" href="/" aria-label="KSV Hessen Kassel Startseite"><img className="brand-logo" src="/ksv-logo.svg" alt="KSV Hessen Kassel" /><span><b>KSV</b><small>HESSEN KASSEL</small></span></a>
        <nav className="desktop-nav" aria-label="Hauptnavigation"><a href={siteHref("/")}>Startseite</a><a href={siteHref("/#news")}>News</a><a className="active" href={siteHref("/mannschaften")}>Mannschaften</a><a href={siteHref("/#spiele")}>Spiele</a><a href={siteHref("/#verein")}>Verein</a><a href={siteHref("/sponsoren")}>Sponsoren</a></nav>
        <div className="header-actions"><a className="radio-pill" href="/#ticker"><span className="live-dot" /> Löwenradio</a><button className="menu-button" aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button></div>
      </header>
      {menuOpen && <div className="mobile-menu-overlay"><div className="mobile-menu-inner"><span className="section-kicker">Navigation</span><a href={siteHref("/")}>Startseite <span>↗</span></a><a href={siteHref("/spiele")}>Spiele & Tabelle <span>↗</span></a><a href={siteHref("/verein")}>Verein <span>↗</span></a><a href={siteHref("/sponsoren")}>Sponsoren <span>↗</span></a><button onClick={() => setMenuOpen(false)}>Menü schließen ×</button></div></div>}

      <section className="teams-hero"><div className="teams-hero-image" style={{ backgroundImage: `linear-gradient(90deg,rgba(13,16,18,.96) 0%,rgba(13,16,18,.7) 48%,rgba(13,16,18,.25)),url('${teamImages[activeTeam]}')` }} /><div className="shell teams-hero-content"><div className="team-tabs team-tabs-hero" role="tablist" aria-label="Mannschaften auswählen">{teams.map((team) => <button key={team} className={activeTeam === team ? "active" : ""} onClick={() => setActiveTeam(team)} role="tab" aria-selected={activeTeam === team}>{team}</button>)}</div><p className="eyebrow"><span className="live-dot" /> {activeTeam} · 2026/27</p><h1>{activeTeam === "1. Mannschaft" ? <>Unsere<br /><em>Löwen.</em></> : <>{activeTeam}<br /><em>im Fokus.</em></>}</h1><p>Vom Regionalliga-Team bis zum Nachwuchs: Hier findest du Kader, Staff und aktuelle Informationen.</p></div></section>

      <section className="squad-section"><div className="shell"><div className="squad-top"><div><div className="section-kicker">{activeTeam} · Kader</div><h2>Die <em>Löwen.</em></h2></div><div className="squad-meta"><span>Saison 2026/27</span><span>{visibleSquad.length} Spieler</span></div></div>{positions.map((position) => { const players = visibleSquad.filter((player) => player.position === position); return <div className="position-group" key={position}><div className="position-heading"><h3>{position}</h3><span>{players.length.toString().padStart(2, "0")}</span></div><div className="squad-grid">{players.map((player, index) => { const fallbackPhoto = `https://images.unsplash.com/photo-${index % 2 === 0 ? "1560272564-c83b66b1ad12" : "1540747913346-19e32dc3e97e"}?auto=format&fit=crop&w=700&q=82`; const photo = directusAsset(player.photo, player.photo_url ?? fallbackPhoto); return <a className="player-card" key={player.id} href={siteHref(`/spieler?id=${player.id}`)}><div className="player-photo" style={{ backgroundImage: `linear-gradient(160deg, rgba(211,19,53,.08), rgba(13,16,18,.76)), url('${photo}')` }}><span className="player-number">{String(player.number).padStart(2, "0")}</span><img src="/ksv-logo.svg" alt="" /></div><div className="player-info"><span>{player.position}</span><h3>{player.name}</h3><b>Profil ansehen <i>↗</i></b></div></a>})}</div></div>})}</div></section>

      <section className="staff-section"><div className="shell staff-layout"><div><div className="section-kicker">An der Seitenlinie</div><h2>Trainer &<br /><em>Staff.</em></h2></div><div className="staff-list">{staff.filter((person) => !person.team || person.team === activeTeam).map((person) => <div key={person.id}><span>{person.role}</span><strong>{person.name}</strong></div>)}</div></div></section>

      <footer className="footer"><div className="shell footer-top"><div className="brand footer-brand"><img className="brand-logo" src="/ksv-logo.svg" alt="" /><span><b>KSV</b><small>HESSEN KASSEL</small></span></div><div><span className="footer-label">Das Löwenrudel</span><h3>Dein Platz im Rudel.</h3></div><a className="button button-red" href="/#newsletter">Newsletter abonnieren <span>↗</span></a></div><div className="shell footer-bottom"><span>© 2026 KSV Hessen Kassel e.V.</span><span>Impressum · Datenschutz · Kontakt</span><span>Made for the Löwen <b>♥</b></span></div></footer>
    </main>
  );
}
