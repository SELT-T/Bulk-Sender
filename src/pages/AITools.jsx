import React, { useState, useRef } from 'react';

const AITools = () => {
  const [studioMode, setStudioMode] = useState('text'); 
  const [activeToolId, setActiveToolId] = useState('custom_prompt');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processLog, setProcessLog] = useState('');

  const [promptInput, setPromptInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [textOutput, setTextOutput] = useState('');
  const [imageOutput, setImageOutput] = useState(null);

  const [textTone, setTextTone] = useState('professional');
  const [language, setLanguage] = useState('english');
  const [imageAspectRatio, setImageAspectRatio] = useState('1:1');
  const [imageStyle, setImageStyle] = useState('realistic');

  const fileInputRef = useRef(null);
  const API_URL = "https://reachify-api.selt-3232.workers.dev"; 
  const user = JSON.parse(localStorage.getItem('reachify_user')) || { email: 'demo@reachify.com' };

  const toolsConfig = {
    text: [
      { id: 'custom_prompt', icon: '🧠', name: 'Universal ChatBot', desc: 'Ask anything, get real answers instantly.' },
      { id: 'social_caption', icon: '📱', name: 'Viral Social Captions', desc: 'Instagram, LinkedIn, Twitter posts.' },
      { id: 'blog_writer', icon: '📝', name: 'Article / Blog Writer', desc: 'SEO optimized long-form content.' },
      { id: 'spintax_gen', icon: '🔀', name: 'Anti-Ban Spintax', desc: 'Generate variations for bulk sending.' },
      { id: 'rewriter', icon: '✍️', name: 'Pro Rewriter & Fixer', desc: 'Improve grammar, tone, and clarity.' },
    ],
    image: [
      { id: 'text_to_image', icon: '🎨', name: 'Text-to-Image Gen', desc: 'Describe it, AI will draw it instantly.' },
      { id: 'video_gen', icon: '🎥', name: 'Text-to-Video (Beta)', desc: 'Generate short clips.', locked: true },
    ],
    utility: [
      { id: 'bg_remover', icon: '🔳', name: 'Background Remover', desc: 'Coming soon.', locked: true },
    ]
  };

  const currentToolConfig = toolsConfig[studioMode].find(t => t.id === activeToolId);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setImageOutput(null);
    }
  };

  const activateEngine = async () => {
    if (studioMode === 'text' && !promptInput.trim()) return alert("❌ Please enter a prompt first!");
    if (studioMode === 'image' && activeToolId === 'text_to_image' && !promptInput.trim()) return alert("❌ Describe the image you want!");

    setIsProcessing(true);
    setTextOutput(''); 
    setImageOutput(null);

    // ===============================================
    // 🧠 REAL TEXT AI (Needs Cloudflare/OpenAI)
    // ===============================================
    if (studioMode === 'text') {
        setProcessLog("Connecting to Text AI Engine...");
        try {
            const res = await fetch(`${API_URL}/generate-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, tool: activeToolId, prompt: promptInput, tone: textTone, language: language })
            });

            const data = await res.json();

            if (res.ok && data.result) {
                setTextOutput(data.result);
                setProcessLog("Completed ✅");
            } else {
                setProcessLog("Error");
                alert(`❌ API Error: ${data.error || 'Please add AI API Key in Settings.'}`);
            }
        } catch (error) {
            alert("❌ Failed to connect to server.");
        }
    } 
    // ===============================================
    // 🎨 REAL IMAGE AI (100% FREE - NO API KEY NEEDED!)
    // ===============================================
    else if (studioMode === 'image' && activeToolId === 'text_to_image') {
        setProcessLog("Rendering REAL AI Image...");
        
        // Dynamic prompt with user's style choice
        const finalPrompt = `${promptInput}, highly detailed, ${imageStyle} style`;
        
        // Resolution based on Aspect Ratio
        let w = 512, h = 512;
        if(imageAspectRatio === '16:9') { w = 896; h = 504; }
        if(imageAspectRatio === '9:16') { w = 504; h = 896; }

        // Using completely free Pollinations.ai API (No keys required)
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=${w}&height=${h}&nologo=true`;
        
        // Pre-load image to show smoothly
        const img = new Image();
        img.onload = () => {
            setImageOutput(imageUrl);
            setProcessLog("Completed ✅");
            setIsProcessing(false);
        };
        img.onerror = () => {
            alert("❌ AI Image Server busy. Try again.");
            setIsProcessing(false);
        };
        img.src = imageUrl;
        return; // Exit early so isProcessing isn't false before load
    }

    setIsProcessing(false);
  };

  const handleSwitchMode = (mode) => {
    setStudioMode(mode);
    setActiveToolId(toolsConfig[mode][0].id); 
    setPromptInput(''); setUploadedFile(null); setFilePreview(null); setTextOutput(''); setImageOutput(null);
  };

  const copyToClipboard = () => {
    if (!textOutput) return;
    navigator.clipboard.writeText(textOutput);
    alert("✅ Copied to clipboard!");
  };

  return (
    <div className="flex flex-col h-auto min-h-screen lg:min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] max-w-[1600px] mx-auto p-2 md:p-4 animate-fade-in pb-20 lg:pb-0">
      
      <div className="bg-[#1e293b] p-3 md:p-4 rounded-2xl border border-gray-700 shadow-xl mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
         <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 w-full md:w-auto">
            <h2 className="text-xl md:text-2xl font-black bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
               ⚛️ Ultimate AI Engine
            </h2>
            <div className="flex flex-wrap bg-[#0f172a] p-1 rounded-xl border border-gray-600/50 w-full md:w-auto">
               <button onClick={() => handleSwitchMode('text')} className={`flex-1 md:flex-none px-2 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold flex items-center justify-center gap-1 md:gap-2 transition-all ${studioMode === 'text' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><span>📝</span> <span className="hidden sm:inline">Text & Copy</span></button>
               <button onClick={() => handleSwitchMode('image')} className={`flex-1 md:flex-none px-2 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold flex items-center justify-center gap-1 md:gap-2 transition-all ${studioMode === 'image' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><span>🎨</span> <span className="hidden sm:inline">Image Gen</span></button>
               <button onClick={() => handleSwitchMode('utility')} className={`flex-1 md:flex-none px-2 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold flex items-center justify-center gap-1 md:gap-2 transition-all ${studioMode === 'utility' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><span>🛠️</span> <span className="hidden sm:inline">Editing Tools</span></button>
            </div>
         </div>
         <div className={`text-[9px] md:text-[10px] font-mono px-3 py-1 rounded-full border w-full md:w-auto text-center md:text-left ${isProcessing ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 animate-pulse' : 'bg-green-500/10 border-green-500 text-green-400'}`}>
            Status: {isProcessing ? processLog : 'Engine Ready'}
         </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-y-auto lg:overflow-hidden custom-scrollbar">
        
        <div className="w-full lg:w-[260px] bg-[#1e293b] rounded-2xl border border-gray-700 shadow-lg flex flex-col overflow-hidden flex-shrink-0 lg:max-h-full">
           <div className="p-3 bg-[#0f172a] border-b border-gray-700 font-bold text-white text-xs md:text-sm tracking-wider">
             AVAILABLE MODULES
           </div>
           <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 lg:grid-cols-1 gap-2 custom-scrollbar">
              {toolsConfig[studioMode].map(tool => (
                 <button 
                   key={tool.id}
                   onClick={() => !tool.locked && setActiveToolId(tool.id)}
                   disabled={tool.locked}
                   className={`w-full text-left p-2 md:p-3 rounded-xl border transition-all group h-full flex flex-col justify-start ${tool.locked ? 'opacity-50 cursor-not-allowed bg-[#0f172a] border-gray-800' : activeToolId === tool.id ? 'bg-fuchsia-600/10 border-fuchsia-500/50 shadow-[inset_0_0_10px_rgba(217,70,239,0.1)]' : 'bg-[#0f172a] border-gray-700/50 hover:border-fuchsia-500/30 hover:bg-[#0f172a]/80'}`}
                 >
                    <div className="flex items-center justify-between mb-1">
                       <span className="text-lg md:text-xl">{tool.icon}</span>
                       {tool.locked && <span className="text-[8px] md:text-[9px] bg-gray-700 px-1.5 rounded text-gray-300">SOON</span>}
                    </div>
                    <h4 className={`font-bold text-[10px] md:text-xs ${activeToolId === tool.id ? 'text-fuchsia-300' : 'text-gray-200 group-hover:text-white'}`}>{tool.name}</h4>
                    <p className="text-[9px] md:text-[10px] text-gray-500 leading-tight mt-1 line-clamp-2 lg:line-clamp-none">{tool.desc}</p>
                 </button>
              ))}
           </div>
        </div>

        <div className="flex-1 bg-[#1e293b] rounded-2xl border border-gray-700 shadow-lg flex flex-col relative overflow-hidden min-h-[300px]">
           <div className="p-3 bg-[#0f172a] border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-xs md:text-sm flex flex-wrap items-center gap-1 md:gap-2">
                 ⚡ Command Center <span className="text-gray-500 font-normal hidden sm:inline">:: {currentToolConfig?.name}</span>
              </h3>
           </div>
           
           <div className="flex-1 p-3 md:p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar bg-gradient-to-br from-[#1e293b] to-[#0f172a]">
              
              {(studioMode === 'text' || (studioMode === 'image' && activeToolId === 'text_to_image')) && (
                 <div className="flex-1 flex flex-col min-h-[150px]">
                    <label className="text-[10px] md:text-xs text-fuchsia-400 font-bold mb-2">Your Prompt / Instructions:</label>
                    <textarea 
                       value={promptInput}
                       onChange={e => setPromptInput(e.target.value)}
                       className="flex-1 w-full min-h-[120px] bg-[#0f172a]/80 border border-gray-600/50 rounded-xl p-3 md:p-4 text-white font-mono text-xs md:text-sm outline-none focus:border-fuchsia-500 resize-none focus:shadow-[0_0_15px_rgba(217,70,239,0.2)] transition-all custom-scrollbar"
                       placeholder={studioMode === 'image' ? "Ex: A cute robot drinking tea on the moon..." : "Ex: Ek mast Diwali offer likho mere showroom ke liye..."}
                    ></textarea>
                 </div>
              )}

              {studioMode === 'utility' && (
                 <div className="flex-1 flex flex-col justify-center min-h-[150px]">
                    <div className={`flex-1 min-h-[150px] border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center bg-[#0f172a]/50`}>
                          <div className="text-center p-4">
                             <span className="text-4xl md:text-5xl mb-2 block opacity-50">🚧</span>
                             <p className="text-gray-300 font-bold text-xs md:text-sm">Utility Module in Development</p>
                          </div>
                    </div>
                 </div>
              )}

              <button 
                onClick={activateEngine} 
                disabled={isProcessing}
                className="w-full mt-auto flex-shrink-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] text-white py-3 md:py-4 rounded-xl font-black text-xs md:text-sm tracking-wider uppercase shadow-lg transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                 <span className="relative flex items-center justify-center gap-2">
                   {isProcessing ? <><span className="animate-spin">⚙️</span> PROCESSING...</> : <>🚀 ACTIVATE ENGINE</>}
                 </span>
              </button>
           </div>
        </div>

        <div className="w-full lg:w-[350px] bg-[#1e293b] rounded-2xl border border-gray-700 shadow-lg flex flex-col overflow-hidden flex-shrink-0 min-h-[400px] lg:max-h-full">
           
           <div className="p-3 md:p-4 border-b border-gray-700/50 bg-[#0f172a]">
              <h3 className="text-white font-bold text-[10px] md:text-xs mb-2 md:mb-3 tracking-wider text-gray-400">ENGINE CONFIGURATION</h3>
              
              {studioMode === 'text' && (
                 <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 md:gap-3 animate-fade-in">
                    <div>
                       <label className="text-[9px] md:text-[10px] text-gray-500 block mb-1">Tone / Style</label>
                       <select value={textTone} onChange={e=>setTextTone(e.target.value)} className="w-full bg-[#1e293b] border border-gray-600 rounded p-1.5 text-[10px] md:text-xs text-white outline-none">
                          <option value="professional">🕴️ Professional</option>
                          <option value="engaging">🔥 Engaging</option>
                          <option value="persuasive">💰 Sales & Marketing</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[9px] md:text-[10px] text-gray-500 block mb-1">Output Language</label>
                       <select value={language} onChange={e=>setLanguage(e.target.value)} className="w-full bg-[#1e293b] border border-gray-600 rounded p-1.5 text-[10px] md:text-xs text-white outline-none">
                          <option value="english">English</option>
                          <option value="hindi">Hindi (हिंदी)</option>
                          <option value="hinglish">Hinglish</option>
                       </select>
                    </div>
                 </div>
              )}

              {studioMode === 'image' && activeToolId === 'text_to_image' && (
                 <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 md:gap-3 animate-fade-in">
                    <div><label className="text-[9px] md:text-[10px] text-gray-500 block mb-1">Aspect Ratio</label><select value={imageAspectRatio} onChange={e=>setImageAspectRatio(e.target.value)} className="w-full bg-[#1e293b] border border-gray-600 rounded p-1.5 text-[10px] md:text-xs text-white outline-none"><option value="1:1">Square (1:1)</option><option value="16:9">Landscape (16:9)</option><option value="9:16">Portrait (9:16)</option></select></div>
                    <div><label className="text-[9px] md:text-[10px] text-gray-500 block mb-1">Art Style</label><select value={imageStyle} onChange={e=>setImageStyle(e.target.value)} className="w-full bg-[#1e293b] border border-gray-600 rounded p-1.5 text-[10px] md:text-xs text-white outline-none"><option value="realistic">📸 Realistic</option><option value="cinematic">🎬 Cinematic</option><option value="digital_art">🎨 Digital Art</option><option value="3d_render">🧊 3D Render</option></select></div>
                 </div>
              )}
           </div>

           <div className="flex-1 flex flex-col bg-[#0f172a]/50 relative overflow-hidden min-h-[250px]">
              <div className="p-2 border-b border-gray-700/30 flex justify-between items-center bg-[#0f172a]">
                 <span className="text-[10px] md:text-xs text-fuchsia-400 font-bold ml-1 md:ml-2">GENERATED RESULT</span>
                 {textOutput && <button onClick={copyToClipboard} className="text-[9px] md:text-[10px] bg-fuchsia-600/20 text-fuchsia-300 px-3 py-1.5 rounded hover:bg-fuchsia-600 hover:text-white transition-all border border-fuchsia-500/30">📋 Copy</button>}
                 {(imageOutput && studioMode!=='text') && <a href={imageOutput} download="ai_generated.jpg" target="_blank" rel="noreferrer" className="text-[9px] md:text-[10px] bg-green-600/20 text-green-300 px-2 py-1 rounded hover:bg-green-600 hover:text-white transition-all">💾 Save</a>}
              </div>
              
              <div className="flex-1 p-3 md:p-5 overflow-y-auto custom-scrollbar relative flex items-center justify-center">
                 {isProcessing ? (
                    <div className="flex flex-col items-center justify-center space-y-3 z-10">
                       <div className="relative w-16 h-16">
                          <div className="absolute inset-0 rounded-full border-4 border-t-fuchsia-500 border-r-purple-500 border-b-indigo-500 border-l-transparent animate-spin"></div>
                       </div>
                       <p className="text-fuchsia-300 text-xs font-bold animate-pulse">{processLog}</p>
                    </div>
                 ) : textOutput ? (
                    <div className="w-full h-full text-gray-200 text-sm md:text-base whitespace-pre-wrap leading-relaxed animate-fade-in">{textOutput}</div>
                 ) : imageOutput ? (
                    <img src={imageOutput} alt="Generated" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-gray-700/50 animate-fade-in p-1" />
                 ) : (
                    <div className="flex flex-col items-center justify-center opacity-30 text-gray-500">
                       <span className="text-4xl md:text-6xl mb-2 md:mb-4 grayscale">🤖</span>
                       <p className="font-bold tracking-widest text-[10px] md:text-xs">AWAITING PROMPT</p>
                    </div>
                 )}
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};

export default AITools;
