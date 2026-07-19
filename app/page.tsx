"use client";

import { useEffect, useState } from "react";

const news = [
  {
    category: "1. Mannschaft",
    date: "16.07.2026",
    title: "Volksbank Kassel Göttingen und KSV Hessen verlängern Partnerschaft",
    image:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=85",
  },
  {
    category: "U23",
    date: "13.07.2026",
    title: "U23 erreicht Platz zwei beim Trillhof-Cup",
    image:
      "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=900&q=85",
  },
  {
    category: "Saisonstart",
    date: "11.07.2026",
    title: "Löwen starten mit Heimspiel gegen Eintracht Frankfurt II",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=85",
  },
];

const ticker = [
  ["90+4'", "Schlusspfiff im Auestadion. Die Löwen holen drei Punkte!"],
  ["87'", "Wechsel beim KSV: Najjar kommt für Dahlke."],
  ["73'", "TOOOOR für den KSV! Stark trifft nach feiner Vorarbeit."],
  ["46'", "Weiter geht's. Beide Teams unverändert zurück auf dem Platz."],
];

const heroSlides = [
  {
    type: "news",
    label: "Saisonstart 2026/27",
    title: "Die Löwen sind zurück.",
    copy: "Alles, was den KSV Hessen Kassel bewegt — direkt aus dem Auestadion.",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=2200&q=90",
    action: "Zum Spielplan",
  },
  {
    type: "news",
    label: "1. Mannschaft · 16.07.2026",
    title: "Partnerschaft verlängert.",
    copy: "Die Volksbank Kassel Göttingen bleibt an der Seite der Löwen.",
    image: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=2200&q=90",
    action: "News lesen",
  },
  {
    type: "result",
    label: "Letztes Ergebnis · Saison 2025/26",
    title: "Auswärtssieg am Bieberer Berg.",
    copy: "Die Löwen bezwingen Kickers Offenbach im Saisonfinale verdient mit 3:1.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=2200&q=90",
    action: "Spielbericht",
    score: ["Kickers Offenbach", "1", "3", "KSV Hessen Kassel"],
  },
];

const fixtures = [
  { state: "Letztes Spiel", competition: "Regionalliga Südwest · 34. Spieltag", date: "16.05.2026", home: "Kickers Offenbach", away: "KSV Hessen Kassel", homeMark: "OFC", awayMark: "KSV", score: "1 : 3", kind: "result" },
  { state: "Nächstes Spiel", competition: "Regionalliga Südwest · 1. Spieltag", date: "25.07.2026 · 14:00", home: "KSV Hessen Kassel", away: "Eintracht Frankfurt II", homeMark: "KSV", awayMark: "SGE", score: "— : —", kind: "active" },
  { state: "Danach", competition: "Regionalliga Südwest", date: "Termin folgt", home: "KSV Hessen Kassel", away: "Nächster Gegner", homeMark: "KSV", awayMark: "?", score: "— : —", kind: "next" },
];

export default function Home() {
  const [activeNav, setActiveNav] = useState("Startseite");
  const [radioOn, setRadioOn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [previousSlide, setPreviousSlide] = useState<number | null>(null);
  const [isSliding, setIsSliding] = useState(false);

  const changeSlide = (nextSlide: number) => {
    if (nextSlide === activeSlide || isSliding) return;
    setPreviousSlide(activeSlide);
    setActiveSlide(nextSlide);
    setIsSliding(true);
    window.setTimeout(() => {
      setPreviousSlide(null);
      setIsSliding(false);
    }, 950);
  };

  useEffect(() => {
    const timer = window.setInterval(() => changeSlide((activeSlide + 1) % heroSlides.length), 7000);
    return () => window.clearInterval(timer);
  }, [activeSlide, isSliding]);

  const slide = heroSlides[activeSlide];
  const outgoingSlide = previousSlide === null ? null : heroSlides[previousSlide];

  const renderHeroContent = (item: (typeof heroSlides)[number], motionClass: string) => (
    <div className={`hero-content shell ${motionClass}`}>
      <p className="eyebrow"><span className={item.type === "result" ? "result-dot" : "live-dot"} /> {item.label}</p>
      <h1>{item.type === "result" ? <>3:1<br /><em>Auswärtssieg.</em></> : item.title}</h1>
      <p className="hero-copy">{item.copy}</p>
      {item.score && <div className="hero-score"><span>{item.score[0]}</span><b>{item.score[1]}</b><i>:</i><b>{item.score[2]}</b><span>{item.score[3]}</span></div>}
      <div className="hero-actions"><a className="button button-red" href={item.type === "result" ? "#news" : "#spiele"}>{item.action} <span>↗</span></a><a className="button button-ghost" href="#news">Alle News</a></div>
    </div>
  );

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="KSV Hessen Kassel Startseite">
          <img className="brand-logo" src="/ksv-logo.svg" alt="KSV Hessen Kassel" />
          <span><b>KSV</b><small>HESSEN KASSEL</small></span>
        </a>
        <nav className="desktop-nav" aria-label="Hauptnavigation">
          {["Startseite", "News", "Mannschaften", "Spiele", "Verein"].map((item) => (
            <a key={item} className={activeNav === item ? "active" : ""} href={item === "Mannschaften" ? "/mannschaften" : item === "Spiele" ? "/spiele" : item === "Verein" ? "/verein" : `#${item.toLowerCase()}`} onClick={() => setActiveNav(item)}>{item}</a>
          ))}
        </nav>
        <div className="header-actions">
          <button className={`radio-pill ${radioOn ? "playing" : ""}`} onClick={() => setRadioOn(!radioOn)} aria-pressed={radioOn}>
            <span className="live-dot" /> {radioOn ? "Radio läuft" : "Löwenradio"}
          </button>
          <button className="menu-button" aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
      </header>
      {menuOpen && <div className="mobile-menu-overlay"><div className="mobile-menu-inner"><span className="section-kicker">Navigation</span><a href="#news" onClick={() => setMenuOpen(false)}>News <span>↗</span></a><a href="/mannschaften" onClick={() => setMenuOpen(false)}>Mannschaften <span>↗</span></a><a href="/spiele" onClick={() => setMenuOpen(false)}>Spiele & Tabelle <span>↗</span></a><a href="/verein" onClick={() => setMenuOpen(false)}>Verein <span>↗</span></a><button onClick={() => setMenuOpen(false)}>Menü schließen ×</button></div></div>}

      <section className="hero" id="top">
        <div className="hero-image hero-image-current" style={{ backgroundImage: `linear-gradient(90deg,rgba(13,16,18,.98) 0%,rgba(13,16,18,.68) 43%,rgba(13,16,18,.2) 100%),url('${slide.image}')` }} />
        {outgoingSlide && <div className="hero-image hero-image-outgoing" style={{ backgroundImage: `linear-gradient(90deg,rgba(13,16,18,.98) 0%,rgba(13,16,18,.68) 43%,rgba(13,16,18,.2) 100%),url('${outgoingSlide.image}')` }} />}
        <div className="hero-grain" />
        {outgoingSlide && renderHeroContent(outgoingSlide, "hero-content-outgoing")}
        {renderHeroContent(slide, "hero-content-current")}
        <div className="hero-carousel-controls" aria-label="Hero-Karussell"><button aria-label="Vorheriger Artikel" onClick={() => changeSlide((activeSlide - 1 + heroSlides.length) % heroSlides.length)}>←</button>{heroSlides.map((item, index) => <button key={item.label} className={activeSlide === index ? "selected" : ""} aria-label={`Artikel ${index + 1}`} onClick={() => changeSlide(index)}><span>0{index + 1}</span><small>{item.type === "result" ? "ERGEBNIS" : "NEWS"}</small></button>)}<button aria-label="Nächster Artikel" onClick={() => changeSlide((activeSlide + 1) % heroSlides.length)}>→</button></div>
        <div className="hero-scroll">Scroll für mehr <span>↓</span></div>
      </section>

      <section className="next-match shell" id="spiele">
        <div className="fixture-heading"><div><div className="section-kicker">Spieltag <span>Alle Termine</span></div><h2>Vorher. Jetzt.<br /><em>Als Nächstes.</em></h2></div><a className="button button-ghost fixture-plan" href="/spiele">Zum Spielplan <span>↗</span></a></div>
        <div className="fixture-strip">{fixtures.map((fixture) => <article className={`fixture-card ${fixture.kind}`} key={fixture.state}><div className="fixture-card-top"><span>{fixture.state}</span><small>{fixture.competition}</small></div><div className="fixture-date">{fixture.date}</div><div className="fixture-teams"><div className="fixture-team"><span className={`fixture-badge ${fixture.homeMark === "KSV" ? "ksv-badge" : "opponent-badge"}`}>{fixture.homeMark === "KSV" ? <img src="/ksv-logo.svg" alt="" /> : fixture.homeMark}</span><strong>{fixture.home}</strong></div><div className="fixture-score">{fixture.score}</div><div className="fixture-team fixture-team-away"><span className={`fixture-badge ${fixture.awayMark === "KSV" ? "ksv-badge" : "opponent-badge"}`}>{fixture.awayMark === "KSV" ? <img src="/ksv-logo.svg" alt="" /> : fixture.awayMark}</span><strong>{fixture.away}</strong></div></div><div className="fixture-card-bottom"><span>{fixture.kind === "result" ? "Spielbericht" : fixture.kind === "active" ? "Auestadion" : "Weitere Termine folgen"}</span>{fixture.kind === "active" && <button onClick={() => setRadioOn(true)}>Löwenradio <span>↗</span></button>}</div></article>)}</div>
      </section>

      <section className="news-section" id="news">
        <div className="shell">
          <div className="section-heading"><div><div className="section-kicker">Aus dem Löwenrudel</div><h2>Neuigkeiten</h2></div><a className="text-link" href="#alle-news">Alle News <span>↗</span></a></div>
          <div className="news-grid">{news.map((item, index) => <article className={`news-card news-${index + 1}`} key={item.title}><div className="news-image" style={{ backgroundImage: `url(${item.image})` }}><span>{item.category}</span></div><div className="news-body"><time>{item.date}</time><h3>{item.title}</h3><a href="#artikel">Artikel lesen <span>→</span></a></div></article>)}</div>
        </div>
      </section>

      <section className="live-section" id="ticker">
        <div className="shell live-layout">
          <div className="live-intro"><div className="section-kicker red-kicker"><span className="live-dot" /> Live im Auestadion</div><h2>Mitten<br /><em>im Spiel.</em></h2><p>Kein Tor verpassen: Der KSV-Liveticker bringt die wichtigsten Szenen direkt auf dein Smartphone.</p><a className="button button-light" href="#vollstaendiger-ticker">Ticker öffnen <span>↗</span></a></div>
          <div className="ticker-card"><div className="ticker-top"><span className="ticker-status"><span className="live-dot" /> LIVE</span><span>KSV 2 : 0 SGE II</span><span>78:42</span></div><div className="ticker-match"><strong>KSV <b>2</b> : <b>0</b> SGE II</strong><small>2. Halbzeit · Auestadion</small></div><div className="ticker-lines">{ticker.map(([minute, text]) => <div className="ticker-line" key={minute}><time>{minute}</time><p>{text}</p></div>)}</div><div className="ticker-foot"><span>Letztes Update vor 12 Sek.</span><button>Aktualisieren ↻</button></div></div>
        </div>
      </section>

      <footer className="footer"><div className="shell footer-top"><div className="brand footer-brand"><img className="brand-logo" src="/ksv-logo.svg" alt="" /><span><b>KSV</b><small>HESSEN KASSEL</small></span></div><div><span className="footer-label">Immer informiert</span><h3>Dein Platz im Rudel.</h3></div><a className="button button-red" href="#newsletter">Newsletter abonnieren <span>↗</span></a></div><div className="shell footer-bottom"><span>© 2026 KSV Hessen Kassel e.V.</span><span>Impressum · Datenschutz · Kontakt</span><span>Made for the Löwen <b>♥</b></span></div></footer>
      <nav className="mobile-nav" aria-label="Mobile Navigation"><a className="selected" href="#top">⌂<small>Home</small></a><a href="#news">▣<small>News</small></a><a href="/spiele">◉<small>Spiele</small></a><a href="/mannschaften">♙<small>Kader</small></a><a href="#menue">☰<small>Menü</small></a></nav>
    </main>
  );
}
