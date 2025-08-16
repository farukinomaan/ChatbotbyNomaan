// src/App.jsx

import React, { useState } from 'react';
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

  // --- DEBUG LOG ---
  // This will show us the state of the app on every render.
  console.log('--- App Router Check ---');
  console.log('isLoading:', isLoading);
  console.log('isAuthenticated:', isAuthenticated);
  console.log('User Data:', user);
  console.log('user.emailVerified:', user?.emailVerified);
  console.log('----------------------');


  const isVerificationPage = window.location.pathname === '/verify-email' || 
                            window.location.search.includes('token=');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900 text-zinc-200">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (isVerificationPage) {
    return <EmailVerification />;
  }

  if (isAuthenticated) {
    // We check for `user` to make sure the data has loaded
    if (user && !user.emailVerified) {
      return <PleaseVerifyEmail />;
    }
    // We also check that the user data is loaded before showing the main app
    if (user && user.emailVerified) {
      return <MainApp />;
    }
    // While the user data is loading after authentication, show a loading screen
    return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-900 text-zinc-200">
            <div className="animate-pulse text-lg">Loading user data...</div>
        </div>
    );
  }

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


