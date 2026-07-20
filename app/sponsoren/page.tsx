"use client";

import "../sponsoren.css";
import { useEffect, useMemo, useState } from "react";
import { directusAsset, getSponsors, type DirectusSponsor } from "../lib/directus";

const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "";
const siteHref = (path: string) => siteOrigin || (typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:3000" : "") ? `${siteOrigin || "http://localhost:3000"}${path}` : path;

const fallbackSponsors: DirectusSponsor[] = [
  { id: 1, name: "Volksbank Kassel Göttingen", tier: "Hauptpartner", industry: "Finanz- / Beratungsunternehmen", website: "https://www.volksbank-kassel-goettingen.de", is_active: true },
  { id: 2, name: "GWG Kassel", tier: "Premium-Partner", industry: "Bau / Immobilien", website: "https://www.gwg-kassel.de", is_active: true },
  { id: 3, name: "Kasseler Sparkasse", tier: "Business-Partner", industry: "Finanz- / Beratungsunternehmen", website: "https://www.kasseler-sparkasse.de", is_active: true },
];

const tierOrder = ["Hauptsponsor", "Trikot-Partner", "Platin-Partner", "Gold-Partner", "Premium-Partner", "Partner", "LED-Banden-Partner", "Löwenrudel"];

export default function SponsorenPage() {
  const [sponsors, setSponsors] = useState(fallbackSponsors);
  const [industry, setIndustry] = useState("Alle");
  const [tier, setTier] = useState("Alle");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    getSponsors().then((items) => {
      if (items.length > 0) setSponsors(items.filter((item) => item.is_active !== false));
    });
  }, []);

  const industries = useMemo(() => ["Alle", ...Array.from(new Set(sponsors.map((sponsor) => sponsor.industry).filter(Boolean) as string[])).sort()], [sponsors]);
  const tiers = useMemo(() => ["Alle", ...tierOrder.filter((name) => sponsors.some((sponsor) => sponsor.tier === name)), ...Array.from(new Set(sponsors.map((sponsor) => sponsor.tier).filter((name) => name && !tierOrder.includes(name)) as string[])).sort()], [sponsors]);
  const filteredSponsors = sponsors.filter((sponsor) => (industry === "Alle" || sponsor.industry === industry) && (tier === "Alle" || sponsor.tier === tier));
  const tierGroups = tiers.filter((name) => name !== "Alle").map((name) => ({ name, sponsors: filteredSponsors.filter((sponsor) => sponsor.tier === name) })).filter((group) => group.sponsors.length > 0);
  const renderSponsor = (sponsor: DirectusSponsor) => { const logo = directusAsset(sponsor.logo, sponsor.logo_url ?? ""); return <article className="directory-card" key={sponsor.id}><div className="directory-card-logo">{logo ? <img src={logo} alt={`${sponsor.name} Logo`} /> : <strong>{sponsor.name.split(" ").map((word) => word[0]).slice(0, 3).join("")}</strong>}</div><div className="directory-card-body"><span>{sponsor.tier ?? "Partner"}</span><h3>{sponsor.name}</h3>{sponsor.industry && <small>{sponsor.industry}</small>}{sponsor.address && <p>{sponsor.address}</p>}<div className="directory-card-links">{sponsor.website && <a href={sponsor.website} target="_blank" rel="noreferrer">Website ↗</a>}{sponsor.email && <a href={`mailto:${sponsor.email}`}>E-Mail ↗</a>}{sponsor.phone && <a href={`tel:${sponsor.phone}`}>{sponsor.phone}</a>}</div></div></article>; };

  return <main className="sponsors-page">
    <header className="site-header sponsors-page-header">
      <a className="brand" href={siteHref("/")} aria-label="KSV Hessen Kassel Startseite"><img className="brand-logo" src="/ksv-logo.svg" alt="KSV Hessen Kassel" /><span><b>KSV</b><small>HESSEN KASSEL</small></span></a>
      <nav className="desktop-nav" aria-label="Hauptnavigation"><a href={siteHref("/")}>Startseite</a><a href={siteHref("/#news")}>News</a><a href={siteHref("/mannschaften")}>Mannschaften</a><a href={siteHref("/spiele")}>Spiele</a><a href={siteHref("/verein")}>Verein</a><a className="active" href={siteHref("/sponsoren")}>Sponsoren</a></nav>
      <div className="header-actions"><a className="radio-pill" href={siteHref("/#ticker")}><span className="live-dot" /> Löwenradio</a><button className="menu-button" aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button></div>
    </header>
    {menuOpen && <div className="mobile-menu-overlay"><div className="mobile-menu-inner"><span className="section-kicker">Navigation</span><a href={siteHref("/")}>Startseite <span>↗</span></a><a href={siteHref("/mannschaften")}>Mannschaften <span>↗</span></a><a href={siteHref("/spiele")}>Spiele & Tabelle <span>↗</span></a><a href={siteHref("/verein")}>Verein <span>↗</span></a><a href={siteHref("/sponsoren")}>Sponsoren <span>↗</span></a><button onClick={() => setMenuOpen(false)}>Menü schließen ×</button></div></div>}

    <section className="sponsors-hero"><div className="sponsors-hero-mark">PARTNER<br /><em>DES KSV</em></div><div className="shell sponsors-hero-content"><p className="eyebrow"><span className="live-dot" /> Gemeinsam für die Löwen</p><h1>Unsere<br /><em>Partner.</em></h1><p>Ein Verein lebt von seinen Fans, Freunden, Gönnern und Partnern. Lernen Sie die Unternehmen kennen, die den KSV Hessen Kassel begleiten.</p><a className="button button-red" href="mailto:marketing@ksv-hessen.de">Partner werden <span>↗</span></a></div></section>

    <section className="sponsors-directory"><div className="shell"><div className="sponsors-directory-heading"><div><div className="section-kicker">Löwenfamilie</div><h2>Das Partner-<em>verzeichnis.</em></h2></div><p>{filteredSponsors.length} Partner</p></div><div className="sponsor-filters"><div><span>Branche</span><select value={industry} onChange={(event) => setIndustry(event.target.value)}>{industries.map((value) => <option key={value}>{value}</option>)}</select></div><div><span>Sponsoring-Level</span><select value={tier} onChange={(event) => setTier(event.target.value)}>{tiers.map((value) => <option key={value}>{value}</option>)}</select></div></div>{tierGroups.map((group) => <section className="sponsor-tier" key={group.name}><div className="sponsor-tier-heading"><h3>{group.name}</h3><span>{group.sponsors.length.toString().padStart(2, "0")}</span></div><div className="directory-grid">{group.sponsors.map(renderSponsor)}</div></section>)}</div></section>

    <section className="sponsors-contact"><div className="shell sponsors-contact-inner"><div><div className="section-kicker">Interesse an einer Partnerschaft?</div><h2>Gemeinsam mehr<br /><em>erreichen.</em></h2></div><div><p>Platzieren Sie Ihre Marke im emotionalen Umfeld des Fußballs und werden Sie Teil der Löwenfamilie.</p><a className="button button-light" href="mailto:marketing@ksv-hessen.de">Marketing kontaktieren <span>↗</span></a></div></div></section>
    <footer className="footer"><div className="shell footer-top"><div className="brand footer-brand"><img className="brand-logo" src="/ksv-logo.svg" alt="" /><span><b>KSV</b><small>HESSEN KASSEL</small></span></div><div><span className="footer-label">Gemeinsam für die Löwen</span><h3>Dein Platz im Rudel.</h3></div><a className="button button-red" href="mailto:marketing@ksv-hessen.de">Kontakt aufnehmen <span>↗</span></a></div><div className="shell footer-bottom"><span>© 2026 KSV Hessen Kassel e.V.</span><span>Impressum · Datenschutz · Kontakt</span><span>Made for the Löwen <b>♥</b></span></div></footer>
  </main>;
}
