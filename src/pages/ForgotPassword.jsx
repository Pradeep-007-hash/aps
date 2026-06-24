import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { Mail, ArrowLeft, Home } from 'lucide-react';
import cityscapeBg from '../assets/login_bg.png';

const API_URL = "http://localhost:5000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ OTP code sent successfully! Check your email inbox.");
        // Redirect to OTP verification after a short delay, passing email in state
        setTimeout(() => {
          navigate("/verify-reset-otp", { state: { email } });
        }, 1500);
      } else {
        setError(data.error || "Failed to request OTP. Please try again.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("⚠️ Server error. Could not connect to API server.");
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
          
          <h2 className="text-3xl font-extrabold text-center text-gray-900 font-sans tracking-tight mb-2">Forgot Password</h2>
          <p className="text-center text-gray-500 font-medium mb-8">Enter your email to receive a password reset code</p>
          
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

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your registered email"
                />
              </div>
            </div>
            
            <Button type="submit" disabled={loading} className="w-full py-3.5 text-lg font-bold rounded-2xl mt-4">
              {loading ? 'Sending OTP...' : 'Send Reset OTP'}
            </Button>
            
            <div className="text-center mt-6">
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
