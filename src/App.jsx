/* ANIMEX v5 — MAIN APP */
import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from './store/useAppStore.js';
import { fetchAPI } from './lib/api.js';

// Layout
import Navbar from './components/layout/Navbar.jsx';
import BottomNav from './components/layout/BottomNav.jsx';
import Footer from './components/layout/Footer.jsx';

// Sections
import HeroSection from './components/sections/HeroSection.jsx';
import { TrendingSection, TopRatedSection } from './components/sections/CardSections.jsx';
import DiscoverSection from './components/sections/DiscoverSection.jsx';
import ScheduleSection from './components/sections/ScheduleSection.jsx';
import DailyPick from './components/sections/DailyPick.jsx';
import { MoodSelector, PlatformTicker } from './components/sections/MoodSelector.jsx';
import WatchlistSection from './components/sections/WatchlistSection.jsx';

// Overlays
import AnimeModal from './components/modal/AnimeModal.jsx';
import SearchOverlay from './components/overlays/SearchOverlay.jsx';
import ToastContainer from './components/ui/Toast.jsx';

// Styles
import './styles/global.css';
import './styles/animations.css';

/* ─── PARTICLES ─── */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h;
  const particles = [];
  const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
  window.addEventListener('resize', resize); resize();
  for (let i = 0; i < 55; i++) {
    particles.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2 + 0.4, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, a: Math.random() * 0.35 + 0.08 });
  }
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,229,255,${p.a})`; ctx.fill();
    });
    requestAnimationFrame(draw);
  };
  draw();
}

export default function App() {
  const { openModal, addToRecent, addToast, toggleSearch, redirectingTo } = useAppStore();
  const loaderRef = useRef(null);

  useEffect(() => {
    // Hide loader
    const loader = document.getElementById('loader');
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => { if (loader) loader.style.display = 'none'; }, 350);
      }, 1200);
    }

    // Particles
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!pref) initParticles();

    // Scroll top button
    const handleScroll = () => {
      const btn = document.getElementById('scroll-top-btn');
      if (btn) btn.classList.toggle('visible', window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Ctrl+K
    const handleKey = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); toggleSearch(); }
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('keydown', handleKey);
    };
  }, [toggleSearch]);

  const handleRandomAnime = useCallback(async () => {
    addToast('Finding random anime…', 'info');
    const d = await fetchAPI('/random/anime');
    if (d?.data) { openModal(d.data); addToRecent(d.data); }
  }, [openModal, addToRecent, addToast]);

  return (
    <>
      {/* Canvas */}
      <canvas id="particles-canvas" aria-hidden="true" style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none',opacity:0.4 }} />

      {/* Redirect overlay — driven by Zustand state, not direct DOM mutation */}
      <div
        id="redirect-overlay-el"
        className={`redirect-overlay ${redirectingTo ? 'active' : ''}`}
        aria-hidden="true"
        aria-live="polite"
      >
        <div className="redirect-ring" />
        <div className="redirect-label">Redirecting to</div>
        <div className="redirect-platform redirect-platform-name">{redirectingTo}</div>
      </div>

      {/* Achievement popup */}
      <AchievementPop />

      {/* Scroll top */}
      <button
        id="scroll-top-btn"
        className="scroll-top-btn"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >↑</button>

      {/* Nav */}
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar onRandomAnime={handleRandomAnime} />
      <BottomNav onRandomAnime={handleRandomAnime} />

      {/* Main content */}
      <main id="main">
        <HeroSection />
        <PlatformTicker />
        <MoodSelector />
        <div className="neon-sep" />
        <TrendingSection />
        <DailyPick />
        <ScheduleSection />
        <div className="neon-sep" />
        <DiscoverSection />
        <TopRatedSection />
        <WatchlistSection />
      </main>

      <Footer />

      {/* Overlays */}
      <AnimeModal />
      <SearchOverlay />
      <ToastContainer />
    </>
  );
}

/* Achievement popup as separate component */
function AchievementPop() {
  const { achievement } = useAppStore();
  return (
    <div className={`achievement-pop ${achievement ? 'show' : ''}`} role="status" aria-live="polite">
      <div className="ach-icon">{achievement?.icon || '🏆'}</div>
      <div>
        <div className="ach-title">Achievement Unlocked</div>
        <div className="ach-label">{achievement?.label}</div>
        <div className="ach-desc">{achievement?.desc}</div>
      </div>
    </div>
  );
}
