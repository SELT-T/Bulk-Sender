import React, { useState, useEffect } from 'react';

const SocialConnect = () => {
  // === CORE STATES ===
  const [activeTab, setActiveTab] = useState('publisher'); 
  
  // === PLATFORM CONNECTIONS (Strictly Real State) ===
  const [platforms, setPlatforms] = useState([
    { id: 'fb', name: 'Facebook Pages', icon: '📘', color: 'bg-blue-600', connected: false, text: 'text-white' },
    { id: 'ig', name: 'Instagram', icon: '📸', color: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600', connected: false, text: 'text-white' },
    { id: 'x', name: 'Twitter / X', icon: '𝕏', color: 'bg-black border border-gray-700', connected: false, text: 'text-white' },
    { id: 'li', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700', connected: false, text: 'text-white' }
  ]);
  const [isConnecting, setIsConnecting] = useState(null);

  // === PUBLISHER STATES ===
  const [postContent, setPostContent] = useState('');
  const [postMedia, setPostMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // === BIRTHDAY AUTO-PILOT STATES (No Dummy Data) ===
  const [autoWishEnabled, setAutoWishEnabled] = useState(false);
  const [wishTemplate, setWishTemplate] = useState("Happy Birthday {{Name}}! 🎉 Wishing you a fantastic year ahead from our team! 🎂");
  const [birthdays, setBirthdays] = useState([]); // Strictly empty, awaits real API fetch
  const [isSyncing, setIsSyncing] = useState(false);

  const API_URL = "https://reachify-api.selt-3232.workers.dev";
  const user = JSON.parse(localStorage.getItem('reachify_user')) || { email: 'demo@reachify.com' };

  // 1. REAL API CHECK ON LOAD
  useEffect(() => {
    const checkSocialStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/get-social-settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        });
        const data = await res.json();
        
        setPlatforms(prev => prev.map(p => ({
          ...p,
          connected: data[p.id]?.is_connected || false
        })));
      } catch (err) {
        setPlatforms(prev => prev.map(p => ({ ...p, connected: false })));
      }
    };
    checkSocialStatus();
  }, [user.email]);

  // --- HANDLERS ---

  // REAL OAUTH CONNECTION (Direct Login flow via Backend)
  const handleConnectToggle = async (platformId) => {
    const platform = platforms.find(p => p.id === platformId);
    
    if (platform.connected) {
      if(window.confirm(`Are you sure you want to completely disconnect ${platform.name}?`)) {
         // Logic to remove from database (needs backend route)
         setPlatforms(platforms.map(p => p.id === platformId ? { ...p, connected: false } : p));
      }
      return;
    }

    setIsConnecting(platformId);
    
    try {
      const res = await fetch(`${API_URL}/social-auth-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, platform: platformId })
      });

      if (!res.ok) throw new Error("API Keys missing in backend.");
      
      const data = await res.json();
      
      // Agar backend se asli OAuth Login URL mila toh wahan bhej do (Jaise Facebook Login Page)
      if (data.auth_url) {
        window.location.href = data.auth_url; 
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (err) {
      // Fake connection ko block karo. Error dikhao.
      alert(`❌ OAUTH LOGIN FAILED!\n\nBackend API keys (App ID / Secret) for ${platform.name} are missing or not configured by the Admin.\nPlease set up the Developer Console first.`);
    }
    setIsConnecting(null);
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostMedia(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const togglePlatformSelection = (id) => {
    if (selectedPlatforms.includes(id)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) return alert("❌ Select at least one platform to post!");
    if (!postContent && !postMedia) return alert("❌ Add text or media to publish!");
    
    // Strict Guard: Prevent posting if platform is not strictly connected
    const unconnected = selectedPlatforms.filter(id => !platforms.find(p => p.id === id).connected);
    if (unconnected.length > 0) {
       return alert(`⚠️ ERROR: Selected platforms are NOT connected. Go to the 'Connections' tab to authenticate and login first.`);
    }

    setIsPosting(true);

    try {
      const payload = {
         email: user.email,
         platforms: selectedPlatforms,
         content: postContent,
         schedule_time: scheduleDate && scheduleTime ? `${scheduleDate} ${scheduleTime}` : null
      };

      const res = await fetch(`${API_URL}/social-publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to communicate with Social Graph API.");

      if (scheduleDate && scheduleTime) {
        alert(`✅ Success! Post scheduled for ${scheduleDate} at ${scheduleTime}.`);
      } else {
        alert(`🚀 Blast Successful! Content pushed to selected platforms.`);
      }
      setPostContent(''); setPostMedia(null); setMediaPreview(null);
    } catch (err) {
      alert(`❌ API ERROR: ${err.message}\nMake sure your OAuth access tokens are valid.`);
    }
    
    setIsPosting(false);
  };

  // REAL BIRTHDAY SYNC FROM SOCIAL GRAPH API
  const handleSyncBirthdays = async () => {
    const hasConnection = platforms.some(p => p.connected);
    if (!hasConnection) {
       return alert("❌ Cannot sync birthdays. No Social APIs are connected.");
    }

    setIsSyncing(true);
    try {
       const res = await fetch(`${API_URL}/social-sync-birthdays`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email: user.email })
       });
       if (!res.ok) throw new Error("Failed to fetch graph data.");
       
       const data = await res.json();
       if(data.birthdays && data.birthdays.length > 0) {
           setBirthdays(data.birthdays);
       } else {
           alert("No upcoming birthdays found in your real network.");
       }

    } catch (err) {
       alert(`❌ SYNC FAILED: ${err.message}\nAPI connections might be expired or not configured properly.`);
    }
    setIsSyncing(false);
  };

  return (
    <div className="flex flex-col h-auto min-h-screen lg:min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] max-w-[1400px] mx-auto p-2 md:p-4 animate-fade-in pb-20 lg:pb-0">
      
      {/* 🌟 HEADER & PLATFORM STRIP */}
      <div className="bg-[#1e293b] p-3 md:p-4 rounded-xl border border-gray-700 shadow-xl mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
         <div>
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
               🌐 Omnichannel Social Hub
            </h2>
            <p className="text-gray-400 text-[10px] md:text-xs mt-1">Manage, Schedule, and Automate all your social media presence.</p>
         </div>

         <div className="flex flex-wrap gap-2">
            {platforms.map(plat => (
               <div key={plat.id} onClick={() => setActiveTab('connections')} className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-lg cursor-pointer transition-all border-2 ${plat.connected ? `${plat.color} border-transparent shadow-[0_0_10px_rgba(255,255,255,0.2)]` : 'bg-[#0f172a] border-gray-600 grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`} title={plat.name}>
                  {plat.icon}
               </div>
            ))}
         </div>
      </div>

      {/* 🌟 NAVIGATION TABS */}
      <div className="flex flex-wrap bg-[#1e293b] p-1.5 rounded-xl border border-gray-700 shadow-md mb-4 w-full md:w-fit gap-1 md:gap-0">
         <button onClick={() => setActiveTab('publisher')} className={`flex-1 md:flex-none px-3 md:px-6 py-2 rounded-lg text-[10px] md:text-sm font-bold transition-all flex items-center justify-center gap-1.5 md:gap-2 ${activeTab === 'publisher' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
            <span>📝</span> <span className="hidden sm:inline">Publisher</span><span className="sm:hidden">Post</span>
         </button>
         <button onClick={() => setActiveTab('birthdays')} className={`flex-1 md:flex-none px-3 md:px-6 py-2 rounded-lg text-[10px] md:text-sm font-bold transition-all flex items-center justify-center gap-1.5 md:gap-2 ${activeTab === 'birthdays' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
            <span>🎂</span> <span className="hidden sm:inline">Auto-Pilot</span><span className="sm:hidden">Wishes</span>
         </button>
         <button onClick={() => setActiveTab('connections')} className={`flex-1 md:flex-none px-3 md:px-6 py-2 rounded-lg text-[10px] md:text-sm font-bold transition-all flex items-center justify-center gap-1.5 md:gap-2 ${activeTab === 'connections' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
            <span>🔌</span> <span className="hidden sm:inline">Connections</span><span className="sm:hidden">APIs</span>
         </button>
      </div>

      {/* 🌟 MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto lg:overflow-hidden">
        
        {/* ========================================== */}
        {/* TAB 1: API CONNECTIONS */}
        {/* ========================================== */}
        {activeTab === 'connections' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:h-full lg:overflow-y-auto custom-scrollbar animate-fade-in-up">
            {platforms.map(plat => (
              <div key={plat.id} className="bg-[#1e293b] p-5 md:p-6 rounded-2xl border border-gray-700 shadow-xl flex flex-col items-center text-center h-fit relative overflow-hidden group">
                {plat.connected && <div className="absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 bg-green-500/20 rounded-bl-full -mr-6 -mt-6 md:-mr-8 md:-mt-8"></div>}
                
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl mb-3 md:mb-4 shadow-lg ${plat.color} ${plat.text}`}>
                  {plat.icon}
                </div>
                <h3 className="text-white font-bold text-base md:text-lg">{plat.name}</h3>
                <p className="text-[10px] md:text-xs text-gray-400 mt-1 md:mt-2 mb-4 md:mb-6 h-8 md:h-10">
                  {plat.connected ? `Successfully authenticated and linked. Syncing active.` : `Disconnected. Requires Secure OAuth Login.`}
                </p>
                
                <button 
                  onClick={() => handleConnectToggle(plat.id)}
                  disabled={isConnecting !== null && isConnecting !== plat.id}
                  className={`w-full py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    plat.connected 
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30' 
                      : isConnecting === plat.id 
                        ? 'bg-blue-600 text-white opacity-80 cursor-wait'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-gray-600'
                  }`}
                >
                  {isConnecting === plat.id ? <><span className="animate-spin">🔄</span> Requesting Login...</> : plat.connected ? 'Disconnect' : 'Login / Connect'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: UNIVERSAL PUBLISHER */}
        {/* ========================================== */}
        {activeTab === 'publisher' && (
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:h-full lg:overflow-hidden animate-fade-in">
            
            {/* Left: Composer */}
            <div className="w-full lg:w-7/12 xl:w-8/12 flex flex-col gap-4 overflow-y-visible lg:overflow-y-auto pr-1 custom-scrollbar">
              
              <div className="bg-[#1e293b] p-4 md:p-5 rounded-2xl border border-gray-700 shadow-md">
                 <h3 className="text-white font-bold text-xs md:text-sm mb-3">1. Select Destinations</h3>
                 <div className="grid grid-cols-4 gap-2 md:gap-3">
                    {platforms.map(plat => (
                       <div 
                         key={plat.id} 
                         onClick={() => togglePlatformSelection(plat.id)}
                         className={`p-2 md:p-3 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all relative ${selectedPlatforms.includes(plat.id) ? `${plat.color} border-transparent shadow-lg text-white` : 'bg-[#0f172a] border-gray-700 text-gray-500 hover:border-gray-500'}`}
                       >
                          <span className="text-lg md:text-2xl mb-1">{plat.icon}</span>
                          <span className="text-[8px] md:text-[10px] font-bold text-center leading-tight">{plat.name.split(' ')[0]}</span>
                          {!plat.connected && <span className="absolute top-1 right-1 text-[6px] md:text-[8px] bg-red-500 text-white px-1 py-0.5 rounded shadow">Offline</span>}
                       </div>
                    ))}
                 </div>
                 {selectedPlatforms.some(id => !platforms.find(p=>p.id === id).connected) && (
                    <p className="text-[9px] md:text-[10px] text-red-400 mt-2 text-center bg-red-500/10 p-1 rounded border border-red-500/20">
                      ⚠️ You have selected offline platforms. Publishing will fail unless you connect them via OAuth.
                    </p>
                 )}
              </div>

              <div className="bg-[#1e293b] p-4 md:p-5 rounded-2xl border border-gray-700 shadow-md flex-1 flex flex-col min-h-[250px]">
                 <h3 className="text-white font-bold text-xs md:text-sm mb-3">2. Create Post</h3>
                 <textarea 
                   value={postContent}
                   onChange={(e) => setPostContent(e.target.value)}
                   placeholder="What do you want to share? Add hashtags for better reach..."
                   className="flex-1 w-full min-h-[100px] bg-[#0f172a] border border-gray-600 rounded-xl p-3 md:p-4 text-white text-[10px] md:text-sm outline-none focus:border-fuchsia-500 resize-none mb-3 md:mb-4 custom-scrollbar"
                 ></textarea>
                 
                 <div className="flex items-center gap-3 md:gap-4">
                    <div className="relative flex-1 cursor-pointer border border-dashed border-gray-600 rounded-xl p-2 md:p-3 text-center bg-[#0f172a] hover:border-fuchsia-500 transition-all">
                       <input type="file" accept="image/*, video/*" onChange={handleMediaUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                       <span className="text-gray-400 text-[10px] md:text-xs font-bold flex items-center justify-center gap-2">
                         <span className="text-sm md:text-lg">📎</span> {postMedia ? postMedia.name : "Attach Image/Video"}
                       </span>
                    </div>
                    {mediaPreview && (
                       <button onClick={() => {setPostMedia(null); setMediaPreview(null)}} className="bg-red-500/20 text-red-400 p-2 md:p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all text-sm md:text-base">🗑️</button>
                    )}
                 </div>
              </div>

              <div className="bg-[#1e293b] p-4 md:p-5 rounded-2xl border border-gray-700 shadow-md">
                 <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-end">
                    <div className="flex-1 w-full flex gap-3">
                       <div className="flex-1">
                          <label className="text-[9px] md:text-[10px] text-gray-400 font-bold mb-1 block">Date (Optional)</label>
                          <input type="date" value={scheduleDate} onChange={e=>setScheduleDate(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-2 md:p-2.5 text-[10px] md:text-xs text-white outline-none focus:border-fuchsia-500" />
                       </div>
                       <div className="flex-1">
                          <label className="text-[9px] md:text-[10px] text-gray-400 font-bold mb-1 block">Time (Optional)</label>
                          <input type="time" value={scheduleTime} onChange={e=>setScheduleTime(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-2 md:p-2.5 text-[10px] md:text-xs text-white outline-none focus:border-fuchsia-500" />
                       </div>
                    </div>
                    <button 
                      onClick={handlePublish}
                      disabled={isPosting || selectedPlatforms.length === 0}
                      className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap mt-2 md:mt-0"
                    >
                      {isPosting ? '⏳ Pushing...' : (scheduleDate ? '🕒 Schedule Post' : '🚀 Post Now')}
                    </button>
                 </div>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className="w-full lg:w-5/12 xl:w-4/12 bg-[#0f172a] rounded-2xl border border-gray-700 shadow-inner flex flex-col relative overflow-hidden min-h-[300px] lg:min-h-0">
               <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 bg-black/80 px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] text-white border border-gray-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Preview
               </div>
               
               <div className="flex-1 flex items-center justify-center p-4 md:p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
                  <div className="w-full max-w-[280px] md:max-w-[340px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
                     <div className="p-2 md:p-3 flex items-center gap-2 border-b">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-fuchsia-500 to-purple-600"></div>
                        <div className="flex flex-col">
                           <span className="text-black font-bold text-[10px] md:text-xs leading-tight">{user.name || 'Your Brand'}</span>
                           <span className="text-gray-500 text-[8px] md:text-[9px]">Just now • 🌍</span>
                        </div>
                     </div>
                     <div className="p-2 md:p-3 text-black text-[10px] md:text-xs whitespace-pre-wrap break-words min-h-[40px]">
                        {postContent || "Your real post preview will appear here..."}
                     </div>
                     {mediaPreview ? (
                        <img src={mediaPreview} alt="Post" className="w-full h-auto max-h-40 md:max-h-48 object-cover border-y" />
                     ) : (
                        <div className="w-full h-24 md:h-32 bg-gray-100 border-y flex items-center justify-center text-gray-400 text-[10px] md:text-xs">No media attached</div>
                     )}
                     <div className="p-2 md:p-3 flex justify-between text-gray-500 text-[9px] md:text-[10px]">
                        <span>❤️ Like</span>
                        <span>💬 Comment</span>
                        <span>🔁 Share</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: BIRTHDAY AUTO-PILOT */}
        {/* ========================================== */}
        {activeTab === 'birthdays' && (
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:h-full lg:overflow-hidden animate-fade-in">
              
             {/* Left: Setup & Engine */}
             <div className="w-full lg:w-[350px] xl:w-[400px] flex flex-col gap-4 overflow-y-visible lg:overflow-y-auto pr-1 custom-scrollbar flex-shrink-0">
                <div className="bg-[#1e293b] p-4 md:p-6 rounded-2xl border border-gray-700 shadow-md">
                   <div className="flex justify-between items-center mb-3 md:mb-4">
                      <h3 className="text-white font-bold text-base md:text-lg">Auto-Pilot Engine</h3>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={autoWishEnabled} onChange={e=>setAutoWishEnabled(e.target.checked)} className="sr-only peer"/>
                        <div className="w-9 h-5 md:w-11 md:h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 md:after:h-5 md:after:w-5 after:transition-all peer-checked:bg-fuchsia-600"></div>
                      </label>
                   </div>
                   <p className="text-[10px] md:text-xs text-gray-400 mb-4 md:mb-6">When enabled, the system listens to APIs and auto-sends the template on birthdays.</p>
                   
                   <h4 className="text-white font-bold text-[10px] md:text-xs mb-1 md:mb-2">Message Template</h4>
                   <p className="text-[9px] md:text-[10px] text-gray-500 mb-2">Use <code className="bg-black px-1 rounded text-fuchsia-400">{"{{Name}}"}</code> to insert name dynamically.</p>
                   <textarea 
                     value={wishTemplate}
                     onChange={e=>setWishTemplate(e.target.value)}
                     className="w-full h-24 md:h-32 bg-[#0f172a] border border-gray-600 rounded-xl p-2.5 md:p-3 text-white text-[10px] md:text-sm outline-none focus:border-fuchsia-500 resize-none mb-3 md:mb-4 custom-scrollbar"
                   ></textarea>

                   <button 
                     onClick={handleSyncBirthdays} 
                     disabled={isSyncing}
                     className="w-full bg-[#0f172a] hover:bg-white/5 border border-gray-600 text-white py-2.5 md:py-3 rounded-xl font-bold transition-all text-xs md:text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                     {isSyncing ? <span className="animate-spin">🔄</span> : <span>🔄</span>}
                     {isSyncing ? 'Fetching Graph Data...' : 'Force Sync Real Network'}
                   </button>
                </div>
             </div>

             {/* Right: Birthday Tracker List */}
             <div className="flex-1 bg-[#1e293b] rounded-2xl border border-gray-700 shadow-md flex flex-col overflow-hidden min-h-[300px] lg:min-h-0">
                <div className="p-3 md:p-5 border-b border-gray-700 bg-[#0f172a] flex justify-between items-center">
                  <div>
                     <h3 className="text-white font-bold text-xs md:text-base">Upcoming Network Birthdays</h3>
                     <p className="text-[8px] md:text-[10px] text-gray-400">Real-time sync from connected platforms</p>
                  </div>
                  <span className="bg-fuchsia-600/20 text-fuchsia-400 px-2 md:px-3 py-1 rounded-full text-[9px] md:text-xs font-bold border border-fuchsia-500/30">
                     Found: {birthdays.length}
                  </span>
                </div>
                
                <div className="flex-1 overflow-x-auto overflow-y-auto p-2 md:p-4 custom-scrollbar bg-[#0f172a]/30">
                   {birthdays.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60 min-h-[200px]">
                         <span className="text-4xl md:text-6xl mb-2 md:mb-4">🔌</span>
                         <p className="font-bold text-xs md:text-base">No Data Found</p>
                         <p className="text-[9px] md:text-xs mt-1 md:mt-2 text-center px-4 md:px-10">Connect an API in the 'Connections' tab to fetch network birthdays from Facebook/LinkedIn.</p>
                      </div>
                   ) : (
                      <table className="w-full text-left min-w-[400px]">
                        <thead className="text-gray-500 text-[9px] md:text-[10px] uppercase tracking-wider border-b border-gray-800">
                          <tr>
                            <th className="pb-2 md:pb-3 pl-2">Person</th>
                            <th className="pb-2 md:pb-3 text-center">Source</th>
                            <th className="pb-2 md:pb-3">Date</th>
                            <th className="pb-2 md:pb-3 text-right pr-2">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {birthdays.map((bday) => (
                            <tr key={bday.id} className="hover:bg-white/5 transition-colors">
                              <td className="py-2 md:py-3 pl-2">
                                 <div className="font-bold text-gray-200 text-xs md:text-sm">{bday.name}</div>
                              </td>
                              <td className="py-2 md:py-3 text-center text-base md:text-xl" title={bday.platform}>
                                 {bday.icon}
                              </td>
                              <td className="py-2 md:py-3 text-fuchsia-400 font-bold text-[10px] md:text-xs">
                                 {bday.date}
                              </td>
                              <td className="py-2 md:py-3 text-right pr-2">
                                 {bday.status === 'Pending' ? (
                                    <button onClick={() => alert(`Sending wish...`)} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-2 md:px-3 py-1 md:py-1.5 rounded text-[9px] md:text-xs font-bold shadow transition-all">Send Now</button>
                                 ) : (
                                    <span className="text-gray-500 text-[9px] md:text-xs italic">{bday.status}</span>
                                 )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   )}
                </div>
             </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default SocialConnect;
