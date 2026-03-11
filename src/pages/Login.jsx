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
    if (email.trim() === "demo@reachify.com" && password.trim() === "demo@123") {
      setTimeout(() => {
        onLogin({ name: "Demo Admin", email: "demo@reachify.com", role: "admin" });
      }, 500); 
      return;
    }

    // Baaki users ke liye server check
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] p-4 sm:p-6 animate-fade-in">
      
      {/* App Branding Logo (Looks great on Mobile & Desktop) */}
      <div className="mb-6 md:mb-8 flex flex-col items-center animate-fade-in-up">
        <div className="w-16 h-16 bg-gradient-to-tr from-fuchsia-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-fuchsia-500/20 mb-4">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 11.5C21 16.75 16.75 21 11.5 21C9.64 21 7.9 20.47 6.42 19.57L3 20.5L3.93 17.08C3.03 15.6 2.5 13.86 2.5 12C2.5 6.75 6.75 2.5 12 2.5C17.25 2.5 21 6.75 21 11.5Z" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
           </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent tracking-wide">
          Reachify Pro
        </h1>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#1e293b] border border-gray-700 rounded-3xl p-6 md:p-8 shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6 text-center">Welcome Back!</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-gray-400 text-[10px] md:text-xs font-bold ml-1 mb-1.5 block uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3.5 md:p-4 text-white text-base md:text-sm focus:border-fuchsia-500 outline-none transition-all focus:shadow-[0_0_10px_rgba(217,70,239,0.2)]" 
              placeholder="demo@reachify.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="text-gray-400 text-[10px] md:text-xs font-bold ml-1 mb-1.5 block uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3.5 md:p-4 text-white text-base md:text-sm focus:border-fuchsia-500 outline-none transition-all focus:shadow-[0_0_10px_rgba(217,70,239,0.2)]" 
              placeholder="demo@123" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 mt-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:scale-[1.02] text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 text-sm md:text-base uppercase tracking-wider"
          >
            {loading ? '🔓 Unlocking...' : 'Login Securely'}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-gray-700/50 text-center text-xs md:text-sm text-gray-500 flex flex-col gap-2">
          <p>Master Demo Credentials:</p> 
          <div className="flex flex-wrap justify-center gap-2 items-center">
            <span className="text-white font-mono bg-[#0f172a] px-3 py-1.5 rounded-lg border border-gray-600">demo@reachify.com</span> 
            <span>+</span> 
            <span className="text-white font-mono bg-[#0f172a] px-3 py-1.5 rounded-lg border border-gray-600">demo@123</span>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Login;
