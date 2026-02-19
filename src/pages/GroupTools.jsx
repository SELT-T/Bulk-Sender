import React, { useState } from 'react';

const GroupTools = () => {
  const [tool, setTool] = useState('extract');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Group Automation Tools</h2>
        <div className="bg-[#1e293b] p-1 rounded-lg flex border border-gray-700">
          <button onClick={() => setTool('extract')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tool === 'extract' ? 'bg-fuchsia-600 text-white' : 'text-gray-400 hover:text-white'}`}>Extract Contacts</button>
          <button onClick={() => setTool('send')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tool === 'send' ? 'bg-fuchsia-600 text-white' : 'text-gray-400 hover:text-white'}`}>Send to Groups</button>
        </div>
      </div>

      <div className="bg-[#1e293b]/80 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        
        {/* Tool: Extract Contacts (Point 8) */}
        {tool === 'extract' && (
          <div className="animate-fade-in-up">
            <div className="mb-6 flex items-start gap-4">
              <div className="text-4xl">🧲</div>
              <div>
                <h3 className="text-lg font-bold text-white">Group Contact Extractor</h3>
                <p className="text-sm text-gray-400">Fetch all member phone numbers from any WhatsApp group using Group Invite Link or ID.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Group Invite Link / Group ID</label>
                <input type="text" placeholder="https://chat.whatsapp.com/..." className="w-full bg-[#0f172a] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-fuchsia-500 transition-all" />
              </div>
              <div className="flex gap-4">
                <button className="flex-1 py-3 rounded-xl bg-gray-700 text-white font-bold hover:bg-gray-600 transition-all border border-gray-600">Fetch Group Info</button>
                <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg hover:shadow-emerald-500/30 transition-all">Download Contacts (CSV)</button>
              </div>
            </div>
          </div>
        )}

        {/* Tool: Send to Groups (Point 7) */}
        {tool === 'send' && (
          <div className="animate-fade-in-up">
             <div className="mb-6 flex items-start gap-4">
              <div className="text-4xl">📣</div>
              <div>
                <h3 className="text-lg font-bold text-white">Bulk Group Sender</h3>
                <p className="text-sm text-gray-400">Broadcast your message to multiple groups at once automatically.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload Group IDs List (.csv)</label>
                <input type="file" className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-fuchsia-500/20 file:text-fuchsia-400 cursor-pointer w-full bg-[#0f172a] p-2 rounded-xl border border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message Content</label>
                <textarea rows="3" placeholder="Write your announcement..." className="w-full bg-[#0f172a] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-fuchsia-500 transition-all resize-none"></textarea>
              </div>
              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-fuchsia-500/30 transition-all">Start Sending to Groups</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GroupTools;
