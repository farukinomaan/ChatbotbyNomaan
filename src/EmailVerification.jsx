// components/EmailVerification.jsx
import React, { useEffect, useState } from 'react';
import { useNhostClient } from '@nhost/react';
import { verifyEmailToken } from './utils/mailVerification';

export default function EmailVerification() {
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const nhost = useNhostClient();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token and email from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');

        if (!token || !email) {
          setVerificationStatus('error');
          setErrorMessage('Invalid verification link. Please check your email for the correct link.');
          return;
        }

        // Verify the token
        const result = await verifyEmailToken(nhost, email, token);

        if (result.success) {
          setVerificationStatus('success');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        } else {
          setVerificationStatus('error');
          setErrorMessage(result.error || 'Verification failed. The link may be expired or invalid.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setErrorMessage('An unexpected error occurred during verification.');
      }
    };

    verifyEmail();
  }, [nhost]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/Untitled_design-5-removebg-preview.png"
              alt="Logo"
              className="w-16 h-16 rounded-lg object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-white">ChatBot</h1>
        </div>

        {/* Verification Status */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            {verificationStatus === 'verifying' && (
              <>
                <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Verifying Your Email</h2>
                <p className="text-slate-300">Please wait while we verify your email address...</p>
              </>
            )}

            {verificationStatus === 'success' && (
              <>
                <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Email Verified!</h2>
                <p className="text-slate-300 mb-6">
                  Your email has been successfully verified. You can now sign in to your account.
                </p>
                <div className="bg-slate-700 rounded-xl p-4 mb-6">
                  <p className="text-slate-400 text-sm">
                    <span className="text-green-400">✓</span> Redirecting to sign in page in a few seconds...
                  </p>
                </div>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-500 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 font-medium"
                >
                  Continue to Sign In
                </button>
              </>
            )}

            {verificationStatus === 'error' && (
              <>
                <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Verification Failed</h2>
                <p className="text-slate-300 mb-6">{errorMessage}</p>
                <div className="bg-slate-700 rounded-xl p-4 mb-6">
                  <p className="text-slate-400 text-sm">
                    <span className="text-red-400">!</span> Please try signing up again or contact support if the problem persists.
                  </p>
                </div>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white rounded-xl hover:from-blue-500 hover:via-purple-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 font-medium"
                >
                  Back to Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500 text-xs">
          <p>&copy; Nomaan Faruki - 2025</p>
        </div>
      </div>
    </div>
  );
}