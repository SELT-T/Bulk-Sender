import React from 'react';

const AITools = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            AI Assistant & Automation
          </h2>
          <p className="text-gray-400 text-sm mt-1">Configure smart auto-replies and intelligent message spin.</p>
        </div>
        <div className="bg-purple-500/20 text-purple-300 px-4 py-1.5 rounded-full text-sm border border-purple-500/30 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
          AI Engine Online
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Smart Reply Bot */}
        <div className="bg-[#1e293b]/60 border border-gray-700 p-6 rounded-2xl backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">💬 Smart Auto-Reply</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>
          <p className="text-sm text-gray-400 mb-4">AI will read incoming customer messages and reply based on your business context.</p>
          <textarea 
            rows="3" 
            placeholder="Train your AI: Tell it about your business, products, and standard replies..."
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
          ></textarea>
        </div>

        {/* Message Spinner / Variations */}
        <div className="bg-[#1e293b]/60 border border-gray-700 p-6 rounded-2xl backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">🔄 Anti-Ban Text Spinner</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>
          <p className="text-sm text-gray-400 mb-4">Automatically change greeting words (Hi, Hello, Hey) for every user to avoid getting banned by WhatsApp.</p>
          <div className="bg-[#0f172a] p-3 rounded-lg border border-gray-600 text-sm text-gray-300">
            Intensity Level: <span className="text-indigo-400 font-bold">Medium</span>
            <input type="range" className="w-full mt-2 accent-indigo-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITools;