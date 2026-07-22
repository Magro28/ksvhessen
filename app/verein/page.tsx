"use client";

import { useEffect, useState } from "react";
import { DirectusClubPerson, getClubPeople } from "../lib/directus";

const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "";
const siteHref = (path: string) => siteOrigin || (typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:3000" : "") ? `${siteOrigin || "http://localhost:3000"}${path}` : path;

const fallbackPeople: DirectusClubPerson[] = [
  { id: 1, department: "Vorstand", name: "Daniel Bettermann", role: "Sponsoring · Marketing · Medien", sort: 1 },
  { id: 2, department: "Vorstand", name: "Florian Beisheim", role: "Finanzen", sort: 2 },
  { id: 3, department: "Vorstand", name: "Karsten Crede", role: "Organisation", sort: 3 },
  { id: 4, department: "Aufsichtsrat", name: "Jens Lüdecke", role: "Vorsitz", sort: 4 },
  { id: 5, department: "Sport", name: "René Klingbeil", role: "Cheftrainer", sort: 5 },
  { id: 6, department: "Sport", name: "Michael Beier", role: "Nachwuchsleitung", sort: 6 },
];

export default function VereinPage() {
  const [filter, setFilter] = useState("Alle");
  const [menuOpen, setMenuOpen] = useState(false);
  const [clubPeople, setClubPeople] = useState<DirectusClubPerson[]>(fallbackPeople);
  const departments = ["Alle", ...Array.from(new Set(clubPeople.map((person) => person.department)))];
  const people = filter === "Alle" ? clubPeople : clubPeople.filter((person) => person.department === filter);

  useEffect(() => {
    getClubPeople().then((items) => {
      if (items.length > 0) setClubPeople(items.filter((person) => person.is_active !== false));
    });
  }, []);

  return (
    <main className="club-page">
      <header className="site-header club-page-header"><a className="brand" href={siteHref("/")} aria-label="KSV Hessen Kassel Startseite"><img className="brand-logo" src="/ksv-logo.svg" alt="KSV Hessen Kassel" /><span><b>KSV</b><small>HESSEN KASSEL</small></span></a><nav className="desktop-nav" aria-label="Hauptnavigation"><a href={siteHref("/")}>Startseite</a><a href={siteHref("/#news")}>News</a><a href={siteHref("/mannschaften")}>Mannschaften</a><a href={siteHref("/spiele")}>Spiele</a><a className="active" href={siteHref("/verein")}>Verein</a><a href={siteHref("/sponsoren")}>Sponsoren</a></nav><div className="header-actions"><a className="radio-pill" href={siteHref("/#ticker")}><span className="live-dot" /> Löwenradio</a><button className="menu-button" aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button></div></header>
      {menuOpen && <div className="mobile-menu-overlay"><div className="mobile-menu-inner"><span className="section-kicker">Navigation</span><a href={siteHref("/")}>Startseite <span>↗</span></a><a href={siteHref("/mannschaften")}>Mannschaften <span>↗</span></a><a href={siteHref("/spiele")}>Spiele & Tabelle <span>↗</span></a><a href={siteHref("/sponsoren")}>Sponsoren <span>↗</span></a><button onClick={() => setMenuOpen(false)}>Menü schließen ×</button></div></div>}

      <section className="club-hero"><div className="club-hero-image" /><div className="shell club-hero-content"><p className="eyebrow"><span className="live-dot" /> Seit über 70 Jahren · Nordhessen</p><h1>Mehr als<br /><em>Fußball.</em></h1><p>Der KSV Hessen Kassel steht für Region, Zusammenhalt und die Leidenschaft, die unser Löwenrudel verbindet.</p></div><div className="club-hero-mark"><img src="/ksv-logo.svg" alt="" /></div></section>

      <section className="club-intro"><div className="shell club-intro-grid"><div><div className="section-kicker">Der Verein</div><h2>Gemeinsam sind<br /><em>wir stark.</em></h2></div><div className="club-copy"><p>Wir sind ein Traditionsverein aus Kassel. Unsere Mitglieder, Fans, Partner und Ehrenamtlichen bilden eine Gemeinschaft, die Fußball in der Region bewegt.</p><p>Wir stehen für bodenständigen, ehrlichen Fußball, starke Nachwuchsarbeit und den Anspruch, uns Schritt für Schritt weiterzuentwickeln.</p><a className="button button-red" href="#leitbild">Unser Leitbild <span>↗</span></a></div></div></section>

      <section className="club-people" id="gremien"><div className="shell"><div className="club-section-heading"><div><div className="section-kicker">Wer macht was?</div><h2>Das <em>Löwenrudel.</em></h2></div><div className="department-tabs">{departments.map((department) => <button key={department} className={filter === department ? "active" : ""} onClick={() => setFilter(department)}>{department}</button>)}</div></div><div className="people-grid">{people.map((person) => <article className="person-card" key={`${person.department}-${person.name}`}><span>{person.department}</span><h3>{person.name}</h3><p>{person.role}</p>{person.email ? <a href={`mailto:${person.email}`}>Kontakt aufnehmen <i>↗</i></a> : <b>Kontakt aufnehmen <i>↗</i></b>}</article>)}</div></div></section>

      <section className="club-office"><div className="shell office-grid"><div><div className="section-kicker">Anlaufstelle für Fans</div><h2>Die<br /><em>Geschäftsstelle.</em></h2><p>In Eppos Clubhaus, direkt in Stadionnähe.</p></div><div className="office-card"><div><span>Adresse</span><strong>KSV Hessen Kassel e.V.<br />Damaschkestraße 35<br />34121 Kassel</strong></div><div><span>Kontakt</span><strong>+49 (561) 25474<br />geschaeftsstelle@ksv-hessen.de</strong></div><div><span>Öffnungszeiten</span><strong>Di. & Do. · 10:00–13:00 Uhr<br /><small>Telefonisch: Di.–Fr. · 09:30–13:00 Uhr</small></strong></div><a className="button button-red" href="mailto:geschaeftsstelle@ksv-hessen.de">E-Mail schreiben <span>↗</span></a></div></div></section>

      <section className="club-values" id="leitbild"><div className="shell values-grid"><div><div className="section-kicker">Unser Leitbild</div><h2>Für die Region.<br /><em>Für die Löwen.</em></h2></div><div className="values-list"><div><b>01</b><span>Wir sind von hier.</span></div><div><b>02</b><span>Löwen geben niemals auf.</span></div><div><b>03</b><span>Unser Nachwuchs ist unsere Zukunft.</span></div><div><b>04</b><span>Gemeinsam sind wir stark.</span></div></div></div></section>

      <footer className="footer"><div className="shell footer-top"><div className="brand footer-brand"><img className="brand-logo" src="/ksv-logo.svg" alt="" /><span><b>KSV</b><small>HESSEN KASSEL</small></span></div><div><span className="footer-label">Das Löwenrudel</span><h3>Dein Platz im Rudel.</h3></div><a className="button button-red" href="/#newsletter">Newsletter abonnieren <span>↗</span></a></div><div className="shell footer-bottom"><span>© 2026 KSV Hessen Kassel e.V.</span><span>Impressum · Datenschutz · Kontakt</span><span>Made for the Löwen <b>♥</b></span></div></footer>
    </main>
  );
}
