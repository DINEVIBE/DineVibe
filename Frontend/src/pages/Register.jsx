import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import api from "../api";
import "../styles/login.css";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    identifier: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ── DEMO BYPASS LOGIC ──
    // This allows you to show the flow without a working backend
    setTimeout(() => {
      sessionStorage.setItem("mfa_email", formData.identifier);
      // firstLogin: true triggers the setup flow in MFA
      navigate("/mfa", { state: { email: formData.identifier, firstLogin: true } });
    }, 1000);

    /* // REAL BACKEND LOGIC (Uncomment when API is ready)
    try {
      const res = await api.post("/api/auth/register", {
        ...formData,
        type: isPhoneMode ? "phone" : "email"
      });
      sessionStorage.setItem("mfa_email", formData.identifier);
      navigate("/mfa", { state: { email: formData.identifier, firstLogin: true } });
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed.");
      setLoading(false);
    } 
    */
  };

  return (
    <div className="login-screen">
      <div className="brand-logo">
        DINE<span className="accent">Vibe</span>
      </div>

      <div className="login-left-side">
        <div className="form-wrapper">
          <h1 className="form-title">Create Account</h1>
          <p className="form-subtitle">Join DineVibe to transform your restaurant intelligence.</p>

          {error && <div className="error-badge-figma">{error}</div>}

          <form onSubmit={handleRegister} className="auth-form">
            <div className="input-block">
              <label>Full Name*</label>
              <input
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            
            <div className="input-block">
              <div className="label-flex">
                <label>Email or Phone Number*</label>
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
                  value={formData.identifier}
                  onChange={(phone) => setFormData({...formData, identifier: phone})}
                  className="custom-phone-input"
                />
              ) : (
                <input
                  name="identifier"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                />
              )}
            </div>

            <div className="input-block">
              <label>Create Password*</label>
              <div className="password-wrap">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
            </div>

            <button type="submit" className="signin-btn" disabled={loading} style={{ marginTop: '20px' }}>
              {loading ? "Creating Account..." : "Register Now"}
            </button>
          </form>
          
          <p className="footer-redirect">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>

      <div className="login-right-side">
        <div className="visual-panel"></div>
      </div>
    </div>
  );
}