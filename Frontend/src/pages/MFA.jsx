import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, CheckCircle } from 'lucide-react';
import "../styles/auth.css";

export default function MFA() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || sessionStorage.getItem("mfa_email") || "test@dinevibe.com";
  
  const [view, setView] = useState("selection"); 
  const [method, setMethod] = useState("email"); 
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(118); 

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

  const handleVerify = (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    setLoading(true);

    // ── DUMMY OTP LOGIC ──
    setTimeout(() => {
      if (otpValue === "123456") {
        setView("success");
        // CHANGED: Redirect to Set Password instead of Dashboard
        setTimeout(() => {
          navigate("/set-password", { state: { email } });
        }, 3000);
      } else {
        setError("Invalid code. Please use 123456");
        setLoading(false);
      }
    }, 1000);
  };

  const BrandHeader = () => (
    <div className="brand-logo">DINE<span className="accent">Vibe</span></div>
  );

  const maskedEmail = email.split('@')[0].slice(0, 3) + "***" + email.split('@')[1];

  if (view === "success") {
    return (
      <div className="auth-wrapper flex items-center justify-center bg-white min-h-screen">
        <BrandHeader />
        <div className="success-container animate-in">
          <div className="success-icon-circle"><CheckCircle size={56} color="white" strokeWidth={3} /></div>
          <h2 className="success-title">MFA Setup Complete!</h2>
          <p className="success-subtitle">Redirecting to password setup....</p>
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
            <div onClick={() => setMethod('email')} className={`method-row ${method === 'email' ? 'selected' : ''}`}>
              <div className="method-text">
                <p className="method-label">Email</p>
                <p className="method-desc">We'll send a code to {maskedEmail}</p>
              </div>
              <div className="custom-radio">{method === 'email' && <div className="radio-inner" />}</div>
            </div>
            <div onClick={() => setMethod('sms')} className={`method-row ${method === 'sms' ? 'selected' : ''}`}>
              <div className="method-text">
                <p className="method-label">Mobile</p>
                <p className="method-desc">We'll send a code to +1 (909) ****** 00</p>
              </div>
              <div className="custom-radio">{method === 'sms' && <div className="radio-inner" />}</div>
            </div>
          </div>
          <button onClick={() => { setView("otp"); setTimeLeft(118); }} className="figma-primary-btn">Continue</button>
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
        <p className="real-app-subtitle">
          we've sent a verification code to <span className="highlight-text">{method === 'email' ? maskedEmail : '+1 (909) ****** 00'}</span>
        </p>

        {method === "authenticator" && (
          <div className="qr-figma-container">
            <div className="qr-white-box">
               <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=DineVibe" alt="QR" />
            </div>
          </div>
        )}

        <p className="figma-input-hint" style={{ marginTop: '32px' }}>Confirm your six digit Authenticator Code*</p>

        {error && <div className="error-badge-figma">{error}</div>}

        <form onSubmit={handleVerify}>
          <div className="otp-grid-figma">
            {otp.map((digit, index) => (
              <React.Fragment key={index}>
                <input
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
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

        <div className="figma-footer-text">
          <span>Didn't receive the code? </span>
          <button type="button" onClick={() => setTimeLeft(120)} className="try-another-link">Resend Code</button>
        </div>
      </div>
    </div>
  );
}