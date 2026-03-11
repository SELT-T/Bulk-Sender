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
  const API_URL = "https://reachify-api.selt-3232.workers.dev"; // Tumhara Real Backend
  const user = JSON.parse(localStorage.getItem('reachify_user')) || { email: 'demo@reachify.com' };

  // --- TOOL DEFINITIONS (The Brain's Capabilities) ---
  const toolsConfig = {
    text: [
      { id: 'custom_prompt', icon: '🧠', name: 'Universal ChatBot', desc: 'Ask anything, get real answers instantly (Hindi/English).' },
      { id: 'social_caption', icon: '📱', name: 'Viral Social Captions', desc: 'Instagram, LinkedIn, Twitter posts with hashtags.' },
      { id: 'blog_writer', icon: '📝', name: 'Article / Blog Writer', desc: 'SEO optimized long-form content generation.' },
      { id: 'spintax_gen', icon: '🔀', name: 'Anti-Ban Spintax', desc: 'Generate {Hi|Hello} variations for bulk sending.' },
      { id: 'rewriter', icon: '✍️', name: 'Pro Rewriter & Fixer', desc: 'Improve grammar, tone, and clarity.' },
    ],
    image: [
      { id: 'text_to_image', icon: '🎨', name: 'Text-to-Image Gen', desc: 'Describe it, AI will draw it (DALL-E style).' },
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
      setImageOutput(null);
    }
  };

  // --- 🔥 THE REAL AI ENGINE CONNECTION 🔥 ---
  const activateEngine = async () => {
    if (studioMode === 'text' && !promptInput.trim()) return alert("❌ Please enter a prompt first! (Ex: Write a Facebook post about my new shop)");
    if (studioMode === 'image' && activeToolId === 'text_to_image' && !promptInput.trim()) return alert("❌ Describe the image you want!");
    if (studioMode === 'utility' && !uploadedFile) return alert("❌ Please upload an image first!");

    setIsProcessing(true);
    setTextOutput(''); 
    setImageOutput(null);

    if (studioMode === 'text') {
        setProcessLog("Connecting to OpenAI Neural Net...");
        try {
            // 🟢 REAL API CALL TO YOUR CLOUDFLARE WORKER
            const res = await fetch(`${API_URL}/generate-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    tool: activeToolId,
                    prompt: promptInput,
                    tone: textTone,
                    language: language
                })
            });

            const data = await res.json();

            if (res.ok && data.result) {
                setProcessLog("Drafting response...");
                setTextOutput(data.result);
                setProcessLog("Completed ✅");
            } else {
                setProcessLog("AI Engine Error");
                alert(`❌ API Error: ${data.error || 'Check if your AI API Key is saved in Settings!'}`);
            }
        } catch (error) {
            setProcessLog("Network Failure");
            alert("❌ Failed to connect to server. Please try again.");
        }
    } 
    else if (studioMode === 'image' || studioMode === 'utility') {
        // Image & Utility modes are currently simulated because Backend /generate-ai only handles text right now
        // In the future, you can add DALL-E route to your Cloudflare worker to make this real too!
        setProcessLog("Image Processing API Not Linked Yet...");
        setTimeout(() => {
            alert("⚠️ Image APIs (DALL-E / Stability) need to be configured in your backend first. Currently returning placeholder.");
            setImageOutput(`https://picsum.photos/seed/${Math.random()}/512/512`);
            setProcessLog("Completed ✅");
            setIsProcessing(false);
        }, 1500);
        return;
    }

    setIsProcessing(false);
  };

  // --- UI HELPERS ---
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

  // ==============================================================
  // MAIN UI RENDER
  // ==============================================================
  return (
    <div className="flex flex-col h-auto min-h-screen lg:min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] max-w-[1600px] mx-auto p-2 md:p-4 animate-fade-in pb-20 lg:pb-0">
      
      {/* 1. TOP STUDIO HEADER & MODE SWITCHER */}
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
        
        {/* 2. LEFT PANEL: TOOL SELECTOR */}
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

        {/* 3. MIDDLE PANEL: INPUT & CONTROLS */}
        <div className="flex-1 bg-[#1e293b] rounded-2xl border border-gray-700 shadow-lg flex flex-col relative overflow-hidden min-h-[300px]">
           <div className="p-3 bg-[#0f172a] border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-xs md:text-sm flex flex-wrap items-center gap-1 md:gap-2">
                 ⚡ Command Center <span className="text-gray-500 font-normal hidden sm:inline">:: {currentToolConfig?.name}</span>
              </h3>
           </div>
           
           <div className="flex-1 p-3 md:p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar bg-gradient-to-br from-[#1e293b] to-[#0f172a]">
              
              {/* DYNAMIC INPUT AREA */}
              {(studioMode === 'text' || (studioMode === 'image' && activeToolId === 'text_to_image')) && (
                 <div className="flex-1 flex flex-col min-h-[150px]">
                    <label className="text-[10px] md:text-xs text-fuchsia-400 font-bold mb-2">Your Prompt / Instructions:</label>
                    <textarea 
                       value={promptInput}
                       onChange={e => setPromptInput(e.target.value)}
                       className="flex-1 w-full min-h-[120px] bg-[#0f172a]/80 border border-gray-600/50 rounded-xl p-3 md:p-4 text-white font-mono text-xs md:text-sm outline-none focus:border-fuchsia-500 resize-none focus:shadow-[0_0_15px_rgba(217,70,239,0.2)] transition-all custom-scrollbar"
                       placeholder={studioMode === 'image' ? "A futuristic cyberpunk city at sunset, neon lights..." : "Ex: Apni dukan ke liye ek dhamakedar Diwali offer message likho... \nOr: Write a professional email for a client meeting..."}
                    ></textarea>
                 </div>
              )}

              {studioMode === 'utility' && (
                 <div className="flex-1 flex flex-col justify-center min-h-[150px]">
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <div onClick={() => fileInputRef.current.click()} className={`flex-1 min-h-[150px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${filePreview ? 'border-fuchsia-500/50 bg-[#0f172a]' : 'border-gray-600 hover:border-fuchsia-400 hover:bg-[#0f172a]/50'}`}>
                       {filePreview ? (
                          <img src={filePreview} alt="Upload" className="max-h-[30vh] md:max-h-[40vh] object-contain rounded-lg shadow-xl p-2" />
                       ) : (
                          <div className="text-center p-4">
                             <span className="text-4xl md:text-5xl mb-2 md:mb-3 block opacity-50">📤</span>
                             <p className="text-gray-300 font-bold text-xs md:text-sm">Tap to Upload Image</p>
                             <p className="text-[9px] md:text-xs text-gray-500 mt-1">JPG, PNG supported</p>
                          </div>
                       )}
                    </div>
                 </div>
              )}

              {/* GENERATE BUTTON */}
              <button 
                onClick={activateEngine} 
                disabled={isProcessing || (studioMode==='utility' && !filePreview)}
                className="w-full mt-auto flex-shrink-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] text-white py-3 md:py-4 rounded-xl font-black text-xs md:text-sm tracking-wider uppercase shadow-lg transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                 <span className="relative flex items-center justify-center gap-2">
                   {isProcessing ? <><span className="animate-spin">⚙️</span> PROCESSING...</> : <>🚀 ACTIVATE ENGINE</>}
                 </span>
              </button>
           </div>
        </div>

        {/* 4. RIGHT PANEL: OUTPUT & ADVANCED SETTINGS */}
        <div className="w-full lg:w-[350px] bg-[#1e293b] rounded-2xl border border-gray-700 shadow-lg flex flex-col overflow-hidden flex-shrink-0 min-h-[400px] lg:max-h-full">
           
           {/* SETTINGS SECTION (Top) */}
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
                          <option value="friendly">🤝 Friendly</option>
                          <option value="humorous">😂 Humorous</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[9px] md:text-[10px] text-gray-500 block mb-1">Output Language</label>
                       <select value={language} onChange={e=>setLanguage(e.target.value)} className="w-full bg-[#1e293b] border border-gray-600 rounded p-1.5 text-[10px] md:text-xs text-white outline-none">
                          <option value="english">English (Default)</option>
                          <option value="hindi">Hindi (शुद्ध हिंदी)</option>
                          <option value="hinglish">Hinglish (Social Media style)</option>
                          <option value="marathi">Marathi</option>
                          <option value="gujarati">Gujarati</option>
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
              
              {studioMode === 'utility' && (
                 <div className="text-[10px] md:text-xs text-gray-500 italic p-2 text-center">API setup required for image processing.</div>
              )}
           </div>

           {/* OUTPUT SECTION (Bottom) */}
           <div className="flex-1 flex flex-col bg-[#0f172a]/50 relative overflow-hidden min-h-[250px]">
              <div className="p-2 border-b border-gray-700/30 flex justify-between items-center bg-[#0f172a]">
                 <span className="text-[10px] md:text-xs text-fuchsia-400 font-bold ml-1 md:ml-2">GENERATED RESULT</span>
                 {textOutput && <button onClick={copyToClipboard} className="text-[9px] md:text-[10px] bg-fuchsia-600/20 text-fuchsia-300 px-3 py-1.5 rounded-md hover:bg-fuchsia-600 hover:text-white font-bold transition-all border border-fuchsia-500/30">📋 Copy to use</button>}
                 {(imageOutput && studioMode!=='text') && <a href={imageOutput} download="ai_generated.jpg" className="text-[9px] md:text-[10px] bg-green-600/20 text-green-300 px-2 py-1 rounded hover:bg-green-600 hover:text-white transition-all">💾 Download</a>}
              </div>
              
              <div className="flex-1 p-3 md:p-5 overflow-y-auto custom-scrollbar relative flex items-center justify-center">
                 {isProcessing ? (
                    <div className="flex flex-col items-center justify-center space-y-3 md:space-y-4 z-10">
                       <div className="relative w-16 h-16 md:w-20 md:h-20">
                          <div className="absolute inset-0 rounded-full border-4 border-t-fuchsia-500 border-r-purple-500 border-b-indigo-500 border-l-transparent animate-spin"></div>
                          <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-fuchsia-500 border-b-purple-500 border-l-indigo-500 animate-spin-slow opacity-70"></div>
                       </div>
                       <p className="text-fuchsia-300 text-xs md:text-sm font-bold animate-pulse tracking-wider text-center">{processLog}</p>
                    </div>
                 ) : textOutput ? (
                    // This container will format the real AI response nicely
                    <div className="w-full h-full text-gray-200 text-sm md:text-base whitespace-pre-wrap leading-relaxed animate-fade-in">
                        {textOutput}
                    </div>
                 ) : imageOutput ? (
                    <img src={imageOutput} alt="Generated" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-gray-700/50 animate-fade-in p-1" />
                 ) : (
                    <div className="flex flex-col items-center justify-center opacity-30 text-gray-500">
                       <span className="text-4xl md:text-6xl mb-2 md:mb-4 grayscale">🤖</span>
                       <p className="font-bold tracking-widest text-[10px] md:text-xs">AWAITING PROMPT</p>
                    </div>
                 )}
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
