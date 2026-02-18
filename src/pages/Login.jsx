import React, { useState } from 'react';

const Login = ({ onLogin, switchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Maine tumhari Sahi URL yahan daal di hai
  const API_URL = "https://reachify-api.selt-3232.workers.dev"; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log("Connecting to:", `${API_URL}/login`); // Debugging ke liye
      
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        onLogin(data.user); // Login Success!
      } else {
        setError(data.error || "Login Failed");
      }
    } catch (err) {
      console.error("Login Error:", err);
      // Ab ye asli error dikhayega
      setError(`Connection Error: ${err.message}. Backend check karo.`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <div className="w-full max-w-md bg-[#1e293b] border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-2">Reachify Pro</h1>
        <p className="text-gray-400 text-center text-sm mb-6">Login to continue</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="email" 
            className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white focus:border-fuchsia-500 outline-none" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white focus:border-fuchsia-500 outline-none" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Login Now'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Demo: demo@reachify.com | Pass: demo@123
        </div>
      </div>
    </div>
  );
};

export default Login;
