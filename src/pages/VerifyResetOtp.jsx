import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/common/Button';
import { Key, ArrowLeft, Home, Mail } from 'lucide-react';
import cityscapeBg from '../assets/login_bg.png';

const API_URL = "http://localhost:5000";

export default function VerifyResetOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Retrieve email from navigation state, default to empty string
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Resend Timer logic
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    if (!email) {
      setError("Email address is required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Code verified successfully!");
        setTimeout(() => {
          // Navigate to reset password page, passing token and email
          navigate("/reset-password", { state: { email, resetToken: data.resetToken } });
        }, 1200);
      } else {
        setError(data.error || "Invalid or expired OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP Verification error:", err);
      setError("⚠️ Server error. Could not connect to API server.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !email) return;

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setMessage("✅ A new OTP code has been sent to your email.");
        setCountdown(60); // disable resend for 60 seconds
      } else {
        const data = await res.json();
        setError(data.error || "Failed to resend OTP.");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("⚠️ Server error during OTP request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 selection:bg-primary-200" style={{ backgroundImage: `url(${cityscapeBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="max-w-md w-full glass-card p-10 rounded-3xl shadow-xl shadow-primary-900/5 relative overflow-hidden group">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary-200 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-200 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
              <Home className="w-8 h-8" />
            </div>
          </div>
          
          <h2 className="text-3xl font-extrabold text-center text-gray-900 font-sans tracking-tight mb-2">Verify OTP</h2>
          <p className="text-center text-gray-500 font-medium mb-8">
            Enter the 6-digit security code sent to your email address
          </p>
          
          {message && (
            <div className="mb-6 p-4 rounded-xl text-sm font-semibold bg-green-50 text-green-700 border border-green-200">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl text-sm font-semibold bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!location.state?.email && (
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-gray-900"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">One-Time Password (OTP)</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                  maxLength="6"
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-gray-900 text-center tracking-widest text-xl"
                  placeholder="------"
                />
              </div>
            </div>
            
            <Button type="submit" disabled={loading} className="w-full py-3.5 text-lg font-bold rounded-2xl mt-4">
              {loading ? 'Verifying...' : 'Verify OTP Code'}
            </Button>

            <div className="text-center mt-6">
              <button 
                type="button" 
                onClick={handleResend}
                disabled={loading || countdown > 0 || !email}
                className={`text-sm font-bold transition-colors ${countdown > 0 || !email ? 'text-gray-400 cursor-not-allowed' : 'text-primary-600 hover:text-primary-700'}`}
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP Code'}
              </button>
            </div>
            
            <div className="text-center mt-4 border-t border-gray-150 pt-4">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
