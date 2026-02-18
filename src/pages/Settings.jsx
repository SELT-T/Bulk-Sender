import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('api'); // Default tab API rakha hai taaki backend test ho sake
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // --- BACKEND STATE (API Keys) ---
  const [instanceId, setInstanceId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [gatewayUrl, setGatewayUrl] = useState('https://wa-api.example.com');
  
  // Backend URL
  const API_URL = "https://reachify-api.selt-3232.workers.dev";
  const user = JSON.parse(localStorage.getItem('reachify_user')) || { email: 'demo@reachify.com', name: 'Admin' };

  // 1. Load API Settings (Sirf tab backend se data layega)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/get-settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        });
        const data = await res.json();
        if (data.instance_id) {
          setInstanceId(data.instance_id);
          setAccessToken(data.access_token);
          setGatewayUrl(data.gateway_url);
        }
      } catch (err) {
        console.error("Error fetching settings");
      }
    };
    fetchSettings();
  }, [user.email]);

  // 2. Save API Settings Function
  const handleSaveApi = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const res = await fetch(`${API_URL}/save-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, instance_id: instanceId, access_token: accessToken, gateway_url: gatewayUrl })
      });
      
      if (res.ok) {
        setMsg('✅ API Configuration Saved Successfully!');
      } else {
        setMsg('❌ Failed to save.');
      }
    } catch (err) {
      setMsg('❌ Connection Error.');
    }
    setLoading(false);
  };

  // --- RENDER CONTENT BASED ON TAB ---
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Profile Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                <input type="text" defaultValue={user.name} className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white focus:border-fuchsia-500 outline-none" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email Address</label>
                <input type="email" defaultValue={user.email} disabled className="w-full bg-[#0f172a]/50 border border-gray-700 rounded-xl p-3 text-gray-500 cursor-not-allowed" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-sm mb-2">Bio / Company Name</label>
                <textarea className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white focus:border-fuchsia-500 outline-none h-24" placeholder="Enter details..."></textarea>
              </div>
            </div>
            <button className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-2 rounded-lg font-medium">Update Profile</button>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-bold text-white">WhatsApp API Configuration</h3>
               <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">Backend Connected ●</span>
            </div>
            
            {msg && <div className={`p-3 rounded-lg text-sm ${msg.includes('✅') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{msg}</div>}
            
            <form onSubmit={handleSaveApi} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Gateway URL (Provider Link)</label>
                <input type="text" value={gatewayUrl} onChange={(e) => setGatewayUrl(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white focus:border-fuchsia-500 outline-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Instance ID</label>
                  <input type="text" value={instanceId} onChange={(e) => setInstanceId(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white focus:border-fuchsia-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Access Token</label>
                  <input type="text" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white focus:border-fuchsia-500 outline-none" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-fuchsia-500/20 disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Configuration'}
              </button>
            </form>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Security & Password</h3>
            <div className="space-y-4">
               <input type="password" placeholder="Current Password" className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white focus:border-fuchsia-500 outline-none" />
               <input type="password" placeholder="New Password" className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white focus:border-fuchsia-500 outline-none" />
               <input type="password" placeholder="Confirm New Password" className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white focus:border-fuchsia-500 outline-none" />
            </div>
            <button className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-2 rounded-lg font-medium">Change Password</button>
          </div>
        );
      
      case 'billing':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Billing & Plans</h3>
            <div className="p-4 bg-gradient-to-r from-fuchsia-900/40 to-purple-900/40 border border-fuchsia-500/30 rounded-xl flex justify-between items-center">
                <div>
                    <p className="text-sm text-fuchsia-300 font-bold uppercase">Current Plan</p>
                    <h2 className="text-2xl text-white font-bold mt-1">Pro Unlimited</h2>
                    <p className="text-xs text-gray-400 mt-1">Renews on Feb 28, 2026</p>
                </div>
                <button className="bg-white text-fuchsia-900 px-4 py-2 rounded-lg font-bold text-sm">Manage Subscription</button>
            </div>
            <div className="text-gray-400 text-sm">
                <p className="mb-2">Payment History:</p>
                <div className="bg-[#0f172a] p-3 rounded-lg flex justify-between mb-2">
                    <span>Feb 01, 2026</span>
                    <span className="text-green-400">Paid $49.00</span>
                </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in-up max-w-6xl mx-auto h-[calc(100vh-140px)] flex gap-8">
      
      {/* SIDEBAR NAVIGATION */}
      <div className="w-64 flex-shrink-0">
        <h2 className="text-2xl font-bold text-white mb-6 px-2">Settings</h2>
        <div className="space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'profile' ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            👤 Profile Info
          </button>
          <button 
            onClick={() => setActiveTab('api')}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'api' ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            🔗 WhatsApp API
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'security' ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            🔒 Security
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'billing' ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            💳 Billing & Plans
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 bg-[#1e293b] border border-gray-700 rounded-2xl p-8 shadow-2xl overflow-y-auto">
        {renderContent()}
      </div>

    </div>
  );
};

export default Settings;
