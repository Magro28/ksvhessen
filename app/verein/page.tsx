"use client";

import { useState } from "react";

const areas = [
  ["Vorstand", "Daniel Bettermann", "Sponsoring · Marketing · Medien"],
  ["Vorstand", "Florian Beisheim", "Finanzen"],
  ["Vorstand", "Karsten Crede", "Organisation"],
  ["Aufsichtsrat", "Jens Lüdecke", "Vorsitz"],
  ["Sport", "René Klingbeil", "Cheftrainer"],
  ["Sport", "Michael Beier", "Nachwuchsleitung"],
];

const departments = ["Alle", "Vorstand", "Aufsichtsrat", "Sport"];

export default function VereinPage() {
  const [filter, setFilter] = useState("Alle");
  const [menuOpen, setMenuOpen] = useState(false);
  const people = filter === "Alle" ? areas : areas.filter(([department]) => department === filter);

  return (
    <main className="club-page">
      <header className="site-header club-page-header"><a className="brand" href="/" aria-label="KSV Hessen Kassel Startseite"><img className="brand-logo" src="/ksv-logo.svg" alt="KSV Hessen Kassel" /><span><b>KSV</b><small>HESSEN KASSEL</small></span></a><nav className="desktop-nav" aria-label="Hauptnavigation"><a href="/">Startseite</a><a href="/#news">News</a><a href="/mannschaften">Mannschaften</a><a href="/spiele">Spiele</a><a className="active" href="/verein">Verein</a></nav><div className="header-actions"><a className="radio-pill" href="/#ticker"><span className="live-dot" /> Löwenradio</a><button className="menu-button" aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button></div></header>
      {menuOpen && <div className="mobile-menu-overlay"><div className="mobile-menu-inner"><span className="section-kicker">Navigation</span><a href="/">Startseite <span>↗</span></a><a href="/mannschaften">Mannschaften <span>↗</span></a><a href="/spiele">Spiele & Tabelle <span>↗</span></a><button onClick={() => setMenuOpen(false)}>Menü schließen ×</button></div></div>}

      <section className="club-hero"><div className="club-hero-image" /><div className="shell club-hero-content"><p className="eyebrow"><span className="live-dot" /> Seit über 70 Jahren · Nordhessen</p><h1>Mehr als<br /><em>Fußball.</em></h1><p>Der KSV Hessen Kassel steht für Region, Zusammenhalt und die Leidenschaft, die unser Löwenrudel verbindet.</p></div><div className="club-hero-mark"><img src="/ksv-logo.svg" alt="" /></div></section>

      <section className="club-intro"><div className="shell club-intro-grid"><div><div className="section-kicker">Der Verein</div><h2>Gemeinsam sind<br /><em>wir stark.</em></h2></div><div className="club-copy"><p>Wir sind ein Traditionsverein aus Kassel. Unsere Mitglieder, Fans, Partner und Ehrenamtlichen bilden eine Gemeinschaft, die Fußball in der Region bewegt.</p><p>Wir stehen für bodenständigen, ehrlichen Fußball, starke Nachwuchsarbeit und den Anspruch, uns Schritt für Schritt weiterzuentwickeln.</p><a className="button button-red" href="#leitbild">Unser Leitbild <span>↗</span></a></div></div></section>

      <section className="club-people" id="gremien"><div className="shell"><div className="club-section-heading"><div><div className="section-kicker">Wer macht was?</div><h2>Das <em>Löwenrudel.</em></h2></div><div className="department-tabs">{departments.map((department) => <button key={department} className={filter === department ? "active" : ""} onClick={() => setFilter(department)}>{department}</button>)}</div></div><div className="people-grid">{people.map(([department, name, role]) => <article className="person-card" key={`${department}-${name}`}><span>{department}</span><h3>{name}</h3><p>{role}</p><b>Kontakt aufnehmen <i>↗</i></b></article>)}</div></div></section>

      <section className="club-office"><div className="shell office-grid"><div><div className="section-kicker">Anlaufstelle für Fans</div><h2>Die<br /><em>Geschäftsstelle.</em></h2><p>In Eppos Clubhaus, direkt in Stadionnähe.</p></div><div className="office-card"><div><span>Adresse</span><strong>KSV Hessen Kassel e.V.<br />Damaschkestraße 35<br />34121 Kassel</strong></div><div><span>Kontakt</span><strong>+49 (561) 25474<br />geschaeftsstelle@ksv-hessen.de</strong></div><div><span>Öffnungszeiten</span><strong>Di. & Do. · 10:00–13:00 Uhr<br /><small>Telefonisch: Di.–Fr. · 09:30–13:00 Uhr</small></strong></div><a className="button button-red" href="mailto:geschaeftsstelle@ksv-hessen.de">E-Mail schreiben <span>↗</span></a></div></div></section>

      <section className="club-values" id="leitbild"><div className="shell values-grid"><div><div className="section-kicker">Unser Leitbild</div><h2>Für die Region.<br /><em>Für die Löwen.</em></h2></div><div className="values-list"><div><b>01</b><span>Wir sind von hier.</span></div><div><b>02</b><span>Löwen geben niemals auf.</span></div><div><b>03</b><span>Unser Nachwuchs ist unsere Zukunft.</span></div><div><b>04</b><span>Gemeinsam sind wir stark.</span></div></div></div></section>

      <footer className="footer"><div className="shell footer-top"><div className="brand footer-brand"><img className="brand-logo" src="/ksv-logo.svg" alt="" /><span><b>KSV</b><small>HESSEN KASSEL</small></span></div><div><span className="footer-label">Das Löwenrudel</span><h3>Dein Platz im Rudel.</h3></div><a className="button button-red" href="/#newsletter">Newsletter abonnieren <span>↗</span></a></div><div className="shell footer-bottom"><span>© 2026 KSV Hessen Kassel e.V.</span><span>Impressum · Datenschutz · Kontakt</span><span>Made for the Löwen <b>♥</b></span></div></footer>
    </main>
  );
}
