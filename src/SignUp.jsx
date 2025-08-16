import React, { useState, useEffect } from 'react';
import { useSignUpEmailPassword } from '@nhost/react';
import { generateVerificationToken, sendVerificationEmail, storeVerificationToken } from './utils/mailVerification';
import { useNhostClient } from '@nhost/react';


export default function Signup({ setShowSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isVerificationLoading, setIsVerificationLoading] = useState(false);
  
  const nhost = useNhostClient();
  
  const {
    signUpEmailPassword,
    isLoading: signUpIsLoading,
    isError: signUpIsError,
    error: signUpError,
    isSuccess: signUpIsSuccess,
  } = useSignUpEmailPassword();

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  // Handle successful signup
  // useEffect(() => {
  //   if (signUpIsSuccess) {
  //     handleEmailVerification();
  //   }
  // }, [signUpIsSuccess]);

  // Password strength calculator (Nhost requires minimum 9 characters)
  useEffect(() => {
    let strength = 0;
    if (password.length >= 9) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [password]);

  // const handleEmailVerification = async () => {
  //   setIsVerificationLoading(true);
    
  //   try {
  //     // Generate verification token
  //     const token = generateVerificationToken();
      
  //     // Store token in database
  //     const storeResult = await storeVerificationToken(nhost, email, token);
      
  //     if (!storeResult.success) {
  //       console.error('Failed to store verification token:', storeResult.error);
  //       // Continue anyway and try to send email
  //     }
      
  //     // Send verification email
  //     const emailResult = await sendVerificationEmail(email, token, email.split('@')[0]);
      
  //     if (emailResult.success) {
  //       setSignupSuccess(true);
  //     } else {
  //       console.error('Failed to send verification email:', emailResult.error);
  //       // Show error but still mark as success since account was created
  //       setSignupSuccess(true);
  //     }
  //   } catch (error) {
  //     console.error('Error in email verification process:', error);
  //     setSignupSuccess(true); // Still show success since account was created
  //   } finally {
  //     setIsVerificationLoading(false);
  //   }
  // };
  // In Signup.jsx

  const handleEmailVerification = async () => {
    setIsVerificationLoading(true);
    
    try {
      console.log('[DEBUG] Step 1: Starting email verification process.');
      const token = generateVerificationToken();
      const storeResult = await storeVerificationToken(nhost, email, token);
  
      if (!storeResult.success) {
        // This error is critical, we should stop if it fails.
        console.error('[DEBUG] FATAL: Failed to store verification token in the database.', storeResult.error);
        throw new Error('Could not store verification token.');
      }
      console.log('[DEBUG] Step 2: Verification token stored successfully in DB.');
  
      const functionUrl = `${nhost.functions.url}/send-verification-email`;
      const payload = {
        email: email,
        token: token,
        userName: email.split('@')[0],
        baseUrl: window.location.origin
      };
  
      console.log(`[DEBUG] Step 3: Preparing to call serverless function at: ${functionUrl}`);
      console.log('[DEBUG] Sending this payload:', payload);
  
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      console.log('[DEBUG] Step 4: Received a response from the function.', response);
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`[DEBUG] FATAL: Function returned an error. Status: ${response.status}. Details:`, errorData);
        throw new Error(errorData.message || 'Serverless function failed.');
      }
      
      const responseData = await response.json();
      console.log('[DEBUG] Step 5: Function returned success!', responseData);
      setSignupSuccess(true);
  
    } catch (error) {
      // This block will catch ANY error from the above steps, including network errors.
      console.error('[DEBUG] CATCH BLOCK: A critical error occurred during the verification process.', error);
      // For now, we still show the success screen, but the console will have the real error.
      setSignupSuccess(true); 
    } finally {
      setIsVerificationLoading(false);
    }
  };
  
  // const handleSignUp = async (e) => {
  //   e.preventDefault();
    
  //   // Validate password length (Nhost requires minimum 9 characters)
  //   if (password.length < 9) {
  //     return;
  //   }
    
  //   try {
  //     // Create account in Nhost (but don't enable it yet)
  //     await signUpEmailPassword(email, password);
  //     // Email verification will be handled in useEffect after success
  //   } catch (error) {
  //     console.error('Signup error:', error);
  //   }
  // };
  // REPLACE your old handleSignUp function with this one

const handleSignUp = async (e) => {
  e.preventDefault();
  if (password.length < 9) {
    return;
  }
  
  // Await the result of the signup function
  const result = await signUpEmailPassword(email, password);
  
  // Check if the signup was successful
  if (result.isSuccess) {
    // If it was, immediately call the verification function.
    // This runs BEFORE the component gets unmounted.
    await handleEmailVerification();
  }
  // If there was an error, the `isError` and `error` states from the hook
  // will automatically update your UI to show the error message.
};

  const isLoading = signUpIsLoading || isVerificationLoading;
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

  // Show success message after signup
  if (signupSuccess) {
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
          </div>

          {/* Success Message */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Check Your Email
              </h2>
              
              <p className="text-slate-300 mb-6 leading-relaxed">
                We've sent a verification link to <span className="text-blue-400 font-medium">{email}</span>. 
                Please click the link in the email to verify your account and complete the signup process.
              </p>
              
              <div className="bg-slate-700 rounded-xl p-4 mb-6">
                <p className="text-slate-400 text-sm">
                  <span className="text-yellow-400">💡</span> Didn't receive the email? Check your spam folder. 
                  The email is sent via Resend and should arrive within a few minutes.
                </p>
              </div>

              <button
                onClick={() => {
                  setSignupSuccess(false);
                  setEmail('');
                  setPassword('');
                  setShowSignup(false);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white rounded-xl hover:from-blue-500 hover:via-purple-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 font-medium"
              >
                Back to Sign In
              </button>
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
                  placeholder="Enter your password (min. 9 characters)"
                  className="w-full px-4 py-3 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner transition-all duration-200 hover:border-slate-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={9}
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
                    {password.length < 9 && (
                      <p className="text-xs text-red-400 mt-1">
                        Password must be at least 9 characters long
                      </p>
                    )}
                    {password.length >= 9 && (
                      <p className="text-xs text-slate-400 mt-1">
                        💡 Use a unique password that hasn't been compromised in data breaches
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white rounded-xl hover:from-blue-500 hover:via-purple-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 font-medium relative overflow-hidden group"
                disabled={isLoading || password.length < 9}
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>
                      {signUpIsLoading ? 'Creating Account...' : 'Sending Verification...'}
                    </span>
                  </div>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>

            {isError && (
              <div className="mt-4 p-3 bg-gradient-to-r from-red-900/50 to-pink-900/50 border border-red-700/50 text-red-300 rounded-xl backdrop-blur-sm transform animate-fadeIn">
                <div className="flex items-start space-x-2">
                  <span className="text-red-400 mt-0.5">⚠</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium mb-1">
                      {error?.message?.includes('HIBP') || error?.message?.includes('compromised') ? 
                        'Password Security Issue' : 
                        error?.message?.includes('already') || error?.message?.includes('exists') ?
                        'Email Already Registered' : 'Sign Up Error'}
                    </div>
                    <div className="text-xs text-red-200">
                      {error?.message?.includes('HIBP') || error?.message?.includes('compromised') ? 
                        'This password has been found in data breaches. Please choose a different, more secure password.' :
                        error?.message?.includes('already') || error?.message?.includes('exists') ?
                        'This email address is already registered. Try signing in instead or use a different email.' :
                        error?.message || 'An error occurred during sign up'}
                    </div>
                  </div>
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

// import React, { useState, useEffect } from 'react';
// import { useSignUpEmailPassword } from '@nhost/react';

// export default function Signup({ setShowSignup }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isVisible, setIsVisible] = useState(false);
//   const [passwordStrength, setPasswordStrength] = useState(0);
  
//   const {
//     signUpEmailPassword,
//     isLoading: signUpIsLoading,
//     isError: signUpIsError,
//     error: signUpError,
//   } = useSignUpEmailPassword();

//   useEffect(() => {
//     setTimeout(() => setIsVisible(true), 100);
//   }, []);

//   // Password strength calculator
//   useEffect(() => {
//     let strength = 0;
//     if (password.length >= 6) strength += 25;
//     if (password.length >= 10) strength += 25;
//     if (/[A-Z]/.test(password)) strength += 25;
//     if (/[0-9]/.test(password)) strength += 25;
//     setPasswordStrength(strength);
//   }, [password]);

//   const handleSignUp = async (e) => {
//     e.preventDefault();
//     await signUpEmailPassword(email, password);
//   };

//   const isLoading = signUpIsLoading;
//   const isError = signUpIsError;
//   const error = signUpError;

//   const getStrengthColor = () => {
//     if (passwordStrength <= 25) return 'bg-red-500';
//     if (passwordStrength <= 50) return 'bg-orange-500';
//     if (passwordStrength <= 75) return 'bg-yellow-500';
//     return 'bg-green-500';
//   };

//   const getStrengthText = () => {
//     if (passwordStrength <= 25) return 'Weak';
//     if (passwordStrength <= 50) return 'Fair';
//     if (passwordStrength <= 75) return 'Good';
//     return 'Strong';
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">

//       <div className={`w-full max-w-md transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
//         {/* Logo Section */}
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center mb-4">
//             <div className="flex items-center space-x-3">
//               <div className="flex items-center space-x-3">
//                 <img
//                   src="/Untitled_design-5-removebg-preview.png"
//                   alt="Logo"
//                   className="w-16 h-16 rounded-lg object-cover"
//                 />
//               </div>
//             </div>
//           </div>
//           <h1 className="text-3xl font-bold text-white">
//             ChatBot
//           </h1>
//           <p className="text-slate-400 mt-2">Join us today! Create your account to get started</p>
//         </div>

//         {/* Signup Form */}
//         <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 relative group">
//           {/* Subtle border glow on hover */}
//           <div className="absolute -inset-px bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm"></div>
          
//           <div className="relative">
//             <h2 className="text-2xl font-bold text-center text-white mb-6">
//               Sign Up
//             </h2>

//             <form onSubmit={handleSignUp} className="space-y-5">
//               <div className="group">
//                 <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-blue-400 transition-colors duration-200" htmlFor="email-input">
//                   Email Address
//                 </label>
//                 <input
//                   id="email-input"
//                   type="email"
//                   placeholder="Enter your email"
//                   className="w-full px-4 py-3 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner transition-all duration-200 hover:border-slate-500"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="group">
//                 <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-blue-400 transition-colors duration-200" htmlFor="password-input">
//                   Password
//                 </label>
//                 <input
//                   id="password-input"
//                   type="password"
//                   placeholder="Enter your password"
//                   className="w-full px-4 py-3 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner transition-all duration-200 hover:border-slate-500"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
                
//                 {/* Password Strength Indicator */}
//                 {password && (
//                   <div className="mt-2 space-y-1">
//                     <div className="flex justify-between text-xs">
//                       <span className="text-slate-400">Password Strength</span>
//                       <span className={`font-medium ${
//                         passwordStrength <= 25 ? 'text-red-400' :
//                         passwordStrength <= 50 ? 'text-orange-400' :
//                         passwordStrength <= 75 ? 'text-yellow-400' : 'text-green-400'
//                       }`}>
//                         {getStrengthText()}
//                       </span>
//                     </div>
//                     <div className="h-1 bg-slate-600 rounded-full overflow-hidden">
//                       <div 
//                         className={`h-full ${getStrengthColor()} transition-all duration-300 rounded-full`}
//                         style={{ width: `${passwordStrength}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <button
//                 type="submit"
//                 className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white rounded-xl hover:from-blue-500 hover:via-purple-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 font-medium relative overflow-hidden group"
//                 disabled={isLoading}
//               >
//                 {/* Button shine effect */}
//                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
//                 {isLoading ? (
//                   <div className="flex items-center justify-center space-x-2">
//                     <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
//                     <span>Creating Account...</span>
//                   </div>
//                 ) : (
//                   'Sign Up'
//                 )}
//               </button>
//             </form>

//             {isError && (
//               <div className="mt-4 p-3 bg-gradient-to-r from-red-900/50 to-pink-900/50 border border-red-700/50 text-red-300 rounded-xl backdrop-blur-sm transform animate-fadeIn">
//                 <div className="flex items-center space-x-2">
//                   <span className="text-red-400">⚠</span>
//                   <span className="text-sm">{error?.message || 'An error occurred'}</span>
//                 </div>
//               </div>
//             )}

//             <div className="mt-6 text-center">
//               <p className="text-slate-400 text-sm">
//                 Already have an account?{' '}
//                 <button
//                   type="button"
//                   onClick={() => setShowSignup(false)}
//                   className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors duration-200"
//                 >
//                   Sign In
//                 </button>
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="text-center mt-8 text-slate-500 text-xs">
//           <p>&copy; Nomaan Faruki - 2025</p>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }
