import React, { useState } from 'react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('api');

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-white mb-6">System Configurations</h2>
      
      <div className="flex-1 flex gap-6">
        {/* Settings Sidebar Menu */}
        <div className="w-64 bg-[#1e293b]/50 border border-white/5 rounded-2xl p-4 backdrop-blur-sm h-fit">
          <ul className="space-y-2">
            <li><button onClick={() => setActiveTab('api')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'api' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' : 'text-gray-400 hover:bg-white/5'}`}>🔌 API & Connections</button></li>
            <li><button onClick={() => setActiveTab('sticker')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'sticker' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' : 'text-gray-400 hover:bg-white/5'}`}>🪄 Sticker Auto-Config</button></li>
            <li><button onClick={() => setActiveTab('billing')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'billing' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' : 'text-gray-400 hover:bg-white/5'}`}>💳 UPI & Billing</button></li>
            <li><button onClick={() => setActiveTab('general')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'general' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' : 'text-gray-400 hover:bg-white/5'}`}>⚙️ General Sub-Settings</button></li>
          </ul>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-[#1e293b]/80 border border-white/5 rounded-2xl p-8 shadow-2xl overflow-y-auto">
          
          {/* API Setup */}
          {activeTab === 'api' && (
             <div className="animate-fade-in-up">
               <h3 className="text-xl font-bold text-white mb-2">WhatsApp API Configuration</h3>
               <p className="text-sm text-gray-400 mb-6">No Web Scan required. Connect directly via Official API.</p>
               
               <div className="space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number ID</label>
                     <input type="text" placeholder="e.g. 10456789..." className="w-full bg-[#0f172a] border border-gray-700 rounded-lg p-3 text-white focus:border-fuchsia-500 outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Business Account ID</label>
                     <input type="text" placeholder="e.g. 1023456..." className="w-full bg-[#0f172a] border border-gray-700 rounded-lg p-3 text-white focus:border-fuchsia-500 outline-none" />
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Permanent Access Token (API Key)</label>
                   <input type="password" placeholder="EAAG..." className="w-full bg-[#0f172a] border border-gray-700 rounded-lg p-3 text-white focus:border-fuchsia-500 outline-none" />
                 </div>
                 
                 <div className="pt-4 border-t border-gray-700">
                    <h4 className="text-sm font-bold text-white mb-3">Webhook Sub-Settings</h4>
                    <input type="text" placeholder="https://your-server.com/webhook" className="w-full bg-[#0f172a] border border-gray-700 rounded-lg p-3 text-white focus:border-fuchsia-500 outline-none mb-2" />
                    <label className="flex items-center gap-2 text-sm text-gray-400">
                      <input type="checkbox" className="accent-fuchsia-500" /> Auto-verify webhook token
                    </label>
                 </div>
                 
                 <button className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg hover:shadow-fuchsia-500/30 transition-all">Save & Test Connection</button>
               </div>
             </div>
          )}

          {/* Sticker Personalization Sub-Settings */}
          {activeTab === 'sticker' && (
             <div className="animate-fade-in-up">
               <h3 className="text-xl font-bold text-white mb-2">AI Sticker Mapping (Nimantran)</h3>
               <p className="text-sm text-gray-400 mb-6">Configure where and how the personalized {"{{Name}}"} will be printed on your images.</p>
               
               <div className="space-y-6">
                 <div className="bg-[#0f172a] p-5 rounded-xl border border-gray-700 flex gap-6">
                    <div className="w-1/3">
                      <div className="w-full h-40 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500 bg-black/20">
                         Base Image Preview
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="block text-xs text-gray-400 mb-1">X-Coordinate (Left/Right)</label>
                           <input type="number" placeholder="450" className="w-full bg-[#1e293b] border border-gray-700 rounded p-2 text-white" />
                         </div>
                         <div>
                           <label className="block text-xs text-gray-400 mb-1">Y-Coordinate (Top/Bottom)</label>
                           <input type="number" placeholder="800" className="w-full bg-[#1e293b] border border-gray-700 rounded p-2 text-white" />
                         </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                           <input type="number" placeholder="42" className="w-full bg-[#1e293b] border border-gray-700 rounded p-2 text-white" />
                         </div>
                         <div>
                           <label className="block text-xs text-gray-400 mb-1">Font Color (Hex)</label>
                           <input type="text" placeholder="#FFFFFF" className="w-full bg-[#1e293b] border border-gray-700 rounded p-2 text-white border-l-8 border-l-white" />
                         </div>
                       </div>
                    </div>
                 </div>
                 <button className="bg-fuchsia-600 text-white px-6 py-2.5 rounded-lg font-bold">Save Sticker Logic</button>
               </div>
             </div>
          )}

          {/* UPI Billing */}
          {activeTab === 'billing' && (
             <div className="animate-fade-in-up">
               <h3 className="text-xl font-bold text-white mb-2">UPI Setup</h3>
               <p className="text-sm text-gray-400 mb-6">Set up your UPI to automatically attach payment links in bulk messages.</p>
               
               <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Merchant UPI ID</label>
                   <input type="text" placeholder="yourbusiness@sbi" className="w-full bg-[#0f172a] border border-gray-700 rounded-lg p-3 text-white focus:border-fuchsia-500 outline-none" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payee Name</label>
                   <input type="text" placeholder="Reachify Pro Services" className="w-full bg-[#0f172a] border border-gray-700 rounded-lg p-3 text-white focus:border-fuchsia-500 outline-none" />
                 </div>
                 <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold">Connect UPI</button>
               </div>
             </div>
          )}

          {/* General Settings */}
          {activeTab === 'general' && (
             <div className="animate-fade-in-up">
               <h3 className="text-xl font-bold text-white mb-2">General System Configurations</h3>
               <p className="text-sm text-gray-400 mb-6">Manage app behavior and background processes.</p>
               
               <div className="space-y-4">
                 <div className="flex items-center justify-between bg-[#0f172a] p-4 rounded-lg border border-gray-700">
                    <div>
                      <h4 className="text-white font-medium">Silent Background Mode</h4>
                      <p className="text-xs text-gray-400">Run sending processes without interrupting other work.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-fuchsia-500" />
                 </div>
                 <div className="flex items-center justify-between bg-[#0f172a] p-4 rounded-lg border border-gray-700">
                    <div>
                      <h4 className="text-white font-medium">Auto-Start on Boot</h4>
                      <p className="text-xs text-gray-400">Launch Reachify Pro API server automatically.</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 accent-fuchsia-500" />
                 </div>
               </div>
             </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default Settings;