import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null); // 'user' or 'hero'
  const [isLoginMode, setIsLoginMode] = useState(false); // false=signup, true=login
  const [formData, setFormData] = useState({});
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData({});
    setAadhaarPreview(null);
    setSubmitSuccess(false);
    setErrorMessage("");
    setIsLoginMode(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleAadhaarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, aadhaarCard: file }));
      const reader = new FileReader();
      reader.onloadend = () => setAadhaarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (isLoginMode) {
        // ─── LOGIN ───
        const endpoint =
          selectedRole === "hero"
            ? "http://localhost:3000/api/login-hero"
            : "http://localhost:3000/api/login-user";

        const response = await axios.post(endpoint, {
          email: formData.email,
          password: formData.password,
        });

        const result = response.data;
        const userData =
          selectedRole === "hero" ? result.hero : result.user;

        // Store in auth context and redirect
        login(userData, selectedRole);
        navigate("/");
      } else {
        // ─── SIGNUP ───
        const endpoint =
          selectedRole === "hero"
            ? "http://localhost:3000/api/register-hero"
            : "http://localhost:3000/api/register-user";

        let payload;
        if (selectedRole === "hero") {
          payload = {
            fullname: formData.fullName,
            email: formData.email,
            password: formData.password,
            skills: formData.skills,
            phone: formData.phone,
            city: formData.city,
          };
        } else {
          payload = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            city: formData.city,
          };
        }

        const response = await axios.post(endpoint, payload);
        const result = response.data;
        const userData =
          selectedRole === "hero" ? result.hero : result.user;

        // Auto-login after signup
        login(userData, selectedRole);
        setSubmitSuccess(true);
      }
    } catch (error) {
      console.log(`Error: ${error}`);
      const msg =
        error.response?.data?.message || "Something went wrong. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setSelectedRole(null);
    setFormData({});
    setAadhaarPreview(null);
    setSubmitSuccess(false);
    setErrorMessage("");
    setIsLoginMode(true);
  };

  const toggleMode = () => {
    setIsLoginMode((prev) => !prev);
    setFormData({});
    setErrorMessage("");
  };

  return (
    <div className="login-page">
      {/* Animated Background */}
      <div className="login-bg">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
        <div className="login-grid-bg" />
      </div>

      <div className="login-container">
        {/* ─── Role Selection ─── */}
        {!selectedRole && !submitSuccess && (
          <div className="role-selection fade-in" id="role-selection">
            <div className="login-header">
              <div className="login-badge">
                <span className="badge-dot-login" />
                Join Hukoom
              </div>
              <h1 className="login-title">
                Choose Your <span className="login-highlight">Role</span>
              </h1>
              <p className="login-subtitle">
                Select how you'd like to join our platform. Users can request
                services, Heroes provide them.
              </p>
            </div>

            <div className="role-cards">
              {/* User Card */}
              <div
                className="role-card"
                onClick={() => handleRoleSelect("user")}
                id="role-user-card"
                style={{ "--card-accent": "var(--gradient-accent)" }}
              >
                <div className="role-icon-wrap user-icon">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h2 className="role-card-title">Continue as User</h2>
                <p className="role-card-desc">
                  Request services, track orders, and connect with professional
                  heroes in your city.
                </p>
                <div className="role-features">
                  <div className="role-feature">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--accent-primary)"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Request Services
                  </div>
                  <div className="role-feature">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--accent-primary)"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Track Orders
                  </div>
                  <div className="role-feature">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--accent-primary)"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Rate & Review
                  </div>
                </div>
                <div className="role-card-action">
                  Get Started
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>

              {/* Hero Card */}
              <div
                className="role-card hero-role-card"
                onClick={() => handleRoleSelect("hero")}
                id="role-hero-card"
                style={{ "--card-accent": "var(--gradient-gold)" }}
              >
                <div className="role-icon-wrap hero-icon">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                {/* <div className="hero-badge-tag">PRO</div> */}
                <h2 className="role-card-title">Continue as Hero</h2>
                <p className="role-card-desc">
                  Offer your skills, grow your business, and become a trusted
                  service provider on the platform.
                </p>
                <div className="role-features">
                  <div className="role-feature">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--gold)"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Offer Services
                  </div>
                  <div className="role-feature">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--gold)"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Build Reputation
                  </div>
                  <div className="role-feature">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--gold)"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Earn & Grow
                  </div>
                </div>
                <div className="role-card-action hero-action">
                  Get Started
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── User Form (Login or Signup) ─── */}
        {selectedRole === "user" && !submitSuccess && (
          <div className="signup-form-wrapper fade-in" id="user-signup-form">
            <button
              className="back-btn"
              onClick={handleBack}
              id="back-btn-user"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>

            <div className="form-card">
              <div className="form-header">
                <div className="form-icon user-form-icon">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h2 className="form-title">
                  {isLoginMode ? "Welcome Back, User" : "Create User Account"}
                </h2>
                <p className="form-subtitle">
                  {isLoginMode
                    ? "Sign in with your email and password"
                    : "Fill in your details to get started"}
                </p>
              </div>

              {/* Mode toggle tabs */}
              <div className="auth-mode-toggle">
                
                <button
                  className={`auth-mode-btn ${isLoginMode ? "active" : ""}`}
                  onClick={() => toggleMode()}
                  type="button"
                >
                  Login🔥
                </button>

                <button
                  className={`auth-mode-btn ${!isLoginMode ? "active" : ""}`}
                  onClick={() => toggleMode()}
                  type="button"
                >
                  Sign Up / New User⚡
                </button>
              </div>

              {/* Error message */}
              {errorMessage && (
                <div className="auth-error-msg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="signup-form">
                {/* Username — signup only */}
                {!isLoginMode && (
                  <div className="form-group">
                    <label htmlFor="user-username">Username</label>
                    <div className="input-wrapper">
                      <svg
                        className="input-icon"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        type="text"
                        id="user-username"
                        name="username"
                        placeholder="Choose a username"
                        value={formData.username || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="user-email">Email Address</label>
                  <div className="input-wrapper">
                    <svg
                      className="input-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <input
                      type="email"
                      id="user-email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="user-password">Password</label>
                  <div className="input-wrapper">
                    <svg
                      className="input-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="user-password"
                      name="password"
                      placeholder={isLoginMode ? "Enter your password" : "Create a strong password"}
                      value={formData.password || ""}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Phone & City — signup only */}
                {!isLoginMode && (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="user-phone">Phone Number</label>
                      <div className="input-wrapper">
                        <svg
                          className="input-icon"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <input
                          type="tel"
                          id="user-phone"
                          name="phone"
                          placeholder="+91 XXXXX XXXXX"
                          value={formData.phone || ""}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="user-city">City</label>
                      <div className="input-wrapper">
                        <svg
                          className="input-icon"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <input
                          type="text"
                          id="user-city"
                          name="city"
                          placeholder="Your city"
                          value={formData.city || ""}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="submit-btn user-submit"
                  id="user-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="spinner" />
                  ) : (
                    <>
                      {isLoginMode ? "Sign In" : "Create Account"}
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ─── Hero Form (Login or Signup) ─── */}
        {selectedRole === "hero" && !submitSuccess && (
          <div className="signup-form-wrapper fade-in" id="hero-signup-form">
            <button
              className="back-btn"
              onClick={handleBack}
              id="back-btn-hero"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>

            <div className="form-card hero-form-card">
              <div className="form-header">
                <div className="form-icon hero-form-icon">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <h2 className="form-title">
                  {isLoginMode ? "Welcome Back, Hero" : "Become a Hero"}
                </h2>
                <p className="form-subtitle">
                  {isLoginMode
                    ? "Sign in with your email and password"
                    : "Register as a service provider and start earning"}
                </p>
              </div>

              {/* Mode toggle tabs */}
              <div className="auth-mode-toggle">
                <button
                  className={`auth-mode-btn ${isLoginMode ? "active" : ""}`}
                  onClick={() => toggleMode()}
                  type="button"
                >
                  Login🔥
                </button>
                <button
                  className={`auth-mode-btn ${!isLoginMode ? "active" : ""}`}
                  onClick={() => toggleMode()}
                  type="button"
                >
                  Register as a Hero⚡
                </button>
              </div>

              {/* Error message */}
              {errorMessage && (
                <div className="auth-error-msg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="signup-form">
                {/* Full Name — signup only */}
                {!isLoginMode && (
                  <div className="form-group">
                    <label htmlFor="hero-fullname">Full Name</label>
                    <div className="input-wrapper">
                      <svg
                        className="input-icon"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        type="text"
                        id="hero-fullname"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="hero-email">Email Address</label>
                  <div className="input-wrapper">
                    <svg
                      className="input-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <input
                      type="email"
                      id="hero-email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="hero-password">Password</label>
                  <div className="input-wrapper">
                    <svg
                      className="input-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="hero-password"
                      name="password"
                      placeholder={isLoginMode ? "Enter your password" : "Create a strong password"}
                      value={formData.password || ""}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Skills, Phone, City, Aadhaar — signup only */}
                {!isLoginMode && (
                  <>
                    <div className="form-group">
                      <label htmlFor="hero-skills">Skills</label>
                      <div className="input-wrapper">
                        <svg
                          className="input-icon"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                        </svg>
                        <input
                          type="text"
                          id="hero-skills"
                          name="skills"
                          placeholder="e.g. Plumbing, Electrical, Carpentry"
                          value={formData.skills || ""}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="hero-phone">Phone Number</label>
                        <div className="input-wrapper">
                          <svg
                            className="input-icon"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          <input
                            type="tel"
                            id="hero-phone"
                            name="phone"
                            placeholder="+91 XXXXX XXXXX"
                            value={formData.phone || ""}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="hero-city">City</label>
                        <div className="input-wrapper">
                          <svg
                            className="input-icon"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <input
                            type="text"
                            id="hero-city"
                            name="city"
                            placeholder="Your city"
                            value={formData.city || ""}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Aadhaar Card Upload */}
                    <div className="form-group">
                      <label>Aadhaar Card Image</label>
                      <div
                        className={`aadhaar-upload ${aadhaarPreview ? "has-preview" : ""}`}
                        onClick={() => fileInputRef.current?.click()}
                        id="aadhaar-upload-area"
                      >
                        {aadhaarPreview ? (
                          <div className="aadhaar-preview">
                            <img src={aadhaarPreview} alt="Aadhaar Card Preview" />
                            <div className="aadhaar-overlay">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                              </svg>
                              <span>Click to change</span>
                            </div>
                          </div>
                        ) : (
                          <div className="upload-placeholder">
                            <div className="upload-icon-circle">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                              </svg>
                            </div>
                            <p className="upload-text">
                              Click to upload your <strong>Aadhaar Card</strong>
                            </p>
                            <p className="upload-hint">
                              Supports JPG, PNG, PDF — Max 5MB
                            </p>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleAadhaarUpload}
                          style={{ display: "none" }}
                          id="aadhaar-file-input"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="submit-btn hero-submit"
                  id="hero-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="spinner" />
                  ) : (
                    <>
                      {isLoginMode ? "Sign In" : "Register as Hero"}
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {isLoginMode ? (
                          <>
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </>
                        ) : (
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        )}
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ─── Success State ─── */}
        {submitSuccess && (
          <div className="success-wrapper fade-in" id="signup-success">
            <div className="success-card">
              <div className="success-icon-wrap">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className="success-title">Welcome to Hukoom!</h2>
              <p className="success-desc">
                Your {selectedRole === "hero" ? "Hero" : "User"} account has
                been created successfully. You can now start{" "}
                {selectedRole === "hero"
                  ? "offering your services"
                  : "exploring services"}
                .
              </p>
              <button
                className="submit-btn user-submit"
                onClick={() => navigate("/")}
                style={{ maxWidth: "280px", margin: "0 auto" }}
              >
                Go to Home
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
