import React, { useState } from 'react';

const BrandLogo = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5C21 16.75 16.75 21 11.5 21C9.64 21 7.9 20.47 6.42 19.57L3 20.5L3.93 17.08C3.03 15.6 2.5 13.86 2.5 12C2.5 6.75 6.75 2.5 12 2.5C17.25 2.5 21 6.75 21 11.5Z" stroke="#d946ef" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="10" stroke="#a855f7" strokeWidth="0.5" strokeDasharray="2 2" className="animate-spin-slow" />
  </svg>
);

const Sidebar = ({ activePage, setActivePage }) => {
  const [openMenu, setOpenMenu] = useState('campaigns');

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? '' : menu);
  };

  return (
    <div className="w-72 h-full bg-[#111827]/90 backdrop-blur-md border-r border-white/5 flex flex-col shadow-2xl z-20">
      
      <div className="p-6 flex items-center gap-3 border-b border-white/5">
        <BrandLogo />
        <h1 className="text-2xl font-black bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent tracking-wide">
          Reachify Pro
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        <nav className="space-y-2 px-4">
          
          <button 
            onClick={() => setActivePage('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePage === 'dashboard' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <span className="text-xl">📊</span> <span className="font-medium">Dashboard Overview</span>
          </button>

          <div className="pt-4">
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Core Features</p>
            
            <div>
              <button 
                onClick={() => toggleMenu('campaigns')}
                className="w-full flex items-center justify-between px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <div className="flex items-center gap-3"><span className="text-lg">🚀</span> <span className="font-medium">Campaigns</span></div>
                <span className="text-xs">{openMenu === 'campaigns' ? '▼' : '▶'}</span>
              </button>
              
              {openMenu === 'campaigns' && (
                <div className="ml-9 mt-1 space-y-1 border-l border-gray-700/50 pl-3">
                  <button onClick={() => setActivePage('campaign')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activePage === 'campaign' ? 'text-fuchsia-400 font-bold' : 'text-gray-400 hover:text-white'}`}>
                    Bulk Sender (Excel/CSV)
                  </button>
                  <button onClick={() => setActivePage('grouptools')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activePage === 'grouptools' ? 'text-fuchsia-400 font-bold' : 'text-gray-400 hover:text-white'}`}>
                    Send to Groups
                  </button>
                  <button onClick={() => setActivePage('personalized')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activePage === 'personalized' ? 'text-fuchsia-400 font-bold' : 'text-gray-400 hover:text-white'}`}>
                    Personalized Image Sender
                  </button>
                </div>
              )}
            </div>

            <div className="mt-1">
              <button 
                onClick={() => toggleMenu('extractors')}
                className="w-full flex items-center justify-between px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <div className="flex items-center gap-3"><span className="text-lg">🧲</span> <span className="font-medium">Data Extractors</span></div>
                <span className="text-xs">{openMenu === 'extractors' ? '▼' : '▶'}</span>
              </button>
              
              {openMenu === 'extractors' && (
                <div className="ml-9 mt-1 space-y-1 border-l border-gray-700/50 pl-3">
                  <button onClick={() => setActivePage('grouptools')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activePage === 'grouptools' ? 'text-fuchsia-400 font-bold' : 'text-gray-400 hover:text-white'}`}>
                    Group Contact Extractor
                  </button>
                  {/* ✅ THE FIX: Yahan 'gmap-scraper' page ka link daal diya gaya hai */}
                  <button onClick={() => setActivePage('gmap-scraper')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activePage === 'gmap-scraper' ? 'text-fuchsia-400 font-bold' : 'text-gray-400 hover:text-white'}`}>
                    Google Map Lead Scraper
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4">
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Automation</p>
            
            <button 
              onClick={() => setActivePage('ai-tools')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePage === 'ai-tools' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <span className="text-xl">🤖</span> <span className="font-medium">AI Tools & Spinners</span>
            </button>

            <button 
              onClick={() => setActivePage('social')}
              className={`w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePage === 'social' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <span className="text-xl">🌐</span> <span className="font-medium">Social Connections</span>
            </button>
          </div>

          <div className="pt-6">
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">System Config</p>
            
            <button 
              onClick={() => setActivePage('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePage === 'settings' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <span className="text-xl">⚙️</span> <span className="font-medium">Advanced Settings</span>
            </button>
          </div>

        </nav>
      </div>

      <div className="p-5 border-t border-white/5 bg-[#0f172a]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
            <span className="text-xs font-semibold text-gray-400">API Server Ready</span>
          </div>
          <span className="text-[10px] text-gray-500 border border-gray-600 px-2 py-0.5 rounded">v2.0 Pro</span>
        </div>
      </div>
      
    </div>
  );
};

export default Sidebar;
