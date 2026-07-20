"use client";

import "../spieler.css";
import { useEffect, useState } from "react";
import { directusAsset, getPlayer, type DirectusPlayer } from "../lib/directus";

const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "";
const siteHref = (path: string) => siteOrigin || (typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:3000" : "") ? `${siteOrigin || "http://localhost:3000"}${path}` : path;
const fallbackPhoto = "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=1200&q=86";

export default function SpielerPage() {
  const [player, setPlayer] = useState<DirectusPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const id = Number(new URLSearchParams(window.location.search).get("id"));
    if (!Number.isInteger(id) || id < 1) {
      setLoading(false);
      return;
    }
    getPlayer(id).then((items) => setPlayer(items[0] ?? null)).finally(() => setLoading(false));
  }, []);

  const photo = player ? directusAsset(player.photo, player.photo_url ?? fallbackPhoto) : fallbackPhoto;

  return <main className="player-detail-page">
    <header className="site-header player-detail-header">
      <a className="brand" href={siteHref("/")} aria-label="KSV Hessen Kassel Startseite"><img className="brand-logo" src="/ksv-logo.svg" alt="KSV Hessen Kassel" /><span><b>KSV</b><small>HESSEN KASSEL</small></span></a>
      <nav className="desktop-nav" aria-label="Hauptnavigation"><a href={siteHref("/")}>Startseite</a><a href={siteHref("/#news")}>News</a><a className="active" href={siteHref("/mannschaften")}>Mannschaften</a><a href={siteHref("/spiele")}>Spiele</a><a href={siteHref("/verein")}>Verein</a><a href={siteHref("/sponsoren")}>Sponsoren</a></nav>
      <div className="header-actions"><a className="radio-pill" href={siteHref("/#ticker")}><span className="live-dot" /> Löwenradio</a><button className="menu-button" aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button></div>
    </header>
    {menuOpen && <div className="mobile-menu-overlay"><div className="mobile-menu-inner"><span className="section-kicker">Navigation</span><a href={siteHref("/")}>Startseite <span>↗</span></a><a href={siteHref("/mannschaften")}>Mannschaften <span>↗</span></a><a href={siteHref("/spiele")}>Spiele & Tabelle <span>↗</span></a><a href={siteHref("/verein")}>Verein <span>↗</span></a><a href={siteHref("/sponsoren")}>Sponsoren <span>↗</span></a><button onClick={() => setMenuOpen(false)}>Menü schließen ×</button></div></div>}

    {loading ? <section className="player-detail-state"><span className="section-kicker">Kader</span><h1>Profil wird<br /><em>geladen.</em></h1></section> : player ? <section className="player-detail-hero"><div className="shell player-detail-content"><a className="back-link" href={siteHref("/mannschaften")}>← Zurück zum Kader</a><div className="player-profile-box"><div className="player-detail-image" style={{ backgroundImage: `linear-gradient(160deg,rgba(211,19,53,.08),rgba(13,16,18,.58)),url('${photo}')` }}><span className="detail-number">{String(player.number).padStart(2, "0")}</span><img src="/ksv-logo.svg" alt="" /></div><div className="player-detail-copy"><span className="eyebrow"><span className="live-dot" /> {player.team}</span><h1>{player.name}</h1><p>{player.position}</p><div className="player-detail-meta"><span><small>Position</small><strong>{player.position}</strong></span><span><small>Mannschaft</small><strong>{player.team}</strong></span><span><small>Saison</small><strong>2026/27</strong></span></div></div></div></div></section> : <section className="player-detail-state"><span className="section-kicker">Kader</span><h1>Profil nicht<br /><em>gefunden.</em></h1><a className="button button-red" href={siteHref("/mannschaften")}>Zum Kader <span>↗</span></a></section>}

    <footer className="footer"><div className="shell footer-top"><div className="brand footer-brand"><img className="brand-logo" src="/ksv-logo.svg" alt="" /><span><b>KSV</b><small>HESSEN KASSEL</small></span></div><div><span className="footer-label">Das Löwenrudel</span><h3>Dein Platz im Rudel.</h3></div><a className="button button-red" href={siteHref("/mannschaften")}>Zum Kader <span>↗</span></a></div><div className="shell footer-bottom"><span>© 2026 KSV Hessen Kassel e.V.</span><span>Impressum · Datenschutz · Kontakt</span><span>Made for the Löwen <b>♥</b></span></div></footer>
  </main>;
}
