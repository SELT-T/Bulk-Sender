import React from 'react';
import StylishCard from '../components/StylishCard';

const Dashboard = ({ setActivePage }) => {
  // Real App starts with 0. Backend se data aane par ye badlenge.
  const stats = {
    totalSent: 0,
    activeApiStatus: "Standby", // 'Online' tab hoga jab API connect hogi
    pending: 0,
    credits: "Check API" // 'Unlimited' likhna fake ho sakta hai agar API free wali ho
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-gray-400 text-sm mt-1">Monitor your real-time campaign performance here.</p>
        </div>
        <button 
          onClick={() => setActivePage('campaign')} 
          className="bg-brand hover:bg-fuchsia-400 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-lg shadow-fuchsia-500/30 flex items-center gap-2"
        >
          <span>➕</span> New Campaign
        </button>
      </div>

      {/* Real Stats Grid (Starts at 0) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StylishCard 
          title="Total Messages Sent" 
          value={stats.totalSent} 
          icon="📤" 
          gradient="bg-gradient-to-br from-fuchsia-600 to-pink-600" 
        />
        <StylishCard 
          title="API Connection" 
          value={stats.activeApiStatus} 
          icon="🔗" 
          gradient="bg-gradient-to-br from-emerald-500 to-teal-500" 
        />
        <StylishCard 
          title="Pending Queue" 
          value={stats.pending} 
          icon="⏳" 
          gradient="bg-gradient-to-br from-orange-500 to-amber-500" 
        />
        <StylishCard 
          title="Meta API Credits" 
          value={stats.credits} 
          icon="💎" 
          gradient="bg-gradient-to-br from-rose-500 to-red-500" 
        />
      </div>

      {/* Recent Activity - Empty State (No Fake Rows) */}
      <div className="mt-8 bg-[#1e293b]/50 border border-white/5 rounded-2xl p-8 backdrop-blur-sm min-h-[300px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-3xl mb-4">
          📊
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Campaigns Yet</h3>
        <p className="text-gray-400 text-sm max-w-md mb-6">
          Your dashboard is clean. Start your first WhatsApp marketing campaign to see live analytics and reports here.
        </p>
        <button 
           onClick={() => setActivePage('campaign')}
           className="text-brand font-medium hover:text-white transition-colors border-b border-brand pb-0.5 hover:border-white"
        >
          Start First Campaign &rarr;
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
