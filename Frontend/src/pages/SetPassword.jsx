import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import api from "../api";
import "../styles/auth.css";

export default function SetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [complete, setComplete] = useState(false);
  const [showP1, setShowP1] = useState(false);
  const [showP2, setShowP2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const email = location.state?.email || sessionStorage.getItem("mfa_email");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [rules, setRules] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
    match: false,
  });

  useEffect(() => {
    setRules({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      number: /\d/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
      match: newPassword === confirmPassword && newPassword.length > 0,
    });
  }, [newPassword, confirmPassword]);

  const isValid = Object.values(rules).every(Boolean);
  const strengthCount = Object.values(rules).filter((r, i) => r && i < 4).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);

    try {
      // ── SIMULATED SUCCESS FLOW ──
      setTimeout(() => {
        // Set storage keys so App.jsx allows access to protected routes
        localStorage.setItem("access_token", "demo_token_123");
        localStorage.setItem("role", "admin"); // Directs to AdminDashboard (Menu view)
        localStorage.setItem("user_name", "Harshu Dhull");
        
        setComplete(true);
        
        // Wait 3 seconds for the user to see the "Success" popup
        setTimeout(() => {
          navigate("/home/dashboard");
        }, 3000);
      }, 1500);
    } catch (err) {
      setError("Failed to update password.");
      setLoading(false);
    }
  };

  const BrandHeader = () => (
    <div className="brand-logo">DINE<span className="accent">Vibe</span></div>
  );

  if (complete) {
    return (
      <div className="auth-wrapper flex items-center justify-center bg-white min-h-screen">
        <BrandHeader />
        <div className="success-container animate-in">
          <div className="success-icon-circle"><CheckCircle size={56} color="white" strokeWidth={3} /></div>
          <h2 className="success-title">Password Updated!</h2>
          <p className="success-subtitle">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper bg-white flex flex-col items-center justify-center min-h-screen">
      <BrandHeader />
      <div className="w-full max-w-[550px] px-6">
        <h2 className="figma-title" style={{ marginBottom: "12px" }}>Set Your Password</h2>
        <p className="real-app-subtitle" style={{ marginBottom: "40px" }}>
          Create a strong password to secure your account
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-block" style={{ marginBottom: '10px' }}>
            <label>New Password*</label>
            <div className="password-wrap">
              <input
                type={showP1 ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter New Password"
                required
              />
              <button type="button" className="eye-btn" onClick={() => setShowP1(!showP1)}>
                {showP1 ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          <div className="strength-meter-container">
            <div className="meter-bars">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className={`meter-bar ${strengthCount >= step ? 'filled' : ''}`} />
              ))}
            </div>
            <span className={`strength-label ${strengthCount === 4 ? 'good' : ''}`}>
              {strengthCount === 4 ? 'Good' : ''}
            </span>
          </div>

          <div className="input-block">
            <label>Confirm Password*</label>
            <div className="password-wrap">
              <input
                type={showP2 ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Enter Confirm Password"
                required
              />
              <button type="button" className="eye-btn" onClick={() => setShowP2(!showP2)}>
                {showP2 ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          <div className="password-rules-card">
            <p className="rules-header">Password Requirements</p>
            <div className="rules-grid">
              <RuleItem valid={rules.length} text="At least 8 characters" />
              <RuleItem valid={rules.uppercase} text="One uppercase letter" />
              <RuleItem valid={rules.number} text="One number" />
              <RuleItem valid={rules.special} text="One special character (!@#$%^&*)" />
              <RuleItem valid={rules.match} text="Passwords match" />
            </div>
          </div>

          <button type="submit" disabled={!isValid || loading} className={`figma-primary-btn ${isValid ? "" : "disabled"}`} style={{ marginTop: "32px" }}>
            {loading ? "Updating..." : "Update password & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

function RuleItem({ valid, text }) {
  return (
    <div className={`figma-rule-item ${valid ? "is-valid" : "is-invalid"}`}>
      {valid ? <CheckCircle size={18} className="icon-valid" /> : <XCircle size={18} className="icon-invalid" />}
      <span>{text}</span>
    </div>
  );
}