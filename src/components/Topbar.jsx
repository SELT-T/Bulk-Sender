import React, { useState, useRef, useEffect } from 'react';

const Topbar = ({ user, setActivePage, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  
  // Click outside hone par menu band karne ke liye
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-16 bg-[#111827]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-50">
      
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96 hidden md:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input 
            type="text" 
            placeholder="Search campaigns, contacts..." 
            className="w-full bg-[#1f2937] text-gray-300 text-sm rounded-full py-2 pl-10 pr-4 border border-transparent focus:border-fuchsia-500 focus:bg-[#374151] outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        {/* 🔔 Notification Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
          >
            🔔
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-[#111827] rounded-full"></span>
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-3 w-80 bg-[#1e293b] border border-gray-700 rounded-xl shadow-2xl py-2 animate-fade-in-up origin-top-right">
              <div className="px-4 py-2 border-b border-gray-700">
                <h3 className="text-white font-semibold text-sm">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-gray-700/50">
                  <p className="text-sm text-gray-200">🚀 Campaign "Diwali Offer" completed.</p>
                  <p className="text-xs text-gray-500 mt-1">2 mins ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-gray-700/50">
                  <p className="text-sm text-gray-200">✅ Database Connected Successfully.</p>
                  <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-white/5 cursor-pointer">
                  <p className="text-sm text-gray-200">⚠️ New login detected from Chrome.</p>
                  <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                </div>
              </div>
              <div className="px-4 py-2 border-t border-gray-700 text-center">
                <button className="text-xs text-fuchsia-400 hover:text-fuchsia-300">Mark all as read</button>
              </div>
            </div>
          )}
        </div>

        {/* 👤 Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)} 
            className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1.5 rounded-lg transition-all border border-transparent hover:border-white/10"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white leading-none mb-1">
                {user?.name || 'Admin'}
              </p>
              <p className="text-[10px] text-gray-400 leading-none">
                {user?.role || 'Super Admin'} ▼
              </p>
            </div>
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-[#1e293b] border border-gray-700 rounded-xl shadow-2xl py-1 animate-fade-in-up origin-top-right">
              
              {/* Menu Items */}
              <div className="px-4 py-3 border-b border-gray-700 mb-1">
                <p className="text-sm text-white font-medium">Signed in as</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>

              <button 
                onClick={() => { setActivePage('profile'); setShowProfileMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-fuchsia-600/20 hover:text-fuchsia-400 transition-all flex items-center gap-2"
              >
                👤 Edit Profile
              </button>
              
              <button 
                onClick={() => { setActivePage('settings'); setShowProfileMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-fuchsia-600/20 hover:text-fuchsia-400 transition-all flex items-center gap-2"
              >
                ⚙️ Account Settings
              </button>
              
              <button 
                 className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-fuchsia-600/20 hover:text-fuchsia-400 transition-all flex items-center gap-2"
              >
                💳 Billing & Plans
              </button>

              <div className="h-px bg-gray-700 my-1"></div>

              <button 
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Topbar;
