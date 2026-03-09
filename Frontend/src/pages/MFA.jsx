import { useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Smartphone, Mail, KeyRound } from "lucide-react";
import api from "../api";
import "../styles/auth.css";
import MFAComplete from "./MFAComplete"; 

export default function MFA() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || sessionStorage.getItem("mfa_email");
  const firstLogin = location.state?.firstLogin ?? true; 

  const [method, setMethod] = useState("authenticator");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [showSuccess, setShowSuccess] = useState(false); 

  if (!email) return <Navigate to="/login" replace />;

  useEffect(() => {
    handleSelectMethod("authenticator");
  }, []);

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleSelectMethod = async (selectedMethod) => {
    setError("");
    setMethod(selectedMethod);
    setOtp(["", "", "", "", "", ""]);
    try {
      const res = await api.post("/api/auth/select-mfa", { email, method: selectedMethod });
      if (selectedMethod === "authenticator") {
        setQrUrl(res.data.qr_url);
        setManualKey(res.data.manual_key);
      }
    } catch (err) {
      console.error("MFA Init Error:", err);
      setQrUrl("otpauth://totp/DineVibe:user?secret=JBSWY3DPEHPK3PXP");
      setManualKey("JBSWY3DPEHPK3PXP");
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/verify-otp", { email, otp: otp.join("") });
      
      if (res.data.status === "MFA_SETUP_COMPLETE" || res.data.status === "SUCCESS") {
        // SAVE USER DATA HERE
        if (res.data.user) {
          localStorage.setItem("user_name", res.data.user.name);
          localStorage.setItem("user_email", res.data.user.email);
        }

        setShowSuccess(true);
        
        setTimeout(() => {
          if (res.data.status === "MFA_SETUP_COMPLETE") {
            navigate("/set-password", { state: { email } });
          } else {
            localStorage.setItem("access_token", res.data.access_token);
            localStorage.setItem("role", res.data.user.role);
            navigate("/home/dashboard");
          }
        }, 2000);
      }
    } catch (err) {
      setError("Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) return <MFAComplete />;

  return (
    <div className="auth-wrapper">
      <div className="auth-logo">
        <div className="logo-icon"><ShieldCheck size={28} /></div>
        <h1>DineVibe</h1>
        <p>Restaurant Intelligence Platform</p>
      </div>

      <div className={`auth-card ${firstLogin && method === "authenticator" ? 'setup-mode' : 'login-mode'}`}>
        <h2>Secure Your Account</h2>
        <p className="auth-subtitle">
          {firstLogin ? "Set up multi-factor authentication to protect your account" : "Enter your verification code"}
        </p>

        <div className="mfa-method-tabs">
          <button className={method === "authenticator" ? "active" : ""} onClick={() => handleSelectMethod("authenticator")}>
            <KeyRound size={16} /> Authenticator
          </button>
          <button className={method === "sms" ? "active" : ""} onClick={() => handleSelectMethod("sms")}>
            <Smartphone size={16} /> Mobile OTP
          </button>
          <button className={method === "email" ? "active" : ""} onClick={() => handleSelectMethod("email")}>
            <Mail size={16} /> Email OTP
          </button>
        </div>

        {firstLogin && method === "authenticator" && (
          <div className="mfa-setup-content">
            <div className="recommended-banner">
              <strong>Recommended Method</strong>
              <p>Most secure option for protecting your account</p>
            </div>

            <div className="setup-step">
              <p className="step-label">Step 1: Download an authenticator app</p>
              <div className="app-grid">
                <button className="app-store-btn">Google Authenticator <span>iOS & Android</span></button>
                <button className="app-store-btn">Microsoft Authenticator <span>iOS & Android</span></button>
              </div>
            </div>

            <div className="setup-step">
              <p className="step-label">Step 2: Scan this QR code</p>
              <div className="qr-wrapper">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrUrl || 'DineVibe-Setup')}`} 
                  alt="MFA QR Code" 
                />
              </div>
              <p className="manual-label">Or enter this code manually:</p>
              <div className="manual-key">{manualKey || "JBSWY3DPEHPK3PXP"}</div>
            </div>

            <div className="setup-step"><p className="step-label">Step 3: Enter the 6-digit code</p></div>
          </div>
        )}

        <div className="verification-area">
          {error && <div className="auth-error">{error}</div>}
          <label className="input-label">Verification Code</label>
          <div className="otp-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                className="otp-input-square"
              />
            ))}
          </div>
          
          <div className="demo-notice">Demo: Use code <strong>123456</strong> to continue</div>

          <button className="primary-btn full-width" onClick={handleVerify} disabled={loading || otp.join("").length !== 6}>
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}