import React, { useState, useEffect } from 'react';
import { useSignUpEmailPassword } from '@nhost/react';

export default function Signup({ setShowSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const {
    signUpEmailPassword,
    isLoading: signUpIsLoading,
    isError: signUpIsError,
    error: signUpError,
  } = useSignUpEmailPassword();

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  // Password strength calculator
  useEffect(() => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [password]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    await signUpEmailPassword(email, password);
  };

  const isLoading = signUpIsLoading;
  const isError = signUpIsError;
  const error = signUpError;

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
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
                  src="public/Untitled_design-5-removebg-preview.png"
                  alt="Logo"
                  className="w-16 h-16 rounded-lg object-cover"
                />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">
            ChatBot
          </h1>
          <p className="text-slate-400 mt-2">Join us today! Create your account to get started</p>
        </div>

        {/* Signup Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 relative group">
          {/* Subtle border glow on hover */}
          <div className="absolute -inset-px bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm"></div>
          
          <div className="relative">
            <h2 className="text-2xl font-bold text-center text-white mb-6">
              Sign Up
            </h2>

            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="group">
                <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-blue-400 transition-colors duration-200" htmlFor="email-input">
                  Email Address
                </label>
                <input
                  id="email-input"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner transition-all duration-200 hover:border-slate-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-blue-400 transition-colors duration-200" htmlFor="password-input">
                  Password
                </label>
                <input
                  id="password-input"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner transition-all duration-200 hover:border-slate-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Password Strength</span>
                      <span className={`font-medium ${
                        passwordStrength <= 25 ? 'text-red-400' :
                        passwordStrength <= 50 ? 'text-orange-400' :
                        passwordStrength <= 75 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {getStrengthText()}
                      </span>
                    </div>
                    <div className="h-1 bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getStrengthColor()} transition-all duration-300 rounded-full`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
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
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Sign Up'
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
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setShowSignup(false)}
                  className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors duration-200"
                >
                  Sign In
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

// /**
//  * @copyright Nomaan Faruki - 2025
//  */
// import React, { useState } from 'react';
// import { useSignUpEmailPassword } from '@nhost/react';

// export default function Signup({ setShowSignup }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const {
//     signUpEmailPassword,
//     isLoading: signUpIsLoading,
//     isError: signUpIsError,
//     error: signUpError,
//   } = useSignUpEmailPassword();

//   const handleSignUp = async (e) => {
//     e.preventDefault();
//     await signUpEmailPassword(email, password);
//   };

//   const isLoading = signUpIsLoading;
//   const isError = signUpIsError;
//   const error = signUpError;

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 to-slate-900 p-4">
//       <div className="w-full max-w-md">
//         {/* Logo Section */}
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center mb-4">
//             <div className="flex items-center space-x-3">
//               <div className="flex items-center space-x-3">
//                 <img
//                   src="public/Untitled_design-5-removebg-preview.png"
//                   alt="Logo"
//                   className="w-16 h-16 rounded-lg object-cover"
//                 />
//               </div>
//             </div>
//           </div>
//           <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
//             ChatBot
//           </h1>
//           <p className="text-zinc-400 mt-2">Join us today! Create your account to get started</p>
//         </div>

//         {/* Signup Form */}
//         <div className="bg-gradient-to-b from-zinc-800 to-slate-800 backdrop-blur-sm border border-zinc-700/50 rounded-2xl shadow-2xl p-8">
//           <h2 className="text-2xl font-bold text-center text-zinc-100 mb-6">
//             Sign Up
//           </h2>

//           <form onSubmit={handleSignUp} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="email-input">
//                 Email Address
//               </label>
//               <input
//                 id="email-input"
//                 type="email"
//                 placeholder="Enter your email"
//                 className="w-full px-4 py-3 bg-gradient-to-r from-zinc-700 to-slate-700 text-zinc-100 placeholder-zinc-400 border border-zinc-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent shadow-inner transition-all duration-200"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="password-input">
//                 Password
//               </label>
//               <input
//                 id="password-input"
//                 type="password"
//                 placeholder="Enter your password"
//                 className="w-full px-4 py-3 bg-gradient-to-r from-zinc-700 to-slate-700 text-zinc-100 placeholder-zinc-400 border border-zinc-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent shadow-inner transition-all duration-200"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>

//             <button
//               type="submit"
//               className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 font-medium"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <div className="flex items-center justify-center space-x-2">
//                   <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
//                   <span>Creating Account...</span>
//                 </div>
//               ) : (
//                 'Sign Up'
//               )}
//             </button>
//           </form>

//           {isError && (
//             <div className="mt-4 p-3 bg-gradient-to-r from-red-900/50 to-pink-900/50 border border-red-700/50 text-red-300 rounded-xl backdrop-blur-sm">
//               <div className="flex items-center space-x-2">
//                 <span className="text-red-400">⚠</span>
//                 <span className="text-sm">{error.message}</span>
//               </div>
//             </div>
//           )}

//           <div className="mt-6 text-center">
//             <p className="text-zinc-400 text-sm">
//               Already have an account?{' '}
//               <button
//                 onClick={() => setShowSignup(false)}
//                 className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors duration-200"
//               >
//                 Sign In
//               </button>
//             </p>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="text-center mt-8 text-zinc-500 text-xs">
//           <p>&copy; Nomaan Faruki - 2025</p>
//         </div>
//       </div>
//     </div>
//   );
// }