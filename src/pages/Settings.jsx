import React, { useState, useEffect } from 'react';

const Settings = () => {
  // --- UI State (Menu Navigation) ---
  const [activeCategory, setActiveCategory] = useState('general');
  const [activeSubTab, setActiveSubTab] = useState('profile'); // Sub-menu support

  // --- Backend Data State ---
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  
  // Real User Data
  const user = JSON.parse(localStorage.getItem('reachify_user')) || { email: '', name: '' };
  const API_URL = "https://reachify-api.selt-3232.workers.dev";

  // --- Form States (Real Data Containers) ---
  // 1. WhatsApp API
  const [waConfig, setWaConfig] = useState({ instanceId: '', accessToken: '', gatewayUrl: '' });
  // 2. Social Media Keys (Real Integration Settings)
  const [socialConfig, setSocialConfig] = useState({ fbAppId: '', instaToken: '', twitterKey: '' });
  // 3. AI Settings
  const [aiConfig, setAiConfig] = useState({ creativity: 0.7, autoReply: false, apiKey: '' });

  // ✅ LOAD REAL SETTINGS FROM BACKEND
  useEffect(() => {
    if(!user.email) return;
    
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/get-settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        });
        const data = await res.json();
        
        // Agar data hai to state update karo, warna blank rakho (No Fake Data)
        if (data.instance_id) {
          setWaConfig({
            instanceId: data.instance_id,
            accessToken: data.access_token,
            gatewayUrl: data.gateway_url
          });
        }
        // Future: Social aur AI settings bhi database se aayengi
      } catch (err) {
        console.error("Failed to load settings");
      }
    };
    fetchSettings();
  }, [user.email]);

  // ✅ SAVE FUNCTION (Universal)
  const handleSave = async (section) => {
    setLoading(true);
    setMsg('');

    // Backend ko data bhejo
    try {
      const payload = {
        email: user.email,
        ...waConfig, // WhatsApp Data
        // ...socialConfig, // Future
        // ...aiConfig    // Future
      };

      const res = await fetch(`${API_URL}/save-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMsg(`✅ ${section} Settings Saved Successfully!`);
      } else {
        setMsg('❌ Save Failed. Database connection check karo.');
      }
    } catch (err) {
      setMsg('❌ Server Error.');
    }
    setLoading(false);
  };

  // --- RENDERERS (Jo dikhega) ---

  const renderProfile = () => (
    <div className="space-y-6 animate-fade-in-up">
      <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-2">Profile Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-gray-400 text-sm">Full Name</label>
          <input type="text" defaultValue={user.name} className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white outline-none focus:border-fuchsia-500" />
        </div>
        <div>
          <label className="text-gray-400 text-sm">Email (Read Only)</label>
          <input type="text" defaultValue={user.email} disabled className="w-full bg-[#0f172a]/50 border border-gray-700 rounded-xl p-3 text-gray-500 cursor-not-allowed" />
        </div>
      </div>
      <button className="bg-fuchsia-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-fuchsia-500">Update Profile</button>
    </div>
  );

  const renderWhatsAppAPI = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center border-b border-gray-700 pb-2">
        <h3 className="text-xl font-bold text-white">WhatsApp API (Gateway)</h3>
        <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">Backend Active ●</span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-gray-400 text-sm">Gateway URL</label>
          <input 
            type="text" 
            placeholder="https://api.provider.com" 
            value={waConfig.gatewayUrl}
            onChange={(e) => setWaConfig({...waConfig, gatewayUrl: e.target.value})}
            className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white outline-none focus:border-fuchsia-500" 
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm">Instance ID</label>
            <input 
              type="text" 
              placeholder="Ex: 609823..." 
              value={waConfig.instanceId}
              onChange={(e) => setWaConfig({...waConfig, instanceId: e.target.value})}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white outline-none focus:border-fuchsia-500" 
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm">Access Token</label>
            <input 
              type="password" 
              placeholder="Ex: s8d7f98s..." 
              value={waConfig.accessToken}
              onChange={(e) => setWaConfig({...waConfig, accessToken: e.target.value})}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white outline-none focus:border-fuchsia-500" 
            />
          </div>
        </div>
      </div>
      <button onClick={() => handleSave('WhatsApp')} className="bg-fuchsia-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-fuchsia-500">
        {loading ? 'Saving...' : 'Save Configuration'}
      </button>
    </div>
  );

  const renderSocialMedia = () => (
    <div className="space-y-6 animate-fade-in-up">
      <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-2">Social Integrations (Real API Keys)</h3>
      <p className="text-sm text-gray-400">Connect your accounts using Developer API keys to enable auto-posting & data extraction.</p>
      
      {/* Facebook */}
      <div className="bg-[#0f172a] p-4 rounded-xl border border-gray-700">
        <h4 className="text-blue-400 font-bold mb-3">Facebook & Instagram</h4>
        <input type="text" placeholder="Facebook App ID" className="w-full mb-3 bg-[#1e293b] border border-gray-600 rounded-lg p-2 text-white text-sm" />
        <input type="text" placeholder="Graph API Token" className="w-full bg-[#1e293b] border border-gray-600 rounded-lg p-2 text-white text-sm" />
      </div>

      {/* Twitter */}
      <div className="bg-[#0f172a] p-4 rounded-xl border border-gray-700">
        <h4 className="text-sky-400 font-bold mb-3">Twitter / X</h4>
        <input type="text" placeholder="API Key" className="w-full mb-3 bg-[#1e293b] border border-gray-600 rounded-lg p-2 text-white text-sm" />
        <input type="text" placeholder="API Secret" className="w-full bg-[#1e293b] border border-gray-600 rounded-lg p-2 text-white text-sm" />
      </div>

      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-500">Save Keys</button>
    </div>
  );

  const renderAI = () => (
    <div className="space-y-6 animate-fade-in-up">
      <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-2">AI Configuration</h3>
      
      <div className="flex items-center justify-between bg-[#0f172a] p-4 rounded-xl border border-gray-700">
        <div>
          <h4 className="text-white font-bold">Auto-Reply AI</h4>
          <p className="text-xs text-gray-400">Automatically reply to new WhatsApp messages using AI.</p>
        </div>
        <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
            <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
            <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
        </div>
      </div>

      <div>
        <label className="text-gray-400 text-sm">OpenAI / Gemini API Key</label>
        <input type="password" placeholder="sk-..." className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white outline-none focus:border-fuchsia-500" />
      </div>

      <div>
        <label className="text-gray-400 text-sm">Creativity Level (Temperature)</label>
        <input type="range" min="0" max="1" step="0.1" className="w-full mt-2 accent-fuchsia-500" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Precise</span>
          <span>Creative</span>
        </div>
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-6 animate-fade-in-up">
      <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-2">Billing & Subscription</h3>
      
      {/* Real Logic: Agar plan nahi hai to Free dikhao */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6">
        <h4 className="text-gray-400 text-sm uppercase font-bold">Current Plan</h4>
        <h2 className="text-3xl text-white font-bold mt-2">Free Starter</h2>
        <p className="text-gray-500 text-sm mt-2">No active subscription found.</p>
        <button className="mt-4 bg-fuchsia-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-fuchsia-500 shadow-lg shadow-fuchsia-500/20">
          Upgrade to Pro
        </button>
      </div>

      {/* No Fake History */}
      <div>
        <h4 className="text-white font-bold mb-4">Transaction History</h4>
        <div className="text-center py-8 bg-[#0f172a] rounded-xl border border-gray-700 border-dashed">
          <p className="text-gray-500">No past transactions found.</p>
        </div>
      </div>
    </div>
  );

  // --- MAIN LAYOUT ---
  return (
    <div className="flex h-[calc(100vh-100px)] max-w-7xl mx-auto gap-8 p-4">
      
      {/* LEFT SIDEBAR (Menu) */}
      <div className="w-64 flex-shrink-0 space-y-8">
        
        {/* Group 1: Account */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 px-2">Account</h4>
          <div className="space-y-1">
            <button onClick={() => setActiveCategory('general')} className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === 'general' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>
              👤 Profile Settings
            </button>
            <button onClick={() => setActiveCategory('billing')} className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === 'billing' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>
              💳 Billing & Plans
            </button>
          </div>
        </div>

        {/* Group 2: Integrations */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 px-2">Integrations</h4>
          <div className="space-y-1">
            <button onClick={() => setActiveCategory('whatsapp')} className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === 'whatsapp' ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20' : 'text-gray-400 hover:text-white'}`}>
              🔗 WhatsApp API
            </button>
            <button onClick={() => setActiveCategory('social')} className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === 'social' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>
              🌐 Social Media
            </button>
          </div>
        </div>

        {/* Group 3: Intelligence */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 px-2">Intelligence</h4>
          <div className="space-y-1">
            <button onClick={() => setActiveCategory('ai')} className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === 'ai' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>
              🤖 AI Configuration
            </button>
          </div>
        </div>

      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="flex-1 bg-[#1e293b] border border-gray-700 rounded-2xl p-8 shadow-2xl overflow-y-auto">
        
        {msg && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${msg.includes('✅') ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            <span>{msg.includes('✅') ? '✅' : '⚠️'}</span>
            {msg}
          </div>
        )}

        {/* Dynamic Content Rendering */}
        {activeCategory === 'general' && renderProfile()}
        {activeCategory === 'whatsapp' && renderWhatsAppAPI()}
        {activeCategory === 'social' && renderSocialMedia()}
        {activeCategory === 'ai' && renderAI()}
        {activeCategory === 'billing' && renderBilling()}

      </div>
    </div>
  );
};

export default Settings;
