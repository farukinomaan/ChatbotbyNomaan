// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useAuthenticationStatus, useUserData } from '@nhost/react';
import Login from './Login';
import MainApp from './MainApp';
import Signup from './SignUp';
import EmailVerification from './EmailVerification';
import PleaseVerifyEmail from './PleaseVerifyEmail';

export default function App() {
  const { isLoading, isAuthenticated } = useAuthenticationStatus();
  const user = useUserData();
  const [showSignup, setShowSignup] = useState(false);
  const [isVerificationPage, setIsVerificationPage] = useState(false);

  // Check for verification page on mount and URL changes
  useEffect(() => {
    const checkVerificationPage = () => {
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const hasToken = searchParams.has('token');
      const hasEmail = searchParams.has('email');
      
      // More robust verification page detection
      const isVerifyPage = (
        pathname === '/verify-email' ||
        pathname === '/EmailVerification' ||
        pathname.endsWith('/verify-email') ||
        pathname.endsWith('/EmailVerification') ||
        (hasToken && hasEmail) // Both token and email parameters present
      );
      
      console.log('--- Verification Page Check ---');
      console.log('pathname:', pathname);
      console.log('search:', window.location.search);
      console.log('hasToken:', hasToken);
      console.log('hasEmail:', hasEmail);
      console.log('isVerificationPage:', isVerifyPage);
      console.log('--------------------------------');
      
      setIsVerificationPage(isVerifyPage);
    };

    checkVerificationPage();

    // Listen for URL changes (for single-page apps)
    const handlePopState = () => {
      checkVerificationPage();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- DEBUG LOG ---
  console.log('--- App Router State ---');
  console.log('isLoading:', isLoading);
  console.log('isAuthenticated:', isAuthenticated);
  console.log('User Data:', user);
  console.log('user.emailVerified:', user?.emailVerified);
  console.log('isVerificationPage:', isVerificationPage);
  console.log('------------------------');

  // Show loading while initial authentication check is happening
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900 text-zinc-200">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          <div className="animate-pulse text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Handle verification page - should work regardless of auth status
  if (isVerificationPage) {
    console.log('[DEBUG] Showing EmailVerification component');
    return <EmailVerification />;
  }

  // User is authenticated
  if (isAuthenticated) {
    // Wait for user data to load
    if (!user) {
      console.log('[DEBUG] Authenticated but waiting for user data...');
      return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-900 text-zinc-200">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            <div className="animate-pulse text-lg">Loading user data...</div>
          </div>
        </div>
      );
    }

    // User data loaded, check verification status
    if (!user.emailVerified) {
      console.log('[DEBUG] User authenticated but email not verified');
      return <PleaseVerifyEmail />;
    }

    // All good - show main app
    console.log('[DEBUG] User authenticated and verified - showing MainApp');
    return <MainApp />;
  }

  // Not authenticated - show login/signup
  console.log('[DEBUG] Not authenticated - showing Login/Signup');
  return (
    <>
      {showSignup ? (
        <Signup setShowSignup={setShowSignup} />
      ) : (
        <Login setShowSignup={setShowSignup} />
      )}
    </>
  );
}
// import React, { useState } from 'react';
// import { useAuthenticationStatus } from '@nhost/react';
// import Login from './Login';
// import MainApp from './MainApp';
// import Signup from './SignUp';

// export default function App() {
//   const { isLoading, isAuthenticated } = useAuthenticationStatus();
//   const [showSignup, setShowSignup] = useState(false);

//   if (isLoading) {
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-zinc-900 text-zinc-200">
//       <div className="animate-pulse text-lg">Loading...</div>
//     </div>
//   );
// }

//   if (isAuthenticated) {
//     return <MainApp />;
//   }

//   return <>{showSignup ? <Signup setShowSignup={setShowSignup} /> : <Login setShowSignup={setShowSignup} />}</>;
// }


