import React, { useState } from 'react';

const AITools = () => {
  // --- States ---
  const [activeTool, setActiveTool] = useState('whatsapp'); // whatsapp, spintax, social, rewrite, custom
  const [inputText, setInputText] = useState('');
  const [resultText, setResultText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // --- AI Settings ---
  const [tone, setTone] = useState('persuasive');
  const [language, setLanguage] = useState('hindi');
  const [useEmojis, setUseEmojis] = useState(true);

  const API_URL = "https://reachify-api.selt-3232.workers.dev";
  const user = JSON.parse(localStorage.getItem('reachify_user')) || { email: 'demo@reachify.com' };

  // TOOLS CONFIGURATION
  const aiTools = [
    { id: 'whatsapp', icon: '💬', name: 'WhatsApp Blast', desc: 'Create high-converting messages for campaigns.' },
    { id: 'spintax', icon: '🔀', name: 'Anti-Ban Spintax', desc: 'Generate {word1|word2} variations to avoid bans.' },
    { id: 'social', icon: '📱', name: 'Social Media', desc: 'Engaging captions for FB, Insta, Twitter.' },
    { id: 'rewrite', icon: '✍️', name: 'Smart Rewriter', desc: 'Fix grammar and improve text professionalism.' },
    { id: 'custom', icon: '🧠', name: 'Custom Prompt', desc: 'Command the AI like ChatGPT.' }
  ];

  // LOCAL SMART ENGINE (Fallback if backend API is not set yet)
  const generateLocalResponse = (text, tool, tone, lang) => {
    let output = "";
    const greeting = lang === 'hindi' ? 'नमस्कार' : lang === 'hinglish' ? 'Hello dosto' : 'Hello';
    const cta = lang === 'hindi' ? 'अधिक जानकारी के लिए संपर्क करें 👇' : 'Contact us for more details 👇';

    if (tool === 'spintax') {
      // Real Local Spintax Generation
      let spun = text
        .replace(/hello/gi, '{Hello|Hi|Hey|Greetings}')
        .replace(/offer/gi, '{Offer|Deal|Discount}')
        .replace(/buy/gi, '{Buy|Purchase|Get}')
        .replace(/best/gi, '{Best|Top|Excellent}')
        .replace(/price/gi, '{Price|Cost|Rate}');
      return `Here is your Spintax format:\n\n${spun}`;
    }

    if (tool === 'whatsapp') {
      output = `${useEmojis ? '✨ ' : ''}${greeting} {{Name}}! \n\n${text}\n\n${useEmojis ? '🚀 ' : ''}${cta}`;
      if (tone === 'urgent') output = `🚨 URGENT UPDATE 🚨\n\n${output}`;
      if (tone === 'formal') output = `प्रति, {{Name}}\n\n${text}\n\nसादर धन्यवाद।`;
      return output;
    }

    if (tool === 'social') {
      return `${useEmojis ? '🔥 ' : ''}${text} \n\n${useEmojis ? '👇 Drop your thoughts below!' : ''}\n#Trending #Viral #Update #ReachifyPro`;
    }

    if (tool === 'rewrite') {
      return `(Refined Version - ${tone} tone):\n\n${text.charAt(0).toUpperCase() + text.slice(1)}.`;
    }

    return `AI Response based on your command:\n\n${text}`;
  };

  // MAIN GENERATION FUNCTION
  const handleGenerate = async () => {
    if (!inputText.trim()) return alert("❌ Please enter some text or topic first!");
    
    setIsGenerating(true);
    setResultText('');

    try {
      // TRY REAL API FIRST
      const res = await fetch(`${API_URL}/generate-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          tool: activeTool,
          prompt: inputText,
          tone: tone,
          language: language,
          emojis: useEmojis
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResultText(data.result);
      } else {
        // IF API FAILS OR NOT SETUP, USE SMART LOCAL ENGINE
        setTimeout(() => {
          setResultText(generateLocalResponse(inputText, activeTool, tone, language));
          setIsGenerating(false);
        }, 1500); // Simulated delay for realism
        return; 
      }
    } catch (err) {
      // FALLBACK TO SMART ENGINE
      setTimeout(() => {
        setResultText(generateLocalResponse(inputText, activeTool, tone, language));
        setIsGenerating(false);
      }, 1500);
      return;
    }

    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    alert("✅ Content copied to clipboard!");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-[1400px] mx-auto p-2 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-xl mb-4">
         <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
               🧠 Reachify Intelligence Hub
               <span className="px-2 py-0.5 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded text-[10px] text-fuchsia-400 flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full animate-pulse"></span> AI Active
               </span>
            </h2>
            <p className="text-gray-400 text-xs mt-1">Command the AI to write, spin, and optimize your campaign content instantly.</p>
         </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        
        {/* LEFT COLUMN: TOOLS & SETTINGS */}
        <div className="w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar pb-4">
           
           {/* AI Tools Selector */}
           <div className="bg-[#1e293b] p-3 rounded-xl border border-gray-700 shadow-md">
             <h3 className="text-white font-bold text-xs mb-3 text-gray-400 uppercase tracking-wider">Select AI Agent</h3>
             <div className="space-y-2">
               {aiTools.map(tool => (
                 <button 
                   key={tool.id}
                   onClick={() => setActiveTool(tool.id)}
                   className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${activeTool === tool.id ? 'bg-fuchsia-600/20 border-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.2)]' : 'bg-[#0f172a] border-gray-700 hover:border-gray-500'}`}
                 >
                   <span className="text-2xl">{tool.icon}</span>
                   <div>
                     <p className={`font-bold text-sm ${activeTool === tool.id ? 'text-fuchsia-400' : 'text-gray-200'}`}>{tool.name}</p>
                     <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{tool.desc}</p>
                   </div>
                 </button>
               ))}
             </div>
           </div>

           {/* Settings Panel */}
           <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-md flex-1">
             <h3 className="text-white font-bold text-xs mb-4 text-gray-400 uppercase tracking-wider">Context & Tuning</h3>
             
             <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Output Language</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-xs text-white outline-none focus:border-fuchsia-500">
                     <option value="hindi">Hindi (हिंदी)</option>
                     <option value="english">English</option>
                     <option value="hinglish">Hinglish (Hindi + English)</option>
                     <option value="marathi">Marathi (मराठी)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Brand Tone</label>
                  <select value={tone} onChange={e => setTone(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-xs text-white outline-none focus:border-fuchsia-500">
                     <option value="persuasive">Persuasive / Sales</option>
                     <option value="professional">Corporate / Professional</option>
                     <option value="friendly">Friendly / Casual</option>
                     <option value="formal">Formal / Political</option>
                     <option value="urgent">Urgent / Alert</option>
                  </select>
                </div>

                <div className="flex items-center justify-between bg-[#0f172a] p-3 rounded border border-gray-600">
                   <span className="text-xs text-gray-300">Include Emojis 🎉</span>
                   <input type="checkbox" checked={useEmojis} onChange={e => setUseEmojis(e.target.checked)} className="w-4 h-4 accent-fuchsia-500" />
                </div>
             </div>
           </div>
        </div>

        {/* CENTER COLUMN: INPUT AREA */}
        <div className="flex-1 bg-[#1e293b] rounded-xl border border-gray-700 shadow-md flex flex-col relative overflow-hidden">
           <div className="p-4 border-b border-gray-700 bg-[#0f172a] flex justify-between items-center">
             <h3 className="text-white font-bold text-sm">
                Command Terminal <span className="text-gray-500 font-normal">({aiTools.find(t=>t.id===activeTool)?.name})</span>
             </h3>
           </div>
           
           <div className="p-4 flex-1 flex flex-col gap-4">
              <label className="text-xs text-gray-400">
                 {activeTool === 'spintax' ? 'Paste your message here to generate anti-ban variations:' : 
                  activeTool === 'custom' ? 'Give the AI a direct instruction:' : 
                  'Enter your raw topic, draft, or bullet points:'}
              </label>
              
              <textarea 
                 value={inputText}
                 onChange={e => setInputText(e.target.value)}
                 className="flex-1 w-full bg-[#0f172a] border border-gray-600 rounded-xl p-4 text-white text-sm outline-none focus:border-fuchsia-500 resize-none custom-scrollbar"
                 placeholder={
                    activeTool === 'whatsapp' ? 'e.g. Write an invitation for a kitty party at Hotel IVY...' :
                    activeTool === 'spintax' ? 'Hello, we have a new offer. Buy now for the best price.' :
                    'Type your thoughts here and let AI do the magic...'
                 }
              ></textarea>

              <button 
                onClick={handleGenerate} 
                disabled={isGenerating || !inputText.trim()}
                className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:scale-[1.01] text-white py-3.5 rounded-xl font-bold shadow-[0_0_15px_rgba(217,70,239,0.4)] transition-all disabled:opacity-50 disabled:scale-100 flex justify-center items-center gap-2"
              >
                 {isGenerating ? (
                   <><span className="animate-spin text-xl">⚙️</span> Processing AI Logic...</>
                 ) : (
                   <>✨ Generate Content</>
                 )}
              </button>
           </div>
        </div>

        {/* RIGHT COLUMN: OUTPUT AREA */}
        <div className="flex-1 bg-[#1e293b] rounded-xl border border-gray-700 shadow-md flex flex-col overflow-hidden relative">
           {/* Code Editor Style Top Bar */}
           <div className="p-3 border-b border-gray-700 bg-[#0f172a] flex justify-between items-center">
             <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-gray-400 text-xs ml-2 font-mono">Output.txt</span>
             </div>
             
             {resultText && (
               <button onClick={handleCopy} className="text-xs bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-3 py-1.5 rounded transition-all font-bold shadow-md">
                 📋 Copy Result
               </button>
             )}
           </div>

           <div className="flex-1 p-5 bg-[#0f172a]/50 overflow-y-auto custom-scrollbar relative">
              {isGenerating ? (
                 <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin"></div>
                    <p className="text-fuchsia-400 text-sm font-mono animate-pulse">Running Neural Models...</p>
                 </div>
              ) : resultText ? (
                 <div className="text-gray-200 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                    {resultText}
                 </div>
              ) : (
                 <div className="h-full flex flex-col items-center justify-center opacity-40 text-gray-500">
                    <span className="text-6xl mb-4">🪄</span>
                    <p className="font-bold">Awaiting Instructions</p>
                    <p className="text-xs text-center mt-2 px-10">Configure settings, type your prompt, and hit generate to see the magic.</p>
                 </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default AITools;
