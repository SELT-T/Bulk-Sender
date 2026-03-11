import React, { useState } from 'react';

const Login = ({ onLogin, switchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = "https://reachify-api.selt-3232.workers.dev"; // Tumhara backend

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.user) {
        onLogin(data.user);
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden">
      
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-fuchsia-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md z-10 flex flex-col items-center">
        
        {/* Logo */}
        <div className="w-16 h-16 bg-fuchsia-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(217,70,239,0.4)] mb-6 animate-fade-in">
           <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M21 11.5C21 16.75 16.75 21 11.5 21C9.64 21 7.9 20.47 6.42 19.57L3 20.5L3.93 17.08C3.03 15.6 2.5 13.86 2.5 12C2.5 6.75 6.75 2.5 12 2.5C17.25 2.5 21 6.75 21 11.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           </svg>
        </div>
        
        <h1 className="text-3xl font-black text-white mb-8 tracking-wide animate-fade-in-up">Reachify Pro</h1>

        <div className="bg-[#1e293b]/80 backdrop-blur-xl w-full rounded-3xl border border-gray-700/50 shadow-2xl p-8 animate-fade-in-up flex flex-col">
           <h2 className="text-xl font-bold text-white text-center mb-6">Welcome Back!</h2>
           
           <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                 <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1.5 block px-1">Email Address</label>
                 <input 
                   type="email" 
                   required
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                   className="w-full bg-[#0f172a] border border-gray-600 focus:border-fuchsia-500 rounded-xl px-4 py-3.5 text-white outline-none transition-all placeholder-gray-600"
                   placeholder="admin@reachify.com"
                 />
              </div>
              
              <div>
                 <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1.5 block px-1">Password</label>
                 <input 
                   type="password" 
                   required
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   className="w-full bg-[#0f172a] border border-gray-600 focus:border-fuchsia-500 rounded-xl px-4 py-3.5 text-white outline-none transition-all placeholder-gray-600"
                   placeholder="••••••••"
                 />
              </div>

              {error && <div className="text-red-400 text-xs font-bold text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</div>}

              <button 
                 type="submit" 
                 disabled={isLoading}
                 className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:scale-[1.02] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-70 mt-2"
              >
                 {isLoading ? 'Authenticating...' : 'LOGIN SECURELY'}
              </button>
           </form>
        </div>

        {/* 🟢 NEW: Sign Up Link Added Below Box */}
        <p className="text-gray-400 text-sm mt-6 animate-fade-in-up">
           Don't have an account?{' '}
           <span onClick={switchToSignup} className="text-fuchsia-400 font-bold cursor-pointer hover:underline">
              Sign up
           </span>
        </p>

      </div>
    </div>
  );
};

export default Login;
