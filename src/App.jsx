

import React, { useState } from 'react';
import { useAuthenticationStatus } from '@nhost/react';
import Login from './Login';
import MainApp from './MainApp';
import Signup from './SignUp';

export default function App() {
  const { isLoading, isAuthenticated } = useAuthenticationStatus();
  const [showSignup, setShowSignup] = useState(false);

  if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900 text-zinc-200">
      <div className="animate-pulse text-lg">Loading...</div>
    </div>
  );
}

  if (isAuthenticated) {
    return <MainApp />;
  }

  return <>{showSignup ? <Signup setShowSignup={setShowSignup} /> : <Login setShowSignup={setShowSignup} />}</>;
}


