import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./HeroDashboard.css";

/* ─── Time Formatting Helpers ─── */
function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function timeLeft(expiresAt) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry - now;
  if (diff <= 0) return { text: "Expired", urgent: true, expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return { text: `${days}d ${hours}h left`, urgent: false, expired: false };
  if (hours > 0) return { text: `${hours}h ${minutes}m left`, urgent: hours < 2, expired: false };
  return { text: `${minutes}m left`, urgent: true, expired: false };
}

function HeroDashboard() {
  const { user, role, isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState("cities"); // cities | areas | chatroom
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(null);
  const [, setTick] = useState(0); // for countdown refresh

  // Redirect if not logged in as hero
  useEffect(() => {
    if (isLoading) return; // Wait for auth hydration

    if (!isLoggedIn) {
      navigate("/login");
    } else if (role !== "hero") {
      navigate("/");
    }
  }, [isLoggedIn, isLoading, role, navigate]);

  // Fetch supported cities
  useEffect(() => {
    axios.get("http://localhost:3000/api/supported-cities")
      .then(res => setCities(res.data.cities))
      .catch(() => setCities(["Noida", "Greater Noida"]));
  }, []);

  // Fetch areas with active queries
  const fetchAreas = useCallback(async (city) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/api/queries/areas/${city.toLowerCase()}`);
      setAreas(res.data.areas);
    } catch {
      setAreas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch queries for a specific area
  const fetchQueries = useCallback(async (city, area) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/api/queries/${city.toLowerCase()}/${encodeURIComponent(area)}`);
      setQueries(res.data.queries);
    } catch {
      setQueries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh countdowns every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      if (view === "chatroom" && selectedCity && selectedArea) {
        fetchQueries(selectedCity, selectedArea);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [view, selectedCity, selectedArea, fetchQueries]);

  const handleSelectCity = (city) => {
    setSelectedCity(city);
    setView("areas");
    fetchAreas(city);
  };

  const handleSelectArea = (area) => {
    setSelectedArea(area);
    setView("chatroom");
    fetchQueries(selectedCity, area);
  };

  const handleAccept = async (queryId) => {
    setAccepting(queryId);
    try {
      await axios.patch(`http://localhost:3000/api/queries/${queryId}/accept`, {
        heroId: user._id,
        heroName: user.fullname,
      });
      // Refresh queries
      await fetchQueries(selectedCity, selectedArea);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept query");
    } finally {
      setAccepting(null);
    }
  };

  const handleBack = () => {
    if (view === "chatroom") {
      setView("areas");
      setSelectedArea("");
      fetchAreas(selectedCity);
    } else if (view === "areas") {
      setView("cities");
      setSelectedCity("");
    }
  };

  if (isLoading) return null;
  if (!isLoggedIn || role !== "hero") return null;

  return (
    <div className="hd-page">
      <div className="hd-container">

        {/* ═══ HEADER ═══ */}
        <div className="hd-header">
          <div className="hd-header-top">
            {view !== "cities" && (
              <button className="hd-back-btn" onClick={handleBack}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}
          </div>

          <h1 className="hd-title">
            {view === "cities" && "Service Requests"}
            {view === "areas" && selectedCity}
            {view === "chatroom" && selectedArea}
          </h1>
          <p className="hd-subtitle">
            {view === "cities" && "Select a city to view active service requests from users in that area."}
            {view === "areas" && "Areas with active service requests. Pick one to see all queries."}
            {view === "chatroom" && (
              <>
                <span className="hd-breadcrumb">{selectedCity} → {selectedArea}</span>
                {" · "}
                {queries.length} active {queries.length === 1 ? "request" : "requests"}
              </>
            )}
          </p>
        </div>

        {/* ═══ CITIES VIEW ═══ */}
        {view === "cities" && (
          <div className="hd-grid hd-fade-in">
            {cities.map(city => (
              <button
                key={city}
                className="hd-city-card"
                onClick={() => handleSelectCity(city)}
              >
                <div className="hd-city-icon">
                  {city.toLowerCase() === "noida" ? "🌆" : "🏗️"}
                </div>
                <div className="hd-city-info">
                  <h3 className="hd-city-name">{city}</h3>
                  <p className="hd-city-desc">View service requests</p>
                </div>
                <svg className="hd-city-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* ═══ AREAS VIEW ═══ */}
        {view === "areas" && (
          <div className="hd-fade-in">
            {loading ? (
              <div className="hd-loading">
                <div className="hd-loading-spinner"></div>
                <p>Loading areas...</p>
              </div>
            ) : areas.length === 0 ? (
              <div className="hd-empty">
                <div className="hd-empty-icon">📭</div>
                <h3>No Active Requests</h3>
                <p>There are no active service requests in {selectedCity} right now. Check back later!</p>
              </div>
            ) : (
              <div className="hd-area-list">
                {areas.map(area => (
                  <button
                    key={area._id}
                    className="hd-area-card"
                    onClick={() => handleSelectArea(area._id)}
                  >
                    <div className="hd-area-left">
                      <div className="hd-area-pin">📍</div>
                      <div>
                        <h3 className="hd-area-name">{area._id}</h3>
                        <p className="hd-area-count">
                          {area.count} {area.count === 1 ? "request" : "requests"}
                          {area.openCount > 0 && (
                            <span className="hd-area-open"> · {area.openCount} open</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="hd-area-badge">{area.openCount}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ CHATROOM VIEW ═══ */}
        {view === "chatroom" && (
          <div className="hd-fade-in">
            {loading ? (
              <div className="hd-loading">
                <div className="hd-loading-spinner"></div>
                <p>Loading requests...</p>
              </div>
            ) : queries.length === 0 ? (
              <div className="hd-empty">
                <div className="hd-empty-icon">📭</div>
                <h3>No Requests Here</h3>
                <p>No active service requests in {selectedArea} right now.</p>
              </div>
            ) : (
              <div className="hd-query-list">
                {queries.map(q => {
                  const expiry = timeLeft(q.expiresAt);
                  return (
                    <div key={q._id} className={`hd-query-card ${q.status === "in_progress" ? "in-progress" : ""}`}>
                      {/* Status Badge */}
                      <div className={`hd-query-status ${q.status}`}>
                        {q.status === "open" ? "Open" : "In Progress"}
                      </div>

                      {/* Header */}
                      <div className="hd-query-header">
                        <div className="hd-query-avatar">
                          {q.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="hd-query-meta">
                          <h4 className="hd-query-user">{q.userName}</h4>
                          <span className="hd-query-time">{timeAgo(q.createdAt)}</span>
                        </div>
                        <div className={`hd-query-expiry ${expiry.urgent ? "urgent" : ""}`}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                          {expiry.text}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="hd-query-body">
                        <p className="hd-query-work">{q.workDescription}</p>
                      </div>

                      {/* Footer */}
                      <div className="hd-query-footer">
                        <div className="hd-query-price">
                          <span className="hd-price-label">Budget</span>
                          <span className="hd-price-value">₹{Number(q.price).toLocaleString()}</span>
                        </div>

                        {q.status === "open" ? (
                          <button
                            className="hd-accept-btn"
                            disabled={accepting === q._id}
                            onClick={() => handleAccept(q._id)}
                          >
                            {accepting === q._id ? (
                              <span className="hd-btn-spinner"></span>
                            ) : (
                              <>
                                Accept Work
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="hd-accepted-info">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                            <span>Accepted by <strong>{q.heroName}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Refresh Button */}
            {!loading && queries.length > 0 && (
              <button
                className="hd-refresh-btn"
                onClick={() => fetchQueries(selectedCity, selectedArea)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6" />
                  <path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
                Refresh
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HeroDashboard;
