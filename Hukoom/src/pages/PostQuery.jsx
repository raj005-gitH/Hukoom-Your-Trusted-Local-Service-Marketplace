import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PostQuery.css";

/* ─── Expiry Presets ─── */
const EXPIRY_PRESETS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
  { label: "6 hours", value: 360 },
  { label: "12 hours", value: 720 },
  { label: "1 day", value: 1440 },
  { label: "3 days", value: 4320 },
  { label: "7 days", value: 10080 },
  { label: "15 days", value: 21600 },
];

function PostQuery() {
  const { user, role, isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [city, setCity] = useState("");
  const [areas, setAreas] = useState([]);
  const [area, setArea] = useState("");
  const [areaSearch, setAreaSearch] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [price, setPrice] = useState("");
  const [expiryMinutes, setExpiryMinutes] = useState(120);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [cities, setCities] = useState([]);

  // Redirect if not logged in as user
  useEffect(() => {
    if (isLoading) return; // Wait for auth hydration
    
    if (!isLoggedIn) {
      navigate("/login");
    } else if (role === "hero") {
      navigate("/hero-dashboard");
    }
  }, [isLoggedIn, isLoading, role, navigate]);

  // Fetch supported cities
  useEffect(() => {
    axios.get("http://localhost:3000/api/supported-cities")
      .then(res => setCities(res.data.cities))
      .catch(() => setCities(["Noida", "Greater Noida"]));
  }, []);

  // Fetch areas when city changes
  useEffect(() => {
    if (!city) return;
    setAreas([]);
    setArea("");
    setAreaSearch("");
    axios.get(`http://localhost:3000/api/city-areas/${city.toLowerCase()}`)
      .then(res => setAreas(res.data.areas))
      .catch(() => setAreas([]));
  }, [city]);

  const filteredAreas = areas.filter(a =>
    a.toLowerCase().includes(areaSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!workDescription.trim() || !price) {
      setError("Please fill in all fields");
      return;
    }
    if (Number(price) <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:3000/api/queries", {
        userName: user.username,
        userId: user._id,
        city,
        area,
        workDescription: workDescription.trim(),
        price: Number(price),
        expiryMinutes,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post query");
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnother = () => {
    setStep(1);
    setCity("");
    setArea("");
    setAreaSearch("");
    setWorkDescription("");
    setPrice("");
    setExpiryMinutes(120);
    setSubmitted(false);
    setError("");
  };

  if (isLoading) return null;
  if (!isLoggedIn || role !== "user") return null;

  /* ═══ SUCCESS SCREEN ═══ */
  if (submitted) {
    return (
      <div className="pq-page">
        <div className="pq-container">
          <div className="pq-success-card">
            <div className="pq-success-icon">✓</div>
            <h2 className="pq-success-title">Query Posted!</h2>
            <p className="pq-success-desc">
              Your service request has been posted to <strong>{area}</strong>, <strong>{city}</strong>.
              Heroes in your area will be able to see and accept your request.
            </p>
            <div className="pq-success-details">
              <div className="pq-detail-row">
                <span className="pq-detail-label">Work</span>
                <span className="pq-detail-value">{workDescription}</span>
              </div>
              <div className="pq-detail-row">
                <span className="pq-detail-label">Budget</span>
                <span className="pq-detail-value">₹{Number(price).toLocaleString()}</span>
              </div>
              <div className="pq-detail-row">
                <span className="pq-detail-label">Expires in</span>
                <span className="pq-detail-value">{EXPIRY_PRESETS.find(p => p.value === expiryMinutes)?.label || `${expiryMinutes} min`}</span>
              </div>
            </div>
            <div className="pq-success-actions">
              <button className="pq-btn-primary" onClick={handlePostAnother}>
                Post Another Request
              </button>
              <button className="pq-btn-secondary" onClick={() => navigate("/")}>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pq-page">
      <div className="pq-container">

        {/* ═══ HEADER ═══ */}
        <div className="pq-header">
          <h1 className="pq-title">Post a Service Request</h1>
          <p className="pq-subtitle">
            Tell us what you need done, and local heroes will come to help.
          </p>
        </div>

        {/* ═══ PROGRESS BAR ═══ */}
        <div className="pq-progress">
          {[1, 2, 3].map(s => (
            <div key={s} className={`pq-progress-step ${step >= s ? "active" : ""} ${step > s ? "completed" : ""}`}>
              <div className="pq-progress-dot">
                {step > s ? "✓" : s}
              </div>
              <span className="pq-progress-label">
                {s === 1 ? "City" : s === 2 ? "Area" : "Details"}
              </span>
            </div>
          ))}
          <div className="pq-progress-line">
            <div className="pq-progress-fill" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          </div>
        </div>

        {/* ═══ STEP 1: CITY ═══ */}
        {step === 1 && (
          <div className="pq-step-card pq-fade-in">
            <div className="pq-step-header">
              <div className="pq-step-icon">🏙️</div>
              <h2 className="pq-step-title">Select Your City</h2>
              <p className="pq-step-desc">Choose the city where you need the service.</p>
            </div>
            <div className="pq-city-grid">
              {cities.map(c => (
                <button
                  key={c}
                  className={`pq-city-card ${city === c ? "selected" : ""}`}
                  onClick={() => setCity(c)}
                >
                  <span className="pq-city-emoji">
                    {c.toLowerCase() === "noida" ? "🌆" : "🏗️"}
                  </span>
                  <span className="pq-city-name">{c}</span>
                  {city === c && <span className="pq-city-check">✓</span>}
                </button>
              ))}
            </div>
            <div className="pq-step-actions">
              <button
                className="pq-btn-primary"
                disabled={!city}
                onClick={() => setStep(2)}
              >
                Continue
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 2: AREA ═══ */}
        {step === 2 && (
          <div className="pq-step-card pq-fade-in">
            <div className="pq-step-header">
              <div className="pq-step-icon">📍</div>
              <h2 className="pq-step-title">Select Your Area</h2>
              <p className="pq-step-desc">Pick the locality in <strong>{city}</strong> where you need help.</p>
            </div>

            <div className="pq-search-wrap">
              <svg className="pq-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="pq-search-input"
                placeholder="Search areas..."
                value={areaSearch}
                onChange={(e) => setAreaSearch(e.target.value)}
              />
            </div>

            <div className="pq-area-grid">
              {filteredAreas.length === 0 ? (
                <div className="pq-no-results">No areas found matching "{areaSearch}"</div>
              ) : (
                filteredAreas.map(a => (
                  <button
                    key={a}
                    className={`pq-area-chip ${area === a ? "selected" : ""}`}
                    onClick={() => setArea(a)}
                  >
                    {a}
                    {area === a && <span className="pq-chip-check">✓</span>}
                  </button>
                ))
              )}
            </div>

            <div className="pq-step-actions">
              <button className="pq-btn-ghost" onClick={() => setStep(1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button
                className="pq-btn-primary"
                disabled={!area}
                onClick={() => setStep(3)}
              >
                Continue
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: DETAILS ═══ */}
        {step === 3 && (
          <div className="pq-step-card pq-fade-in">
            <div className="pq-step-header">
              <div className="pq-step-icon">📝</div>
              <h2 className="pq-step-title">Describe Your Request</h2>
              <p className="pq-step-desc">
                Posting to <strong>{area}</strong>, <strong>{city}</strong>
              </p>
            </div>

            <div className="pq-form">
              <div className="pq-field">
                <label className="pq-label">What work do you need done?</label>
                <textarea
                  className="pq-textarea"
                  placeholder="e.g., Need a plumber to fix a leaking kitchen tap. The tap has been dripping for 2 days..."
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="pq-field">
                <label className="pq-label">Your Budget (₹)</label>
                <div className="pq-price-wrap">
                  <span className="pq-price-symbol">₹</span>
                  <input
                    type="number"
                    className="pq-price-input"
                    placeholder="500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="1"
                  />
                </div>
              </div>

              <div className="pq-field">
                <label className="pq-label">Request expires in</label>
                <div className="pq-expiry-grid">
                  {EXPIRY_PRESETS.map(preset => (
                    <button
                      key={preset.value}
                      className={`pq-expiry-chip ${expiryMinutes === preset.value ? "selected" : ""}`}
                      onClick={() => setExpiryMinutes(preset.value)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <div className="pq-error">{error}</div>}
            </div>

            <div className="pq-step-actions">
              <button className="pq-btn-ghost" onClick={() => setStep(2)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button
                className="pq-btn-primary pq-btn-submit"
                disabled={loading || !workDescription.trim() || !price}
                onClick={handleSubmit}
              >
                {loading ? (
                  <span className="pq-spinner"></span>
                ) : (
                  <>
                    Post Request
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2L11 13" />
                      <path d="M22 2L15 22 11 13 2 9l20-7z" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostQuery;
