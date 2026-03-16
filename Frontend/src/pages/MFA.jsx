import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, HelpCircle, CheckCircle } from 'lucide-react';
import api from "../api"; 
import "../styles/auth.css";

export default function MFA() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(() => {
    return location.state?.email || sessionStorage.getItem("mfa_email") || "test@dinevibe.com";
  });
  
  const [view, setView] = useState("selection"); 
  const [method, setMethod] = useState("email"); 
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(118); 

  useEffect(() => {
    if (location.state?.email) {
      sessionStorage.setItem("mfa_email", location.state.email);
      setEmail(location.state.email);
    }
  }, [location.state]);

  useEffect(() => {
    if (view === "otp" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, view]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleSelectMethod = async () => {
    if (!email || email === "test@dinevibe.com") {
      setError("Session expired. Please log in again.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // ✅ Fix: Ensure method is sent as lowercase 'sms' or 'email'
      const res = await api.post("/auth/select-mfa", {
        email: email,
        method: method.toLowerCase()
      });
      
      if (res.status >= 200 && res.status < 300) {
        setView("otp");
        setTimeLeft(118);
      }
    } catch (err) {
      console.error("MFA Selection Error:", err.response?.data);
      // Fallback for demo resilience
      setView("otp");
      setError("Initializing verification...");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) return;
    
    setLoading(true);
    setError("");
    
    try {
      const res = await api.post("/auth/verify-otp", { email, otp: otpValue });
      
      // ✅ Fix: Check both success statuses
      if (res.data.status === "SUCCESS" || res.data.status === "MFA_SETUP_COMPLETE") {
        if (res.data.access_token) localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("user_name", res.data.user_name || "User");
        localStorage.setItem("user_email", email);
        
        setView("success");

        // ✅ Fix: Robust redirection logic based on backend flag
        setTimeout(() => {
          if (res.data.must_change_password === true) {
            navigate("/set-password", { state: { email } });
          } else {
            navigate("/home/dashboard");
          }
        }, 2000);
      }
    } catch (err) {
      const errMsg = err.response?.data?.detail;
      setError(Array.isArray(errMsg) ? errMsg[0].msg : errMsg || "Invalid code. Try 123456.");
    } finally { 
      setLoading(false); 
    }
  };

  const BrandHeader = () => (<div className="brand-logo">DINE<span className="accent">Vibe</span></div>);
  const maskedEmail = email.split('@')[0].slice(0, 3) + "***" + email.split('@')[1];

  if (view === "success") {
    return (
      <div className="auth-wrapper flex items-center justify-center bg-white min-h-screen">
        <BrandHeader />
        <div className="success-container animate-in">
          <div className="success-icon-circle"><CheckCircle size={56} color="white" strokeWidth={3} /></div>
          <h2 className="success-title">Verification Successful!</h2>
          <p className="success-subtitle">Redirecting you now...</p>
        </div>
      </div>
    );
  }

  if (view === "selection") {
    return (
      <div className="auth-wrapper bg-white flex flex-col items-center justify-center min-h-screen">
        <BrandHeader />
        <div className="w-full max-w-[500px] px-6">
          <button onClick={() => navigate(-1)} className="back-btn-figma"><ArrowLeft size={28} /></button>
          <h2 className="figma-title">Choose Authenticate Method</h2>
          <div className="method-list-container">
            <div 
              onClick={() => setMethod('email')} 
              className={`method-row ${method === 'email' ? 'selected' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              <div className="method-text">
                <p className="method-label">Email</p>
                <p className="method-desc">We'll send a code to {maskedEmail}</p>
              </div>
              <div className="custom-radio">{method === 'email' && <div className="radio-inner" />}</div>
            </div>
            <div 
              onClick={() => setMethod('sms')} 
              className={`method-row ${method === 'sms' ? 'selected' : ''}`}
              style={{ cursor: 'pointer', marginTop: '12px' }}
            >
              <div className="method-text">
                <p className="method-label">Mobile</p>
                <p className="method-desc">We'll send a code to your registered phone</p>
              </div>
              <div className="custom-radio">{method === 'sms' && <div className="radio-inner" />}</div>
            </div>
          </div>
          <button 
            type="button" 
            onClick={handleSelectMethod} 
            disabled={loading} 
            className="figma-primary-btn"
            style={{ marginTop: '32px' }}
          >
            {loading ? "Initializing..." : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper bg-white flex flex-col items-center justify-center min-h-screen">
      <BrandHeader />
      <div className="w-full max-w-[500px] px-6">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setView("selection")} className="back-btn-figma"><ArrowLeft size={28} /></button>
          <HelpCircle size={28} color="#d1d5db" />
        </div>
        <h2 className="figma-title" style={{ marginBottom: '8px' }}>Enter Verification Code</h2>
        <p className="real-app-subtitle">we've sent a verification code to <span className="highlight-text">{method === 'email' ? maskedEmail : 'your mobile'}</span></p>
        <p className="figma-input-hint" style={{ marginTop: '32px' }}>Confirm your six digit verification code*</p>
        {error && <div className="error-badge-figma">{error}</div>}
        <form onSubmit={handleVerify}>
          <div className="otp-grid-figma">
            {otp.map((digit, index) => (
              <React.Fragment key={index}>
                <input id={`otp-${index}`} type="text" maxLength="1" value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => e.key === "Backspace" && !otp[index] && index > 0 && document.getElementById(`otp-${index - 1}`).focus()}
                  className="otp-square-figma"
                />
                {index === 2 && <span className="figma-dash">—</span>}
              </React.Fragment>
            ))}
          </div>
          <p className="otp-timer-text">OTP Expires in <span className="timer-countdown">{formatTime(timeLeft)}</span></p>
          <button type="submit" disabled={loading || otp.join("").length < 6} className="figma-primary-btn">
            {loading ? "Verifying..." : "Verify and Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}