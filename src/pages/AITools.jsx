import React, { useState, useRef } from 'react';

const AITools = () => {
  // === CORE ENGINE STATES ===
  const [studioMode, setStudioMode] = useState('text'); // 'text', 'image', 'utility'
  const [activeToolId, setActiveToolId] = useState('custom_prompt');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processLog, setProcessLog] = useState('');

  // === INPUT STATES ===
  const [promptInput, setPromptInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // === OUTPUT STATES ===
  const [textOutput, setTextOutput] = useState('');
  const [imageOutput, setImageOutput] = useState(null);

  // === ADVANCED SETTINGS STATES ===
  const [textTone, setTextTone] = useState('professional');
  const [language, setLanguage] = useState('english');
  const [imageAspectRatio, setImageAspectRatio] = useState('1:1');
  const [imageStyle, setImageStyle] = useState('realistic');

  const fileInputRef = useRef(null);
  const API_URL = "https://reachify-api.selt-3232.workers.dev";
  const user = JSON.parse(localStorage.getItem('reachify_user')) || { email: 'demo@reachify.com' };

  // --- TOOL DEFINITIONS (The Brain's Capabilities) ---
  const toolsConfig = {
    text: [
      { id: 'custom_prompt', icon: '🧠', name: 'Universal ChatBot', desc: 'Ask anything, get answers like ChatGPT.' },
      { id: 'social_caption', icon: '📱', name: 'Viral Social Captions', desc: 'Instagram, LinkedIn, Twitter posts with hashtags.' },
      { id: 'blog_writer', icon: '📝', name: 'Article / Blog Writer', desc: 'SEO optimized long-form content.' },
      { id: 'spintax_gen', icon: '🔀', name: 'Anti-Ban Spintax', desc: 'Generate {Hi|Hello} variations for bulk sending.' },
      { id: 'rewriter', icon: '✍️', name: 'Pro Rewriter & Fixer', desc: 'Improve grammar, tone, and clarity.' },
    ],
    image: [
      { id: 'text_to_image', icon: '🎨', name: 'Text-to-Image Gen', desc: 'Describe it, AI will draw it (DALL-E style).' },
      // Future Placeholder for Video Gen (Requires heavy backend)
      { id: 'video_gen', icon: '🎥', name: 'Text-to-Video (Beta)', desc: 'Generate short clips from text prompts.', locked: true },
    ],
    utility: [
      { id: 'bg_remover', icon: '🔳', name: 'Background Remover', desc: 'One-click transparent background.' },
      { id: 'watermark_remover', icon: '💧', name: 'Watermark Eraser', desc: 'Clean up images magically.' },
      { id: 'photo_enhancer', icon: '✨', name: 'Photo Upscaler', desc: 'Make blurry images HD sharp.' },
    ]
  };

  const currentToolConfig = toolsConfig[studioMode].find(t => t.id === activeToolId);

  // --- FILE HANDLING ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setImageOutput(null); // Clear previous output
    }
  };

  // --- THE "ENGINE" (Simulation & API Trigger) ---
  const activateEngine = async () => {
    if (studioMode === 'text' && !promptInput.trim()) return alert("❌ Please enter a prompt first!");
    if (studioMode === 'image' && activeToolId === 'text_to_image' && !promptInput.trim()) return alert("❌ Describe the image you want!");
    if (studioMode === 'utility' && !uploadedFile) return alert("❌ Please upload an image first!");

    setIsProcessing(true);
    setProcessLog("Initializing Neural Net...");
    setTextOutput(''); setImageOutput(null);

    // SIMULATION SEQUENCE (Kyuki abhi asli backend nahi hai)
    // Jab asli backend lagega, yahan asli fetch() call aayega.
    try {
      await simulateStep("Translating request to machine code...", 1000);
      
      if (studioMode === 'text') {
         await simulateStep(`Generating text with ${textTone} tone in ${language}...`, 2000);
         // --- SIMULATED TEXT RESPONSE ---
         let simRes = `[SIMULATION MODE - Connect Backend for Real AI]\n\nHere is a ${textTone} output for: "${promptInput.substring(0, 20)}..."\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. This is placeholder text demonstrating where the actual AI response will appear once connected to OpenAI or similar APIs. It will respect your language selection (${language}).\n\n#ReachifyAI #Innovation`;
         if(activeToolId === 'spintax_gen') simRes = "{Hello|Hi|Hey} there! Check out our {new|latest|exclusive} offer specially for {you|our valued members}.";
         setTextOutput(simRes);

      } else if (studioMode === 'image') {
         await simulateStep(`Synthesizing pixels based on description...`, 2500);
         await simulateStep(`Applying ${imageStyle} style and rendering...`, 1500);
         // --- SIMULATED IMAGE RESPONSE ---
         // Using a placeholder image service to simulate generation
         setImageOutput(`https://picsum.photos/seed/${Math.random()}/512/512`);

      } else if (studioMode === 'utility') {
         await simulateStep(`Analyzing image structure...`, 1500);
         await simulateStep(`Performing ${currentToolConfig.name} operation...`, 2000);
         // --- SIMULATED UTILITY RESPONSE ---
         // Just showing the original image back for now as "processed"
         setImageOutput(filePreview); 
      }
      
      await simulateStep("Finalizing output...", 500);
      setProcessLog("Completed ✅");

    } catch (error) {
       setProcessLog("Error in processing engine.");
       alert("Engine Failure. Check console.");
    }
    setIsProcessing(false);
  };

  // Helper for simulation delays
  const simulateStep = (log, ms) => new Promise(resolve => {
    setProcessLog(log);
    setTimeout(resolve, ms);
  });


  // --- UI HELPERS ---
  const handleSwitchMode = (mode) => {
    setStudioMode(mode);
    setActiveToolId(toolsConfig[mode][0].id); // Reset to first tool in category
    setPromptInput(''); setUploadedFile(null); setFilePreview(null); setTextOutput(''); setImageOutput(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textOutput);
    alert("✅ Copied to clipboard!");
  };

  // ==============================================================
  // MAIN UI RENDER
  // ==============================================================
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-[1600px] mx-auto p-2 animate-fade-in">
      
      {/* 1. TOP STUDIO HEADER & MODE SWITCHER */}
      <div className="bg-[#1e293b] p-3 rounded-2xl border border-gray-700 shadow-xl mb-4 flex justify-between items-center">
         <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
               ⚛️ Ultimate AI Engine
            </h2>
            <div className="flex bg-[#0f172a] p-1 rounded-xl border border-gray-600/50">
               <button onClick={() => handleSwitchMode('text')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${studioMode === 'text' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><span>📝</span> Text & Copy</button>
               <button onClick={() => handleSwitchMode('image')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${studioMode === 'image' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><span>🎨</span> Image Gen</button>
               <button onClick={() => handleSwitchMode('utility')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${studioMode === 'utility' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><span>🛠️</span> Editing Tools</button>
            </div>
         </div>
         <div className={`text-[10px] font-mono px-3 py-1 rounded-full border ${isProcessing ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 animate-pulse' : 'bg-green-500/10 border-green-500 text-green-400'}`}>
            Status: {isProcessing ? processLog : 'Engine Ready'}
         </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        
        {/* 2. LEFT PANEL: TOOL SELECTOR */}
        <div className="w-[260px] bg-[#1e293b] rounded-2xl border border-gray-700 shadow-lg flex flex-col overflow-hidden">
           <div className="p-3 bg-[#0f172a] border-b border-gray-700 font-bold text-white text-sm tracking-wider">
              AVAILABLE MODULES
           </div>
           <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {toolsConfig[studioMode].map(tool => (
                 <button 
                   key={tool.id}
                   onClick={() => !tool.locked && setActiveToolId(tool.id)}
                   disabled={tool.locked}
                   className={`w-full text-left p-3 rounded-xl border transition-all group ${tool.locked ? 'opacity-50 cursor-not-allowed bg-[#0f172a] border-gray-800' : activeToolId === tool.id ? 'bg-fuchsia-600/10 border-fuchsia-500/50 shadow-[inset_0_0_10px_rgba(217,70,239,0.1)]' : 'bg-[#0f172a] border-gray-700/50 hover:border-fuchsia-500/30 hover:bg-[#0f172a]/80'}`}
                 >
                    <div className="flex items-center justify-between mb-1">
                       <span className="text-xl">{tool.icon}</span>
                       {tool.locked && <span className="text-[9px] bg-gray-700 px-1.5 rounded text-gray-300">SOON</span>}
                    </div>
                    <h4 className={`font-bold text-xs ${activeToolId === tool.id ? 'text-fuchsia-300' : 'text-gray-200 group-hover:text-white'}`}>{tool.name}</h4>
                    <p className="text-[10px] text-gray-500 leading-tight mt-1">{tool.desc}</p>
                 </button>
              ))}
           </div>
        </div>

        {/* 3. MIDDLE PANEL: INPUT & CONTROLS (The Command Center) */}
        <div className="flex-1 bg-[#1e293b] rounded-2xl border border-gray-700 shadow-lg flex flex-col relative overflow-hidden">
           <div className="p-3 bg-[#0f172a] border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                 ⚡ Command Center <span className="text-gray-500 font-normal">:: {currentToolConfig?.name}</span>
              </h3>
           </div>
           
           <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar bg-gradient-to-br from-[#1e293b] to-[#0f172a]">
              
              {/* DYNAMIC INPUT AREA BASED ON MODE */}
              {(studioMode === 'text' || (studioMode === 'image' && activeToolId === 'text_to_image')) && (
                 <div className="flex-1 flex flex-col">
                    <label className="text-xs text-fuchsia-400 font-bold mb-2">Your Prompt / Instructions:</label>
                    <textarea 
                       value={promptInput}
                       onChange={e => setPromptInput(e.target.value)}
                       className="flex-1 w-full bg-[#0f172a]/80 border border-gray-600/50 rounded-xl p-4 text-white font-mono text-sm outline-none focus:border-fuchsia-500 resize-none focus:shadow-[0_0_15px_rgba(217,70,239,0.2)] transition-all"
                       placeholder={studioMode === 'image' ? "A futuristic cyberpunk city at sunset, neon lights, flying cars, highly detailed, 8k render..." : "Write an engaging caption for a new shoe launch..."}
                    ></textarea>
                 </div>
              )}

              {studioMode === 'utility' && (
                 <div className="flex-1 flex flex-col justify-center">
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <div onClick={() => fileInputRef.current.click()} className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${filePreview ? 'border-fuchsia-500/50 bg-[#0f172a]' : 'border-gray-600 hover:border-fuchsia-400 hover:bg-[#0f172a]/50'}`}>
                       {filePreview ? (
                          <img src={filePreview} alt="Upload" className="max-h-[40vh] object-contain rounded-lg shadow-xl" />
                       ) : (
                          <>
                             <span className="text-5xl mb-3 opacity-50">📤</span>
                             <p className="text-gray-300 font-bold">Drop Image or Click to Upload</p>
                             <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG for processing</p>
                          </>
                       )}
                    </div>
                 </div>
              )}

              {/* GENERATE BUTTON */}
              <button 
                onClick={activateEngine} 
                disabled={isProcessing || (studioMode==='utility' && !filePreview)}
                className="w-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] text-white py-4 rounded-xl font-black text-sm tracking-wider uppercase shadow-lg transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                 <span className="relative flex items-center justify-center gap-2">
                   {isProcessing ? <><span className="animate-spin">⚙️</span> PROCESSING...</> : <>🚀 ACTIVATE ENGINE</>}
                 </span>
              </button>
           </div>
        </div>

        {/* 4. RIGHT PANEL: OUTPUT & ADVANCED SETTINGS */}
        <div className="w-[350px] bg-[#1e293b] rounded-2xl border border-gray-700 shadow-lg flex flex-col overflow-hidden">
           
           {/* SETTINGS SECTION (TOP HALF) */}
           <div className="p-4 border-b border-gray-700/50 bg-[#0f172a]">
              <h3 className="text-white font-bold text-xs mb-3 tracking-wider text-gray-400">ENGINE CONFIGURATION</h3>
              
              {studioMode === 'text' && (
                 <div className="space-y-3 animate-fade-in">
                    <div><label className="text-[10px] text-gray-500 block mb-1">Tone / Style</label><select value={textTone} onChange={e=>setTextTone(e.target.value)} className="w-full bg-[#1e293b] border border-gray-600 rounded p-1.5 text-xs text-white outline-none"><option value="professional">🕴️ Professional</option><option value="engaging">🔥 Engaging / Viral</option><option value="persuasive">💰 Persuasive (Sales)</option><option value="friendly">🤝 Friendly</option></select></div>
                    <div><label className="text-[10px] text-gray-500 block mb-1">Output Language</label><select value={language} onChange={e=>setLanguage(e.target.value)} className="w-full bg-[#1e293b] border border-gray-600 rounded p-1.5 text-xs text-white outline-none"><option value="english">English</option><option value="hindi">Hindi (हिंदी)</option><option value="hinglish">Hinglish</option></select></div>
                 </div>
              )}

              {studioMode === 'image' && activeToolId === 'text_to_image' && (
                 <div className="space-y-3 animate-fade-in">
                    <div><label className="text-[10px] text-gray-500 block mb-1">Aspect Ratio</label><select value={imageAspectRatio} onChange={e=>setImageAspectRatio(e.target.value)} className="w-full bg-[#1e293b] border border-gray-600 rounded p-1.5 text-xs text-white outline-none"><option value="1:1">Square (1:1)</option><option value="16:9">Landscape (16:9)</option><option value="9:16">Portrait (9:16)</option></select></div>
                    <div><label className="text-[10px] text-gray-500 block mb-1">Art Style</label><select value={imageStyle} onChange={e=>setImageStyle(e.target.value)} className="w-full bg-[#1e293b] border border-gray-600 rounded p-1.5 text-xs text-white outline-none"><option value="realistic">📸 Realistic Photo</option><option value="cinematic">🎬 Cinematic</option><option value="digital_art">🎨 Digital Art</option><option value="3d_render">🧊 3D Render</option></select></div>
                 </div>
              )}
              
              {studioMode === 'utility' && (
                 <div className="text-xs text-gray-500 italic p-2 text-center">No extra settings for this tool.</div>
              )}
           </div>

           {/* OUTPUT SECTION (BOTTOM HALF - FLEX GROW) */}
           <div className="flex-1 flex flex-col bg-[#0f172a]/50 relative overflow-hidden">
              <div className="p-2 border-b border-gray-700/30 flex justify-between items-center bg-[#0f172a]">
                 <span className="text-xs text-fuchsia-400 font-bold ml-2">GENERATED RESULT</span>
                 {textOutput && <button onClick={copyToClipboard} className="text-[10px] bg-fuchsia-600/20 text-fuchsia-300 px-2 py-1 rounded hover:bg-fuchsia-600 hover:text-white transition-all">📋 Copy Text</button>}
                 {(imageOutput && studioMode!=='text') && <a href={imageOutput} download="ai_generated.jpg" className="text-[10px] bg-green-600/20 text-green-300 px-2 py-1 rounded hover:bg-green-600 hover:text-white transition-all">💾 Download</a>}
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar relative flex items-center justify-center">
                 {isProcessing ? (
                    <div className="flex flex-col items-center justify-center space-y-4 z-10">
                       <div className="relative w-20 h-20">
                          <div className="absolute inset-0 rounded-full border-4 border-t-fuchsia-500 border-r-purple-500 border-b-indigo-500 border-l-transparent animate-spin"></div>
                          <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-fuchsia-500 border-b-purple-500 border-l-indigo-500 animate-spin-slow opacity-70"></div>
                       </div>
                       <p className="text-fuchsia-300 text-sm font-bold animate-pulse tracking-wider">{processLog}</p>
                    </div>
                 ) : textOutput ? (
                    <div className="w-full h-full text-gray-200 text-sm whitespace-pre-wrap font-mono leading-relaxed animate-fade-in">{textOutput}</div>
                 ) : imageOutput ? (
                    <img src={imageOutput} alt="Generated" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-gray-700/50 animate-fade-in" />
                 ) : (
                    <div className="flex flex-col items-center justify-center opacity-30 text-gray-500">
                       <span className="text-6xl mb-4 grayscale">🧬</span>
                       <p className="font-bold tracking-widest">AWAITING INPUT</p>
                    </div>
                 )}
                 {/* Background Grid effect for empty state */}
                 {!isProcessing && !textOutput && !imageOutput && (
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
                 )}
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};

export default AITools;
