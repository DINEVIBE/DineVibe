import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import api from "../api"; // ✅ Imported your axios instance
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // ✅ Added for backend error messages

  // Focus management when switching modes
  useEffect(() => {
    if (inputRef.current) {
      const timeout = setTimeout(() => {
        const input = inputRef.current.querySelector('input') || inputRef.current;
        input.focus();
        if (input.setSelectionRange) {
          const len = identifier.length;
          input.setSelectionRange(len, len);
        }
      }, 10);
      return () => clearTimeout(timeout);
    }
  }, [isPhoneMode]);

  const handleIdentifierChange = (val) => {
    if (!val || val === "+" || val.trim() === "") {
      setIdentifier("");
      setIsPhoneMode(false);
      return;
    }
    const isNumeric = /^[+]?[0-9]/.test(val);
    const hasEmailClues = /[@a-zA-Z]/.test(val);

    setIsPhoneMode(isNumeric && !hasEmailClues);
    setIdentifier(val);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors

    try {
      // ✅ Real Backend Integration
      // Hits http://localhost:8001/api/auth/login/password based on your main.py config
      const res = await api.post("/auth/login/password", {
        email: identifier, // Backend expects 'email' key in PasswordLoginRequest
        password: password
      });

      // ✅ Handle MFA Redirection
      if (res.data.status === "MFA_REQUIRED") {
        sessionStorage.setItem("mfa_email", identifier);
        navigate("/mfa", { state: { email: identifier, mustChange: res.data.must_change_password } });
      } 
      // ✅ Handle Direct Success (if MFA is disabled)
      else if (res.data.status === "SUCCESS") {
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("role", res.data.role);
        navigate("/home/dashboard");
      }
    } catch (err) {
      // ✅ Handle backend errors (401, 404, etc)
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="brand-logo-fixed">
        DINE<span className="accent">Vibe</span>
      </div>

      <div className="login-container">
        <div className="login-left">
          <div className="form-content">
            <h1 className="form-title">Get Started Now</h1>
            <p className="form-subtitle">Enter your credentials to access your account</p>

            {/* ✅ Show error badge if backend returns an error */}
            {error && <div className="error-badge-figma" style={{ marginBottom: "20px" }}>{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="input-block">
                <div className="label-row">
                  <label>Email or Phone Number</label>
                  <button 
                    type="button" 
                    className="mode-switch" 
                    onClick={() => {
                      setIsPhoneMode(!isPhoneMode);
                      setIdentifier(""); 
                    }}
                  >
                    Use {isPhoneMode ? 'Email' : 'Phone'} Instead
                  </button>
                </div>

                <div ref={inputRef}>
                  {isPhoneMode ? (
                    <PhoneInput
                      defaultCountry="us"
                      value={identifier}
                      onChange={(phone) => handleIdentifierChange(phone)}
                      className="custom-phone"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Enter Email or Phone Number"
                      value={identifier}
                      onChange={(e) => handleIdentifierChange(e.target.value)}
                      required
                    />
                  )}
                </div>
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
                {loading ? "Verifying..." : "Sign In"}
              </button>
            </form>

            <div className="divider"><span>Or Continue with</span></div>
            <button type="button" className="google-btn">
              Sign in with Google
            </button>
            
            <p className="signup-text">New to Dine Vibe? <Link to="/register">Sign up</Link></p>
          </div>
        </div>

        <div className="login-right">
          <div className="orange-panel"></div>
        </div>
      </div>
    </div>
  );
}