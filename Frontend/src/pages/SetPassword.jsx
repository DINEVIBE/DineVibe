import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import api from "../api";
import "../styles/auth.css";

export default function SetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [complete, setComplete] = useState(false);

  // ✅ THIS IS THE ONLY PART THAT MOVED. THIS GOES FIRST.
  if (complete) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card text-center pt-8 pb-8">
          <CheckCircle size={64} className="mx-auto mb-5 text-green-500" />
          <h2>Password Updated</h2>
          <p className="text-gray-500 mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  const email =
    location.state?.email ||
    sessionStorage.getItem("mfa_email");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Session expired. Please login again.");
      return;
    }

    if (!isValid) {
      setError("Please meet all password requirements.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/set-password", {
        email,
        new_password: newPassword,
      });

      if (res.data.status === "SUCCESS") {
        setComplete(true)
        setTimeout(() => {
          localStorage.setItem("access_token", res.data.access_token);
          navigate("/home/dashboard");
        }, 2100)
      }

    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to update password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Set Your Password</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          <div className="auth-input-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="auth-input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
            />
          </div>

          <div className="password-rules">
            <p>Password Requirements:</p>
            <Rule valid={rules.length} text="At least 8 characters" />
            <Rule valid={rules.uppercase} text="One uppercase letter" />
            <Rule valid={rules.number} text="One number" />
            <Rule valid={rules.special} text="One special character" />
            <Rule valid={rules.match} text="Passwords match" />
          </div>

          <button
            type="submit"
            className="primary-btn full-width"
            disabled={!isValid || loading}
          >
            {loading ? "Updating..." : "Update Password & Continue"}
          </button>

        </form>
      </div>
    </div>
  );
}

function Rule({ valid, text }) {
  return (
    <div className={`rule ${valid ? "valid" : ""}`}>
      <CheckCircle size={14} />
      {text}
    </div>
  );
}