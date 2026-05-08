'use client';

import Link from "next/link";
import Image from "next/image";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState, useEffect, useRef } from "react";

const FEATURES = [
  {
    title: "Specialized Assistants",
    description: "Browse carefully curated AI assistants, each built for a specific domain — from legal to culinary to fitness.",
    icon: "🧩",
    num: "01"
  },
  {
    title: "Free to Start",
    description: "No paywall to begin. Jump in with CodeGenie or EduMate instantly, no account required.",
    icon: "⚡",
    num: "02"
  },
  {
    title: "Beta Experience",
    description: "Be among the first. Your feedback directly shapes the roadmap and the future of the platform.",
    icon: "🚀",
    num: "03"
  },
];

const VALUES = ["Innovation", "Discovery", "Curation", "Community"];

const VISION = [
  {
    title: "AI Assistant Marketplace",
    description: "A curated platform where users discover, test, and connect with AI assistants tailored to their specific needs.",
    emoji: "🏪"
  },
  {
    title: "Entrepreneurial Journey",
    description: "Built as a learning project and real product — every decision reflects growth as a developer and founder.",
    emoji: "🚀"
  },
  {
    title: "Developer Growth",
    description: "Every feature, every bug fixed, every user conversation contributes to something bigger.",
    emoji: "💻"
  }
];

const TICKER_ITEMS = [
  "CodeGenie", "EduMate", "MediBot", "LegalMind",
  "DesignWhiz", "TravelBot", "ChefAI", "FinGenie",
  "FitBuddy", "MindMuse",
];

function ProfileImage() {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="home-profile-wrap">
      <div className="home-profile-glow" />
      <div className="home-profile-ring">
        {!imageError ? (
          <Image
            src="/images/profile.jpg"
            alt="Samuel Njoroge"
            width={72}
            height={72}
            className="home-profile-img"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="home-profile-fallback">SN</div>
        )}
      </div>
      <div className="home-profile-dot home-profile-dot-1" />
      <div className="home-profile-dot home-profile-dot-2" />
      <div className="home-profile-dot home-profile-dot-3" />
    </div>
  );
}

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="home-ticker">
      <div className="home-ticker-track">
        {items.map((item, i) => (
          <span key={i} className="home-ticker-item">
            <span className="home-ticker-dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div className="home-root">
      <style>{styles}</style>

      {/* ── Background layers ── */}
      <div className="home-bg">
        <div className="home-grid" />
        <div className="home-glow-1" />
        <div className="home-glow-2" />
        <div className="home-ghost-text" aria-hidden="true">KAI</div>
      </div>

      {/* ── NAV ── */}
      <header className={`home-nav ${scrolled ? 'home-nav--scrolled' : ''}`}>
        <div className="home-nav-inner">
          <div className="home-logo">
            <div className="home-logo-ring">
              <span className="home-logo-k">K</span>
            </div>
            <span className="home-logo-wordmark">Kai Ai</span>
            <span className="home-logo-beta">from Samuel Njoroge</span>
          </div>

          <nav className="home-nav-links">
            <a href="#features" className="home-nav-link">Features</a>
            <a href="#about" className="home-nav-link">About</a>
            <a href="#vision" className="home-nav-link">Vision</a>
          </nav>

          <Link href="/sign-in" className="home-nav-cta">
            Try 😁 Kai Ai
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="home-main">

        {/* ─── HERO ─── */}
        <section className="home-hero">
          <div className="home-hero-left">
            <div className="home-hero-eyebrow">
              <span className="home-eyebrow-dot" />
              <span> AI Assistant Marketplace</span>
            </div>

            <h1 className="home-hero-h1">
              Discover &amp; Connect with
              <br />
              <em className="home-hero-em">AI Assistants</em>
            </h1>

            <p className="home-hero-sub">
              Find the perfect AI assistant for your needs. From coding companions to creative partners — a curated marketplace of specialized helpers.
            </p>

            <div className="home-hero-actions">
              <Link href="/ai-assistants" className="home-cta-primary">
                Explore Assistants
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/sign-in" className="home-cta-ghost">
                Sign In
              </Link>
            </div>

            <div className="home-hero-stats">
              <div className="home-stat">
                <span className="home-stat-n">10</span>
                <span className="home-stat-l">Assistants</span>
              </div>
              <div className="home-stat-sep" />
              <div className="home-stat">
                <span className="home-stat-n">2</span>
                <span className="home-stat-l">Free forever</span>
              </div>
              <div className="home-stat-sep" />
              <div className="home-stat">
                <span className="home-stat-n">v1.1</span>
                <span className="home-stat-l">Launched</span>
              </div>
            </div>
          </div>

          <div className="home-hero-right">
            <div className="home-orb-wrap">
              <div className="home-orb-ring home-orb-ring-1" />
              <div className="home-orb-ring home-orb-ring-2" />
              <div className="home-orb-ring home-orb-ring-3" />
              <div className="home-orb-glow" />
              <div className="home-orb-label">KAI</div>

              {/* Floating assistant chips */}
              <div className="home-chip home-chip-1">💻 CodeGenie</div>
              <div className="home-chip home-chip-2">📚 EduMate</div>
              <div className="home-chip home-chip-3">🩺 MediBot</div>
              <div className="home-chip home-chip-4">🎨 DesignWhiz</div>
              <div className="home-chip home-chip-5">✈️ TravelBot</div>
            </div>
          </div>
        </section>

        {/* ─── TICKER ─── */}
        <Ticker />

        {/* ─── FEATURES ─── */}
        <section id="features" className="home-section">
          <div className="home-section-head">
            <p className="home-section-label">What we offer</p>
            <h2 className="home-section-h2">
              AI assistants for<br />
              <em>every need</em>
            </h2>
          </div>

          <div className="home-features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="home-feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="home-feature-top">
                  <span className="home-feature-num">{f.num}</span>
                  <span className="home-feature-icon">{f.icon}</span>
                </div>
                <h3 className="home-feature-title">{f.title}</h3>
                <p className="home-feature-desc">{f.description}</p>
                <div className="home-feature-line" />
              </div>
            ))}
          </div>
        </section>

        {/* ─── ABOUT ─── */}
        <section id="about" className="home-section home-about">
          <div className="home-about-card">
            <div className="home-about-glow" />
            <div className="home-about-header">
              <ProfileImage />
              <div>
                <h2 className="home-about-name">
                  Built by <em>Samuel Njoroge</em>
                </h2>
                <p className="home-about-role">Aspiring  Entrepreneur & Developer · Kenya</p>
              </div>
            </div>
            <p className="home-about-body">
              Kai is my vision for democratizing access to AI assistants. As an aspiring developer and entrepreneur,
              I&apos;m building a platform where anyone can discover and connect with the perfect AI for their needs.
            </p>
            <p className="home-about-body">
              This MVP is the beginning of something bigger — a marketplace where specialized AI meets real human needs,
              inspired by how Poe revolutionized AI chat, but focused on discovery and curation.
            </p>
            <div className="home-about-footer">
              <div className="home-about-badge">MVP</div>
              <div className="home-about-launch">
                <span className="home-about-launch-sub"> Version 1.1</span>
                <span className="home-about-launch-year">2026 Launch</span>
              </div>
            </div>
          </div>

          <div className="home-values-grid">
            {VALUES.map((v, i) => (
              <div key={i} className="home-value-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <span className="home-value-label">{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── VISION ─── */}
        <section id="vision" className="home-section">
          <div className="home-section-head">
            <p className="home-section-label">The mission</p>
            <h2 className="home-section-h2">
              The vision<br />
              <em>behind Kai</em>
            </h2>
          </div>

          <div className="home-vision-grid">
            {VISION.map((item, i) => (
              <div key={i} className="home-vision-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="home-vision-emoji">{item.emoji}</span>
                <h3 className="home-vision-title">{item.title}</h3>
                <p className="home-vision-desc">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="home-cta-section">
          <div className="home-cta-card">
            <div className="home-cta-glow" />
            <p className="home-section-label" style={{ textAlign:'center', marginBottom: '16px' }}>Join the beta</p>
            <h2 className="home-cta-h2">
              Ready to explore<br />
              the <em>future of AI</em>?
            </h2>
            <p className="home-cta-sub">
              Join the beta and be among the first to discover a new way of connecting with AI assistants.
            </p>
            <Link href="/sign-in" className="home-cta-primary home-cta-xl">
              Join Beta Now
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <p className="home-cta-note">🚀 MVP Version · Your feedback shapes the future</p>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <div className="home-footer-brand">
          <div className="home-logo-ring home-logo-ring--sm">
            <span className="home-logo-k">K</span>
          </div>
          <span className="home-footer-name">Kai Ai</span>
          <span className="home-footer-year">© 2026 XTech Devs(From Samuel Njoroge)</span>
        </div>
        <div className="home-footer-contact">
          <a href="mailto:xam77950@gmail.com" className="home-footer-link">📧 xam77950@gmail.com</a>
          <a href="tel:+254708201715" className="home-footer-link">📱 +254 708 201715</a>
        </div>
      </footer>
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700;1,800&family=DM+Sans:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --gold: #f5a623;
  --gold2: #e8900a;
  --gold-rgb: 245,166,35;
  --bg: #09090c;
  --surface: #111115;
  --surface2: #18181e;
  --border: rgba(255,255,255,0.07);
  --border2: rgba(255,255,255,0.04);
  --text: #ededf0;
  --text2: #8b8fa8;
  --text3: #4b4f64;
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'DM Sans', sans-serif;
}

/* ── Root ── */
.home-root {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  overflow-x: hidden;
  position: relative;
}

/* ── Background ── */
.home-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.home-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(245,166,35,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(245,166,35,0.05) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 90% 70% at 50% 10%, black 30%, transparent 90%);
}
.home-glow-1 {
  position: absolute;
  width: 700px; height: 700px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%);
  top: -200px; left: -150px;
  animation: glowDrift 16s ease-in-out infinite alternate;
}
.home-glow-2 {
  position: absolute;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
  bottom: 5%; right: -100px;
  animation: glowDrift 20s ease-in-out infinite alternate-reverse;
}
@keyframes glowDrift {
  from { transform: translate(0,0) scale(1); }
  to   { transform: translate(50px, 40px) scale(1.15); }
}
.home-ghost-text {
  position: absolute;
  bottom: -80px; right: -40px;
  font-family: var(--font-display);
  font-size: clamp(200px, 28vw, 400px);
  font-weight: 800;
  color: transparent;
  -webkit-text-stroke: 1px rgba(245,166,35,0.06);
  line-height: 1;
  pointer-events: none;
  user-select: none;
}

/* ── Nav ── */
.home-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  border-bottom: 1px solid transparent;
  transition: all .3s ease;
}
.home-nav--scrolled {
  background: rgba(9,9,12,0.88);
  border-bottom-color: var(--border);
  backdrop-filter: blur(20px);
}
.home-nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 18px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.home-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}
.home-logo-ring {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1.5px solid var(--gold);
  display: flex; align-items: center; justify-content: center;
  background: rgba(245,166,35,0.08);
  box-shadow: 0 0 12px rgba(245,166,35,0.25);
  flex-shrink: 0;
}
.home-logo-ring--sm { width: 28px; height: 28px; }
.home-logo-k {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 18px;
  color: var(--gold);
  line-height: 1;
}
.home-logo-wordmark {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  background: linear-gradient(135deg, #f5a623, #e8d07a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.home-logo-beta {
  font-size: 10px;
  letter-spacing: .1em;
  padding: 2px 8px;
  border-radius: 100px;
  border: 1px solid rgba(245,166,35,0.35);
  color: var(--gold);
  background: rgba(245,166,35,0.08);
  font-weight: 500;
}
.home-nav-links {
  display: flex;
  gap: 32px;
}
.home-nav-link {
  color: var(--text2);
  text-decoration: none;
  font-size: 14px;
  font-weight: 400;
  transition: color .15s;
}
.home-nav-link:hover { color: var(--gold); }
.home-nav-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 22px;
  border-radius: 100px;
  border: 1.5px solid var(--gold);
  color: var(--gold);
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  transition: all .2s;
  background: rgba(245,166,35,0.05);
}
.home-nav-cta:hover {
  background: var(--gold);
  color: #09090c;
}

/* ── Main ── */
.home-main {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
}

/* ── Hero ── */
.home-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  min-height: 100vh;
  padding: 120px 0 80px;
}
.home-hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 24px;
  font-weight: 500;
}
.home-eyebrow-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--gold);
  animation: eyeDot 2s ease-in-out infinite;
}
@keyframes eyeDot {
  0%,100% { opacity:1; }
  50% { opacity:.3; }
}
.home-hero-h1 {
  font-family: var(--font-display);
  font-size: clamp(40px, 5vw, 64px);
  font-weight: 800;
  line-height: 1.1;
  color: var(--text);
  margin-bottom: 24px;
  letter-spacing: -1px;
}
.home-hero-em {
  font-style: italic;
  background: linear-gradient(135deg, #f5a623, #e8d07a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.home-hero-sub {
  font-size: 17px;
  color: var(--text2);
  line-height: 1.72;
  max-width: 460px;
  margin-bottom: 36px;
  font-weight: 300;
}
.home-hero-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 48px;
}
.home-cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 100px;
  background: var(--gold);
  color: #09090c;
  text-decoration: none;
  font-size: 15px;
  font-weight: 700;
  font-family: var(--font-body);
  transition: all .2s;
  box-shadow: 0 4px 24px rgba(245,166,35,0.4);
  border: none;
  cursor: pointer;
}
.home-cta-primary:hover {
  background: #e8900a;
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(245,166,35,0.55);
}
.home-cta-xl {
  font-size: 16px;
  padding: 16px 36px;
}
.home-cta-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 100px;
  border: 1px solid var(--border);
  color: var(--text2);
  text-decoration: none;
  font-size: 15px;
  font-weight: 400;
  transition: all .15s;
}
.home-cta-ghost:hover { border-color: var(--gold); color: var(--gold); }

.home-hero-stats {
  display: flex;
  align-items: center;
  gap: 24px;
}
.home-stat { display: flex; flex-direction: column; gap: 2px; }
.home-stat-n {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 800;
  font-style: italic;
  color: var(--gold);
  line-height: 1;
}
.home-stat-l { font-size: 12px; color: var(--text3); letter-spacing: .03em; }
.home-stat-sep { width: 1px; height: 36px; background: var(--border); }

/* ── Hero orb ── */
.home-hero-right { display: flex; justify-content: center; align-items: center; }
.home-orb-wrap {
  position: relative;
  width: 340px; height: 340px;
  display: flex; align-items: center; justify-content: center;
}
.home-orb-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid;
  animation: orbSpin linear infinite;
}
.home-orb-ring-1 {
  inset: 0;
  border-color: rgba(245,166,35,0.2);
  animation-duration: 30s;
}
.home-orb-ring-2 {
  inset: 30px;
  border-color: rgba(245,166,35,0.15);
  animation-duration: 20s;
  animation-direction: reverse;
}
.home-orb-ring-3 {
  inset: 60px;
  border-color: rgba(245,166,35,0.25);
  animation-duration: 14s;
}
@keyframes orbSpin { to { transform: rotate(360deg); } }
.home-orb-glow {
  position: absolute;
  width: 140px; height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(245,166,35,0.35), transparent 70%);
  filter: blur(30px);
  animation: orbPulse 4s ease-in-out infinite;
}
@keyframes orbPulse {
  0%,100% { transform: scale(1); opacity: .7; }
  50% { transform: scale(1.2); opacity: 1; }
}
.home-orb-label {
  position: relative;
  font-family: var(--font-display);
  font-size: 52px;
  font-weight: 800;
  font-style: italic;
  background: linear-gradient(135deg, #f5a623, #e8d07a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  z-index: 1;
}
.home-chip {
  position: absolute;
  padding: 7px 12px;
  border-radius: 100px;
  background: rgba(17,17,21,0.9);
  border: 1px solid var(--border);
  font-size: 12px;
  color: var(--text2);
  white-space: nowrap;
  backdrop-filter: blur(8px);
  font-weight: 500;
  animation: chipFloat ease-in-out infinite alternate;
}
.home-chip-1 { top: 10px; right: 0; animation-duration: 5s; }
.home-chip-2 { bottom: 30px; right: -10px; animation-duration: 6.5s; animation-delay: .5s; }
.home-chip-3 { bottom: 0; left: 20px; animation-duration: 5.5s; animation-delay: 1s; }
.home-chip-4 { top: 20px; left: -10px; animation-duration: 7s; animation-delay: .3s; }
.home-chip-5 { top: 50%; left: -30px; transform: translateY(-50%); animation-duration: 6s; animation-delay: .8s; }
@keyframes chipFloat {
  from { transform: translateY(0); }
  to   { transform: translateY(-8px); }
}
.home-chip-5 { animation-name: chipFloat5; }
@keyframes chipFloat5 {
  from { transform: translateY(-50%) translateX(0); }
  to   { transform: translateY(calc(-50% - 8px)) translateX(0); }
}

/* ── Ticker ── */
.home-ticker {
  overflow: hidden;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 14px 0;
  margin-bottom: 120px;
}
.home-ticker-track {
  display: flex;
  gap: 0;
  animation: tickerScroll 28s linear infinite;
  width: max-content;
}
@keyframes tickerScroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.home-ticker-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 28px;
  font-size: 13px;
  color: var(--text3);
  font-weight: 500;
  letter-spacing: .06em;
  text-transform: uppercase;
  white-space: nowrap;
}
.home-ticker-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); opacity: .5; }

/* ── Sections ── */
.home-section {
  margin-bottom: 140px;
}
.home-section-head {
  margin-bottom: 60px;
}
.home-section-label {
  font-size: 11px;
  letter-spacing: .15em;
  text-transform: uppercase;
  color: var(--gold);
  font-weight: 500;
  margin-bottom: 12px;
}
.home-section-h2 {
  font-family: var(--font-display);
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 800;
  color: var(--text);
  line-height: 1.15;
  letter-spacing: -0.5px;
}
.home-section-h2 em { font-style: italic; color: var(--gold); }

/* ── Features ── */
.home-features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
}
.home-feature-card {
  padding: 40px 32px;
  background: var(--surface);
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
  transition: all .2s;
  cursor: default;
}
.home-feature-card:first-child { border-radius: 16px 0 0 16px; }
.home-feature-card:last-child  { border-radius: 0 16px 16px 0; }
.home-feature-card:hover { background: var(--surface2); border-color: rgba(245,166,35,0.2); z-index: 1; }
.home-feature-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}
.home-feature-num {
  font-family: var(--font-display);
  font-size: 13px;
  font-style: italic;
  color: var(--text3);
}
.home-feature-icon { font-size: 28px; }
.home-feature-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
  line-height: 1.3;
}
.home-feature-desc {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.65;
  font-weight: 300;
}
.home-feature-line {
  position: absolute;
  bottom: 0; left: 0;
  width: 0; height: 2px;
  background: var(--gold);
  transition: width .3s ease;
}
.home-feature-card:hover .home-feature-line { width: 100%; }

/* ── About ── */
.home-about {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 40px;
  align-items: start;
}
.home-about-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 40px;
  position: relative;
  overflow: hidden;
}
.home-about-glow {
  position: absolute;
  top: -60px; right: -60px;
  width: 200px; height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(245,166,35,0.15), transparent 70%);
  pointer-events: none;
}
.home-about-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}
.home-about-name {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  color: var(--text);
  line-height: 1.2;
}
.home-about-name em { font-style: italic; color: var(--gold); }
.home-about-role {
  font-size: 13px;
  color: var(--text3);
  margin-top: 4px;
}
.home-about-body {
  font-size: 14.5px;
  color: var(--text2);
  line-height: 1.72;
  margin-bottom: 16px;
  font-weight: 300;
}
.home-about-footer {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}
.home-about-badge {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 800;
  font-style: italic;
  color: var(--gold);
}
.home-about-launch { display: flex; flex-direction: column; gap: 2px; }
.home-about-launch-sub { font-size: 12px; color: var(--text3); }
.home-about-launch-year { font-size: 15px; font-weight: 600; color: var(--text); }

/* Profile image */
.home-profile-wrap { position: relative; width: 72px; height: 72px; flex-shrink: 0; }
.home-profile-glow {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99,130,245,0.4), transparent 70%);
  filter: blur(8px);
}
.home-profile-ring {
  width: 72px; height: 72px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(99,130,245,0.5);
  position: relative;
  z-index: 1;
}
.home-profile-img { display: block; width: 100%; height: 100%; object-fit: cover; }
.home-profile-fallback {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, #4f6af5, #7f5af0);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 700; color: white;
}
.home-profile-dot {
  position: absolute;
  border-radius: 50%;
  background: #818cf8;
  animation: dotPulse 2s ease-in-out infinite;
  z-index: 2;
}
.home-profile-dot-1 { width: 8px; height: 8px; top: -2px; right: -2px; }
.home-profile-dot-2 { width: 6px; height: 6px; bottom: 0; left: -3px; animation-delay: .4s; }
.home-profile-dot-3 { width: 5px; height: 5px; top: 50%; right: -4px; animation-delay: .8s; }
@keyframes dotPulse {
  0%,100% { opacity:.9; transform:scale(1); }
  50% { opacity:.4; transform:scale(.7); }
}

/* Values grid */
.home-values-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.home-value-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  padding: 40px 20px;
  transition: all .2s;
  cursor: default;
}
.home-value-card:hover {
  background: var(--surface2);
  border-color: rgba(245,166,35,0.25);
  transform: scale(1.02);
}
.home-value-label {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  font-style: italic;
  color: var(--text);
}
.home-value-card:hover .home-value-label { color: var(--gold); }

/* ── Vision ── */
.home-vision-grid {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 16px;
}
.home-vision-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 32px;
  transition: all .2s;
}
.home-vision-card:hover {
  background: var(--surface2);
  border-color: rgba(245,166,35,0.2);
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.3);
}
.home-vision-emoji { font-size: 36px; display: block; margin-bottom: 16px; }
.home-vision-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 10px;
}
.home-vision-desc { font-size: 14px; color: var(--text2); line-height: 1.65; font-weight: 300; }

/* ── CTA Section ── */
.home-cta-section { margin-bottom: 120px; }
.home-cta-card {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 28px;
  padding: 72px 48px;
  text-align: center;
  overflow: hidden;
}
.home-cta-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 60% at 50% 0%, rgba(245,166,35,0.1), transparent 70%);
  pointer-events: none;
}
.home-cta-h2 {
  font-family: var(--font-display);
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.5px;
  color: var(--text);
  margin-bottom: 20px;
}
.home-cta-h2 em { font-style: italic; color: var(--gold); }
.home-cta-sub {
  font-size: 16px;
  color: var(--text2);
  max-width: 480px;
  margin: 0 auto 36px;
  line-height: 1.7;
  font-weight: 300;
}
.home-cta-note { font-size: 13px; color: var(--text3); margin-top: 20px; }

/* ── Footer ── */
.home-footer {
  position: relative;
  z-index: 1;
  border-top: 1px solid var(--border);
  padding: 24px 32px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
.home-footer-brand { display: flex; align-items: center; gap: 10px; }
.home-footer-name {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 800;
  font-style: italic;
  color: var(--gold);
}
.home-footer-year { font-size: 13px; color: var(--text3); margin-left: 4px; }
.home-footer-contact { display: flex; gap: 24px; }
.home-footer-link { color: var(--text3); text-decoration: none; font-size: 13px; transition: color .15s; }
.home-footer-link:hover { color: var(--gold); }

/* ── Responsive ── */
@media (max-width: 900px) {
  .home-hero { grid-template-columns: 1fr; min-height: auto; padding: 100px 0 60px; }
  .home-hero-right { display: none; }
  .home-about { grid-template-columns: 1fr; }
  .home-features-grid { grid-template-columns: 1fr; }
  .home-feature-card:first-child,.home-feature-card:last-child { border-radius: 0; }
  .home-feature-card:first-child { border-radius: 16px 16px 0 0; }
  .home-feature-card:last-child  { border-radius: 0 0 16px 16px; }
  .home-vision-grid { grid-template-columns: 1fr; }
  .home-nav-links { display: none; }
  .home-cta-card { padding: 48px 28px; }
}
@media (max-width: 600px) {
  .home-nav-inner { padding: 16px 20px; }
  .home-main { padding: 0 20px; }
  .home-hero-stats { flex-wrap: wrap; gap: 16px; }
  .home-footer { flex-direction: column; text-align: center; padding: 20px; }
  .home-footer-contact { flex-direction: column; gap: 8px; align-items: center; }
  .home-ghost-text { font-size: 140px; }
}
`;