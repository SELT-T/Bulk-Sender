import React, { useState } from 'react';

const Signup = ({ switchToLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-[#1e293b]/80 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Get Started
          </h1>
          <p className="text-gray-400 text-sm">Create your Reachify Pro account.</p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input type="text" className="w-full bg-[#0f172a] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-all" placeholder="John Doe" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input type="email" className="w-full bg-[#0f172a] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-all" placeholder="you@example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input type="password" className="w-full bg-[#0f172a] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-all" placeholder="Create a strong password" />
          </div>

          <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold text-lg shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all">
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <button onClick={switchToLogin} className="text-indigo-400 font-bold hover:underline">
              Login Here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
