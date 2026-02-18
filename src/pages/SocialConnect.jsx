import React, { useState, useEffect } from 'react';

const SocialConnect = () => {
  const [status, setStatus] = useState({ fb: false, insta: false, twitter: false });
  const [loading, setLoading] = useState(true);
  
  // Backend URL
  const API_URL = "https://reachify-api.selt-3232.workers.dev";
  const user = JSON.parse(localStorage.getItem('reachify_user'));

  // 1. Check Connection Status (Real Check)
  useEffect(() => {
    const checkConnections = async () => {
      if (!user) return;
      try {
        // Hum settings fetch karke dekhenge ki keys saved hain ya nahi
        const res = await fetch(`${API_URL}/get-settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        });
        const data = await res.json();
        
        // Agar keys database me hain, to status Connected dikhao
        setStatus({
          fb: !!data.fb_app_id,      // Future backend update me ye columns honge
          insta: !!data.insta_token,
          twitter: !!data.twitter_key
        });
      } catch (err) {
        console.error("Status Check Failed");
      }
      setLoading(false);
    };
    checkConnections();
  }, [user]);

  const handleConnect = (platform) => {
    // Redirect user to Settings to enter keys
    alert(`Please go to Settings > Social Media to enter your ${platform} API Keys first.`);
    window.location.href = '/'; // Ya phir setActivePage('settings') agar context hota
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-100px)]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Social Ecosystem</h2>
        <p className="text-gray-400 mt-2">Connect your platforms to automate posting and extract leads.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Instagram Card */}
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-gray-700 shadow-xl hover:border-fuchsia-500 transition-all group">
          <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-xl mb-4 shadow-lg flex items-center justify-center text-3xl text-white">
            📸
          </div>
          <h3 className="text-xl font-bold text-white">Instagram Business</h3>
          <p className="text-gray-400 text-sm mt-2 h-16">Auto-reply to DMs, fetch comments, and extract follower data for leads.</p>
          
          <div className="mt-6 flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${status.insta ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-gray-700 border-gray-600 text-gray-400'}`}>
              {status.insta ? '● Connected' : '○ Not Connected'}
            </span>
            <button 
              onClick={() => handleConnect('Instagram')}
              className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm border border-gray-600 transition-all"
            >
              Configure ⚙️
            </button>
          </div>
        </div>

        {/* Facebook Card */}
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-gray-700 shadow-xl hover:border-blue-500 transition-all group">
          <div className="w-16 h-16 bg-blue-600 rounded-xl mb-4 shadow-lg flex items-center justify-center text-3xl text-white">
            f
          </div>
          <h3 className="text-xl font-bold text-white">Facebook Pages</h3>
          <p className="text-gray-400 text-sm mt-2 h-16">Schedule posts, sync leads from Forms, and manage inbox automation.</p>
          
          <div className="mt-6 flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${status.fb ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-gray-700 border-gray-600 text-gray-400'}`}>
              {status.fb ? '● Connected' : '○ Not Connected'}
            </span>
            <button 
              onClick={() => handleConnect('Facebook')}
              className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm border border-gray-600 transition-all"
            >
              Configure ⚙️
            </button>
          </div>
        </div>

        {/* Twitter/X Card */}
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-gray-700 shadow-xl hover:border-sky-500 transition-all group">
          <div className="w-16 h-16 bg-black border border-gray-700 rounded-xl mb-4 shadow-lg flex items-center justify-center text-3xl text-white">
            𝕏
          </div>
          <h3 className="text-xl font-bold text-white">Twitter / X</h3>
          <p className="text-gray-400 text-sm mt-2 h-16">Automate tweets, thread creation, and trend monitoring.</p>
          
          <div className="mt-6 flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${status.twitter ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-gray-700 border-gray-600 text-gray-400'}`}>
              {status.twitter ? '● Connected' : '○ Not Connected'}
            </span>
            <button 
               onClick={() => handleConnect('Twitter')}
               className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm border border-gray-600 transition-all"
            >
              Configure ⚙️
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SocialConnect;
