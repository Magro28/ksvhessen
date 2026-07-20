"use client";

import "../artikel.css";
import { useEffect, useState } from "react";
import { directusAsset, getNewsItem, type DirectusNews } from "../lib/directus";

const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "";
const siteHref = (path: string) => siteOrigin || (typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:3000" : "") ? `${siteOrigin || "http://localhost:3000"}${path}` : path;
const fallbackImage = "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1600&q=88";

export default function ArtikelPage() {
  const [article, setArticle] = useState<DirectusNews | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const id = Number(new URLSearchParams(window.location.search).get("id"));
    if (!Number.isInteger(id) || id < 1) {
      setLoading(false);
      return;
    }
    getNewsItem(id).then((items) => setArticle(items[0] ?? null)).finally(() => setLoading(false));
  }, []);

  const image = article ? directusAsset(article.image, article.image_url ?? fallbackImage) : fallbackImage;
  const date = article?.published_at ? new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(article.published_at)) : "";

  return <main className="article-page">
    <header className="site-header article-page-header">
      <a className="brand" href={siteHref("/")} aria-label="KSV Hessen Kassel Startseite"><img className="brand-logo" src="/ksv-logo.svg" alt="KSV Hessen Kassel" /><span><b>KSV</b><small>HESSEN KASSEL</small></span></a>
      <nav className="desktop-nav" aria-label="Hauptnavigation"><a href={siteHref("/")}>Startseite</a><a className="active" href={siteHref("/#news")}>News</a><a href={siteHref("/mannschaften")}>Mannschaften</a><a href={siteHref("/spiele")}>Spiele</a><a href={siteHref("/verein")}>Verein</a><a href={siteHref("/sponsoren")}>Sponsoren</a></nav>
      <div className="header-actions"><a className="radio-pill" href={siteHref("/#ticker")}><span className="live-dot" /> Löwenradio</a><button className="menu-button" aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button></div>
    </header>
    {menuOpen && <div className="mobile-menu-overlay"><div className="mobile-menu-inner"><span className="section-kicker">Navigation</span><a href={siteHref("/")}>Startseite <span>↗</span></a><a href={siteHref("/mannschaften")}>Mannschaften <span>↗</span></a><a href={siteHref("/spiele")}>Spiele & Tabelle <span>↗</span></a><a href={siteHref("/verein")}>Verein <span>↗</span></a><a href={siteHref("/sponsoren")}>Sponsoren <span>↗</span></a><button onClick={() => setMenuOpen(false)}>Menü schließen ×</button></div></div>}

    {loading ? <section className="article-state"><span className="section-kicker">News</span><h1>Artikel wird<br /><em>geladen.</em></h1></section> : article ? <><section className="article-hero"><div className="article-hero-image" style={{ backgroundImage: `linear-gradient(90deg,rgba(13,16,18,.9),rgba(13,16,18,.28)),url('${image}')` }} /><div className="shell article-hero-content"><a className="back-link" href={siteHref("/#news")}>← Zurück zu den News</a><div className="article-heading"><span className="eyebrow"><span className="live-dot" /> {article.category ?? "KSV Hessen Kassel"} · {date}</span><h1>{article.title}</h1></div></div></section><article className="article-body"><div className="shell article-body-inner"><p className="article-lead">{article.excerpt}</p><div className="article-copy">{(article.body ?? article.excerpt ?? "Aktuelles aus dem Löwenrudel.").split(/\n\n|\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></div></article></> : <section className="article-state"><span className="section-kicker">News</span><h1>Artikel nicht<br /><em>gefunden.</em></h1><a className="button button-red" href={siteHref("/#news")}>Zu den News <span>↗</span></a></section>}

    <footer className="footer"><div className="shell footer-top"><div className="brand footer-brand"><img className="brand-logo" src="/ksv-logo.svg" alt="" /><span><b>KSV</b><small>HESSEN KASSEL</small></span></div><div><span className="footer-label">Immer informiert</span><h3>Dein Platz im Rudel.</h3></div><a className="button button-red" href={siteHref("/#news")}>Weitere News <span>↗</span></a></div><div className="shell footer-bottom"><span>© 2026 KSV Hessen Kassel e.V.</span><span>Impressum · Datenschutz · Kontakt</span><span>Made for the Löwen <b>♥</b></span></div></footer>
  </main>;
}
