import React, { useState, useEffect } from 'react';

const Dashboard = ({ setActivePage }) => {
  const [userName, setUserName] = useState('Admin');
  
  // 🚀 STRICTLY REAL STATES
  const [apiHealth, setApiHealth] = useState({ wa: false, social: false, maps: false, ai: false });
  const [stats, setStats] = useState({ sent: 0, failed: 0, pending: 0, credits: 0, leads: 0 });
  const [recentActivities, setRecentActivities] = useState([]); 
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0]); 
  
  const [isLoading, setIsLoading] = useState(true);

  // Load Real User & Local Settings Status
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('reachify_user'));
    if (user && user.name) setUserName(user.name);

    const savedSettings = JSON.parse(localStorage.getItem('reachify_api_settings')) || {};
    setApiHealth({
      wa: !!savedSettings.wa_access_token || savedSettings.wa_connection_mode === 'web',
      social: !!(savedSettings.fb_app_id || savedSettings.ig_access_token),
      maps: !!savedSettings.gmaps_api_key,
      ai: !!savedSettings.ai_api_key
    });
    
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  const activeApisCount = Object.values(apiHealth).filter(Boolean).length;

  return (
    <div className="flex flex-col h-auto min-h-screen lg:min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] max-w-[1400px] mx-auto p-2 lg:p-4 animate-fade-in overflow-y-auto custom-scrollbar pb-24 lg:pb-0">
      
      {/* 🌟 HEADER GREETING (Mobile me wrap ho jayega) */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide">
            Welcome back, <span className="bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent break-all">{userName}</span> 👋
          </h1>
          <p className="text-gray-400 text-xs md:text-sm mt-1">Monitor your real-time campaign performance here.</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
           <button onClick={() => setActivePage('campaign')} className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 text-white px-3 md:px-5 py-2 rounded-xl text-xs md:text-sm font-bold border border-white/10 transition-all text-center">
             View Reports
           </button>
           <button onClick={() => setActivePage('campaign')} className="flex-1 md:flex-none bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:scale-105 text-white px-3 md:px-5 py-2 rounded-xl text-xs md:text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-1 md:gap-2">
             <span>+</span> New Campaign
           </button>
        </div>
      </div>

      {/* 🌟 TOP STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6">
        
        <div className="bg-gradient-to-br from-fuchsia-900/50 to-purple-900/50 p-4 md:p-5 rounded-2xl border border-fuchsia-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 md:p-3 opacity-20 text-4xl md:text-6xl">💬</div>
          <h3 className="text-fuchsia-300 font-bold text-[10px] md:text-xs uppercase tracking-wider mb-1">Messages Sent</h3>
          <p className="text-xl md:text-3xl font-black text-white">{isLoading ? '...' : stats.sent}</p>
          <p className="text-[8px] md:text-[10px] text-gray-400 mt-1 md:mt-2 font-bold">Awaiting campaigns</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 p-4 md:p-5 rounded-2xl border border-emerald-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 md:p-3 opacity-20 text-4xl md:text-6xl">🔌</div>
          <h3 className="text-emerald-300 font-bold text-[10px] md:text-xs uppercase tracking-wider mb-1">Active APIs</h3>
          <p className="text-xl md:text-3xl font-black text-white">{isLoading ? '...' : `${activeApisCount} / 4`}</p>
          <p className="text-[8px] md:text-[10px] text-emerald-400 mt-1 md:mt-2 font-bold">System Status</p>
        </div>

        <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 p-4 md:p-5 rounded-2xl border border-blue-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 md:p-3 opacity-20 text-4xl md:text-6xl">👥</div>
          <h3 className="text-blue-300 font-bold text-[10px] md:text-xs uppercase tracking-wider mb-1">Leads Extracted</h3>
          <p className="text-xl md:text-3xl font-black text-white">{isLoading ? '...' : stats.leads}</p>
          <p className="text-[8px] md:text-[10px] text-gray-400 mt-1 md:mt-2 font-bold">Via Google Maps & Groups</p>
        </div>

        <div className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 p-4 md:p-5 rounded-2xl border border-amber-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 md:p-3 opacity-20 text-4xl md:text-6xl">🧠</div>
          <h3 className="text-amber-300 font-bold text-[10px] md:text-xs uppercase tracking-wider mb-1">AI Tokens</h3>
          <p className="text-xl md:text-3xl font-black text-white">{isLoading ? '...' : stats.credits}</p>
          <p className="text-[8px] md:text-[10px] text-gray-400 mt-1 md:mt-2 font-bold">Refills on 1st of month</p>
        </div>

      </div>

      {/* 🌟 MIDDLE SECTION: CHARTS & HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Analytics Chart */}
        <div className="lg:col-span-2 bg-[#1e293b] p-4 md:p-5 rounded-2xl border border-gray-700 shadow-xl flex flex-col">
           <h3 className="text-white font-bold text-xs md:text-sm mb-6 flex justify-between items-center">
             <span>📈 Weekly Campaign Performance</span>
             <span className="text-[9px] md:text-[10px] bg-[#0f172a] border border-gray-600 px-2 py-1 rounded text-gray-400">Last 7 Days</span>
           </h3>
           {/* Chart container with horizontal scroll for very small devices if needed */}
           <div className="flex-1 flex items-end justify-between gap-1 md:gap-2 h-40 mt-auto border-b border-gray-700 pb-2 relative overflow-x-auto overflow-y-hidden custom-scrollbar">
              <div className="absolute top-0 w-full border-t border-gray-700/50 border-dashed h-0 min-w-[250px]"></div>
              <div className="absolute top-1/2 w-full border-t border-gray-700/50 border-dashed h-0 min-w-[250px]"></div>
              
              {chartData.map((val, i) => (
                <div key={i} className="w-full min-w-[20px] max-w-[40px] flex flex-col items-center gap-2 group z-10">
                   <div className="w-full bg-gradient-to-t from-gray-700 to-gray-600 rounded-t-sm transition-all relative" style={{ height: `${val > 0 ? val : 2}%` }}>
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] text-white opacity-0 group-hover:opacity-100 bg-black px-1.5 rounded">{val}</span>
                   </div>
                   <span className="text-[8px] md:text-[10px] text-gray-500 font-bold">Day {i+1}</span>
                </div>
              ))}
           </div>
           {Math.max(...chartData) === 0 && (
             <p className="text-center text-[9px] md:text-[10px] text-gray-500 mt-2">No activity recorded in the last 7 days.</p>
           )}
        </div>

        {/* API Health Monitor */}
        <div className="bg-[#1e293b] p-4 md:p-5 rounded-2xl border border-gray-700 shadow-xl flex flex-col">
           <h3 className="text-white font-bold text-xs md:text-sm mb-4 flex justify-between items-center">
             <span>🩺 API Health Monitor</span>
             <button onClick={() => setActivePage('settings')} className="text-fuchsia-400 text-[10px] md:text-xs hover:underline">Configure</button>
           </h3>
           <div className="flex-1 space-y-2 md:space-y-3">
              
              <div className="flex items-center justify-between bg-[#0f172a] p-2 md:p-3 rounded-xl border border-gray-700">
                 <div className="flex items-center gap-2 md:gap-3">
                   <span className="text-lg md:text-xl">💬</span>
                   <div>
                     <p className="text-[10px] md:text-xs font-bold text-white">WhatsApp Gateway</p>
                     <p className="text-[8px] md:text-[9px] text-gray-500">Bulk & Image Sender</p>
                   </div>
                 </div>
                 {apiHealth.wa ? <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold border border-green-500/30">Online</span> : <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold border border-red-500/30">Offline</span>}
              </div>

              <div className="flex items-center justify-between bg-[#0f172a] p-2 md:p-3 rounded-xl border border-gray-700">
                 <div className="flex items-center gap-2 md:gap-3">
                   <span className="text-lg md:text-xl">🌐</span>
                   <div>
                     <p className="text-[10px] md:text-xs font-bold text-white">Social Graph APIs</p>
                     <p className="text-[8px] md:text-[9px] text-gray-500">Auto-Post & Birthdays</p>
                   </div>
                 </div>
                 {apiHealth.social ? <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold border border-green-500/30">Online</span> : <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold border border-red-500/30">Offline</span>}
              </div>

              <div className="flex items-center justify-between bg-[#0f172a] p-2 md:p-3 rounded-xl border border-gray-700">
                 <div className="flex items-center gap-2 md:gap-3">
                   <span className="text-lg md:text-xl">🧲</span>
                   <div>
                     <p className="text-[10px] md:text-xs font-bold text-white">Google Places API</p>
                     <p className="text-[8px] md:text-[9px] text-gray-500">Map Lead Scraper</p>
                   </div>
                 </div>
                 {apiHealth.maps ? <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold border border-green-500/30">Online</span> : <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold border border-red-500/30">Offline</span>}
              </div>

              <div className="flex items-center justify-between bg-[#0f172a] p-2 md:p-3 rounded-xl border border-gray-700">
                 <div className="flex items-center gap-2 md:gap-3">
                   <span className="text-lg md:text-xl">🤖</span>
                   <div>
                     <p className="text-[10px] md:text-xs font-bold text-white">AI Neural Engine</p>
                     <p className="text-[8px] md:text-[9px] text-gray-500">OpenAI / Gemini</p>
                   </div>
                 </div>
                 {apiHealth.ai ? <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold border border-green-500/30">Online</span> : <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold border border-red-500/30">Offline</span>}
              </div>

           </div>
        </div>
      </div>

      {/* 🌟 BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Tools Navigation */}
        <div className="bg-[#1e293b] p-4 md:p-5 rounded-2xl border border-gray-700 shadow-xl">
           <h3 className="text-white font-bold text-xs md:text-sm mb-4">⚡ Quick Jump Tools</h3>
           <div className="grid grid-cols-2 gap-2 md:gap-3">
              <button onClick={() => setActivePage('personalized')} className="bg-[#0f172a] hover:bg-fuchsia-600/20 hover:border-fuchsia-500 border border-gray-700 p-2 md:p-3 rounded-xl text-left transition-all group">
                 <span className="text-xl md:text-2xl mb-1 block">🎨</span>
                 <p className="text-white text-[10px] md:text-xs font-bold">Pro Studio</p>
                 <p className="text-[8px] md:text-[9px] text-gray-500 group-hover:text-fuchsia-300">Custom Image Blast</p>
              </button>
              <button onClick={() => setActivePage('gmap-scraper')} className="bg-[#0f172a] hover:bg-blue-600/20 hover:border-blue-500 border border-gray-700 p-2 md:p-3 rounded-xl text-left transition-all group">
                 <span className="text-xl md:text-2xl mb-1 block">📍</span>
                 <p className="text-white text-[10px] md:text-xs font-bold">Map Scraper</p>
                 <p className="text-[8px] md:text-[9px] text-gray-500 group-hover:text-blue-300">Extract B2B Leads</p>
              </button>
              <button onClick={() => setActivePage('ai-tools')} className="bg-[#0f172a] hover:bg-emerald-600/20 hover:border-emerald-500 border border-gray-700 p-2 md:p-3 rounded-xl text-left transition-all group">
                 <span className="text-xl md:text-2xl mb-1 block">🧠</span>
                 <p className="text-white text-[10px] md:text-xs font-bold">AI Hub</p>
                 <p className="text-[8px] md:text-[9px] text-gray-500 group-hover:text-emerald-300">Spintax & Captions</p>
              </button>
              <button onClick={() => setActivePage('social')} className="bg-[#0f172a] hover:bg-pink-600/20 hover:border-pink-500 border border-gray-700 p-2 md:p-3 rounded-xl text-left transition-all group">
                 <span className="text-xl md:text-2xl mb-1 block">🎂</span>
                 <p className="text-white text-[10px] md:text-xs font-bold">Auto-Pilot</p>
                 <p className="text-[8px] md:text-[9px] text-gray-500 group-hover:text-pink-300">Birthday Wishes</p>
              </button>
           </div>
        </div>

        {/* Activity Table */}
        <div className="lg:col-span-2 bg-[#1e293b] rounded-2xl border border-gray-700 shadow-xl flex flex-col overflow-hidden h-[300px] lg:h-auto">
           <div className="p-3 md:p-4 border-b border-gray-700 bg-[#0f172a] flex justify-between items-center">
             <h3 className="text-white font-bold text-xs md:text-sm">🕒 Recent Automations</h3>
           </div>
           <div className="flex-1 bg-[#0f172a]/30 overflow-x-auto overflow-y-auto custom-scrollbar flex flex-col p-2 md:p-4">
              <table className="w-full text-left text-[10px] md:text-xs whitespace-nowrap min-w-[400px]">
                <thead className="text-gray-500 border-b border-gray-800 uppercase tracking-wide">
                  <tr>
                    <th className="pb-2 md:pb-3 px-2 w-1/3">Task / Campaign</th>
                    <th className="pb-2 md:pb-3 px-2 w-1/4">Module</th>
                    <th className="pb-2 md:pb-3 px-2 w-1/4">Date & Time</th>
                    <th className="pb-2 md:pb-3 px-2 text-right w-1/6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((act, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="p-2 md:p-3 px-2 font-bold text-gray-200">{act.name}</td>
                        <td className="p-2 md:p-3 px-2 text-fuchsia-400">{act.module}</td>
                        <td className="p-2 md:p-3 px-2 text-gray-500">{act.date}</td>
                        <td className="p-2 md:p-3 px-2 text-right"><span className="bg-green-500/20 text-green-400 px-2 py-1 rounded font-bold">{act.status}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 md:py-10 text-center">
                         <div className="flex flex-col items-center justify-center opacity-50 text-gray-400">
                            <span className="text-2xl md:text-4xl mb-2 md:mb-3">📭</span>
                            <p className="font-bold text-xs md:text-sm">No recent activity found.</p>
                            <p className="text-[8px] md:text-[10px] mt-1">Start your first campaign or extraction to see logs here.</p>
                         </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
