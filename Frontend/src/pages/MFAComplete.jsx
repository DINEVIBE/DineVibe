import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function MFAComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    const timer = setTimeout(() => {
      // Directs to password setup matching the flow requirement
      navigate('/set-password', { state: { email } });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, email]);

  return (
    <div className="auth-wrapper flex items-center justify-center bg-white min-h-screen">
      <div className="brand-logo">
        DINE<span className="accent">Vibe</span>
      </div>

      <div className="success-container animate-in">
        <div className="success-icon-circle">
          <CheckCircle size={56} color="white" strokeWidth={3} />
        </div>
        
        <h2 className="success-title">MFA Setup Complete!</h2>
        <p className="success-subtitle">Redirecting to password setup....</p>
      </div>
    </div>
  );
}