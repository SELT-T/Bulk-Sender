import React, { useState } from 'react';

const Login = ({ onLogin, switchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ⚠️ YAHAN APNA WORKER URL DALNA ZAROORI HAI
  const API_URL = "https://reachify-api.YOUR-WORKER-SUBDOMAIN.workers.dev"; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        onLogin(data.user); // Success
      } else {
        setError(data.error || "Login Failed");
      }
    } catch (err) {
      setError("Server connection failed. Check internet.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <div className="absolute top-20 left-20 w-72 h-72 bg-fuchsia-600/20 rounded-full blur-[100px]"></div>
      <div className="w-full max-w-md bg-[#1e293b]/80 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent mb-2">Reachify Pro</h1>
          <p className="text-gray-400 text-sm">Login to access Dashboard</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg text-sm text-center border border-red-500/30">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="email" required className="w-full bg-[#0f172a] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-fuchsia-500" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" required className="w-full bg-[#0f172a] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-fuchsia-500" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-fuchsia-500/30 transition-all disabled:opacity-50">
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Demo: <span className="text-gray-300">demo@reachify.com</span> | Pass: <span className="text-gray-300">demo@123</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
