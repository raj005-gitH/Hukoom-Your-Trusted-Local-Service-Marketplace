import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Home.css";

/* ─── Animated Counter Hook ─── */
function useCounter(end, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let startTime = null;
          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, startOnView]);

  return [count, ref];
}

/* ─── Fade-In on Scroll Hook ─── */
function useFadeIn() {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ─── Service Data ─── */
const services = [
  { icon: "⚡", title: "Electrician", desc: "Wiring, repairs & installations by certified pros", color: "#f59e0b" },
  { icon: "🔧", title: "Plumber", desc: "Leak fixes, pipe fitting & bathroom solutions", color: "#3b82f6" },
  { icon: "✨", title: "Cleaning", desc: "Deep cleaning, sanitization & regular upkeep", color: "#06b6d4" },
  { icon: "🛠️", title: "Mechanic", desc: "Vehicle servicing, diagnostics & roadside help", color: "#8b5cf6" },
  { icon: "🎨", title: "Painter", desc: "Interior, exterior & decorative wall finishes", color: "#ec4899" },
  { icon: "🏗️", title: "Carpenter", desc: "Furniture, fixtures & custom woodwork", color: "#10b981" },
];

/* ─── Steps Data ─── */
const steps = [
  { num: "01", title: "Search & Select", desc: "Browse verified professionals in your area and pick the right one for your needs." },
  { num: "02", title: "Book Instantly", desc: "Schedule a convenient time slot with just a few taps. No calls, no waiting." },
  { num: "03", title: "Get It Done", desc: "Your trusted professional arrives on time, gets the job done right." },
];

/* ─── Testimonials Data ─── */
const testimonials = [
  { name: "Priya Sharma", role: "Homeowner", text: "Hukoom saved me so much time. Found a great electrician within minutes — professional, punctual, and affordable!", rating: 5 },
  { name: "Rahul Verma", role: "Business Owner", text: "We use Hukoom for all our office maintenance. The quality of service providers is consistently excellent.", rating: 5 },
  { name: "Anita Desai", role: "Working Professional", text: "The booking process is incredibly smooth. I love how I can track the service provider in real-time!", rating: 5 },
];

/* ═══════════════════════════════════
   HOME COMPONENT
   ═══════════════════════════════════ */
function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { user, role, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  /* Handler for CTA / Get Started buttons */
  const handleGetStarted = () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else if (role === "hero") {
      navigate("/hero-dashboard");
    } else {
      navigate("/post-query");
    }
  };

  // Get display name
  const displayName = user
    ? role === "hero"
      ? user.fullname
      : user.username
    : "";

  /* Counters */
  const [users, usersRef] = useCounter(15000, 2500);
  const [providers, providersRef] = useCounter(2500, 2000);
  const [bookings, bookingsRef] = useCounter(45000, 2500);
  const [rating, ratingRef] = useCounter(49, 2000);

  /* Fade-in refs */
  const servicesRef = useFadeIn();
  const stepsRef = useFadeIn();
  const testimonialRef = useFadeIn();
  const ctaRef = useFadeIn();

  /* Auto-rotate testimonials */
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-page">

      {/* ═══ WELCOME BANNER ═══ */}
      {isLoggedIn && (
        <div className="welcome-banner" id="welcome-banner">
          <div className="welcome-banner-content">
            <div className="welcome-avatar">
              {displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div className="welcome-text">
              <span className="welcome-greeting">
                Hi, <strong>{displayName}</strong> 👋
              </span>
              <span className="welcome-role">
                {role === "hero"
                  ? "Welcome back, Hero! Ready to offer your services?"
                  : "Welcome back! Find trusted services near you."}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ HERO SECTION ═══ */}
      <section className="hero-section" id="hero">
        {/* Animated Background Elements */}
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-orb hero-orb-3"></div>
          <div className="hero-grid"></div>
        </div>

        <div className="hero-content section-container">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Trusted by 15,000+ users across India
          </div>

          <h1 className="hero-title">
            Find Trusted
            <span className="hero-highlight"> Local Services</span>
            <br />Instantly
          </h1>

          <p className="hero-subtitle">
            Book verified professionals for all your daily needs — from electricians
            to cleaners, mechanics to painters. Quality service, guaranteed.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" id="hero-explore-btn" onClick={handleGetStarted}>
              <span>{isLoggedIn && role === "hero" ? "View Requests" : "Explore Services"}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button className="btn-secondary" id="hero-provider-btn" onClick={() => navigate(isLoggedIn ? (role === 'hero' ? '/hero-dashboard' : '/post-query') : '/login')}>
              {isLoggedIn ? (role === "hero" ? "Dashboard" : "Post a Request") : "Become a Provider"}
            </button>
          </div>

          {/* Stats Row */}
          <div className="hero-stats">
            <div className="stat-item" ref={usersRef}>
              <span className="stat-number">{users.toLocaleString()}+</span>
              <span className="stat-label">Happy Users</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item" ref={providersRef}>
              <span className="stat-number">{providers.toLocaleString()}+</span>
              <span className="stat-label">Verified Pros</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item" ref={bookingsRef}>
              <span className="stat-number">{bookings.toLocaleString()}+</span>
              <span className="stat-label">Bookings Done</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item" ref={ratingRef}>
              <span className="stat-number">{(rating / 10).toFixed(1)}★</span>
              <span className="stat-label">Avg Rating</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* ═══ SERVICES SECTION ═══ */}
      {/* FIX 1: className changed from "services" → "services-section" to match CSS */}
      {/* FIX 2: Added fade-section class and servicesRef so scroll animation works */}
      {/* FIX 3: Now maps over the `services` data array with proper card markup */}
      <section className="services-section fade-section" ref={servicesRef} id="services">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">What We Offer</span>
            <h2 className="section-title">Our Services</h2>
            <p className="section-desc">
              Verified professionals for every job around your home or office.
            </p>
          </div>

          <div className="services-grid">
            {services.map((service, i) => (
              <div
                className="service-card"
                key={i}
                style={{ "--card-accent": service.color }}
              >
                <div
                  className="service-icon-wrap"
                  style={{ background: `${service.color}18` }}
                >
                  {service.icon}
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-desc">{service.desc}</p>
                <span className="service-link">
                  Book now
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="steps-section fade-section" ref={stepsRef} id="how-it-works">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">How It Works</span>
            <h2 className="section-title">Simple Steps to<br />Get Things Done</h2>
            <p className="section-desc">
              No complicated processes. Just a few taps and your problem is solved.
            </p>
          </div>

          <div className="steps-container">
            {steps.map((step, i) => (
              <div className="step-card" key={i}>
                <div className="step-number">{step.num}</div>
                <div className="step-connector"></div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="testimonials-section fade-section" ref={testimonialRef} id="testimonials">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2 className="section-title">What Our Users Say</h2>
          </div>

          <div className="testimonial-carousel">
            {testimonials.map((t, i) => (
              <div
                className={`testimonial-card ${i === activeTestimonial ? "active" : ""}`}
                key={i}
              >
                <div className="testimonial-stars">
                  {"★".repeat(t.rating)}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="testimonial-dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === activeTestimonial ? "active" : ""}`}
                onClick={() => setActiveTestimonial(i)}
                aria-label={`Show testimonial ${i + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="cta-section fade-section" ref={ctaRef} id="cta">
        <div className="section-container">
          <div className="cta-card">
            <div className="cta-bg-glow"></div>
            <h2 className="cta-title">Ready to Get Things Done?</h2>
            <p className="cta-desc">
              Join thousands of satisfied users. Book a trusted professional in under 60 seconds.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary btn-lg" id="cta-start-btn" onClick={handleGetStarted}>
                <span>Get Started — It's Free</span>
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

export default Home;
