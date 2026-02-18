import React, { useState } from 'react';

const Login = ({ onLogin, switchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Abhi ke liye direct login (Backend connect karte hi isse hata denge)
    onLogin(email, password); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      {/* Background Glow Effect */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-fuchsia-600/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md bg-[#1e293b]/80 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Reachify Pro
          </h1>
          <p className="text-gray-400 text-sm">Welcome back! Please login to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-[#0f172a] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-fuchsia-500 transition-all"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-[#0f172a] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-fuchsia-500 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-fuchsia-500/30 hover:scale-[1.02] transition-all"
          >
            Access Dashboard
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Don't have an account?{' '}
            <button onClick={switchToSignup} className="text-fuchsia-400 font-bold hover:underline">
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
