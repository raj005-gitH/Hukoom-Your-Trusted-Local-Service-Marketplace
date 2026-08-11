import { useEffect, useRef } from "react";
import "./About.css";
const API_URL = "https://hukoom-trusted-local-services.onrender.com";

/* ─── Fade-in Hook ─── */
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add("visible"); },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ─── Data ─── */
const values = [
  { icon: "🛡️", title: "Trust & Safety", desc: "Every provider is background-verified and rated by real users." },
  { icon: "⚡", title: "Speed", desc: "Book a professional in under 60 seconds, anytime, anywhere." },
  { icon: "💎", title: "Quality", desc: "We maintain strict quality benchmarks for every service delivered." },
  { icon: "🤝", title: "Transparency", desc: "Upfront pricing, no hidden charges, and real-time tracking." },
];

const team = [
  { name: "Jayraj Singh", role: "Founder & CEO", initial: "R", color: "#3b82f6" },
  { name: "Kanak Saini", role: "CTO", initial: "A", color: "#06b6d4" },
  { name: "Sarthak Srivastava", role: "Head of Operations", initial: "V", color: "#8b5cf6" },
  { name: "Akshat Chandrakar", role: "Head of Design", initial: "S", color: "#ec4899" },
];

const milestones = [
  { year: "January-2026", title: "Founded", desc: "Hukoom was born with a mission to simplify local services." },
  { year: "April-2026", title: "Launch", desc: "First time to be used in Greater Noida" },
  { year: "May-2026", title: "AI Integration", desc: "Upcoming: AI-powered service matching and smart scheduling" },
  { year: "December-2026", title: "Target - 10K Users", desc: "Expanded to 10+ cities with 2,500+ verified professionals." },
];

function About() {
  const missionRef = useFadeIn();
  const valuesRef = useFadeIn();
  const timelineRef = useFadeIn();
  const teamRef = useFadeIn();
  const ctaRef = useFadeIn();

  return (
    <div className="about-page">

      {/* ═══ PAGE HERO ═══ */}
      <section className="page-hero" id="about-hero">
        <div className="page-hero-bg">
          <div className="page-hero-orb page-hero-orb-1"></div>
          <div className="page-hero-orb page-hero-orb-2"></div>
        </div>
        <div className="section-container page-hero-content">
          <span className="section-tag">About Us</span>
          <h1 className="page-hero-title">
            Building India's Most
            <span className="text-gradient"> Trusted</span> Service Platform
          </h1>
          <p className="page-hero-subtitle">
            We're on a mission to connect millions with reliable local professionals — making everyday life simpler, safer, and more convenient.
          </p>
        </div>
      </section>

      {/* ═══ MISSION & VISION ═══ */}
      <section className="about-mission fade-section" ref={missionRef} id="mission">
        <div className="section-container">
          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>
                To simplify everyday life by helping people find verified professionals
                for their daily needs — whether it's fixing a tap, cleaning your home,
                or handling urgent repairs. We believe quality service should be accessible to everyone.
              </p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">🚀</div>
              <h3>Our Vision</h3>
              <p>
                To become India's most trusted platform for connecting users with
                reliable service providers, while empowering local workers with dignified
                opportunities and sustainable livelihoods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VALUES ═══ */}
      <section className="about-values fade-section" ref={valuesRef} id="values">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Our Values</span>
            <h2 className="section-title">What We Stand For</h2>
          </div>
          <div className="values-grid">
            {values.map((v, i) => (
              <div className="value-card" key={i}>
                <div className="value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TIMELINE ═══ */}
      <section className="about-timeline fade-section" ref={timelineRef} id="timeline">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Our Journey</span>
            <h2 className="section-title">Milestones That Define Us</h2>
          </div>
          <div className="timeline">
            {milestones.map((m, i) => (
              <div className="timeline-item" key={i}>
                <div className="timeline-marker">
                  <div className="timeline-dot"></div>
                </div>
                <div className="timeline-content">
                  <span className="timeline-year">{m.year}</span>
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TEAM ═══ */}
      <section className="about-team fade-section" ref={teamRef} id="team">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Our Team</span>
            <h2 className="section-title">The People Behind Hukoom</h2>
          </div>
          <div className="team-grid">
            {team.map((t, i) => (
              <div className="team-card" key={i}>
                <div className="team-avatar" style={{ background: t.color }}>
                  {t.name.charAt(0)}
                </div>
                <h3>{t.name}</h3>
                <p>{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="about-cta fade-section" ref={ctaRef} id="about-cta">
        <div className="section-container">
          <div className="cta-card">
            <div className="cta-bg-glow"></div>
            <h2 className="cta-title">Want to Be Part of the Story?</h2>
            <p className="cta-desc">
              Whether you're looking for services or want to offer yours — Hukoom is the platform built for you.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary btn-lg" id="about-cta-btn">
                <span>Explore Services</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="footer" id="footer">
        <div className="section-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="nav-logo-icon">H</div>
                <span className="nav-logo-text">Hu<span>koom</span></span>
              </div>
              <p className="footer-tagline">
                Your trusted platform for reliable local services. Quality professionals, one tap away.
              </p>
            </div>

            <div className="footer-col">
              <h4>Services</h4>
              <ul>
                <li><a href="#">Electrician</a></li>
                <li><a href="#">Plumber</a></li>
                <li><a href="#">Cleaning</a></li>
                <li><a href="#">Mechanic</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Press</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 Hukoom. All rights reserved.</p>
            <div className="footer-socials">
              <a href="#" aria-label="Twitter" className="social-link">𝕏</a>
              <a href="#" aria-label="Instagram" className="social-link">📸</a>
              <a href="#" aria-label="LinkedIn" className="social-link">in</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default About;