import React, { useState } from 'react';

const AITools = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('rewrite'); // rewrite, reply, caption

  const handleGenerate = () => {
    if (!prompt) return alert("Please enter some text!");
    setLoading(true);
    
    // Simulation of AI processing (Real API call would go here using stored Key)
    // Kyunki abhi OpenAI key nahi hai, hum logic use kar rahe hain
    setTimeout(() => {
      let output = "";
      if (mode === 'rewrite') output = `✨ Rewritten Version:\n\n"${prompt}"\n\n(More professional and engaging tone applied.)`;
      if (mode === 'reply') output = `✨ Suggested Reply:\n\n"Thank you for reaching out! Regarding '${prompt}', we would love to assist you..."`;
      if (mode === 'caption') output = `✨ Social Caption:\n\n🚀 ${prompt} \n\n#Trending #Viral #Update`;

      setResult(output);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-100px)] flex gap-6">
      
      {/* Left Input Area */}
      <div className="w-1/2 flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-white">AI Content Studio</h2>
        
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-700 shadow-lg flex-1 flex flex-col">
          <label className="text-gray-400 text-sm mb-3">Choose AI Mode</label>
          <div className="flex gap-2 mb-6">
            <button onClick={() => setMode('rewrite')} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${mode === 'rewrite' ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-[#0f172a] border-gray-600 text-gray-400'}`}>Rewrite</button>
            <button onClick={() => setMode('reply')} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${mode === 'reply' ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-[#0f172a] border-gray-600 text-gray-400'}`}>Auto Reply</button>
            <button onClick={() => setMode('caption')} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${mode === 'caption' ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-[#0f172a] border-gray-600 text-gray-400'}`}>Caption</button>
          </div>

          <label className="text-gray-400 text-sm mb-2">Input Text / Topic</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full flex-1 bg-[#0f172a] border border-gray-600 rounded-xl p-4 text-white outline-none focus:border-fuchsia-500 resize-none mb-4"
            placeholder="Paste your message or topic here..."
          ></textarea>

          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:scale-[1.02] text-white py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? '🤖 Generating Magic...' : 'Generate Content ✨'}
          </button>
        </div>
      </div>

      {/* Right Output Area */}
      <div className="w-1/2 flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-transparent">.</h2> {/* Spacer */}
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-700 shadow-lg flex-1 relative overflow-hidden">
          {result ? (
            <div className="h-full flex flex-col">
              <h3 className="text-white font-bold mb-4">AI Result:</h3>
              <div className="flex-1 bg-[#0f172a] p-4 rounded-xl border border-gray-600 text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-y-auto">
                {result}
              </div>
              <button onClick={() => {navigator.clipboard.writeText(result); alert("Copied!")}} className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-bold">
                📋 Copy Result
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
              <div className="text-6xl mb-4">🧠</div>
              <p>AI is ready. Waiting for input...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITools;
