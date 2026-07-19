"use client";

import { useState } from "react";

const teams = ["1. Mannschaft", "Frauen", "U23", "Nachwuchs"];
const squad = [
  ["Torhüter", "Jonas Weyand", "01"], ["Torhüter", "Nicolas Gröteke", "12"], ["Abwehr", "Frederic Brill", "03"], ["Abwehr", "Maurice Springfield", "05"],
  ["Abwehr", "Tyron Duah", "15"], ["Abwehr", "Tobias Boche", "17"], ["Mittelfeld", "Yannick Stark", "08"], ["Mittelfeld", "Adrian Bravo Sanchez", "10"],
  ["Mittelfeld", "Cornelius Bräunling", "21"], ["Sturm", "Nael Najjar", "11"], ["Sturm", "Phinees Bonianga", "19"], ["Sturm", "Joshua Kopf", "23"],
];
const positions = ["Torhüter", "Abwehr", "Mittelfeld", "Sturm"];
const teamImages: Record<string, string> = {
  "1. Mannschaft": "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=2200&q=90",
  Frauen: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=2200&q=90",
  U23: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=2200&q=90",
  Nachwuchs: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=2200&q=90",
};

export default function MannschaftenPage() {
  const [activeTeam, setActiveTeam] = useState(teams[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleSquad = activeTeam === teams[0] ? squad : squad.slice(0, 6);

  return (
    <main className="teams-page">
      <header className="site-header teams-page-header">
        <a className="brand" href="/" aria-label="KSV Hessen Kassel Startseite"><img className="brand-logo" src="/ksv-logo.svg" alt="KSV Hessen Kassel" /><span><b>KSV</b><small>HESSEN KASSEL</small></span></a>
        <nav className="desktop-nav" aria-label="Hauptnavigation"><a href="/">Startseite</a><a href="/#news">News</a><a className="active" href="/mannschaften">Mannschaften</a><a href="/#spiele">Spiele</a><a href="/#verein">Verein</a></nav>
        <div className="header-actions"><a className="radio-pill" href="/#ticker"><span className="live-dot" /> Löwenradio</a><button className="menu-button" aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button></div>
      </header>
      {menuOpen && <div className="mobile-menu-overlay"><div className="mobile-menu-inner"><span className="section-kicker">Navigation</span><a href="/">Startseite <span>↗</span></a><a href="/spiele">Spiele & Tabelle <span>↗</span></a><a href="/verein">Verein <span>↗</span></a><button onClick={() => setMenuOpen(false)}>Menü schließen ×</button></div></div>}

      <section className="teams-hero"><div className="teams-hero-image" style={{ backgroundImage: `linear-gradient(90deg,rgba(13,16,18,.96) 0%,rgba(13,16,18,.7) 48%,rgba(13,16,18,.25)),url('${teamImages[activeTeam]}')` }} /><div className="shell teams-hero-content"><div className="team-tabs team-tabs-hero" role="tablist" aria-label="Mannschaften auswählen">{teams.map((team) => <button key={team} className={activeTeam === team ? "active" : ""} onClick={() => setActiveTeam(team)} role="tab" aria-selected={activeTeam === team}>{team}</button>)}</div><p className="eyebrow"><span className="live-dot" /> {activeTeam} · 2026/27</p><h1>{activeTeam === "1. Mannschaft" ? <>Unsere<br /><em>Löwen.</em></> : <>{activeTeam}<br /><em>im Fokus.</em></>}</h1><p>Vom Regionalliga-Team bis zum Nachwuchs: Hier findest du Kader, Staff und aktuelle Informationen.</p></div></section>

      <section className="squad-section"><div className="shell"><div className="squad-top"><div><div className="section-kicker">{activeTeam} · Kader</div><h2>Die <em>Löwen.</em></h2></div><div className="squad-meta"><span>Saison 2026/27</span><span>{visibleSquad.length} Spieler</span></div></div>{positions.map((position) => { const players = visibleSquad.filter(([playerPosition]) => playerPosition === position); return <div className="position-group" key={position}><div className="position-heading"><h3>{position}</h3><span>{players.length.toString().padStart(2, "0")}</span></div><div className="squad-grid">{players.map(([playerPosition, name, number], index) => <article className="player-card" key={name}><div className="player-photo" style={{ backgroundImage: `linear-gradient(160deg, rgba(211,19,53,.08), rgba(13,16,18,.76)), url('https://images.unsplash.com/photo-${index % 2 === 0 ? "1560272564-c83b66b1ad12" : "1540747913346-19e32dc3e97e"}?auto=format&fit=crop&w=700&q=82)` }}><span className="player-number">{number}</span><img src="/ksv-logo.svg" alt="" /></div><div className="player-info"><span>{playerPosition}</span><h3>{name}</h3><b>Profil ansehen <i>↗</i></b></div></article>)}</div></div>})}</div></section>

      <section className="staff-section"><div className="shell staff-layout"><div><div className="section-kicker">An der Seitenlinie</div><h2>Trainer &<br /><em>Staff.</em></h2></div><div className="staff-list"><div><span>Cheftrainer</span><strong>René Klingbeil</strong></div><div><span>Sportlicher Leiter</span><strong>Alban Meha</strong></div><div><span>Torwarttrainer</span><strong>Michael Voss</strong></div></div></div></section>

      <footer className="footer"><div className="shell footer-top"><div className="brand footer-brand"><img className="brand-logo" src="/ksv-logo.svg" alt="" /><span><b>KSV</b><small>HESSEN KASSEL</small></span></div><div><span className="footer-label">Das Löwenrudel</span><h3>Dein Platz im Rudel.</h3></div><a className="button button-red" href="/#newsletter">Newsletter abonnieren <span>↗</span></a></div><div className="shell footer-bottom"><span>© 2026 KSV Hessen Kassel e.V.</span><span>Impressum · Datenschutz · Kontakt</span><span>Made for the Löwen <b>♥</b></span></div></footer>
    </main>
  );
}
