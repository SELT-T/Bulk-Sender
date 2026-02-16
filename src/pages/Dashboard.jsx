import React from 'react';
import StylishCard from '../components/StylishCard';

// setActivePage prop ko receive kar rahe hain
const Dashboard = ({ setActivePage }) => {
  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Welcome back, Admin 👋</h2>
          <p className="text-gray-300 text-sm mt-1">Here is what's happening with your campaigns today.</p>
        </div>
        {/* Yahan onClick function laga diya hai jo seedha bulk sender page khol dega */}
        <button 
          onClick={() => setActivePage('campaign')} 
          className="bg-brand hover:bg-fuchsia-400 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-lg shadow-fuchsia-500/30"
        >
          + New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StylishCard title="Total Sent" value="1,24,500" icon="📤" gradient="bg-gradient-to-br from-fuchsia-600 to-pink-600" />
        <StylishCard title="Active API" value="Online" icon="🟢" gradient="bg-gradient-to-br from-emerald-500 to-teal-500" />
        <StylishCard title="Pending Messages" value="3,420" icon="⏳" gradient="bg-gradient-to-br from-orange-500 to-amber-500" />
        <StylishCard title="API Credits" value="Unlimited" icon="💎" gradient="bg-gradient-to-br from-rose-500 to-red-500" />
      </div>

      <div className="mt-8 bg-black/20 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Campaign Activity</h3>
        <p className="text-gray-400 text-sm">No campaigns running currently. Start a new bulk send to see data here.</p>
      </div>
    </div>
  );
};

export default Dashboard;