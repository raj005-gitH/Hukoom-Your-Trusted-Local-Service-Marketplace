import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { user, role, isLoggedIn, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  // Get display name based on role
  const displayName = user
    ? role === "hero"
      ? user.fullname
      : user.username
    : "";

  // Get initials for avatar
  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`} id="main-navbar">
      {/* Brand */}
      <div className="nav-brand" onClick={() => { navigate("/"); closeMenu(); }}>
        <div className="nav-logo-icon">H</div>
        <div className="nav-logo-text">
          Hu<span>koom</span>
        </div>
      </div>

      {/* Navigation Links */}
      <ul className={`nav-links ${isOpen ? "open" : ""}`} id="nav-links">
        <li><Link to="/" onClick={closeMenu}>Home</Link></li>
        <li><Link to="/about" onClick={closeMenu}>About</Link></li>
        <li><Link to="/contact" onClick={closeMenu}>Contact</Link></li>
        <li><Link to="/profile" onClick={closeMenu}>Profile</Link></li>
        <li><Link to="/aiagent" onClick={closeMenu}>AI Agent</Link></li>
        {isLoggedIn && role === "user" && (
          <li><Link to="/post-query" onClick={closeMenu}>Post Query</Link></li>
        )}
        {isLoggedIn && role === "hero" && (
          <li><Link to="/hero-dashboard" onClick={closeMenu}>Dashboard</Link></li>
        )}
        <li>
          {isLoggedIn ? (
            <div className="nav-user-section">
              <div
                className="nav-user-pill"
                onClick={() => { navigate("/profile"); closeMenu(); }}
              >
                <div className="nav-avatar">{initials}</div>
                <span className="nav-username">{displayName}</span>
              </div>
              <button className="nav-logout-btn" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <button className="nav-cta" onClick={() => { navigate("/login"); closeMenu(); }}>
              Login
            </button>
          )}
        </li>
      </ul>

      {/* Mobile Toggle */}
      <div
        className={`nav-toggle ${isOpen ? "active" : ""}`}
        onClick={toggleMenu}
        id="nav-toggle"
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
}

export default Navbar;