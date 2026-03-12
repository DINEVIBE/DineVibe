import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import api from "../api";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Default demo credentials for easier testing
    setIdentifier("test@dinevibe.com");
    setPassword("Test@123");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ── DEMO BYPASS LOGIC ──
    if (identifier === "test@dinevibe.com" && password === "Test@123") {
      setTimeout(() => {
        sessionStorage.setItem("mfa_email", identifier);
        navigate("/mfa", { state: { email: identifier, firstLogin: false } });
      }, 800);
      return;
    }

    try {
      const res = await api.post("/api/auth/login", {
        identifier: identifier.trim(),
        password: password.trim(),
      });

      if (res.data.status === "MFA_REQUIRED") {
        sessionStorage.setItem("mfa_email", identifier.trim());
        navigate("/mfa", { state: { email: identifier.trim(), firstLogin: false } });
      } else {
        localStorage.setItem("access_token", res.data.access_token);
        navigate("/home/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/mfa");
    } catch (err) {
      setError("Google sign-in failed.");
    }
  };

  return (
    <div className="login-screen">
      {/* BRANDING TOP LEFT - MATCHES image_b793b8.png */}
      <div className="brand-logo">
        DINE<span className="accent">Vibe</span>
      </div>

      <div className="login-left-side">
        <div className="form-wrapper">
          <h1 className="form-title">Get Started Now</h1>
          <p className="form-subtitle">Enter your credentials to access your account</p>

          {error && <div className="error-badge">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-block">
              <div className="label-flex">
                <label>Email or Phone Number</label>
                <button 
                  type="button" 
                  className="mode-toggle"
                  onClick={() => setIsPhoneMode(!isPhoneMode)}
                >
                  Use {isPhoneMode ? 'Email' : 'Phone'} Instead
                </button>
              </div>

              {isPhoneMode ? (
                <PhoneInput
                  defaultCountry="us"
                  value={identifier}
                  onChange={(phone) => setIdentifier(phone)}
                  className="custom-phone-input"
                />
              ) : (
                <input
                  type="text"
                  placeholder="Enter Email or Phone Number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              )}
            </div>

            <div className="input-block">
              <label>Password</label>
              <div className="password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
            </div>

            <div className="form-footer-links">
              <label className="check-label">
                <input type="checkbox" /> <span>Remember me</span>
              </label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" className="signin-btn" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="divider-row"><span>Or Continue with</span></div>
          <button type="button" className="google-auth-btn" onClick={handleGoogleSignIn}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" />
            Sign in with Google
          </button>
          
          {/* LINKED TO REGISTER PAGE */}
          <p className="footer-redirect">New to Dine Vibe? <Link to="/register">Sign up</Link></p>
        </div>
      </div>

      <div className="login-right-side">
        <div className="visual-panel"></div>
      </div>
    </div>
  );
}