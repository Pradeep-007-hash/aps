import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { Home, Mail, Lock, User, Key } from 'lucide-react';
import cityscapeBg from '../assets/login_bg.png';
import { useAuth } from '../context/AuthContext';
import SocialLogin from '../components/common/SocialLogin';

const API_URL = "http://localhost:5000";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [googleFlowStep, setGoogleFlowStep] = useState('default');
  const [googleEmail, setGoogleEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Handle Google OAuth success
  const handleSocialAuthSuccess = (data) => {
    if (data.user && data.token) {
      setMessage(data.message || "✅ Sign in successful!");
      login(data.user, data.token);
      
      setTimeout(() => {
        navigate(data.user.role === 'security' ? "/security/visitor-log" : "/dashboard");
      }, 500);
    }
  };

  // Handle Google OAuth failure
  const handleSocialAuthFailure = (errorMsg) => {
    setMessage(`❌ ${errorMsg}`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(""); 
    setLoading(true); 

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        login(data.user, data.token);

        setTimeout(() => {
            navigate(data.user.role === 'security' ? "/security/visitor-log" : "/dashboard");
        }, 500);
      } else {
        setMessage(data.error || "Login failed. Check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("⚠️ Server error. Could not connect to API.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOTPStart = () => {
      setMessage("");
      setGoogleFlowStep('email');
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
        const res = await fetch(`${API_URL}/api/generate-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: googleEmail }),
        });

        const data = await res.json();

        if (data.success) {
            setMessage(data.message);
            setGoogleFlowStep('otp');
        } else {
            setMessage(data.message || "Failed to send OTP. Check your email address.");
        }
    } catch (err) {
        setMessage("Network error. Could not reach the API server.");
    } finally {
        setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
        const res = await fetch(`${API_URL}/api/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: googleEmail, otp }),
        });

        const data = await res.json();

        if (data.success && data.user) {
            setMessage("OTP verified. Successfully signed in!");
            login(data.user, data.token);

            setTimeout(() => {
                navigate(data.user.role === 'security' ? "/security/visitor-log" : "/dashboard");
            }, 500);
        } else {
            setMessage(data.message || "Invalid OTP. Please try again.");
        }
    } catch (err) {
        setMessage("Network error during OTP verification.");
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
          
          <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white font-sans tracking-tight mb-2">Welcome Back</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 font-medium mb-8">Sign in to your apartment portal</p>
          
          {message && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.includes("error") || message.includes("failed") || message.includes("Invalid") || message.includes("Server") ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {message}
            </div>
          )}
 
          {googleFlowStep === 'default' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-gray-900 dark:text-white"
                    placeholder="Enter your username"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Password</label>
                  <Link to="/forgot-password" className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-gray-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <Button type="submit" disabled={loading} className="w-full py-3.5 text-lg font-bold rounded-2xl mt-4 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
 
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-500 text-sm font-bold uppercase tracking-wider">Or continue with</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              </div>
 
              <SocialLogin 
                onAuthStart={() => setLoading(true)}
                onAuthSuccess={handleSocialAuthSuccess}
                onAuthFailure={handleSocialAuthFailure}
              />
            </form>
          )}
 
          {googleFlowStep === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email for OTP Verification</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-gray-900 dark:text-white"
                    placeholder="Enter registered email"
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full py-3.5 text-lg font-bold rounded-2xl">
                {loading ? 'Sending OTP...' : 'Generate OTP'}
              </Button>
              <button 
                type="button" 
                onClick={() => { setGoogleFlowStep('default'); setMessage(''); }} 
                disabled={loading}
                className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </form>
          )}
 
          {googleFlowStep === 'otp' && (
            <form onSubmit={handleOTPSubmit} className="space-y-5">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">An OTP has been sent to <strong>{googleEmail}</strong>.</p>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">One-Time Password (OTP)</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                    maxLength="6"
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-gray-900 dark:text-white text-center tracking-widest text-xl"
                    placeholder="------"
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full py-3.5 text-lg font-bold rounded-2xl">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <button 
                type="button" 
                onClick={() => { setGoogleFlowStep('email'); setMessage(''); setOtp(''); }} 
                disabled={loading}
                className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Back / Resend OTP
              </button>
            </form>
          )}
          
          {googleFlowStep === 'default' && (
            <p className="text-center text-gray-500 dark:text-gray-400 font-medium mt-8">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-400 font-bold hover:text-primary-700 transition-colors">Create account</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
