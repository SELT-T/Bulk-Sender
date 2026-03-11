import React, { useState } from 'react';

const Signup = ({ switchToLogin }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] p-4 sm:p-6 animate-fade-in relative overflow-hidden">
      
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-600/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none"></div>

      {/* App Branding Logo */}
      <div className="mb-6 md:mb-8 flex flex-col items-center animate-fade-in-up relative z-10">
        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 11.5C21 16.75 16.75 21 11.5 21C9.64 21 7.9 20.47 6.42 19.57L3 20.5L3.93 17.08C3.03 15.6 2.5 13.86 2.5 12C2.5 6.75 6.75 2.5 12 2.5C17.25 2.5 21 6.75 21 11.5Z" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
           </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">
          Reachify Pro
        </h1>
      </div>

      {/* Main Signup Card */}
      <div className="w-full max-w-md bg-[#1e293b]/80 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative z-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
            Get Started
          </h2>
          <p className="text-gray-400 text-xs md:text-sm">Create your new account in seconds.</p>
        </div>

        <form className="space-y-4 md:space-y-5">
          <div>
            <label className="text-gray-400 text-[10px] md:text-xs font-bold ml-1 mb-1.5 block uppercase tracking-wider">Full Name</label>
            <input 
              type="text" 
              className="w-full bg-[#0f172a] border border-gray-700 rounded-xl p-3.5 md:p-4 text-white text-base md:text-sm focus:outline-none focus:border-indigo-500 transition-all focus:shadow-[0_0_10px_rgba(99,102,241,0.2)]" 
              placeholder="John Doe" 
            />
          </div>

          <div>
            <label className="text-gray-400 text-[10px] md:text-xs font-bold ml-1 mb-1.5 block uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-[#0f172a] border border-gray-700 rounded-xl p-3.5 md:p-4 text-white text-base md:text-sm focus:outline-none focus:border-indigo-500 transition-all focus:shadow-[0_0_10px_rgba(99,102,241,0.2)]" 
              placeholder="you@example.com" 
            />
          </div>

          <div>
            <label className="text-gray-400 text-[10px] md:text-xs font-bold ml-1 mb-1.5 block uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              className="w-full bg-[#0f172a] border border-gray-700 rounded-xl p-3.5 md:p-4 text-white text-base md:text-sm focus:outline-none focus:border-indigo-500 transition-all focus:shadow-[0_0_10px_rgba(99,102,241,0.2)]" 
              placeholder="Create a strong password" 
            />
          </div>

          <button className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold text-sm md:text-base shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all uppercase tracking-wider">
            Create Account
          </button>
        </form>

        <div className="mt-6 md:mt-8 pt-5 border-t border-gray-700/50 text-center">
          <p className="text-gray-500 text-xs md:text-sm">
            Already have an account?{' '}
            <button onClick={switchToLogin} className="text-indigo-400 font-bold hover:text-indigo-300 hover:underline transition-all ml-1">
              Login Here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
