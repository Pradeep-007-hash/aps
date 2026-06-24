import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function SocialLogin({ onAuthStart, onAuthSuccess, onAuthFailure }) {
  const [error, setError] = useState(null);

  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    
    if (onAuthStart) {
      onAuthStart();
    }

    try {
      console.log("✅ Google Sign-In Successful");
      console.log("📦 Credential received from Google");

      // Send the ID token to your backend for verification
      const response = await fetch("http://localhost:5000/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential, // Google sends it as 'credential'
        }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        console.log("✅ Backend verification successful:", data);
        if (onAuthSuccess) {
          onAuthSuccess(data);
        }
      } else {
        const errorMsg = data.error || "Backend authentication failed";
        console.error("❌ Backend error:", errorMsg);
        setError(errorMsg);
        if (onAuthFailure) {
          onAuthFailure(errorMsg);
        }
      }
    } catch (err) {
      const errorMsg = `Network error: ${err.message}`;
      console.error("❌ Error during Google authentication:", err);
      setError(errorMsg);
      if (onAuthFailure) {
        onAuthFailure(errorMsg);
      }
    }
  };

  const handleGoogleError = () => {
    const errorMsg = "❌ Google Sign-In failed. Please try again.";
    console.error(errorMsg);
    setError(errorMsg);
    if (onAuthFailure) {
      onAuthFailure(errorMsg);
    }
  };

  return (
    <div className="space-y-3.5 w-full">
      {/* Error Message Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Google Sign-in Button */}
      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          theme="outline"
          size="large"
          text="continue_with"
          width="368"
          locale="en"
        />
      </div>

      {/* Divider */}
      <div className="relative w-full">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or</span>
        </div>
      </div>

      {/* Apple Sign-in Button (Placeholder for future implementation) */}
      <div className="flex justify-center w-full">
        <button
          type="button"
          disabled={true}
          className="w-[368px] h-10 flex items-center justify-center gap-3 bg-black border border-black rounded text-white font-medium text-sm hover:bg-gray-950 focus:ring-4 focus:ring-gray-800 transition-all shadow-sm active:scale-[0.98] cursor-not-allowed opacity-50"
        >
          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.97.08 2.15-.52 2.82-1.33z" />
          </svg>
          Continue with Apple (Coming Soon)
        </button>
      </div>
    </div>
  );
}
