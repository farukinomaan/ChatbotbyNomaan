/**
 * @copyright Nomaan Faruki - 2025
 */

import React from 'react';
import { useSignOut, useUserData } from '@nhost/react';

export default function PleaseVerifyEmail() {
  const user = useUserData();
  const { signOut } = useSignOut();

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo Section */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/Untitled_design-5-removebg-preview.png"
              alt="Logo"
              className="w-16 h-16 rounded-lg object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-white">ChatBot</h1>
        </div>

        {/* Verification Message */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Please Verify Your Email
          </h2>
          <p className="text-slate-300 mb-6 leading-relaxed">
            We've sent a verification link to{' '}
            <span className="font-medium text-blue-400">{user?.email}</span>.
            Please click the link to continue.
          </p>
          <div className="bg-slate-700 rounded-xl p-4 mb-6">
            <p className="text-slate-400 text-sm">
              <span className="text-yellow-400">💡</span> You can close this page. Once you click the link in your email, you'll be able to sign in.
            </p>
          </div>
          <button
            onClick={signOut}
            className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
