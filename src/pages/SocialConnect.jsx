import React, { useState } from 'react';

const SocialConnect = () => {
  // === CORE STATES ===
  const [activeTab, setActiveTab] = useState('publisher'); // 'publisher', 'birthdays', 'connections'
  
  // === PLATFORM CONNECTIONS ===
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
  const [selectedPlatforms, setSelectedPlatforms] = useState(['fb', 'ig']);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // === BIRTHDAY AUTO-PILOT STATES ===
  const [autoWishEnabled, setAutoWishEnabled] = useState(false);
  const [wishTemplate, setWishTemplate] = useState("Happy Birthday {{Name}}! 🎉 Wishing you a fantastic year ahead from the Reachify Pro team! 🎂");
  const [birthdays, setBirthdays] = useState([
    { id: 1, name: 'Rahul Sharma', platform: 'fb', icon: '📘', date: 'Today', status: 'Pending' },
    { id: 2, name: 'Priya Patel', platform: 'ig', icon: '📸', date: 'Today', status: 'Pending' },
    { id: 3, name: 'Amit Singh', platform: 'li', icon: '💼', date: 'Tomorrow', status: 'Scheduled' },
    { id: 4, name: 'Neha Gupta', platform: 'fb', icon: '📘', date: 'Tomorrow', status: 'Scheduled' },
    { id: 5, name: 'Vikas Kumar', platform: 'x', icon: '𝕏', date: '21 Feb', status: 'Waiting' },
  ]);

  // --- HANDLERS ---

  // Fake OAuth Connection Simulator
  const handleConnectToggle = (platformId) => {
    const platform = platforms.find(p => p.id === platformId);
    if (platform.connected) {
      setPlatforms(platforms.map(p => p.id === platformId ? { ...p, connected: false } : p));
      return;
    }

    setIsConnecting(platformId);
    // Simulate API OAuth Handshake delay
    setTimeout(() => {
      setPlatforms(platforms.map(p => p.id === platformId ? { ...p, connected: true } : p));
      setIsConnecting(null);
      alert(`✅ Successfully authenticated and linked with ${platform.name}!`);
    }, 2000);
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

  const handlePublish = () => {
    if (selectedPlatforms.length === 0) return alert("❌ Select at least one platform to post!");
    if (!postContent && !postMedia) return alert("❌ Add text or media to publish!");
    
    // Check if selected platforms are actually connected
    const unconnected = selectedPlatforms.filter(id => !platforms.find(p => p.id === id).connected);
    if (unconnected.length > 0) {
       return alert("⚠️ Some selected platforms are not connected. Please connect them in the 'Connections' tab first.");
    }

    setIsPosting(true);
    setTimeout(() => {
      setIsPosting(false);
      if (scheduleDate && scheduleTime) {
        alert(`✅ Success! Post scheduled for ${scheduleDate} at ${scheduleTime} on ${selectedPlatforms.length} platforms.`);
      } else {
        alert(`🚀 Blast Successful! Post published instantly to ${selectedPlatforms.length} platforms.`);
      }
      setPostContent('');
      setPostMedia(null);
      setMediaPreview(null);
    }, 2500);
  };

  const handleSyncBirthdays = () => {
    alert("🔄 Syncing friends & followers from connected APIs... (This will pull real data once backend tokens are active).");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-[1400px] mx-auto p-2 animate-fade-in">
      
      {/* 🌟 HEADER & PLATFORM STRIP */}
      <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-xl mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
               🌐 Omnichannel Social Hub
            </h2>
            <p className="text-gray-400 text-xs mt-1">Manage, Schedule, and Automate all your social media presence from one dashboard.</p>
         </div>

         {/* Mini Connection Status Strip */}
         <div className="flex gap-2">
            {platforms.map(plat => (
               <div key={plat.id} onClick={() => setActiveTab('connections')} className={`w-10 h-10 rounded-full flex items-center justify-center text-lg cursor-pointer transition-all border-2 ${plat.connected ? `${plat.color} border-transparent shadow-[0_0_10px_rgba(255,255,255,0.2)]` : 'bg-[#0f172a] border-gray-600 grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`} title={plat.name}>
                  {plat.icon}
               </div>
            ))}
         </div>
      </div>

      {/* 🌟 NAVIGATION TABS */}
      <div className="flex bg-[#1e293b] p-1.5 rounded-xl border border-gray-700 shadow-md mb-4 w-fit">
         <button onClick={() => setActiveTab('publisher')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'publisher' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
            <span>📝</span> Universal Publisher
         </button>
         <button onClick={() => setActiveTab('birthdays')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'birthdays' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
            <span>🎂</span> Birthday Auto-Pilot
         </button>
         <button onClick={() => setActiveTab('connections')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'connections' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
            <span>🔌</span> API Connections
         </button>
      </div>

      {/* 🌟 MAIN CONTENT AREA */}
      <div className="flex-1 overflow-hidden">
        
        {/* ========================================== */}
        {/* TAB 1: API CONNECTIONS */}
        {/* ========================================== */}
        {activeTab === 'connections' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full overflow-y-auto pb-10 custom-scrollbar animate-fade-in-up">
            {platforms.map(plat => (
              <div key={plat.id} className="bg-[#1e293b] p-6 rounded-2xl border border-gray-700 shadow-xl flex flex-col items-center text-center h-fit relative overflow-hidden group">
                {plat.connected && <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/20 rounded-bl-full -mr-8 -mt-8"></div>}
                
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-lg ${plat.color} ${plat.text}`}>
                  {plat.icon}
                </div>
                <h3 className="text-white font-bold text-lg">{plat.name}</h3>
                <p className="text-xs text-gray-400 mt-2 mb-6 h-10">
                  {plat.connected ? `Successfully linked via Official API. Syncing active.` : `Click connect to authorize Reachify Pro to access your account.`}
                </p>
                
                <button 
                  onClick={() => handleConnectToggle(plat.id)}
                  disabled={isConnecting !== null && isConnecting !== plat.id}
                  className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    plat.connected 
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30' 
                      : isConnecting === plat.id 
                        ? 'bg-blue-600 text-white opacity-80 cursor-wait'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-gray-600'
                  }`}
                >
                  {isConnecting === plat.id ? <><span className="animate-spin">🔄</span> Connecting...</> : plat.connected ? 'Disconnect' : 'Connect API'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: UNIVERSAL PUBLISHER */}
        {/* ========================================== */}
        {activeTab === 'publisher' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden animate-fade-in">
            
            {/* Left: Composer */}
            <div className="lg:col-span-7 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar pb-10">
              
              {/* Select Platforms */}
              <div className="bg-[#1e293b] p-5 rounded-2xl border border-gray-700 shadow-md">
                 <h3 className="text-white font-bold text-sm mb-3">1. Select Destinations</h3>
                 <div className="flex gap-3">
                    {platforms.map(plat => (
                       <div 
                         key={plat.id} 
                         onClick={() => togglePlatformSelection(plat.id)}
                         className={`flex-1 p-3 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${selectedPlatforms.includes(plat.id) ? `${plat.color} border-transparent shadow-lg text-white` : 'bg-[#0f172a] border-gray-700 text-gray-500 hover:border-gray-500'}`}
                       >
                          <span className="text-2xl mb-1">{plat.icon}</span>
                          <span className="text-[10px] font-bold">{plat.name.split(' ')[0]}</span>
                          {!plat.connected && <span className="absolute top-1 right-1 text-[8px] bg-red-500 text-white px-1 rounded">Offline</span>}
                       </div>
                    ))}
                 </div>
              </div>

              {/* Content Box */}
              <div className="bg-[#1e293b] p-5 rounded-2xl border border-gray-700 shadow-md flex-1 flex flex-col">
                 <h3 className="text-white font-bold text-sm mb-3">2. Create Post</h3>
                 <textarea 
                   value={postContent}
                   onChange={(e) => setPostContent(e.target.value)}
                   placeholder="What do you want to share with your audience? Add hashtags for better reach..."
                   className="flex-1 w-full bg-[#0f172a] border border-gray-600 rounded-xl p-4 text-white text-sm outline-none focus:border-fuchsia-500 resize-none mb-4 custom-scrollbar"
                 ></textarea>
                 
                 <div className="flex items-center gap-4">
                    <div className="relative flex-1 cursor-pointer border border-dashed border-gray-600 rounded-xl p-3 text-center bg-[#0f172a] hover:border-fuchsia-500 transition-all">
                       <input type="file" accept="image/*, video/*" onChange={handleMediaUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                       <span className="text-gray-400 text-xs font-bold flex items-center justify-center gap-2">
                         <span className="text-lg">📎</span> {postMedia ? postMedia.name : "Attach Image or Video"}
                       </span>
                    </div>
                    {mediaPreview && (
                       <button onClick={() => {setPostMedia(null); setMediaPreview(null)}} className="bg-red-500/20 text-red-400 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                    )}
                 </div>
              </div>

              {/* Scheduling & Publish */}
              <div className="bg-[#1e293b] p-5 rounded-2xl border border-gray-700 shadow-md">
                 <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                       <label className="text-[10px] text-gray-400 font-bold mb-1 block">Schedule Date (Optional)</label>
                       <input type="date" value={scheduleDate} onChange={e=>setScheduleDate(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-2.5 text-xs text-white outline-none focus:border-fuchsia-500" />
                    </div>
                    <div className="flex-1 w-full">
                       <label className="text-[10px] text-gray-400 font-bold mb-1 block">Time (Optional)</label>
                       <input type="time" value={scheduleTime} onChange={e=>setScheduleTime(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-2.5 text-xs text-white outline-none focus:border-fuchsia-500" />
                    </div>
                    <button 
                      onClick={handlePublish}
                      disabled={isPosting}
                      className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                      {isPosting ? '⏳ Processing...' : (scheduleDate ? '🕒 Schedule Post' : '🚀 Post Now')}
                    </button>
                 </div>
              </div>

            </div>

            {/* Right: Live Preview */}
            <div className="lg:col-span-5 bg-[#0f172a] rounded-2xl border border-gray-700 shadow-inner flex flex-col relative overflow-hidden">
               <div className="absolute top-4 left-4 z-10 bg-black/80 px-3 py-1 rounded-full text-[10px] text-white border border-gray-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Post Preview
               </div>
               
               <div className="flex-1 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
                  <div className="w-full max-w-[340px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
                     {/* Preview Header */}
                     <div className="p-3 flex items-center gap-2 border-b">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-500 to-purple-600"></div>
                        <div className="flex flex-col">
                           <span className="text-black font-bold text-xs leading-tight">Reachify Pro</span>
                           <span className="text-gray-500 text-[9px]">Just now • 🌍</span>
                        </div>
                     </div>
                     {/* Preview Content */}
                     <div className="p-3 text-black text-xs whitespace-pre-wrap break-words">
                        {postContent || "Your post text will appear here..."}
                     </div>
                     {/* Preview Media */}
                     {mediaPreview ? (
                        <img src={mediaPreview} alt="Post" className="w-full h-auto max-h-48 object-cover border-y" />
                     ) : (
                        <div className="w-full h-32 bg-gray-100 border-y flex items-center justify-center text-gray-400 text-xs">No media attached</div>
                     )}
                     {/* Preview Footer */}
                     <div className="p-3 flex justify-between text-gray-500 text-[10px]">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden animate-fade-in">
             
             {/* Left: Setup & Engine */}
             <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar pb-10">
                
                <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-700 shadow-md">
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white font-bold text-lg">Auto-Pilot Engine</h3>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={autoWishEnabled} onChange={e=>setAutoWishEnabled(e.target.checked)} className="sr-only peer"/>
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fuchsia-600"></div>
                      </label>
                   </div>
                   <p className="text-xs text-gray-400 mb-6">When enabled, the system will automatically scan your connected social accounts daily and send personalized wishes directly to their inbox or timeline.</p>
                   
                   <h4 className="text-white font-bold text-xs mb-2">Message Template</h4>
                   <p className="text-[10px] text-gray-500 mb-2">Use <code className="bg-black px-1 rounded text-fuchsia-400">{"{{Name}}"}</code> to insert the person's name.</p>
                   <textarea 
                     value={wishTemplate}
                     onChange={e=>setWishTemplate(e.target.value)}
                     className="w-full h-32 bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white text-sm outline-none focus:border-fuchsia-500 resize-none mb-4 custom-scrollbar"
                   ></textarea>

                   <button onClick={handleSyncBirthdays} className="w-full bg-[#0f172a] hover:bg-white/5 border border-gray-600 text-white py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2">
                     <span>🔄</span> Force Sync APIs Now
                   </button>
                </div>
             </div>

             {/* Right: Birthday Tracker List */}
             <div className="lg:col-span-7 bg-[#1e293b] rounded-2xl border border-gray-700 shadow-md flex flex-col overflow-hidden">
                <div className="p-5 border-b border-gray-700 bg-[#0f172a] flex justify-between items-center">
                  <div>
                     <h3 className="text-white font-bold">Upcoming Birthdays</h3>
                     <p className="text-[10px] text-gray-400">Extracted from Facebook & LinkedIn APIs</p>
                  </div>
                  <span className="bg-fuchsia-600/20 text-fuchsia-400 px-3 py-1 rounded-full text-xs font-bold border border-fuchsia-500/30">
                     Total Found: {birthdays.length}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#0f172a]/30">
                   <table className="w-full text-left">
                     <thead className="text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-800">
                       <tr>
                         <th className="pb-3 pl-2">Person</th>
                         <th className="pb-3 text-center">Source</th>
                         <th className="pb-3">Date</th>
                         <th className="pb-3 text-right pr-2">Action / Status</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-800">
                       {birthdays.map((bday) => (
                         <tr key={bday.id} className="hover:bg-white/5 transition-colors">
                           <td className="py-3 pl-2">
                              <div className="font-bold text-gray-200 text-sm">{bday.name}</div>
                           </td>
                           <td className="py-3 text-center text-xl" title={bday.platform}>
                              {bday.icon}
                           </td>
                           <td className="py-3 text-fuchsia-400 font-bold text-xs">
                              {bday.date}
                           </td>
                           <td className="py-3 text-right pr-2">
                              {bday.status === 'Pending' ? (
                                 <button onClick={() => alert(`Sending wish to ${bday.name}...`)} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-3 py-1.5 rounded text-xs font-bold shadow transition-all">Send Now</button>
                              ) : (
                                 <span className="text-gray-500 text-xs italic">{bday.status}</span>
                              )}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
             </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default SocialConnect;
