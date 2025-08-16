import React, { useState, useEffect } from 'react';
import { useSignInEmailPassword } from '@nhost/react';

export default function Login({ setShowSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const {
    signInEmailPassword,
    isLoading: signInIsLoading,
    isError: signInIsError,
    error: signInError,
  } = useSignInEmailPassword();

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    await signInEmailPassword(email, password);
  };

  const isLoading = signInIsLoading;
  const isError = signInIsError;
  const error = signInError;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      <div className={`w-full max-w-md transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3">
                <img
                  src="/Untitled_design-5-removebg-preview.png"
                  alt="Logo"
                  className="w-16 h-16 rounded-lg object-cover"
                />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">
            ChatBot
          </h1>
          <p className="text-slate-400 mt-2">Welcome back! Please sign in to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 relative group">
          {/* Subtle border glow on hover */}
          <div className="absolute -inset-px bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm"></div>
          
          <div className="relative">
            <h2 className="text-2xl font-bold text-center text-white mb-6">
              Sign In
            </h2>

            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="group">
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  emailFocused || email ? 'text-blue-400' : 'text-slate-300'
                }`} htmlFor="email-input">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email-input"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner transition-all duration-200 hover:border-slate-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    required
                  />
                  {/* Email icon */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="group">
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  passwordFocused || password ? 'text-blue-400' : 'text-slate-300'
                }`} htmlFor="password-input">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner transition-all duration-200 hover:border-slate-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    required
                  />
                  {/* Password visibility toggle */}
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <div className={`w-4 h-4 rounded border-2 transition-all duration-200 ${
                      rememberMe 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-slate-500 group-hover:border-slate-400'
                    }`}>
                      {rememberMe && (
                        <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors duration-200">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white rounded-xl hover:from-blue-500 hover:via-purple-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 font-medium relative overflow-hidden group"
                disabled={isLoading}
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Sign In</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </div>
                )}
              </button>
            </form>



            {isError && (
              <div className="mt-4 p-3 bg-gradient-to-r from-red-900/50 to-pink-900/50 border border-red-700/50 text-red-300 rounded-xl backdrop-blur-sm transform animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <span className="text-red-400">⚠</span>
                  <span className="text-sm">{error?.message || 'An error occurred'}</span>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => setShowSignup(true)}
                  className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors duration-200"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500 text-xs">
          <p>&copy; Nomaan Faruki - 2025</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}