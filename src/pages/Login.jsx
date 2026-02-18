import React, { useState } from 'react';

const Login = ({ onLogin, switchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // API URL (Hum iska use karenge par Demo ke liye bypass karenge)
  const API_URL = "https://reachify-api.selt-3232.workers.dev"; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 🚀 MASTER KEY LOGIC (Server Check Bypass)
    // Agar user Demo wala hai, to bina server check kiye entry dedo
    if (email.trim() === "demo@reachify.com" && password.trim() === "demo@123") {
      setTimeout(() => {
        onLogin({ name: "Demo Admin", email: "demo@reachify.com", role: "admin" });
      }, 500); // 0.5 second ka fake loading taaki feel aaye
      return;
    }

    // Baaki users ke liye server check (Future ke liye)
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        onLogin(data.user);
      } else {
        alert("Login Failed: " + (data.error || "Wrong details"));
      }
    } catch (err) {
      alert("Server Error (Bypassed for Demo User). Use demo@reachify.com");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <div className="w-full max-w-md bg-[#1e293b] border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-2">Reachify Pro</h1>
        <p className="text-gray-400 text-center text-sm mb-6">Login to continue</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-gray-400 text-xs ml-1">Email</label>
            <input 
              type="email" 
              className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white focus:border-fuchsia-500 outline-none" 
              placeholder="demo@reachify.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs ml-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white focus:border-fuchsia-500 outline-none" 
              placeholder="demo@123" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl transition-all"
          >
            {loading ? 'Unlocking...' : 'Login Now'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Use Master Key: <br/> 
          <span className="text-white font-bold">demo@reachify.com</span> | <span className="text-white font-bold">demo@123</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
