import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIdentifier("test@dinevibe.com");
    setPassword("Test@123");
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate flow for demo
    setTimeout(() => {
      sessionStorage.setItem("mfa_email", identifier);
      navigate("/mfa", { state: { email: identifier } });
    }, 800);
  };

  return (
    <div className="login-screen">
      {/* Branding - Top Left */}
      <div className="brand-logo-fixed">
        DINE<span className="accent">Vibe</span>
      </div>

      <div className="login-container">
        {/* Left Side: Form */}
        <div className="login-left">
          <div className="form-content">
            <h1 className="form-title">Get Started Now</h1>
            <p className="form-subtitle">Enter your credentials to access your account</p>

            <form onSubmit={handleLogin}>
              <div className="input-block">
                <div className="label-row">
                  <label>Email or Phone Number</label>
                  <button type="button" className="mode-switch" onClick={() => setIsPhoneMode(!isPhoneMode)}>
                    Use {isPhoneMode ? 'Email' : 'Phone'} Instead
                  </button>
                </div>

                {isPhoneMode ? (
                  <PhoneInput
                    defaultCountry="us"
                    value={identifier}
                    onChange={(phone) => setIdentifier(phone)}
                    className="custom-phone"
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
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <label className="remember-me">
                  <input type="checkbox" /> <span>Remember me</span>
                </label>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="divider"><span>Or Continue with</span></div>
            <button type="button" className="google-btn">
              Sign in with Google
            </button>
            
            <p className="signup-text">New to Dine Vibe? <Link to="/register">Sign up</Link></p>
          </div>
        </div>

        {/* Right Side: Visual Panel */}
        <div className="login-right">
          <div className="orange-panel"></div>
        </div>
      </div>
    </div>
  );
}