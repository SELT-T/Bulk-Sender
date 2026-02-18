import React, { useState } from 'react';

const Login = ({ onLogin, switchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Tumhari Worker URL
  const API_URL = "https://reachify-api.selt-3232.workers.dev"; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Alert user that we are starting
      // alert("Connecting to Server..."); 

      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), // Spaces hata rahe hain
          password: password.trim() 
        })
      });
      
      const data = await res.json();
      
      // 2. Server Response ko Alert karo (Taaki pata chale kya aa raha hai)
      // alert("Server Response: " + JSON.stringify(data));

      if (res.ok && data.user) {
        // Agar sab sahi hai to Login karo
        onLogin(data.user);
      } else {
        // Agar error hai to dikhao
        alert("Login Error: " + (data.error || "Unknown Error"));
      }
    } catch (err) {
      // Agar internet ya code fat gaya to ye dikhega
      alert("CRITICAL ERROR: " + err.message);
    } finally {
      // Chahe kuch bhi ho, loading band karo
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
            className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? 'Checking Server...' : 'Login Now'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Try: demo@reachify.com | demo@123
        </div>
      </div>
    </div>
  );
};

export default Login;
