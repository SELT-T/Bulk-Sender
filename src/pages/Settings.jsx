import React, { useState, useEffect } from 'react';

const Settings = () => {
  // 🔥 ASLI FIX: Current logged-in user ko fetch karna
  const loggedInUser = JSON.parse(localStorage.getItem('reachify_user')) || { email: 'demo@reachify.com', name: 'Demo Admin' };

  const [activeTab, setActiveTab] = useState('ai'); // Default AI tab khulega
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({}); 

  // === WHATSAPP WEB SPECIFIC STATES ===
  const [waConnectionType, setWaConnectionType] = useState('api'); 
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [webStatus, setWebStatus] = useState('disconnected'); 
  const [liveLog, setLiveLog] = useState('Engine is offline. Click Generate QR to start.');

  // === GLOBAL SETTINGS STATE ===
  const [settings, setSettings] = useState({
    // Profile (Locked to logged-in user)
    fullName: loggedInUser.name,
    email: loggedInUser.email,
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
    
    // WhatsApp Connections
    wa_connection_mode: 'api', 
    wa_provider: 'meta', // 🟢 Defaulting to Meta Cloud API
    wa_instance_id: '', // Meta Phone Number ID
    wa_access_token: '', // Meta Permanent Token
    anti_ban_min_delay: 5,
    anti_ban_max_delay: 15,
    anti_ban_typing_status: true,
    
    // Social Media APIs
    fb_app_id: '',
    fb_app_secret: '',
    ig_access_token: '',
    x_api_key: '',
    x_api_secret: '',
    li_client_id: '',
    li_client_secret: '',
    
    // Data Extractors
    gmaps_api_key: '',
    
    // AI Configuration
    ai_provider: 'gemini',
    ai_api_key: '',
    ai_max_tokens: '2000'
  });

  const API_URL = "https://reachify-api.selt-3232.workers.dev";
  const WA_ENGINE_URL = "https://reachify-wa-engine.onrender.com"; 

  // LOAD SETTINGS FROM LOCAL & DB
  useEffect(() => {
    const savedSettings = localStorage.getItem('reachify_api_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // 🔥 Forcefully merge with real logged-in email and Gemini provider
      setSettings(prev => ({ 
         ...prev, 
         ...parsed, 
         email: loggedInUser.email, 
         fullName: loggedInUser.name,
         ai_provider: 'gemini' 
      }));
      if(parsed.wa_connection_mode) setWaConnectionType(parsed.wa_connection_mode);
    }
  }, []);

  // AUTO-POLLING FOR WHATSAPP STATUS
  useEffect(() => {
    let interval;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${WA_ENGINE_URL}/api/wa-status`);
        const data = await res.json();
        
        if (data.status === 'connected') {
           setWebStatus('connected');
           setQrCodeData(null);
           setIsGeneratingQR(false); 
           setLiveLog('✅ Device linked securely. Engine is ready.');
        } 
        else if (data.status === 'scanning') {
           if (data.qr) {
              setWebStatus('scanning');
              setQrCodeData(data.qr);
              setIsGeneratingQR(false); 
              setLiveLog('⏳ Scan this QR quickly! (Do not delay)');
           } else {
              setWebStatus('authenticating');
              setQrCodeData(null);
              setIsGeneratingQR(false); 
              setLiveLog('🔄 Scan successful! Authenticating and syncing chats...');
           }
        }
        else {
           if (webStatus !== 'generating') {
               setWebStatus('disconnected');
               setQrCodeData(null);
               setIsGeneratingQR(false);
               setLiveLog('❌ Engine disconnected. Click Generate to get new QR.');
           }
        }
      } catch(err) { 
        if (webStatus === 'generating') {
           setLiveLog('⚠️ Waking up Render server from deep sleep... please wait (takes up to 50s).'); 
        } else {
           setLiveLog('⚠️ Waiting for server to wake up...'); 
        }
      }
    };

    if (waConnectionType === 'web' && webStatus === 'disconnected') fetchStatus();

    if (webStatus === 'scanning' || webStatus === 'authenticating' || webStatus === 'generating') {
      interval = setInterval(() => fetchStatus(), 3000);
    }
    
    // 🟢 Fix: API mode ke liye check
    if (waConnectionType === 'api') {
      const savedSettings = JSON.parse(localStorage.getItem('reachify_api_settings') || '{}');
      if (savedSettings.wa_access_token && savedSettings.wa_instance_id) {
         setWaStatus('connected');
      } else {
         setWaStatus('disconnected');
      }
    }

    return () => clearInterval(interval);
  }, [webStatus, waConnectionType]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSettings(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleModeChange = (mode) => {
    setWaConnectionType(mode);
    setSettings(prev => ({ ...prev, wa_connection_mode: mode }));
  };

  const toggleVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // 🔥 SAVE TO BACKEND WITH REAL EMAIL
  const handleSave = async () => {
    setIsSaving(true);
    
    // Safety check: ensure email is correct before saving
    const finalSettings = { ...settings, email: loggedInUser.email, ai_provider: 'gemini' };
    localStorage.setItem('reachify_api_settings', JSON.stringify(finalSettings));

    try {
      const res = await fetch(`${API_URL}/update-settings`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(finalSettings)
      });
      
      if(res.ok) {
         setTimeout(() => { 
             setIsSaving(false); 
             alert("✅ Settings Saved Successfully to Database!"); 
         }, 800);
         // Update API status immediately after save if mode is API
         if (finalSettings.wa_connection_mode === 'api' && finalSettings.wa_access_token && finalSettings.wa_instance_id) {
             setWaStatus('connected');
         }
      } else {
         throw new Error("Backend save failed");
      }
    } catch (error) {
      setTimeout(() => { setIsSaving(false); alert("⚠️ Network error, but settings saved locally."); }, 800);
    }
  };

  const generateQRCode = async () => {
    setIsGeneratingQR(true); 
    setWebStatus('generating'); 
    setLiveLog('⏳ Requesting fresh QR Code... Waking up Engine (takes 20-50s)...');
    setQrCodeData(null);
    try { await fetch(`${WA_ENGINE_URL}/api/wa-status`); } 
    catch (err) { setLiveLog('⚠️ Server is sleeping. Waking it up, please keep waiting...'); }
  };

  const disconnectWeb = async () => {
    setLiveLog('🔌 Resetting Engine...');
    try {
        await fetch(`${WA_ENGINE_URL}/api/wa-logout`, { method: 'POST' });
        setWebStatus('disconnected');
        setQrCodeData(null);
        setIsGeneratingQR(false);
        setLiveLog('❌ Engine Reset successfully. Click Generate QR to start fresh.');
    } catch (err) { setLiveLog('⚠️ Failed to reach server for reset.'); }
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

  const ToggleSwitch = ({ name, checked, label, desc }) => (
    <div className="flex items-center justify-between bg-[#0f172a] p-3 md:p-4 rounded-xl border border-gray-700">
      <div className="pr-2">
         <h4 className="text-white font-bold text-xs md:text-sm">{label}</h4>
         <p className="text-[9px] md:text-[10px] text-gray-500 mt-1 leading-tight">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input type="checkbox" name={name} checked={checked} onChange={handleChange} className="sr-only peer"/>
        <div className="w-10 h-5 md:w-11 md:h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 md:after:h-5 md:after:w-5 after:transition-all peer-checked:bg-fuchsia-600"></div>
      </label>
    </div>
  );

  return (
    <div className="flex flex-col h-auto min-h-screen lg:min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] max-w-[1400px] mx-auto p-2 md:p-4 animate-fade-in pb-20 lg:pb-0">
      
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
        <div>
           <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide">⚙️ Configuration</h2>
           <p className="text-gray-400 text-xs md:text-sm mt-1">Manage billing, workspace, and API integrations.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 overflow-hidden">
        
        {/* LEFT SIDEBAR */}
        <div className="w-full lg:w-[280px] flex lg:flex-col gap-2 lg:gap-6 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto custom-scrollbar flex-shrink-0 pb-2 lg:pb-10 lg:pr-2 border-b lg:border-b-0 border-gray-700/50">
          
          <div className="flex lg:hidden gap-2">
             {menuItems.map(item => (
                <button
                   key={item.id}
                   onClick={() => setActiveTab(item.id)}
                   className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-bold text-[10px] whitespace-nowrap ${
                     activeTab === item.id 
                       ? 'bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/50' 
                       : 'bg-[#1e293b] text-gray-400 border border-gray-700'
                   }`}
                 >
                   <span className="text-sm">{item.icon}</span> {item.label}
                 </button>
             ))}
          </div>

          <div className="hidden lg:block w-full">
            {menuCategories.map(category => (
              <div key={category} className="mb-6">
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
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 bg-[#1e293b] rounded-2xl border border-gray-700 shadow-xl flex flex-col relative overflow-visible lg:overflow-hidden min-h-[500px]">
          
          <div className="p-4 md:p-5 border-b border-gray-700 bg-[#0f172a] flex flex-row justify-between items-center z-10 shadow-sm sticky top-0 rounded-t-2xl">
            <h3 className="text-sm md:text-xl font-bold text-white flex items-center gap-2 truncate pr-2">
              {menuItems.find(m => m.id === activeTab)?.icon} <span className="truncate">{menuItems.find(m => m.id === activeTab)?.label}</span>
            </h3>
            <button 
              onClick={handleSave} disabled={isSaving}
              className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:scale-[1.02] text-white px-4 md:px-8 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-lg transition-all disabled:opacity-50 flex items-center gap-1 md:gap-2 flex-shrink-0"
            >
              {isSaving ? <><span className="animate-spin">⏳</span> <span className="hidden sm:inline">Saving...</span></> : '💾 Save Settings'}
            </button>
          </div>

          <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#1e293b] to-[#0f172a]">
            
            {/* 1. PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-4 md:space-y-6 animate-fade-in max-w-3xl">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 mb-4 md:mb-8 bg-[#0f172a] p-4 md:p-6 rounded-2xl border border-gray-700">
                   <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-fuchsia-500 to-indigo-600 flex items-center justify-center text-2xl md:text-4xl text-white font-bold shadow-lg flex-shrink-0 uppercase">
                      {settings.fullName ? settings.fullName.charAt(0) : 'U'}
                   </div>
                   <div className="text-center sm:text-left">
                      <h3 className="text-xl md:text-2xl font-bold text-white">{settings.fullName}</h3>
                      <p className="text-gray-400 text-xs md:text-sm">{settings.email}</p>
                      <button className="mt-2 md:mt-3 text-[10px] md:text-xs bg-white/10 hover:bg-white/20 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-all border border-gray-600">Logged In Account</button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-1 block">Full Name</label>
                    <input type="text" name="fullName" value={settings.fullName} onChange={handleChange} className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 md:p-3.5 text-base md:text-sm text-white outline-none focus:border-fuchsia-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-1 block">Phone Number</label>
                    <input type="text" name="phone" value={settings.phone} onChange={handleChange} placeholder="+91 9876543210" className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 md:p-3.5 text-base md:text-sm text-white outline-none focus:border-fuchsia-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-1 block">Company / Agency</label>
                    <input type="text" name="companyName" value={settings.companyName} onChange={handleChange} placeholder="Reachify Solutions" className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 md:p-3.5 text-base md:text-sm text-white outline-none focus:border-fuchsia-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-1 block">Login Email (Read Only)</label>
                    <input type="email" value={settings.email} readOnly className="w-full bg-black/30 border border-gray-700 rounded-xl p-3 md:p-3.5 text-base md:text-sm text-gray-500 outline-none cursor-not-allowed" />
                  </div>
                </div>
              </div>
            )}

            {/* 2. BILLING */}
            {activeTab === 'billing' && (
              <div className="space-y-4 md:space-y-6 animate-fade-in max-w-3xl">
                <div className="bg-gradient-to-r from-indigo-900 to-fuchsia-900 border border-fuchsia-500/50 p-5 md:p-6 rounded-2xl shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-20"><span className="text-6xl md:text-8xl">👑</span></div>
                   <h3 className="text-fuchsia-300 font-bold text-[10px] md:text-sm tracking-widest uppercase mb-1">Current Plan</h3>
                   <h2 className="text-2xl md:text-4xl font-black text-white mb-2 relative z-10">Reachify PRO</h2>
                   <p className="text-indigo-200 text-[10px] md:text-sm mb-4 md:mb-6 relative z-10">Unlimited Campaigns • Social Automations • AI Studio</p>
                   <div className="flex flex-wrap gap-2 md:gap-4 relative z-10">
                      <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold">Status: Active</span>
                      <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold">Renews: 01 April 2026</span>
                   </div>
                </div>

                <div className="bg-[#0f172a] p-4 md:p-6 rounded-2xl border border-gray-700">
                  <h4 className="text-white font-bold text-sm md:text-lg mb-3 md:mb-4 flex items-center gap-2"><span>🏦</span> Payment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-1 block">UPI ID</label>
                      <input type="text" name="upi_id" value={settings.upi_id} onChange={handleChange} placeholder="yourname@okaxis" className="w-full bg-[#1e293b] border border-gray-600 rounded-xl p-3 text-base md:text-sm text-white outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-1 block">GST Number</label>
                      <input type="text" name="gst_number" value={settings.gst_number} onChange={handleChange} placeholder="22AAAAA0000A1Z5" className="w-full bg-[#1e293b] border border-gray-600 rounded-xl p-3 text-base md:text-sm text-white font-mono outline-none focus:border-indigo-500 uppercase" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-1 block">Billing Email</label>
                      <input type="email" name="billing_email" value={settings.billing_email} onChange={handleChange} placeholder="billing@yourcompany.com" className="w-full bg-[#1e293b] border border-gray-600 rounded-xl p-3 text-base md:text-sm text-white outline-none focus:border-indigo-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. GENERAL */}
            {activeTab === 'general' && (
              <div className="space-y-4 md:space-y-6 animate-fade-in max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-1 block">Language</label>
                    <select name="app_language" value={settings.app_language} onChange={handleChange} className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 md:p-3.5 text-xs md:text-sm text-white outline-none focus:border-fuchsia-500">
                      <option value="en">English (US)</option>
                      <option value="hi">Hindi (हिंदी)</option>
                      <option value="mr">Marathi (मराठी)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-1 block">System Timezone</label>
                    <select name="timezone" value={settings.timezone} onChange={handleChange} className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 md:p-3.5 text-xs md:text-sm text-white outline-none focus:border-fuchsia-500">
                      <option value="Asia/Kolkata">India Standard Time (IST)</option>
                      <option value="America/New_York">Eastern Time (EST)</option>
                      <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-1 block">Date Format</label>
                    <select name="date_format" value={settings.date_format} onChange={handleChange} className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 md:p-3.5 text-xs md:text-sm text-white outline-none focus:border-fuchsia-500">
                      <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2026)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (2026-12-31)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 4. DISPLAY */}
            {activeTab === 'display' && (
              <div className="space-y-4 md:space-y-6 animate-fade-in max-w-2xl">
                 <div>
                    <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-2 md:mb-3 block">Color Theme</label>
                    <div className="flex gap-3 md:gap-4">
                       <div onClick={() => setSettings({...settings, theme: 'dark'})} className={`flex-1 p-3 md:p-4 rounded-xl border-2 cursor-pointer flex flex-col items-center gap-2 transition-all ${settings.theme === 'dark' ? 'border-fuchsia-500 bg-[#0f172a]' : 'border-gray-700 bg-[#1e293b] opacity-70'}`}>
                          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gray-900 border border-gray-700"></div>
                          <span className="text-white text-xs md:text-sm font-bold">Dark</span>
                       </div>
                       <div onClick={() => alert("Light theme is locked in Pro Beta.")} className="flex-1 p-3 md:p-4 rounded-xl border-2 border-gray-700 bg-gray-100 cursor-not-allowed flex flex-col items-center gap-2 opacity-50 relative">
                          <span className="absolute top-2 right-2 text-[8px] bg-black text-white px-1.5 py-0.5 rounded">LOCKED</span>
                          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white border border-gray-300"></div>
                          <span className="text-gray-800 text-xs md:text-sm font-bold">Light</span>
                       </div>
                    </div>
                 </div>
                 <ToggleSwitch name="compact_mode" checked={settings.compact_mode} label="Compact UI Mode" desc="Reduce padding and margins to fit more data." />
              </div>
            )}

            {/* 5. NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-3 md:space-y-4 animate-fade-in max-w-2xl">
                 <ToggleSwitch name="notify_email_campaigns" checked={settings.notify_email_campaigns} label="Campaign Emails" desc="Receive a summary email when a bulk blast finishes." />
                 <ToggleSwitch name="notify_wa_alerts" checked={settings.notify_wa_alerts} label="WhatsApp Lead Alerts" desc="Get a ping when a new lead replies." />
                 <ToggleSwitch name="notify_system_updates" checked={settings.notify_system_updates} label="System Updates" desc="Notifications about new tools, patches, etc." />
              </div>
            )}

            {/* 6. WHATSAPP */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-4 md:space-y-6 animate-fade-in max-w-3xl">
                
                <div className="bg-[#0f172a] p-1 md:p-1.5 rounded-xl border border-gray-700 flex w-full">
                   <button onClick={() => handleModeChange('api')} className={`flex-1 py-2 md:py-3 text-[10px] md:text-sm font-bold rounded-lg transition-all ${waConnectionType === 'api' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>☁️ Official API</button>
                   <button onClick={() => handleModeChange('web')} className={`flex-1 py-2 md:py-3 text-[10px] md:text-sm font-bold rounded-lg transition-all ${waConnectionType === 'web' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>📱 Web (QR)</button>
                </div>

                {waConnectionType === 'api' && (
                   <div className="space-y-4 md:space-y-6 animate-fade-in-up">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-[#0f172a] p-4 md:p-6 rounded-xl border border-gray-700">
                       <div>
                         <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-1 block">Provider</label>
                         <select name="wa_provider" value={settings.wa_provider} onChange={handleChange} className="w-full bg-[#1e293b] border border-gray-600 rounded-xl p-3 md:p-3.5 text-xs md:text-sm text-white outline-none focus:border-emerald-500">
                           <option value="meta">Meta Cloud API</option>
                           <option value="evolution">Evolution API (Node)</option>
                           <option value="wapi">WAPI Gateway</option>
                         </select>
                       </div>
                       <div>
                         <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-1 block">Instance ID / Phone Number ID</label>
                         <input type="text" name="wa_instance_id" value={settings.wa_instance_id} onChange={handleChange} placeholder="e.g. 10478200..." className="w-full bg-[#1e293b] border border-gray-600 rounded-xl p-3 md:p-3.5 text-white font-mono text-base md:text-sm outline-none focus:border-emerald-500" />
                       </div>
                       <div className="md:col-span-2">
                         <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-1 block">Secure Token / Access Token</label>
                         <div className="relative">
                           <input type={showPassword['wa_token'] ? 'text' : 'password'} name="wa_access_token" value={settings.wa_access_token} onChange={handleChange} placeholder="Paste API key..." className="w-full bg-[#1e293b] border border-gray-600 rounded-xl p-3 md:p-3.5 text-white font-mono text-base md:text-sm outline-none focus:border-emerald-500 pr-12" />
                           <button onClick={() => toggleVisibility('wa_token')} className="absolute right-3 md:right-4 top-3 md:top-3.5 text-gray-400 hover:text-white">
                             {showPassword['wa_token'] ? '👁️' : '🙈'}
                           </button>
                         </div>
                       </div>
                     </div>
                   </div>
                )}

                {waConnectionType === 'web' && (
                   <div className="space-y-4 md:space-y-6 animate-fade-in-up">
                     
                     <div className="bg-black border border-gray-700 rounded-xl p-3 md:p-4 shadow-inner font-mono">
                        <div className="flex items-center gap-2 mb-2 border-b border-gray-800 pb-2">
                           <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span></div>
                           <span className="text-gray-500 text-[8px] md:text-[10px] ml-1 md:ml-2 tracking-widest uppercase">Engine Log</span>
                        </div>
                        <div className="text-emerald-400 text-[10px] md:text-xs tracking-wide">> {liveLog}</div>
                     </div>

                     <div className="bg-[#0f172a] p-4 md:p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row gap-4 md:gap-6 items-center">
                        <div className="flex-1 w-full text-center md:text-left">
                           <h3 className="text-white font-bold text-base md:text-lg mb-1 md:mb-2">Device Linking</h3>
                           <p className="text-gray-400 text-[10px] md:text-xs mb-3 md:mb-4">Click "Generate QR" to link your WhatsApp.</p>
                           
                           <div className="flex flex-col gap-2 md:gap-3 items-center md:items-start">
                              {webStatus !== 'connected' ? (
                                <button onClick={generateQRCode} disabled={isGeneratingQR} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-xs md:text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 w-full max-w-[250px]">
                                   {isGeneratingQR ? '⏳ Waking Engine...' : (qrCodeData ? '🔄 Refresh QR Code' : '📱 Generate QR Code')}
                                </button>
                              ) : (
                                <button disabled className="bg-green-600/20 text-green-400 border border-green-500/50 px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 w-full max-w-[250px] cursor-default">
                                   <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Connected Active
                                </button>
                              )}
                              <button onClick={disconnectWeb} className="bg-gray-800 text-red-400 hover:bg-red-500 hover:text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-bold border border-gray-700 hover:border-red-500 transition-all flex items-center justify-center gap-2 w-full max-w-[250px]">
                                 <span>🛑</span> Reset Engine
                              </button>
                           </div>
                        </div>

                        {/* QR AREA */}
                        <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 bg-[#111b21] rounded-xl border-4 border-gray-600 flex items-center justify-center p-2 relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                           {(webStatus === 'disconnected' || webStatus === 'generating') && !qrCodeData && (
                              <div className="text-center">
                                 {webStatus === 'generating' ? (
                                    <div className="flex flex-col items-center">
                                      <div className="w-6 h-6 md:w-8 md:h-8 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin mb-2 md:mb-3"></div>
                                      <span className="text-[#00a884] text-[10px] md:text-xs font-bold animate-pulse">Requesting...</span>
                                    </div>
                                 ) : (
                                    <span className="text-gray-400 text-[10px] md:text-xs font-bold px-2">Click Generate to load QR</span>
                                 )}
                              </div>
                           )}

                           {qrCodeData && webStatus === 'scanning' && (
                              <div className="w-full h-full p-1.5 md:p-2 bg-white rounded-lg flex flex-col relative">
                                <img src={qrCodeData} alt="WhatsApp QR" className="w-full h-full object-contain" />
                              </div>
                           )}

                           {webStatus === 'authenticating' && (
                              <div className="flex flex-col items-center justify-center w-full h-full">
                                 <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin mb-2 md:mb-3"></div>
                                 <h4 className="text-white font-bold text-[10px] md:text-sm">Authenticating...</h4>
                              </div>
                           )}

                           {webStatus === 'connected' && (
                              <div className="flex flex-col items-center justify-center w-full h-full">
                                 <div className="w-12 h-12 md:w-16 md:h-16 bg-[#00a884] rounded-full flex items-center justify-center mb-2 md:mb-3">
                                    <span className="text-2xl md:text-3xl text-white">✅</span>
                                 </div>
                                 <h4 className="text-white font-bold text-xs md:text-[15px]">Active</h4>
                              </div>
                           )}
                        </div>
                     </div>

                     <div className="bg-[#0f172a] p-4 md:p-6 rounded-xl border border-gray-700">
                        <h3 className="text-white font-bold text-sm md:text-lg mb-1 flex items-center gap-2">🛡️ Anti-Ban Protocol</h3>
                        <p className="text-gray-400 text-[10px] md:text-xs mb-4 md:mb-6">Control sending speed to mimic humans.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                           <div>
                              <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-1 flex justify-between">Min Delay <span>{settings.anti_ban_min_delay} sec</span></label>
                              <input type="range" name="anti_ban_min_delay" min="0" max="10" value={settings.anti_ban_min_delay} onChange={handleChange} className="w-full accent-emerald-500" />
                           </div>
                           <div>
                              <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-1 flex justify-between">Max Delay <span>{settings.anti_ban_max_delay} sec</span></label>
                              <input type="range" name="anti_ban_max_delay" min="0" max="60" value={settings.anti_ban_max_delay} onChange={handleChange} className="w-full accent-emerald-500" />
                           </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-700">
                           <ToggleSwitch name="anti_ban_typing_status" checked={settings.anti_ban_typing_status} label="Simulate 'Typing...' Status" desc="Show typing indicator before sending." />
                        </div>
                     </div>
                   </div>
                )}
              </div>
            )}

            {/* 7. SOCIAL */}
            {activeTab === 'social' && (
              <div className="space-y-4 md:space-y-6 animate-fade-in max-w-3xl">
                <p className="text-[10px] md:text-sm text-gray-400 bg-blue-500/10 border border-blue-500/20 p-3 md:p-4 rounded-xl">Add App Credentials to enable Omni-channel publishing.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-[#0f172a] p-4 md:p-5 rounded-2xl border border-gray-700 shadow-md">
                    <h4 className="text-blue-400 font-bold flex items-center gap-2 mb-3 md:mb-4 text-xs md:text-base"><span>📘</span> Facebook Graph API</h4>
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <label className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-wide block mb-1">App ID</label>
                        <input type="text" name="fb_app_id" value={settings.fb_app_id} onChange={handleChange} className="w-full bg-[#1e293b] border border-gray-600 rounded-lg p-2.5 text-white font-mono text-base md:text-xs outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-wide block mb-1">App Secret</label>
                        <input type="password" name="fb_app_secret" value={settings.fb_app_secret} onChange={handleChange} className="w-full bg-[#1e293b] border border-gray-600 rounded-lg p-2.5 text-white font-mono text-base md:text-xs outline-none focus:border-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 8. EXTRACTORS (🟢 FIX: Divs closed properly) */}
            {activeTab === 'extractors' && (
              <div className="space-y-6 animate-fade-in max-w-2xl">
                <div>
                  <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-1 block">Google Places API Key</label>
                  <p className="text-[9px] md:text-[10px] text-gray-500 mb-2">Required for Map Scraper.</p>
                  <div className="relative">
                    <input type={showPassword['gmap_key'] ? 'text' : 'password'} name="gmaps_api_key" value={settings.gmaps_api_key} onChange={handleChange} placeholder="AIzaSy..." className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 md:p-3.5 text-white font-mono text-base md:text-sm outline-none focus:border-yellow-500 pr-12" />
                    <button onClick={() => toggleVisibility('gmap_key')} className="absolute right-3 md:right-4 top-3 md:top-3.5 text-gray-400 hover:text-white">
                      {showPassword['gmap_key'] ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 🔥 9. AI MODELS (LOCKED TO GEMINI) 🔥 */}
            {activeTab === 'ai' && (
              <div className="space-y-4 md:space-y-6 animate-fade-in max-w-2xl">
                
                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl flex items-start gap-3">
                   <span className="text-2xl">💡</span>
                   <div>
                      <h4 className="text-blue-400 font-bold text-sm">Google Gemini AI Engine</h4>
                      <p className="text-gray-400 text-xs mt-1">We have integrated Google's ultra-fast Gemini API. Paste your key below to unlock the AI Studio.</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-1 block">AI Provider Engine</label>
                    <select disabled className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 md:p-3.5 text-xs md:text-sm text-fuchsia-400 font-bold outline-none cursor-not-allowed">
                      <option>Google Gemini 2.5 Flash (Ultra Fast)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-1 block">Max Output Tokens</label>
                    <input type="number" name="ai_max_tokens" value={settings.ai_max_tokens} onChange={handleChange} className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 md:p-3.5 text-white font-mono text-base md:text-sm outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] md:text-xs text-gray-400 font-bold mb-1 block">Paste Your Gemini API Key Here</label>
                  <div className="relative">
                    <input type={showPassword['ai_key'] ? 'text' : 'password'} name="ai_api_key" value={settings.ai_api_key} onChange={handleChange} placeholder="AIzaSy..." className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 md:p-3.5 text-white font-mono text-base md:text-sm outline-none focus:border-blue-500 pr-12" />
                    <button onClick={() => toggleVisibility('ai_key')} className="absolute right-3 md:right-4 top-3 md:top-3.5 text-gray-400 hover:text-white">
                      {showPassword['ai_key'] ? '👁️' : '🙈'}
                    </button>
                  </div>
                  {settings.ai_api_key && settings.ai_api_key.startsWith('AIza') && (
                     <p className="text-green-400 text-xs mt-2 font-bold flex items-center gap-1"><span>✅</span> Valid Gemini Key format detected.</p>
                  )}
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
