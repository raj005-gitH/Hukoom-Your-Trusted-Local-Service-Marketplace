import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

/* ─── Fade-In on Scroll Hook ─── */
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ─── Status Meta mapping (DB → UI) ─── */
const statusMeta = {
  open:        { label: "Open",        className: "status-upcoming"  },
  in_progress: { label: "In Progress", className: "status-pending"   },
  completed:   { label: "Completed",   className: "status-completed" },
  expired:     { label: "Expired",     className: "status-expired"   },
};

/* ─── Icon by work description (keyword match) ─── */
function getServiceIcon(description = "") {
  const desc = description.toLowerCase();
  if (desc.includes("plumb") || desc.includes("pipe") || desc.includes("water"))       return "🔧";
  if (desc.includes("electric") || desc.includes("wiring") || desc.includes("wire"))   return "⚡";
  if (desc.includes("clean"))    return "✨";
  if (desc.includes("paint"))    return "🎨";
  if (desc.includes("carpent") || desc.includes("wood") || desc.includes("furniture")) return "🪚";
  if (desc.includes("mechanic") || desc.includes("car") || desc.includes("vehicle"))   return "🚗";
  if (desc.includes("pest"))     return "🐛";
  if (desc.includes("garden") || desc.includes("plant")) return "🌿";
  if (desc.includes("internet") || desc.includes("wifi") || desc.includes("network"))  return "📡";
  return "🛠️";
}

/* ─── Format date helper ─── */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* ═══════════════════════════════════
   PROFILE COMPONENT
   ═══════════════════════════════════ */
function Profile() {
  const navigate = useNavigate();
  const { user, role, isLoggedIn, isLoading, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings");

  /* ─── Real bookings state ─── */
  const [bookings, setBookings]               = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError]     = useState(null);

  const detailsRef  = useFadeIn();
  const bookingsRef = useFadeIn();
  const actionsRef  = useFadeIn();

  // Wait for auth to hydrate from localStorage before deciding to redirect
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/login");
    }
  }, [isLoading, isLoggedIn, navigate]);

  // Fetch real bookings whenever the bookings tab is active
  // NOTE: must be above early returns to satisfy React's Rules of Hooks
  useEffect(() => {
    if (isLoading || !isLoggedIn || !user || activeTab !== "bookings") return;

    const fetchBookings = async () => {
      setBookingsLoading(true);
      setBookingsError(null);
      try {
        const isHeroRole = role === "hero";
        const id = user._id;
        const endpoint = isHeroRole
          ? `http://localhost:3000/api/queries/hero/${id}`
          : `http://localhost:3000/api/queries/user/${id}`;

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();
        setBookings(data.queries || []);
      } catch (err) {
        setBookingsError("Could not load bookings. Please try again.");
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchBookings();
  }, [isLoading, isLoggedIn, user, role, activeTab]);

  /* ─── Handlers for Completion / Cancellation ─── */
  const handleComplete = async (queryId) => {
    if (!window.confirm("Mark this work as successfully completed?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/queries/${queryId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      });
      if (!res.ok) throw new Error("Failed to complete query");
      
      // Update local state
      setBookings(prev => prev.map(b => b._id === queryId ? { ...b, status: "completed" } : b));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelWork = async (queryId) => {
    if (!window.confirm("Are you sure you want to cancel this work? Frequent cancellations may lead to a temporary ban.")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/queries/${queryId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroId: user._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to cancel work");
      
      alert(data.message);
      // Remove from list or update to open (usually better to just remove from hero's view if they cancelled)
      setBookings(prev => prev.filter(b => b._id !== queryId));
    } catch (err) {
      alert(err.message);
    }
  };

  // While auth state is being restored, render nothing to avoid flicker
  if (isLoading) {
    return null;
  }

  if (!isLoggedIn || !user) {
    return null;
  }

  // Get display values from real user data
  const isHero        = role === "hero";
  const displayName   = isHero ? user.fullname : user.username;
  const displayEmail  = user.email;
  const displayPhone  = user.phone || "Not provided";
  const displayCity   = user.city  || "Not provided";
  const displaySkills = isHero && user.skills ? user.skills.join(", ") : null;

  // Get initials for avatar
  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  // Compute real stats from fetched bookings
  const completedCount = bookings.filter((b) => b.status === "completed").length;
  const activeCount    = bookings.filter((b) => ["open", "in_progress"].includes(b.status)).length;

  const stats = isHero
    ? [
        { value: completedCount,                      label: "Jobs Done"   },
        { value: user.skills?.length ?? 0,            label: "Skills"      },
        { value: activeCount,                         label: "Active Jobs" },
      ]
    : [
        { value: bookings.length,                     label: "Total Bookings"  },
        { value: completedCount,                      label: "Completed"       },
        { value: activeCount,                         label: "Active Services" },
      ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="profile-page">

      {/* ── Background orbs ── */}
      <div className="profile-bg">
        <div className="profile-orb profile-orb-1"></div>
        <div className="profile-orb profile-orb-2"></div>
      </div>

      <div className="profile-layout section-container">

        {/* ══════════════════════════
            LEFT SIDEBAR — Identity
            ══════════════════════════ */}
        <aside className="profile-sidebar">

          {/* Avatar card */}
          <div className="profile-card avatar-card">
            <div className="avatar-ring">
              <div className="avatar-inner">{initials}</div>
            </div>
            <h2 className="profile-name">{displayName}</h2>
            <p className="profile-email">{displayEmail}</p>
            <span className="profile-badge">
              <span className="badge-dot"></span>
              {isHero ? "Verified Hero" : "Verified Member"}
            </span>

            {/* Role tag */}
            {isHero && (
              <div className="profile-role-tag hero-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Hero Account
              </div>
            )}
            {!isHero && (
              <div className="profile-role-tag user-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                User Account
              </div>
            )}

            {/* Stats — computed from live DB data */}
            <div className="profile-stats">
              {stats.map((s, i) => (
                <div className="profile-stat" key={i}>
                  <span className="profile-stat-value">{s.value}</span>
                  <span className="profile-stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            <button
              className={`btn-primary profile-edit-btn ${editing ? "editing" : ""}`}
              onClick={() => setEditing((e) => !e)}
            >
              {editing ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Save Changes
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit Profile
                </>
              )}
            </button>
          </div>

          {/* Account details card */}
          <div className="profile-card details-card fade-section" ref={detailsRef}>
            <h3 className="card-title">Account Details</h3>

            <div className="detail-row">
              <span className="detail-icon">📧</span>
              <div className="detail-content">
                <span className="detail-label">Email</span>
                <span className="detail-value">{displayEmail}</span>
              </div>
            </div>

            <div className="detail-row">
              <span className="detail-icon">📞</span>
              <div className="detail-content">
                <span className="detail-label">Phone</span>
                {editing ? (
                  <input className="detail-input" defaultValue={displayPhone} />
                ) : (
                  <span className="detail-value">{displayPhone}</span>
                )}
              </div>
            </div>

            <div className="detail-row">
              <span className="detail-icon">📍</span>
              <div className="detail-content">
                <span className="detail-label">City</span>
                {editing ? (
                  <input className="detail-input" defaultValue={displayCity} />
                ) : (
                  <span className="detail-value">{displayCity}</span>
                )}
              </div>
            </div>

            {isHero && displaySkills && (
              <div className="detail-row">
                <span className="detail-icon">🛠️</span>
                <div className="detail-content">
                  <span className="detail-label">Skills</span>
                  <div className="skills-tags">
                    {user.skills.map((skill, i) => (
                      <span className="skill-tag" key={i}>{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="detail-row">
              <span className="detail-icon">👤</span>
              <div className="detail-content">
                <span className="detail-label">Account Type</span>
                <span className="detail-value">{isHero ? "Hero (Service Provider)" : "User (Customer)"}</span>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="profile-card danger-card fade-section" ref={actionsRef}>
            <button className="btn-logout" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Log Out
            </button>
          </div>

        </aside>

        {/* ══════════════════════════
            MAIN CONTENT
            ══════════════════════════ */}
        <main className="profile-main">

          {/* Tab switcher */}
          <div className="profile-tabs">
            {["bookings", "settings"].map((tab) => (
              <button
                key={tab}
                className={`profile-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "bookings" ? "Recent Bookings" : "Preferences"}
              </button>
            ))}
          </div>

          {/* ── Bookings Tab ── */}
          {activeTab === "bookings" && (
            <div className="bookings-list tab-panel">

              {/* Loading state */}
              {bookingsLoading && (
                <div className="bookings-state-wrap">
                  <div className="bookings-spinner"></div>
                  <p className="bookings-state-text">Loading your bookings…</p>
                </div>
              )}

              {/* Error state */}
              {!bookingsLoading && bookingsError && (
                <div className="bookings-state-wrap bookings-error">
                  <span className="bookings-state-icon">⚠️</span>
                  <p className="bookings-state-text">{bookingsError}</p>
                </div>
              )}

              {/* Empty state */}
              {!bookingsLoading && !bookingsError && bookings.length === 0 && (
                <div className="bookings-state-wrap bookings-empty">
                  <span className="bookings-state-icon">📋</span>
                  <p className="bookings-state-text">
                    {isHero
                      ? "You haven't accepted any service requests yet."
                      : "You haven't posted any service requests yet."}
                  </p>
                </div>
              )}

              {/* Real booking cards from DB */}
              {!bookingsLoading && !bookingsError && bookings.map((b, i) => {
                const meta = statusMeta[b.status] || { label: b.status, className: "status-pending" };
                const icon = getServiceIcon(b.workDescription);
                return (
                  <div className="booking-card" key={b._id || i}>
                    <div className="booking-icon-wrap">{icon}</div>

                    <div className="booking-info">
                      <span className="booking-service">{b.workDescription}</span>
                      <span className="booking-provider">
                        {isHero
                          ? `by ${b.userName} · ${b.area}, ${b.city}`
                          : b.heroName
                            ? `Accepted by ${b.heroName}`
                            : `${b.area}, ${b.city}`}
                      </span>
                    </div>

                    <div className="booking-meta">
                      <span className="booking-date">{formatDate(b.createdAt)}</span>
                      <span className="booking-amount">₹{b.price?.toLocaleString("en-IN")}</span>
                    </div>

                    <span className={`booking-status ${meta.className}`}>
                      {meta.label}
                    </span>

                    {/* Action buttons for in-progress work */}
                    {b.status === "in_progress" && (
                      <div className="booking-actions">
                        {!isHero ? (
                          <button 
                            className="btn-action-complete" 
                            onClick={() => handleComplete(b._id)}
                            title="Mark as Completed"
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <button 
                            className="btn-action-cancel" 
                            onClick={() => handleCancelWork(b._id)}
                            title="Cancel Work"
                          >
                            Cancel Work
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          )}

          {/* ── Preferences Tab ── */}
          {activeTab === "settings" && (
            <div className="settings-list tab-panel">
              {[
                { label: "Email notifications", desc: "Receive booking confirmations and updates", on: true  },
                { label: "SMS alerts",           desc: "Get SMS reminders before your booking",   on: true  },
                { label: "Promotional offers",   desc: "Discounts and special deals from Hukoom", on: false },
                { label: "Provider reviews",     desc: "Remind me to leave a review after service", on: true },
              ].map((pref, i) => (
                <div className="pref-row" key={i}>
                  <div className="pref-text">
                    <span className="pref-label">{pref.label}</span>
                    <span className="pref-desc">{pref.desc}</span>
                  </div>
                  <div className={`toggle-track ${pref.on ? "on" : ""}`}>
                    <div className="toggle-thumb"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
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

export default Profile;
