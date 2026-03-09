import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/otp.css";
import api from "../api";

export default function OTP() {
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);

  useEffect(() => {}, [navigate]);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      setError("Please enter complete OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const email = sessionStorage.getItem("otp_email") || sessionStorage.getItem("mfa_email");
      const method = sessionStorage.getItem("mfa_method") || "email";

      const res = await api.post("/api/auth/verify-otp", {
        email,
        otp: finalOtp,
        method,
      });

      if (res.data.status === "SUCCESS") {
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("role", res.data.user?.role || res.data.role || "");
        sessionStorage.removeItem("otp_email");
        navigate("/home", { replace: true });

      } else if (res.data.status === "MFA_SETUP_COMPLETE") {
        navigate("/set-password", { state: { email } });
      }

    } catch (err) {
      setError(err.response?.data?.detail || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-container">

      {/* LEFT BRAND PANEL */}
      <div className="otp-left">
        <h1 className="brand-title">DineVibe</h1>
        <p className="brand-subtitle">
          Secure verification required to continue.
          We've sent a one-time password to your registered email.
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="otp-right">
        <form className="otp-card" onSubmit={handleVerifyOTP}>

          <h2 className="otp-title">OTP Verification</h2>
          <p className="otp-subtitle">Enter the 6-digit code</p>

          {error && <div className="otp-error">{error}</div>}

          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
              />
            ))}
          </div>

          <button
            type="submit"
            className="verify-btn"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="resend-section">
            {timer > 0 ? (
              <div className="otp-timer">
                Resend OTP in {timer}s
              </div>
            ) : (
              <span
                className="resend-link"
                onClick={() => setTimer(60)}
              >
                Resend OTP
              </span>
            )}
          </div>

        </form>
      </div>

    </div>
  );
}
