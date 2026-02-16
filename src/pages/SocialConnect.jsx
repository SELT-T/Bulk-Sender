import React from 'react';

const SocialConnect = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Social Media Integrations</h2>
        <p className="text-gray-400 text-sm mt-1">Connect your accounts to fetch birthdays, leads, and automate cross-posting.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Instagram Card */}
        <div className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-gray-700 rounded-2xl p-6 relative overflow-hidden group hover:border-pink-500/50 transition-all">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 flex items-center justify-center text-white text-2xl mb-4 shadow-lg">
            📸
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Instagram</h3>
          <p className="text-sm text-gray-400 mb-4">Sync DMs and extract target audience from profiles.</p>
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="e.g. @koremobile.cg" 
              className="w-full bg-[#111827] border border-gray-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-pink-500"
            />
            <button className="w-full bg-white/10 hover:bg-pink-500/20 text-white font-medium py-2 rounded-lg border border-white/10 hover:border-pink-500/50 transition-all text-sm">
              Connect Account
            </button>
          </div>
        </div>

        {/* Facebook Card */}
        <div className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-gray-700 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl mb-4 shadow-lg">
            📘
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Facebook Pages</h3>
          <p className="text-sm text-gray-400 mb-4">Auto-reply to comments and fetch upcoming birthdays.</p>
          <button className="w-full mt-12 bg-white/10 hover:bg-blue-600/20 text-white font-medium py-2 rounded-lg border border-white/10 hover:border-blue-500/50 transition-all text-sm">
            Login with Facebook
          </button>
        </div>

        {/* Twitter Card */}
        <div className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-gray-700 rounded-2xl p-6 relative overflow-hidden group hover:border-sky-500/50 transition-all">
          <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center text-white text-2xl mb-4 shadow-lg">
            🐦
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Twitter / X</h3>
          <p className="text-sm text-gray-400 mb-4">Automate trend replies and DM marketing.</p>
          <button className="w-full mt-12 bg-white/10 hover:bg-sky-500/20 text-white font-medium py-2 rounded-lg border border-white/10 hover:border-sky-500/50 transition-all text-sm">
            Link Twitter API
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialConnect;