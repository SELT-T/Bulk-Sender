import React from 'react';

const Topbar = ({ user, onProfileClick }) => {
  return (
    <div className="h-16 bg-[#111827]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-10">
      
      {/* Search Bar (Design Only) */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input 
            type="text" 
            placeholder="Search campaigns, contacts..." 
            className="w-full bg-[#1f2937] text-gray-300 text-sm rounded-full py-2 pl-10 pr-4 border border-transparent focus:border-fuchsia-500 focus:bg-[#374151] outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <button className="relative text-gray-400 hover:text-white transition-colors">
          🔔
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile Dropdown Trigger */}
        <div 
          onClick={onProfileClick} 
          className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all border border-transparent hover:border-white/10"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-fuchsia-500/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-white leading-none mb-1">
              {user?.name || 'Admin User'}
            </p>
            <p className="text-xs text-gray-500 leading-none">
              {user?.role || 'Super Admin'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
