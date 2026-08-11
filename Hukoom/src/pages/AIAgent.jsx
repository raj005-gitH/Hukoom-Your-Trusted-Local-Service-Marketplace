import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./AIAgent.css";

/* ─── Suggested prompts ─── */
const suggestions = [
  "Book a plumber near me",
  "Find an electrician for tomorrow",
  "Schedule a deep cleaning service",
  "Get a carpenter for furniture repair",
];

/* ─── Time formatting ─── */
function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

/* ─── Typing indicator ─── */
function TypingIndicator() {
  return (
    <div className="chat-bubble-wrap ai">
      <div className="bubble-avatar">AI</div>
      <div className="chat-bubble ai typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  );
}

const AIAgent = () => {
  const { user, role, isLoggedIn } = useAuth();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      sender: "ai",
      text: "Hi! I'm Hukoom AI — your personal service assistant. Tell me what you need and I'll help you find the right professional instantly. 🛠️",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  /* Auto-scroll to bottom on new messages */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  /* Load chat history if logged in */
  useEffect(() => {
    if (isLoggedIn && user?._id) {
      axios.get(`http://localhost:3000/api/ai/history/${user._id}`)
        .then(res => {
          if (res.data.messages && res.data.messages.length > 0) {
            const mapped = res.data.messages.map(m => ({
              sender: m.sender,
              text: m.text,
              timestamp: m.timestamp,
            }));
            setChat(prev => [...prev, ...mapped]);
          }
        })
        .catch(() => { /* silently ignore */ });
    }
  }, [isLoggedIn, user]);

  const handleSend = async (text) => {
    const prompt = (text || message).trim();
    if (!prompt || loading) return;

    const userMsg = { sender: "user", text: prompt, timestamp: new Date().toISOString() };
    setChat((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/api/ai", {
        prompt,
        userId: user?._id || "anonymous",
        userName: user ? (role === "hero" ? user.fullname : user.username) : "Guest",
        userRole: role || "user",
        sessionId,
      });

      const aiMsg = { sender: "ai", text: res.data.reply, timestamp: new Date().toISOString() };
      setChat((prev) => [...prev, aiMsg]);
    } catch {
      setChat((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setChat([
      {
        sender: "ai",
        text: "Chat cleared! How can I help you today? 🛠️",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="aiagent-page">

      {/* ── Background ── */}
      <div className="aiagent-bg">
        <div className="aiagent-orb aiagent-orb-1"></div>
        <div className="aiagent-orb aiagent-orb-2"></div>
        <div className="aiagent-grid"></div>
      </div>

      <div className="aiagent-layout">

        {/* ── Left: intro panel ── */}
        <aside className="aiagent-intro">
          <div className="ai-logo-wrap">
            <div className="ai-logo-ring">
              <div className="ai-logo-inner">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z" />
                  <circle cx="9" cy="14" r="1" /><circle cx="15" cy="14" r="1" />
                </svg>
              </div>
            </div>
            <div className="ai-status-dot"></div>
          </div>

          <h1 className="aiagent-title">
            Hukoom
            <span className="hero-highlight"> AI Assistant</span>
          </h1>
          <p className="aiagent-desc">
            Your smart service companion — powered by AI to find, book, and manage local professionals instantly.
          </p>

          <div className="aiagent-capabilities">
            {[
              { icon: "⚡", text: "Instant service matching" },
              { icon: "📅", text: "Smart booking suggestions" },
              { icon: "🔍", text: "Provider availability checks" },
              { icon: "💬", text: "24/7 support assistance" },
            ].map((cap, i) => (
              <div className="capability-row" key={i}>
                <span className="capability-icon">{cap.icon}</span>
                <span className="capability-text">{cap.text}</span>
              </div>
            ))}
          </div>

          <div className="aiagent-hint">
            <span className="hint-tag">Try asking</span>
            <div className="suggestions-list">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="suggestion-chip"
                  onClick={() => handleSend(s)}
                  disabled={loading}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Right: chat panel ── */}
        <div className="chat-panel">

          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z" />
                  <circle cx="9" cy="14" r="1" /><circle cx="15" cy="14" r="1" />
                </svg>
              </div>
              <div>
                <span className="chat-header-name">Hukoom AI (Beta)</span>
                <span className="chat-header-status">
                  <span className="status-dot-sm"></span>
                  Online
                </span>
              </div>
            </div>
            <div className="chat-header-right">
              <button className="chat-clear-btn" onClick={handleClearChat} title="Clear chat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
              <div className="chat-header-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Powered by Gemini
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {chat.map((msg, i) => (
              <div key={i} className={`chat-bubble-wrap ${msg.sender}`}>
                {msg.sender === "ai" && (
                  <div className="bubble-avatar">AI</div>
                )}
                <div className={`chat-bubble ${msg.sender}`}>
                  {msg.text}
                  {msg.timestamp && (
                    <span className="bubble-time">{formatTime(msg.timestamp)}</span>
                  )}
                </div>
              </div>
            ))}
            {loading && <TypingIndicator />}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <div className="chat-input-wrap">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask for any service..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="chat-input"
              />
              <button
                className={`send-btn ${message.trim() ? "active" : ""}`}
                onClick={() => handleSend()}
                disabled={!message.trim() || loading}
                aria-label="Send message"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="chat-input-hint">Press Enter to send · Shift+Enter for new line</p>
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
};

export default AIAgent;