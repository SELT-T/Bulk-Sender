import React from 'react';

const Topbar = () => {
  return (
    <div className="h-16 bg-[#111827]/60 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search campaigns, contacts..." 
            className="bg-[#1e293b] border border-gray-700 text-sm rounded-full pl-10 pr-4 py-2 text-gray-200 focus:outline-none focus:border-brand w-64 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white transition-all">🔔</button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg cursor-pointer">
          A
        </div>
      </div>
    </div>
  );
};

export default Topbar;