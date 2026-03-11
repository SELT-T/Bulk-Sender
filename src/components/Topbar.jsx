import React, { useState, useRef, useEffect } from 'react';

const Topbar = ({ user, setActivePage, onLogout, toggleSidebar }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  
  // 🟢 REAL NOTIFICATION STATES
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const API_URL = "https://reachify-api.selt-3232.workers.dev"; // Tumhara backend

  // 🟢 REAL DATABASE SE NOTIFICATIONS (LOGS) FETCH KARNA
  useEffect(() => {
    const fetchRealNotifications = async () => {
      if (!user?.email) return;
      setIsLoadingNotifs(true);
      try {
        const res = await fetch(`${API_URL}/dashboard-stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        });
        const data = await res.json();
        
        if (data.recent) {
          setNotifications(data.recent);
          // Agar nayi notifications hain, toh unread counter set karo
          setUnreadCount(data.recent.length > 0 ? data.recent.length : 0);
        }
      } catch (err) {
        console.error("Failed to fetch notifications");
      }
      setIsLoadingNotifs(false);
    };

    fetchRealNotifications();
    // Har 30 second me naye notifications check karega
    const interval = setInterval(fetchRealNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside close logic
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileMenu(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotifClick = () => {
    setShowNotifMenu(!showNotifMenu);
    if (!showNotifMenu) {
        setUnreadCount(0); // Notification kholte hi unread count zero ho jayega (Mark as read)
    }
  };

  // Helper for Profile Initials
  const getInitials = (name) => {
      if (!name) return 'U';
      return name.charAt(0).toUpperCase();
  };

  return (
    <div className="h-16 bg-[#111827]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shadow-sm">
      
      <div className="flex items-center gap-4 flex-1">
        <button 
           onClick={toggleSidebar}
           className="lg:hidden text-gray-400 hover:text-white p-2 -ml-2 rounded-lg focus:outline-none focus:bg-gray-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>

        <div className="relative w-96 hidden lg:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input 
            type="text" 
            placeholder="Search campaigns, contacts..." 
            className="w-full bg-[#1f2937] text-gray-300 text-sm rounded-full py-2 pl-10 pr-4 border border-transparent focus:border-fuchsia-500 focus:bg-[#374151] outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        
        {/* 🔔 REAL Notification Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={handleNotifClick}
            className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
          >
            🔔
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 border-2 border-[#111827] rounded-full flex items-center justify-center text-[8px] text-white font-bold animate-pulse">
                </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-[-40px] md:right-0 mt-3 w-72 md:w-80 bg-[#1e293b] border border-gray-700 rounded-xl shadow-2xl py-2 animate-fade-in-up origin-top-right">
              <div className="px-4 py-2 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-white font-semibold text-sm">Recent Activity</h3>
                <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded">Live Server</span>
              </div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {isLoadingNotifs ? (
                    <div className="px-4 py-4 text-center text-gray-500 text-xs">Loading logs...</div>
                ) : notifications.length === 0 ? (
                    <div className="px-4 py-4 text-center text-gray-500 text-xs">No recent activity found.</div>
                ) : (
                    notifications.map((notif, idx) => (
                        <div key={idx} className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-gray-700/50">
                            <p className="text-sm text-gray-200 flex items-start gap-2">
                                {notif.status === 'Success' ? '✅' : '⚠️'}
                                <span className="flex-1 leading-tight">{notif.action}</span>
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1.5 ml-6">
                                {new Date(notif.created_at).toLocaleString()}
                            </p>
                        </div>
                    ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-gray-700 text-center">
                <button onClick={() => setUnreadCount(0)} className="text-xs text-fuchsia-400 hover:text-fuchsia-300">Mark all as read</button>
              </div>
            </div>
          )}
        </div>

        {/* 👤 REAL Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)} 
            className="flex items-center gap-2 md:gap-3 cursor-pointer hover:bg-white/5 p-1 md:p-1.5 rounded-lg transition-all border border-transparent hover:border-white/10"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg uppercase">
              {getInitials(user?.name)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-white leading-none mb-1 capitalize">
                {user?.name || 'User'}
              </p>
              <p className={`text-[10px] leading-none font-bold uppercase tracking-wider ${user?.role === 'admin' ? 'text-fuchsia-400' : 'text-gray-400'}`}>
                {user?.role || 'User'} ▼
              </p>
            </div>
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-[#1e293b] border border-gray-700 rounded-xl shadow-2xl py-1 animate-fade-in-up origin-top-right">
              
              <div className="px-4 py-3 border-b border-gray-700 mb-1 bg-black/20">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Logged in as</p>
                <p className="text-sm text-white font-bold truncate">{user?.name}</p>
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

              {/* Sirf Admin ko dikhega Panel ka shortcut yahan se bhi */}
              {user?.role === 'admin' && (
                  <button 
                    onClick={() => { setActivePage('admin-panel'); setShowProfileMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-amber-400 hover:bg-amber-500/10 transition-all flex items-center gap-2 font-medium"
                  >
                    👑 Admin Dashboard
                  </button>
              )}

              <div className="h-px bg-gray-700 my-1"></div>

              <button 
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2"
              >
                🚪 Secure Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Topbar;
