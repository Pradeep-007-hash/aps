import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/common/Button';
import { Lock, Eye, EyeOff, Check, X, ArrowLeft, Home } from 'lucide-react';
import cityscapeBg from '../assets/login_bg.png';

const API_URL = "http://localhost:5000";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || "";
  const resetToken = location.state?.resetToken || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password Validation Checks
  const checks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[@$!%*?&]/.test(newPassword),
  };

  const isPasswordValid = Object.values(checks).every(Boolean);
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email || !resetToken) {
      setError("Session expired. Please request a new password reset link.");
      return;
    }

    if (!isPasswordValid) {
      setError("Please satisfy all password strength requirements.");
      return;
    }

    if (!doPasswordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetToken, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Password reset successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.error || "Failed to reset password. Token may have expired.");
      }
    } catch (err) {
      console.error("Password reset submission error:", err);
      setError("⚠️ Server error. Could not connect to API server.");
    } finally {
      setLoading(false);
    }
  };

  // If accessed directly without tokens, show alert block
  if (!email || !resetToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: `url(${cityscapeBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="max-w-md w-full glass-card p-10 rounded-3xl shadow-xl text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Session</h2>
          <p className="text-gray-500 mb-6">This password reset link is invalid or has expired. Please start the process again.</p>
          <Link to="/forgot-password" className="inline-block w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-primary-500/30">
            Request New Reset
          </Link>
          <div className="mt-6 border-t border-gray-150 pt-4">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          
          <h2 className="text-3xl font-extrabold text-center text-gray-900 font-sans tracking-tight mb-2">New Password</h2>
          <p className="text-center text-gray-500 font-medium mb-8">Set your new secure password</p>
          
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
            
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-gray-900"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password Strength Checklist */}
            <div className="p-4 bg-gray-50/60 rounded-2xl border border-gray-150 space-y-2 text-xs text-gray-600">
              <p className="font-bold text-gray-700 mb-1">Password Requirements:</p>
              <div className="grid grid-cols-1 gap-1.5">
                <div className="flex items-center gap-2">
                  {checks.length ? <Check className="w-4 h-4 text-green-600 font-bold" /> : <X className="w-4 h-4 text-gray-400" />}
                  <span className={checks.length ? "text-green-700 font-medium" : ""}>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  {checks.uppercase ? <Check className="w-4 h-4 text-green-600 font-bold" /> : <X className="w-4 h-4 text-gray-400" />}
                  <span className={checks.uppercase ? "text-green-700 font-medium" : ""}>At least one uppercase letter (A-Z)</span>
                </div>
                <div className="flex items-center gap-2">
                  {checks.lowercase ? <Check className="w-4 h-4 text-green-600 font-bold" /> : <X className="w-4 h-4 text-gray-400" />}
                  <span className={checks.lowercase ? "text-green-700 font-medium" : ""}>At least one lowercase letter (a-z)</span>
                </div>
                <div className="flex items-center gap-2">
                  {checks.number ? <Check className="w-4 h-4 text-green-600 font-bold" /> : <X className="w-4 h-4 text-gray-400" />}
                  <span className={checks.number ? "text-green-700 font-medium" : ""}>At least one number (0-9)</span>
                </div>
                <div className="flex items-center gap-2">
                  {checks.special ? <Check className="w-4 h-4 text-green-600 font-bold" /> : <X className="w-4 h-4 text-gray-400" />}
                  <span className={checks.special ? "text-green-700 font-medium" : ""}>At least one special character (@$!%*?&)</span>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-gray-900"
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && (
                <div className="text-xs mt-1 ml-1">
                  {doPasswordsMatch ? (
                    <span className="text-green-600 font-medium">✓ Passwords match</span>
                  ) : (
                    <span className="text-red-500 font-medium">✗ Passwords do not match</span>
                  )}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={loading || !isPasswordValid || !doPasswordsMatch} 
              className="w-full py-3.5 text-lg font-bold rounded-2xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
