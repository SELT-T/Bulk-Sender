import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({}); 

  // === WHATSAPP WEB SPECIFIC STATES ===
  const [waConnectionType, setWaConnectionType] = useState('api'); 
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [webStatus, setWebStatus] = useState('disconnected'); // disconnected, generating, scanning, authenticating, connected
  const [liveLog, setLiveLog] = useState('Engine is offline. Click Show QR to start.');

  // === GLOBAL SETTINGS STATE ===
  const [settings, setSettings] = useState({
    fullName: 'Demo Admin',
    email: 'demo@reachify.com',
    phone: '',
    companyName: '',
    upi_id: '',
    gst_number: '',
    billing_email: '',
    timezone: 'Asia/Kolkata',
    date_format: 'DD/MM/YYYY',
    app_language: 'en',
    theme: 'dark',
    compact_mode: false,
    notify_email_campaigns: true,
    notify_wa_alerts: false,
    notify_system_updates: true,
    wa_connection_mode: 'api',
    wa_provider: 'evolution',
    wa_instance_id: '',
    wa_access_token: '',
    anti_ban_min_delay: 5,
    anti_ban_max_delay: 15,
    anti_ban_typing_status: true,
    fb_app_id: '',
    fb_app_secret: '',
    ig_access_token: '',
    x_api_key: '',
    x_api_secret: '',
    li_client_id: '',
    li_client_secret: '',
    gmaps_api_key: '',
    ai_provider: 'openai',
    ai_api_key: '',
    ai_max_tokens: '2000'
  });

  const API_URL = "https://reachify-api.selt-3232.workers.dev";
  const WA_ENGINE_URL = "https://reachify-wa-engine.onrender.com"; 

  // 1. LOAD SETTINGS
  useEffect(() => {
    const savedSettings = localStorage.getItem('reachify_api_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(prev => ({ ...prev, ...parsed }));
      if(parsed.wa_connection_mode) setWaConnectionType(parsed.wa_connection_mode);
    }
  }, []);

  // 2. 🔄 SUPER ADVANCED AUTO-POLLING (Live Feedback System)
  useEffect(() => {
    let interval;
    
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${WA_ENGINE_URL}/api/wa-status`);
        const data = await res.json();
        
        if (data.status === 'connected') {
           setWebStatus('connected');
           setQrCodeData(null);
           setLiveLog('✅ Device linked securely. Engine is ready for bulk campaigns.');
        } 
        else if (data.status === 'scanning') {
           if (data.qr) {
              setWebStatus('scanning');
              setQrCodeData(data.qr);
              setLiveLog('⏳ Waiting for you to scan the QR code from your phone...');
           } else {
              // Agar backend scanning bol raha hai par QR nahi hai, matlab usne scan kar liya hai aur sync ho raha hai
              setWebStatus('authenticating');
              setQrCodeData(null);
              setLiveLog('🔄 Scan successful! Syncing chats and authenticating with Meta. Please wait...');
           }
        }
        else {
           setWebStatus('disconnected');
           setQrCodeData(null);
           setLiveLog('❌ Engine disconnected. Click to generate new QR.');
        }
      } catch(err) { 
        setLiveLog('⚠️ Render Server is sleeping or offline. Requesting wake up...'); 
      }
    };

    // Initial Check
    if (waConnectionType === 'web' && webStatus === 'disconnected') {
       fetchStatus();
    }

    // Continuous Live Tracking (Har 2.5 seconds mein check karega)
    if (webStatus === 'scanning' || webStatus === 'authenticating' || webStatus === 'generating') {
      interval = setInterval(() => {
         fetchStatus();
      }, 2500);
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

  const handleSave = async () => {
    setIsSaving(true);
    localStorage.setItem('reachify_api_settings', JSON.stringify(settings));
    try {
      await fetch(`${API_URL}/update-settings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings)
      });
      setTimeout(() => { setIsSaving(false); alert("✅ Settings Saved Successfully!"); }, 800);
    } catch (error) {
      setTimeout(() => { setIsSaving(false); alert("✅ Settings Saved Locally!"); }, 800);
    }
  };

  // 🚀 GENERATE REAL QR
  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    setWebStatus('generating');
    setLiveLog('⏳ Booting up headless Chrome on Render server. This takes 10-20 seconds...');
    setQrCodeData(null);

    try {
      const res = await fetch(`${WA_ENGINE_URL}/api/wa-status`);
      const data = await res.json();

      if (data.status === 'connected') {
        setWebStatus('connected');
        setLiveLog('✅ Already connected.');
      } else if (data.status === 'scanning' && data.qr) {
        setQrCodeData(data.qr);
        setWebStatus('scanning');
        setLiveLog('🟢 Engine ready. Scan the QR code.');
      } else {
        setLiveLog('⏳ Engine starting. Please wait and click generate again in 10 seconds.');
        setWebStatus('disconnected');
      }
    } catch (err) {
      setLiveLog('⚠️ Server waking up. Please wait 30 sec and try again.');
      setWebStatus('disconnected');
    }
    setIsGeneratingQR(false);
  };

  // 🔴 REAL LOGOUT
  const disconnectWeb = async () => {
    if(window.confirm("Are you sure you want to unlink your WhatsApp device?")) {
        setLiveLog('🔌 Disconnecting from Meta servers...');
        try {
           await fetch(`${WA_ENGINE_URL}/api/wa-logout`, { method: 'POST' });
           setWebStatus('disconnected');
           setQrCodeData(null);
           setLiveLog('❌ Disconnected successfully.');
        } catch (err) {
           alert("Failed to disconnect from server.");
           setLiveLog('⚠️ Failed to disconnect. Engine might be busy.');
        }
    }
  };

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
        
        {/* LEFT SIDEBAR */}
        <div className="w-[280px] flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-10">
          {menuCategories.map(category => (
            <div key={category}>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2 border-b border-gray-700/50 pb-1">{category}</p>
              <div className="space-y-1.5">
                {menuItems.filter(item => item.category === category).map(item => (
                  <button
                    key={item.id} onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                      activeTab === item.id ? 'bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/30' : 'text-gray-400 hover:text-white hover:bg-[#1e293b] border border-transparent'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span> {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 bg-[#1e293b] rounded-2xl border border-gray-700 shadow-xl flex flex-col overflow-hidden relative">
          
          <div className="p-5 border-b border-gray-700 bg-[#0f172a] flex justify-between items-center z-10 shadow-sm">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {menuItems.find(m => m.id === activeTab)?.icon} {menuItems.find(m => m.id === activeTab)?.label}
            </h3>
            <button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:scale-105 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
              {isSaving ? <><span className="animate-spin">⏳</span> Saving...</> : '💾 Save Changes'}
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#1e293b] to-[#0f172a]">
            
            {/* ... [Profile, Billing, General, Display, Notifications TABS ARE OMITTED FOR BREVITY, THEY REMAIN EXACTLY THE SAME] ... */}
            
            {/* ========================================= */}
            {/* 6. WHATSAPP CONNECTION (SUPER ADVANCED) */}
            {/* ========================================= */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-6 animate-fade-in max-w-3xl">
                
                <div className="bg-[#0f172a] p-1.5 rounded-xl border border-gray-700 flex w-full">
                   <button onClick={() => handleModeChange('api')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${waConnectionType === 'api' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>☁️ Official Cloud API (Tokens)</button>
                   <button onClick={() => handleModeChange('web')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${waConnectionType === 'web' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>📱 WhatsApp Web (QR Scanner)</button>
                </div>

                {waConnectionType === 'api' && (
                   <div className="space-y-6 animate-fade-in-up">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0f172a] p-6 rounded-xl border border-gray-700">
                       {/* API Fields Here */}
                       <div>
                         <label className="text-xs text-gray-400 font-bold mb-1 block">Gateway Provider</label>
                         <select name="wa_provider" value={settings.wa_provider} onChange={handleChange} className="w-full bg-[#1e293b] border border-gray-600 rounded-xl p-3.5 text-sm text-white outline-none focus:border-emerald-500">
                           <option value="evolution">Evolution API (Node)</option>
                           <option value="wapi">WAPI Gateway</option>
                           <option value="meta">Meta Cloud API (Official)</option>
                         </select>
                       </div>
                       <div>
                         <label className="text-xs text-gray-400 font-bold mb-1 block">Instance / Phone ID</label>
                         <input type="text" name="wa_instance_id" value={settings.wa_instance_id} onChange={handleChange} className="w-full bg-[#1e293b] border border-gray-600 rounded-xl p-3.5 text-white font-mono text-sm outline-none focus:border-emerald-500" />
                       </div>
                       <div className="col-span-1 md:col-span-2">
                         <label className="text-xs text-gray-400 font-bold mb-1 block">Secure Access Token</label>
                         <input type={showPassword['wa_token'] ? 'text' : 'password'} name="wa_access_token" value={settings.wa_access_token} onChange={handleChange} className="w-full bg-[#1e293b] border border-gray-600 rounded-xl p-3.5 text-white font-mono text-sm outline-none focus:border-emerald-500" />
                       </div>
                     </div>
                   </div>
                )}

                {waConnectionType === 'web' && (
                   <div className="space-y-6 animate-fade-in-up">
                     
                     {/* 🌟 LIVE STATUS TERMINAL 🌟 */}
                     <div className="bg-black border border-gray-700 rounded-xl p-4 shadow-inner font-mono">
                        <div className="flex items-center gap-2 mb-2 border-b border-gray-800 pb-2">
                           <div className="flex gap-1.5">
                              <span className="w-3 h-3 rounded-full bg-red-500"></span>
                              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                              <span className="w-3 h-3 rounded-full bg-green-500"></span>
                           </div>
                           <span className="text-gray-500 text-[10px] ml-2 tracking-widest uppercase">Engine Status Log</span>
                        </div>
                        <div className="text-emerald-400 text-xs tracking-wide">
                           > {liveLog}
                        </div>
                     </div>

                     <div className="bg-[#0f172a] p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1">
                           <h3 className="text-white font-bold text-lg mb-2">Device Linking (Advanced)</h3>
                           <p className="text-gray-400 text-xs mb-4">Link your standard WhatsApp securely. The engine automatically updates the status here.</p>
                           
                           {webStatus !== 'connected' && (
                             <ul className="text-xs text-gray-300 space-y-2 mb-6">
                                <li>1. Open WhatsApp on your phone</li>
                                <li>2. Tap Menu (⋮) or Settings</li>
                                <li>3. Select <strong>Linked Devices</strong></li>
                                <li>4. Tap on <strong>Link a Device</strong> and point your camera at the QR code.</li>
                             </ul>
                           )}

                           {/* ONLY SHOW GENERATE IF COMPLETELY DISCONNECTED */}
                           {(webStatus === 'disconnected' || webStatus === 'generating') && (
                             <button onClick={generateQRCode} disabled={isGeneratingQR || webStatus === 'generating'} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2">
                                {isGeneratingQR || webStatus === 'generating' ? <><span className="animate-spin">⏳</span> Booting Engine...</> : '📱 Show Real QR Code'}
                             </button>
                           )}
                           
                           {/* ONLY SHOW DISCONNECT IF CONNECTED */}
                           {webStatus === 'connected' && (
                             <div className="mt-4">
                               <button onClick={disconnectWeb} className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-6 py-2.5 rounded-lg font-bold border border-red-500/50 transition-all flex items-center gap-2">
                                  <span>🔌</span> Disconnect WhatsApp
                               </button>
                             </div>
                           )}
                        </div>

                        {/* 🌟 WHATSAPP DASHBOARD / QR AREA 🌟 */}
                        <div className="w-64 h-64 bg-[#111b21] rounded-xl border-4 border-gray-600 flex items-center justify-center p-2 relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                           
                           {(webStatus === 'disconnected' || webStatus === 'generating') && !qrCodeData && (
                              <div className="text-center">
                                 {webStatus === 'generating' ? (
                                    <div className="flex flex-col items-center">
                                      <div className="w-8 h-8 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin mb-3"></div>
                                      <span className="text-[#00a884] text-xs font-bold animate-pulse">Requesting Chrome...</span>
                                    </div>
                                 ) : (
                                    <>
                                       <span className="text-4xl block mb-2 opacity-50">📱</span>
                                       <span className="text-gray-400 text-xs font-bold px-4">Click "Show" to load Engine</span>
                                    </>
                                 )}
                              </div>
                           )}

                           {/* QR CODE VISIBLE */}
                           {qrCodeData && webStatus === 'scanning' && (
                              <div className="w-full h-full p-2 bg-white rounded-lg flex flex-col relative">
                                <img src={qrCodeData} alt="WhatsApp QR" className="w-full h-full object-contain" />
                                <div className="absolute inset-0 bg-[#00a884]/10 animate-pulse pointer-events-none rounded-lg"></div>
                              </div>
                           )}

                           {/* AUTHENTICATING SPINNER (QR is gone, but not yet ready) */}
                           {webStatus === 'authenticating' && (
                              <div className="flex flex-col items-center justify-center w-full h-full">
                                 <div className="w-12 h-12 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin mb-3"></div>
                                 <h4 className="text-white font-bold text-sm">Authenticating...</h4>
                                 <p className="text-[#8696a0] text-[10px] text-center mt-1 px-2">Syncing chats from your phone.</p>
                              </div>
                           )}

                           {/* CONNECTED DASHBOARD */}
                           {webStatus === 'connected' && (
                              <div className="flex flex-col items-center justify-center w-full h-full">
                                 <div className="w-16 h-16 bg-[#00a884] rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(0,168,132,0.4)]">
                                    <span className="text-3xl text-white">✅</span>
                                 </div>
                                 <h4 className="text-white font-bold text-[15px]">WhatsApp Active</h4>
                                 <p className="text-[#8696a0] text-[10px] text-center mt-1 mb-4 px-2">Ready to send bulk campaigns.</p>
                                 
                                 <div className="w-[90%] bg-[#202c33] rounded-lg p-2.5 text-[10px] text-[#8696a0] flex flex-col gap-1.5 border border-gray-700/50">
                                    <div className="flex justify-between border-b border-gray-700 pb-1">
                                       <span>Engine:</span> <span className="text-[#00a884] font-bold animate-pulse">Online 🟢</span>
                                    </div>
                                    <div className="flex justify-between">
                                       <span>Anti-Ban:</span> <span className="text-emerald-400">Active 🛡️</span>
                                    </div>
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>

                     <div className="bg-[#0f172a] p-6 rounded-xl border border-gray-700">
                        <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">🛡️ Anti-Ban Protocol</h3>
                        <p className="text-gray-400 text-xs mb-6">Control sending speed to mimic human behavior and avoid Meta bans.</p>

                        <div className="grid grid-cols-2 gap-6">
                           <div>
                              <label className="text-xs text-gray-400 font-bold mb-1 flex justify-between">Min Delay <span>{settings.anti_ban_min_delay} sec</span></label>
                              <input type="range" name="anti_ban_min_delay" min="1" max="10" value={settings.anti_ban_min_delay} onChange={handleChange} className="w-full accent-emerald-500" />
                           </div>
                           <div>
                              <label className="text-xs text-gray-400 font-bold mb-1 flex justify-between">Max Delay <span>{settings.anti_ban_max_delay} sec</span></label>
                              <input type="range" name="anti_ban_max_delay" min="10" max="60" value={settings.anti_ban_max_delay} onChange={handleChange} className="w-full accent-emerald-500" />
                           </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-700">
                           <ToggleSwitch name="anti_ban_typing_status" checked={settings.anti_ban_typing_status} label="Simulate 'Typing...' Status" desc="Show typing indicator to the receiver before sending the message." />
                        </div>
                     </div>
                   </div>
                )}
              </div>
            )}
            {/* OTHER TABS CODE OMITTED AS IT IS UNCHANGED */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
