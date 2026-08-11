import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Contact.css";

/* ─── Fade-In on Scroll Hook ─── */
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add("visible"); },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ─── Contact Info Data ─── */
const contactInfo = [
  {
    icon: "📧",
    label: "Email Us",
    value: "support@hukoom.com",
    desc: "We reply within 24 hours",
  },
  {
    icon: "📞",
    label: "Call Us",
    value: "+91 98765 43210",
    desc: "Mon – Sat, 9 AM to 7 PM",
  },
  {
    icon: "📍",
    label: "Our Office",
    value: "New Delhi, India",
    desc: "Serving across the country",
  },
];

/* ═══════════════════════════════════
   CONTACT COMPONENT
   ═══════════════════════════════════ */
function Contact() {
  const { user, role, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [formState, setFormState] = useState({ 
    name: user ? (role === "hero" ? user.fullname : user.username) : "", 
    email: user ? user.email : "", 
    subject: "", 
    message: "" 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [focused, setFocused] = useState(null);

  // Update form if user data arrives after initial mount (though Auth is now sync)
  useEffect(() => {
    if (user) {
      setFormState(prev => ({
        ...prev,
        name: role === "hero" ? user.fullname : user.username,
        email: user.email
      }));
    }
  }, [user, role]);

  const formRef = useFadeIn();
  const infoRef = useFadeIn();

  const handleChange = (e) =>
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user._id,
          senderRole: role,
          name: formState.name,
          email: formState.email,
          subject: formState.subject,
          message: formState.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message.");
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">

      {/* ── Background orbs ── */}
      <div className="contact-bg">
        <div className="contact-orb contact-orb-1"></div>
        <div className="contact-orb contact-orb-2"></div>
        <div className="contact-grid"></div>
      </div>

      {/* ══════════════════════
          HERO
          ══════════════════════ */}
      <section className="contact-hero">
        <div className="section-container hero-inner">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Typically replies within 24 hours
          </div>
          <h1 className="contact-hero-title">
            We'd Love to
            <span className="hero-highlight"> Hear From You</span>
          </h1>
          <p className="contact-hero-sub">
            Have a question, feedback, or need help with a booking?
            Our team is ready to assist.
          </p>
        </div>
      </section>

      {/* ══════════════════════
          MAIN GRID
          ══════════════════════ */}
      <div className="contact-layout section-container">

        {/* ── Form ── */}
        <div className="contact-form-card fade-section" ref={formRef}>
          <div className="form-card-header">
            <h2 className="form-card-title">Send a Message</h2>
            <p className="form-card-desc">Fill in the details below and we'll get back to you shortly.</p>
          </div>

          {!isLoggedIn ? (
            <div className="login-required-card">
              <div className="login-lock-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h3 className="login-req-title">Login Required</h3>
              <p className="login-req-desc">
                To help us keep your communications secure and organized, please log in to your account before sending a message.
              </p>
              <div className="login-req-actions">
                <button className="btn-primary" onClick={() => navigate("/login")}>
                  Sign In
                </button>
                <Link to="/about" className="btn-secondary">Learn More</Link>
              </div>
            </div>
          ) : !submitted ? (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              
              {error && <div className="form-error-msg">{error}</div>}

              <div className="form-row">
                <div className={`form-group ${focused === "name" || formState.name ? "active" : ""}`}>
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formState.name}
                    onChange={handleChange}
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused(null)}
                    required
                  />
                </div>

                <div className={`form-group ${focused === "email" || formState.email ? "active" : ""}`}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formState.email}
                    onChange={handleChange}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    required
                  />
                </div>
              </div>

              <div className={`form-group ${focused === "subject" || formState.subject ? "active" : ""}`}>
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="How can we help?"
                  value={formState.subject}
                  onChange={handleChange}
                  onFocus={() => setFocused("subject")}
                  onBlur={() => setFocused(null)}
                />
              </div>

              <div className={`form-group ${focused === "message" || formState.message ? "active" : ""}`}>
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Tell us what's on your mind..."
                  value={formState.message}
                  onChange={handleChange}
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused(null)}
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn-primary submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="spinner-small" />
                ) : (
                  <>
                    <span>Send Message</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </>
                )}
              </button>

            </form>
          ) : (
            <div className="success-state">
              <div className="success-icon">✓</div>
              <h3 className="success-title">Message Sent!</h3>
              <p className="success-desc">
                Thanks for reaching out, {formState.name || "there"}. We'll get back to you at{" "}
                <strong>{formState.email || "your email"}</strong> within 24 hours.
              </p>
              <button
                className="btn-secondary"
                onClick={() => { setSubmitted(false); setFormState({ name: "", email: "", subject: "", message: "" }); }}
              >
                Send Another Message
              </button>
            </div>
          )}
        </div>

        {/* ── Contact Info ── */}
        <div className="contact-info-col fade-section" ref={infoRef}>
          <h2 className="info-col-title">Other Ways to Reach Us</h2>
          <p className="info-col-desc">
            Prefer a direct line? We're available across all channels.
          </p>

          <div className="info-cards">
            {contactInfo.map((item, i) => (
              <div className="info-card" key={i}>
                <div className="info-icon">{item.icon}</div>
                <div className="info-text">
                  <span className="info-label">{item.label}</span>
                  <span className="info-value">{item.value}</span>
                  <span className="info-desc">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ nudge */}
          <div className="faq-nudge">
            <span className="faq-nudge-icon">💡</span>
            <div>
              <p className="faq-nudge-title">Check our FAQ first</p>
              <p className="faq-nudge-desc">Most questions are answered in our Help Center — no waiting required.</p>
            </div>
            <button className="btn-secondary faq-btn">
              Help Center
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>        
      </div>

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

export default Contact;
