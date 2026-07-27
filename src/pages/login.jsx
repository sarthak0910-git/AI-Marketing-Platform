import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .auth-root {
    min-height: 100vh;
    background: #0d0e14;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }

  /* Ambient blobs */
  .auth-blob-1 {
    position: fixed;
    top: -240px;
    left: -200px;
    width: 680px;
    height: 680px;
    border-radius: 50%;
    background: radial-gradient(circle, #6366f128 0%, transparent 68%);
    pointer-events: none;
    z-index: 0;
  }
  .auth-blob-2 {
    position: fixed;
    bottom: -220px;
    right: -180px;
    width: 580px;
    height: 580px;
    border-radius: 50%;
    background: radial-gradient(circle, #8b5cf620 0%, transparent 68%);
    pointer-events: none;
    z-index: 0;
  }
  .auth-blob-3 {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 900px;
    height: 900px;
    border-radius: 50%;
    background: radial-gradient(circle, #6366f108 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  .auth-card {
    width: 100%;
    max-width: 480px;
    background: rgba(19, 20, 28, 0.88);
    backdrop-filter: blur(32px);
    -webkit-backdrop-filter: blur(32px);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 28px;
    padding: 52px 48px;
    position: relative;
    z-index: 1;
    box-shadow:
      0 40px 100px rgba(0,0,0,0.55),
      0 0 0 1px rgba(255,255,255,0.03) inset,
      0 1px 0 rgba(255,255,255,0.06) inset;
    animation: card-in 0.45s cubic-bezier(0.16,1,0.3,1) both;
  }

  @keyframes card-in {
    from { opacity: 0; transform: translateY(24px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ── Logo ── */
  .auth-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 36px;
  }
  .auth-logo-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 0 8px 28px #6366f145, 0 0 0 1px #ffffff10 inset;
    flex-shrink: 0;
  }
  .auth-logo-text {
    font-family: 'Sora', sans-serif;
    font-size: 18px;
    font-weight: 700;
    background: linear-gradient(135deg, #e8e8f0 30%, #a5b4fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.2px;
  }

  /* ── Headings ── */
  .auth-heading {
    font-family: 'Sora', sans-serif;
    font-size: 30px;
    font-weight: 800;
    color: #eeeef8;
    text-align: center;
    margin-bottom: 8px;
    letter-spacing: -0.6px;
    line-height: 1.15;
  }
  .auth-subheading {
    font-size: 14px;
    color: #55556e;
    text-align: center;
    margin-bottom: 38px;
    font-weight: 400;
    line-height: 1.5;
  }

  /* ── Fields ── */
  .auth-field {
    margin-bottom: 20px;
  }
  .auth-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    font-weight: 600;
    color: #8888aa;
    margin-bottom: 9px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .auth-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .auth-input-icon {
    position: absolute;
    left: 17px;
    top: 50%;
    transform: translateY(-50%);
    color: #44445a;
    pointer-events: none;
    display: flex;
    align-items: center;
    transition: color 0.2s;
    z-index: 1;
  }
  .auth-input-wrap:focus-within .auth-input-icon {
    color: #6366f1;
  }
  .auth-input {
    width: 100%;
    height: 54px;
    padding: 0 18px 0 46px;
    border-radius: 13px;
    border: 1.5px solid rgba(255,255,255,0.07);
    background: rgba(10,10,16,0.55);
    color: #e8e8f0;
    font-size: 14.5px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.22s, box-shadow 0.22s, background 0.22s;
    appearance: none;
  }
  .auth-input.has-toggle { padding-right: 48px; }
  .auth-input::placeholder { color: #33334a; }
  .auth-input:hover {
    border-color: rgba(99,102,241,0.22);
    background: rgba(14,14,22,0.65);
  }
  .auth-input:focus {
    border-color: #6366f166;
    background: rgba(99,102,241,0.06);
    box-shadow: 0 0 0 4px rgba(99,102,241,0.10), 0 2px 12px rgba(99,102,241,0.08);
  }

  /* show/hide password toggle */
  .auth-eye-btn {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #44445a;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 6px;
    transition: color 0.18s, background 0.18s;
    z-index: 2;
  }
  .auth-eye-btn:hover {
    color: #a5b4fc;
    background: rgba(99,102,241,0.12);
  }

  /* ── Submit button ── */
  .auth-btn {
    width: 100%;
    height: 52px;
    margin-top: 10px;
    border-radius: 13px;
    border: none;
    background: linear-gradient(135deg, #6366f1 0%, #7c5cbf 50%, #8b5cf6 100%);
    background-size: 200% 200%;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: transform 0.18s, box-shadow 0.22s, opacity 0.18s, background-position 0.4s;
    box-shadow: 0 8px 28px rgba(99,102,241,0.35);
    position: relative;
    overflow: hidden;
  }
  .auth-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 60%);
    pointer-events: none;
  }
  .auth-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 14px 40px rgba(99,102,241,0.50), 0 0 0 1px rgba(255,255,255,0.10) inset;
    background-position: right center;
  }
  .auth-btn:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 6px 20px rgba(99,102,241,0.30);
  }
  .auth-btn:disabled {
    opacity: 0.52;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* spinner */
  @keyframes auth-spin { to { transform: rotate(360deg); } }
  .auth-spinner {
    width: 17px;
    height: 17px;
    border: 2px solid rgba(255,255,255,0.28);
    border-top-color: #fff;
    border-radius: 50%;
    animation: auth-spin 0.65s linear infinite;
    flex-shrink: 0;
  }

  /* ── Divider ── */
  .auth-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 28px 0;
  }
  .auth-divider-line {
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.055);
  }
  .auth-divider-text {
    font-size: 11px;
    color: #33334a;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }

  /* ── Footer ── */
  .auth-footer {
    text-align: center;
    font-size: 13.5px;
    color: #55556e;
    line-height: 1.6;
  }
  .auth-link {
    color: #a5b4fc;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.15s;
  }
  .auth-link:hover { color: #c4b5fd; text-decoration: underline; text-underline-offset: 3px; }

  /* ── Error banner ── */
  .auth-error {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.22);
    color: #fca5a5;
    border-radius: 12px;
    padding: 13px 16px;
    font-size: 13px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 9px;
    animation: shake 0.35s cubic-bezier(0.36,0.07,0.19,0.97);
  }
  @keyframes shake {
    10%, 90% { transform: translateX(-2px); }
    20%, 80% { transform: translateX(3px); }
    30%, 50%, 70% { transform: translateX(-3px); }
    40%, 60% { transform: translateX(3px); }
  }
  .auth-error-icon { flex-shrink: 0; opacity: 0.85; }

  /* ── Responsive ── */
  @media (max-width: 520px) {
    .auth-card { padding: 38px 28px; border-radius: 22px; }
    .auth-heading { font-size: 25px; }
  }
  @media (max-width: 380px) {
    .auth-card { padding: 30px 20px; }
  }
`;

// SVG icon primitives (inline — no extra dependency)
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="3"/>
    <path d="M2 7l10 7 10-7"/>
  </svg>
);

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const IconAlert = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  // ── Unchanged auth logic ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      alert("Login Successful!");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-root">
        <div className="auth-blob-1" />
        <div className="auth-blob-2" />
        <div className="auth-blob-3" />

        <div className="auth-card">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">🔥</div>
            <span className="auth-logo-text">AI Marketing Platform</span>
          </div>

          {/* Heading */}
          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-subheading">Sign in to continue to AI Marketing Platform</p>

          {/* Error */}
          {error && (
            <div className="auth-error" key={error}>
              <span className="auth-error-icon"><IconAlert /></span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><IconMail /></span>
                <input
                  id="login-email"
                  className="auth-input"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><IconLock /></span>
                <input
                  id="login-password"
                  className="auth-input has-toggle"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              className="auth-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Signing in…
                </>
              ) : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">OR</span>
            <div className="auth-divider-line" />
          </div>

          {/* Footer */}
          <p className="auth-footer">
            Don't have an account?{" "}
            <Link className="auth-link" to="/signup">Create Account</Link>
          </p>
        </div>
      </div>
    </>
  );
}