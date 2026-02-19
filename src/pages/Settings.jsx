import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({}); 

  // === GLOBAL SETTINGS STATE (Real Working via LocalStorage) ===
  const [settings, setSettings] = useState({
    // Profile
    fullName: 'Demo Admin',
    email: 'demo@reachify.com',
    phone: '',
    companyName: '',
    
    // Billing & Payments
    upi_id: '',
    gst_number: '',
    billing_email: '',

    // General & Preferences
    timezone: 'Asia/Kolkata',
    date_format: 'DD/MM/YYYY',
    app_language: 'en',
    
    // Display
    theme: 'dark',
    compact_mode: false,

    // Notifications
    notify_email_campaigns: true,
    notify_wa_alerts: false,
    notify_system_updates: true,
    
    // WhatsApp API
    wa_provider: 'evolution',
    wa_instance_id: '',
    wa_access_token: '',
    
    // Social Media APIs
    fb_app_id: '',
    fb_app_secret: '',
    ig_access_token: '',
    x_api_key: '',
    x_api_secret: '',
    li_client_id: '',
    li_client_secret: '',
    
    // Data Extractors (GMap)
    gmaps_api_key: '',
    
    // AI Configuration
    ai_provider: 'openai',
    ai_api_key: '',
    ai_max_tokens: '2000'
  });

  const API_URL = "https://reachify-api.selt-3232.workers.dev";

  // LOAD SETTINGS
  useEffect(() => {
    const savedSettings = localStorage.getItem('reachify_api_settings');
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }
  }, []);

  // HANDLE INPUT CHANGES
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSettings(prev => ({ ...prev, [e.target.name]: value }));
  };

  const toggleVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // REAL SAVE FUNCTION
  const handleSave = async () => {
    setIsSaving(true);
    localStorage.setItem('reachify_api_settings', JSON.stringify(settings));

    try {
      const res = await fetch(`${API_URL}/update-settings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings)
      });
      setTimeout(() => {
        setIsSaving(false);
        alert("✅ Settings Saved Successfully! Preferences updated.");
      }, 800);
    } catch (error) {
      setTimeout(() => {
        setIsSaving(false);
        alert("✅ Settings Saved Locally!");
      }, 800);
    }
  };

  // --- UI MENU CONFIG ---
  const menuCategories = ['ACCOUNT & BILLING', 'SYSTEM PREFERENCES', 'API INTEGRATIONS'];
  const menuItems = [
    { id: 'profile', label: 'Profile Details', icon: '👤', category: 'ACCOUNT & BILLING' },
    { id: 'billing', label: 'Subscription & UPI', icon: '💳', category: 'ACCOUNT & BILLING' },
    { id: 'general', label: 'General Settings', icon: '⚙️', category: 'SYSTEM PREFERENCES' },
    { id: 'display', label: 'Display & Theme', icon: '🖥️', category: 'SYSTEM PREFERENCES' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', category: 'SYSTEM PREFERENCES' },
    { id: 'whatsapp', label: 'WhatsApp Provider', icon: '💬', category: 'API INTEGRATIONS' },
    { id: 'social', label: 'Social Media Apps', icon: '🌐', category: 'API INTEGRATIONS' },
    { id: 'extractors', label: 'Data Scrapers', icon: '🧲', category: 'API INTEGRATIONS' },
    { id: 'ai', label: 'AI Models (LLM)', icon: '🤖', category: 'API INTEGRATIONS' }
  ];

  // Custom Toggle Switch Component
  const ToggleSwitch = ({ name, checked, label, desc }) => (
    <div className="flex items-center justify-between bg-[#0f172a] p-4 rounded-xl border border-gray-700">
      <div>
         <h4 className="text-white font-bold text-sm">{label}</h4>
         <p className="text-[10px] text-gray-500 mt-1">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" name={name} checked={checked} onChange={handleChange} className="sr-only peer"/>
        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fuchsia-600"></div>
      </label>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-[1400px] mx-auto p-2 animate-fade-in">
      
      <div className="mb-4 px-2 flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-black text-white tracking-wide">⚙️ Configuration Hub</h2>
           <p className="text-gray-400 text-sm mt-1">Manage billing, customize workspace, and configure API integrations.</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* LEFT SIDEBAR (SETTINGS MENU) */}
        <div className="w-[280px] flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-10">
          {menuCategories.map(category => (
            <div key={category}>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2 border-b border-gray-700/50 pb-1">{category}</p>
              <div className="space-y-1.5">
                {menuItems.filter(item => item.category === category).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                      activeTab === item.id 
                        ? 'bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/30 shadow-[inset_0_0_15px_rgba(217,70,239,0.1)]' 
                        : 'text-gray-400 hover:text-white hover:bg-[#1e293b] border border-transparent'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span> {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 bg-[#1e293b] rounded-2xl border border-gray-700 shadow-xl flex flex-col overflow-hidden relative">
          
          <div className="p-5 border-b border-gray-700 bg-[#0f172a] flex justify-between items-center z-10 shadow-sm">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {menuItems.find(m => m.id === activeTab)?.icon} {menuItems.find(m => m.id === activeTab)?.label}
            </h3>
            <button 
              onClick={handleSave} disabled={isSaving}
              className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:scale-105 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? <><span className="animate-spin">⏳</span> Saving...</> : '💾 Save Changes'}
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#1e293b] to-[#0f172a]">
            
            {/* ========================================= */}
            {/* 1. PROFILE SETTINGS */}
            {/* ========================================= */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in max-w-3xl">
                <div className="flex items-center gap-6 mb-8 bg-[#0f172a] p-6 rounded-2xl border border-gray-700">
                   <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-fuchsia-500 to-indigo-600 flex items-center justify-center text-4xl text-white font-bold shadow-lg">
                      {settings.fullName.charAt(0)}
                   </div>
                   <div>
                      <h3 className="text-2xl font-bold text-white">{settings.fullName}</h3>
                      <p className="text-gray-400">{settings.email}</p>
                      <button className="mt-3 text-xs bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all border border-gray-600">Change Avatar</button>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-1 block">Full Name</label>
                    <input type="text" name="fullName" value={settings.fullName} onChange={handleChange} className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3.5 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-1 block">Phone Number</label>
                    <input type="text" name="phone" value={settings.phone} onChange={handleChange} placeholder="+91 9876543210" className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3.5 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-1 block">Company / Agency Name</label>
                    <input type="text" name="companyName" value={settings.companyName} onChange={handleChange} placeholder="Reachify Solutions" className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3.5 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-1 block">Login Email (Read Only)</label>
                    <input type="email" value={settings.email} readOnly className="w-full bg-black/30 border border-gray-700 rounded-xl p-3.5 text-sm text-gray-500 outline-none cursor-not-allowed" />
                  </div>
                </div>
              </div>
            )}

            {/* ========================================= */}
            {/* 2. SUBSCRIPTION & BILLING */}
            {/* ========================================= */}
            {activeTab === 'billing' && (
              <div className="space-y-6 animate-fade-in max-w-3xl">
                
                {/* Active Plan Card */}
                <div className="bg-gradient-to-r from-indigo-900 to-fuchsia-900 border border-fuchsia-500/50 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-20"><span className="text-8xl">👑</span></div>
                   <h3 className="text-fuchsia-300 font-bold text-sm tracking-widest uppercase mb-1">Current Plan</h3>
                   <h2 className="text-4xl font-black text-white mb-2">Reachify PRO</h2>
                   <p className="text-indigo-200 text-sm mb-6">Unlimited Campaigns • Social Automations • AI Studio</p>
                   <div className="flex gap-4">
                      <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold">Status: Active</span>
                      <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold">Renews: 01 April 2026</span>
                   </div>
                </div>

                <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-700">
                  <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><span>🏦</span> Payment & Invoice Details</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs text-gray-400 font-bold mb-1 block">UPI ID (For Collections)</label>
                      <input type="text" name="upi_id" value={settings.upi_id} onChange={handleChange} placeholder="yourname@okaxis" className="w-full bg-[#1e293b] border border-gray-600 rounded-xl p-3 text-sm text-white outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-bold mb-1 block">GST Number (Optional)</label>
                      <input type="text" name="gst_number" value={settings.gst_number} onChange={handleChange} placeholder="22AAAAA0000A1Z5" className="w-full bg-[#1e293b] border border-gray-600 rounded-xl p-3 text-sm text-white font-mono outline-none focus:border-indigo-500 uppercase" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-400 font-bold mb-1 block">Billing Email (For Invoices)</label>
                      <input type="email" name="billing_email" value={settings.billing_email} onChange={handleChange} placeholder="billing@yourcompany.com" className="w-full bg-[#1e293b] border border-gray-600 rounded-xl p-3 text-sm text-white outline-none focus:border-indigo-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================= */}
            {/* 3. GENERAL SETTINGS */}
            {/* ========================================= */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-fade-in max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-1 block">Application Language</label>
                    <select name="app_language" value={settings.app_language} onChange={handleChange} className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3.5 text-sm text-white outline-none focus:border-fuchsia-500">
                      <option value="en">English (US)</option>
                      <option value="hi">Hindi (हिंदी)</option>
                      <option value="mr">Marathi (मराठी)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-1 block">System Timezone</label>
                    <select name="timezone" value={settings.timezone} onChange={handleChange} className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3.5 text-sm text-white outline-none focus:border-fuchsia-500">
                      <option value="Asia/Kolkata">India Standard Time (IST)</option>
                      <option value="America/New_York">Eastern Time (EST)</option>
                      <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                      <option value="UTC">Coordinated Universal Time (UTC)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-1 block">Date Format</label>
                    <select name="date_format" value={settings.date_format} onChange={handleChange} className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3.5 text-sm text-white outline-none focus:border-fuchsia-500">
                      <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2026)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (2026-12-31)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================= */}
            {/* 4. DISPLAY SETTINGS */}
            {/* ========================================= */}
            {activeTab === 'display' && (
              <div className="space-y-6 animate-fade-in max-w-2xl">
                 <div>
                    <label className="text-xs text-gray-400 font-bold mb-3 block">Color Theme</label>
                    <div className="flex gap-4">
                       <div onClick={() => setSettings({...settings, theme: 'dark'})} className={`flex-1 p-4 rounded-xl border-2 cursor-pointer flex flex-col items-center gap-2 transition-all ${settings.theme === 'dark' ? 'border-fuchsia-500 bg-[#0f172a]' : 'border-gray-700 bg-[#1e293b] opacity-70'}`}>
                          <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-700"></div>
                          <span className="text-white text-sm font-bold">Dark Mode</span>
                       </div>
                       <div onClick={() => alert("Light theme is locked in Pro Beta.")} className="flex-1 p-4 rounded-xl border-2 border-gray-700 bg-gray-100 cursor-not-allowed flex flex-col items-center gap-2 opacity-50 relative">
                          <span className="absolute top-2 right-2 text-[10px] bg-black text-white px-2 py-0.5 rounded">LOCKED</span>
                          <div className="w-12 h-12 rounded-full bg-white border border-gray-300"></div>
                          <span className="text-gray-800 text-sm font-bold">Light Mode</span>
                       </div>
                    </div>
                 </div>

                 <ToggleSwitch 
                    name="compact_mode" 
                    checked={settings.compact_mode} 
                    label="Compact UI Mode" 
                    desc="Reduce padding and margins to fit more data on the screen."
                 />
              </div>
            )}

            {/* ========================================= */}
            {/* 5. NOTIFICATIONS */}
            {/* ========================================= */}
            {activeTab === 'notifications' && (
              <div className="space-y-4 animate-fade-in max-w-2xl">
                 <ToggleSwitch 
                    name="notify_email_campaigns" 
                    checked={settings.notify_email_campaigns} 
                    label="Campaign Completion Emails" 
                    desc="Receive a summary email when a bulk blast finishes."
                 />
                 <ToggleSwitch 
                    name="notify_wa_alerts" 
                    checked={settings.notify_wa_alerts} 
                    label="WhatsApp Lead Alerts" 
                    desc="Get a ping on your connected WhatsApp when a new lead replies."
                 />
                 <ToggleSwitch 
                    name="notify_system_updates" 
                    checked={settings.notify_system_updates} 
                    label="System & Feature Updates" 
                    desc="Notifications about new tools, patches, and AI models."
                 />
              </div>
            )}

            {/* ========================================= */}
            {/* 6. WHATSAPP API SETTINGS */}
            {/* ========================================= */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-6 animate-fade-in max-w-2xl">
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex gap-3 text-sm text-gray-300">
                  <span className="text-xl">💬</span>
                  <p>Link your Gateway provider to enable Bulk Sender and Auto-Responders.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-1 block">Gateway Provider</label>
                    <select name="wa_provider" value={settings.wa_provider} onChange={handleChange} className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3.5 text-sm text-white outline-none focus:border-emerald-500">
                      <option value="evolution">Evolution API (Node)</option>
                      <option value="wapi">WAPI Gateway</option>
                      <option value="meta">Meta Cloud API (Official)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-1 block">Instance / Phone ID</label>
                    <input type="text" name="wa_instance_id" value={settings.wa_instance_id} onChange={handleChange} placeholder="reachify-inst-01" className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3.5 text-white font-mono text-sm outline-none focus:border-emerald-500" />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="text-xs text-gray-400 font-bold mb-1 block">Secure Access Token</label>
                    <div className="relative">
                      <input type={showPassword['wa_token'] ? 'text' : 'password'} name="wa_access_token" value={settings.wa_access_token} onChange={handleChange} placeholder="Paste your API key here..." className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3.5 text-white font-mono text-sm outline-none focus:border-emerald-500 pr-12" />
                      <button onClick={() => toggleVisibility('wa_token')} className="absolute right-4 top-3.5 text-gray-400 hover:text-white">
                        {showPassword['wa_token'] ? '👁️' : '🙈'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================= */}
            {/* 7. SOCIAL MEDIA API SETTINGS */}
            {/* ========================================= */}
            {activeTab === 'social' && (
              <div className="space-y-6 animate-fade-in max-w-3xl">
                <p className="text-sm text-gray-400 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">Add App Credentials to enable Omni-channel publishing and Birthday tracking.</p>

                {/* FB & Insta Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#0f172a] p-5 rounded-2xl border border-gray-700 shadow-md">
                    <h4 className="text-blue-400 font-bold flex items-center gap-2 mb-4"><span>📘</span> Facebook Graph API</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">App ID</label>
                        <input type="text" name="fb_app_id" value={settings.fb_app_id} onChange={handleChange} className="w-full bg-[#1e293b] border border-gray-600 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">App Secret</label>
                        <input type="password" name="fb_app_secret" value={settings.fb_app_secret} onChange={handleChange} className="w-full bg-[#1e293b] border border-gray-600 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-blue-500" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0f172a] p-5 rounded-2xl border border-gray-700 shadow-md">
                    <h4 className="text-pink-400 font-bold flex items-center gap-2 mb-4"><span>📸</span> Instagram API</h4>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Long-Lived Access Token</label>
                      <input type="password" name="ig_access_token" value={settings.ig_access_token} onChange={handleChange} className="w-full bg-[#1e293b] border border-gray-600 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-pink-500" />
                    </div>
                  </div>

                  <div className="bg-[#0f172a] p-5 rounded-2xl border border-gray-700 shadow-md">
                    <h4 className="text-gray-200 font-bold flex items-center gap-2 mb-4"><span>🕮</span> Twitter / X Developer (v2)</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">API Key</label>
                        <input type="text" name="x_api_key" value={settings.x_api_key} onChange={handleChange} className="w-full bg-[#1e293b] border border-gray-600 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-gray-400" />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">API Secret</label>
                        <input type="password" name="x_api_secret" value={settings.x_api_secret} onChange={handleChange} className="w-full bg-[#1e293b] border border-gray-600 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0f172a] p-5 rounded-2xl border border-gray-700 shadow-md">
                    <h4 className="text-blue-500 font-bold flex items-center gap-2 mb-4"><span>💼</span> LinkedIn API</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Client ID</label>
                        <input type="text" name="li_client_id" value={settings.li_client_id} onChange={handleChange} className="w-full bg-[#1e293b] border border-gray-600 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Client Secret</label>
                        <input type="password" name="li_client_secret" value={settings.li_client_secret} onChange={handleChange} className="w-full bg-[#1e293b] border border-gray-600 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================= */}
            {/* 8. DATA EXTRACTORS & AI */}
            {/* ========================================= */}
            {activeTab === 'extractors' && (
              <div className="space-y-6 animate-fade-in max-w-2xl">
                <div>
                  <label className="text-xs text-gray-400 font-bold mb-1 block">Google Places API Key</label>
                  <p className="text-[10px] text-gray-500 mb-2">Required for Google Map Lead Scraper.</p>
                  <div className="relative">
                    <input type={showPassword['gmap_key'] ? 'text' : 'password'} name="gmaps_api_key" value={settings.gmaps_api_key} onChange={handleChange} placeholder="AIzaSy..." className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3.5 text-white font-mono text-sm outline-none focus:border-yellow-500 pr-12" />
                    <button onClick={() => toggleVisibility('gmap_key')} className="absolute right-4 top-3.5 text-gray-400 hover:text-white">
                      {showPassword['gmap_key'] ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6 animate-fade-in max-w-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-1 block">AI Neural Engine</label>
                    <select name="ai_provider" value={settings.ai_provider} onChange={handleChange} className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3.5 text-sm text-white outline-none focus:border-purple-500">
                      <option value="openai">OpenAI (GPT-4o)</option>
                      <option value="gemini">Google Gemini Pro</option>
                      <option value="claude">Anthropic Claude 3.5</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-1 block">Max Output Tokens</label>
                    <input type="number" name="ai_max_tokens" value={settings.ai_max_tokens} onChange={handleChange} className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3.5 text-white font-mono text-sm outline-none focus:border-purple-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-bold mb-1 block">Master API Key</label>
                  <div className="relative">
                    <input type={showPassword['ai_key'] ? 'text' : 'password'} name="ai_api_key" value={settings.ai_api_key} onChange={handleChange} placeholder="sk-..." className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3.5 text-white font-mono text-sm outline-none focus:border-purple-500 pr-12" />
                    <button onClick={() => toggleVisibility('ai_key')} className="absolute right-4 top-3.5 text-gray-400 hover:text-white">
                      {showPassword['ai_key'] ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
