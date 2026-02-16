import React, { useState } from 'react';

const BulkSender = () => {
  const [useSticker, setUseSticker] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">🚀 Launch Bulk Campaign</h2>
      
      <div className="bg-[#1e293b]/80 border border-gray-700 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        
        {/* Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">1. Upload Contact List (Excel/CSV)</label>
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-brand transition-all cursor-pointer bg-[#0f172a]/50">
            <span className="text-3xl mb-2 block">📁</span>
            <p className="text-gray-400">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500 mt-1">Supported formats: .xlsx, .csv</p>
          </div>
        </div>

        {/* Message Box */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">2. Message (Use {'{{Name}}'} for personalization)</label>
          <textarea 
            rows="4" 
            placeholder="Hello {{Name}}, welcome to..." 
            className="w-full bg-[#0f172a] border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-brand transition-all resize-none"
          ></textarea>
        </div>

        {/* Attachments & Sticker AI */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="bg-[#0f172a] p-4 rounded-xl border border-gray-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">Attach Media</label>
            <input type="file" className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand/20 file:text-brand hover:file:bg-brand/30 cursor-pointer" multiple />
          </div>
          
          {/* Personalized Sticker Feature (Point 4) */}
          <div className="bg-gradient-to-r from-[#1e1b4b] to-[#312e81] p-4 rounded-xl border border-indigo-500/30 flex items-center justify-between shadow-inner">
            <div>
              <h4 className="text-sm font-bold text-indigo-300">🪄 AI Sticker Personalization</h4>
              <p className="text-xs text-indigo-200/60 mt-1">Auto-print names on Nimantran images.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={useSticker} onChange={() => setUseSticker(!useSticker)} />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
            </label>
          </div>
        </div>

        {/* Send Button */}
        <button className="w-full py-4 rounded-xl bg-gradient-to-r from-brand to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-brand/50 hover:scale-[1.01] transition-all flex justify-center items-center gap-2">
          <span>✈️</span> Start Silent Sending
        </button>

      </div>
    </div>
  );
};

export default BulkSender;