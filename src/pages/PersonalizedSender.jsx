import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';

const PersonalizedSender = () => {
  // --- States ---
  const [contacts, setContacts] = useState([]);
  const [showContactPreview, setShowContactPreview] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [waStatus, setWaStatus] = useState('checking'); 
  
  // --- STUDIO STATES ---
  const [activeTab, setActiveTab] = useState('name'); // name, sub, box

  // 1. Name Tag Config
  const [nameText, setNameText] = useState("{{Name}}");
  const [nameFont, setNameFont] = useState("Arial, sans-serif");
  const [nameSize, setNameSize] = useState(32);
  const [nameColor, setNameColor] = useState("#ffffff");
  const [nameOutline, setNameOutline] = useState("none");
  const [nameWeight, setNameWeight] = useState("bold");
  const [nameStyle, setNameStyle] = useState("normal");

  // 2. Sub-Text Config
  const [subText, setSubText] = useState("सपरिवार आमंत्रित हैं");
  const [subFont, setSubFont] = useState("Arial, sans-serif");
  const [subSize, setSubSize] = useState(14);
  const [subColor, setSubColor] = useState("#fbcfe8"); // Light pink
  const [subOutline, setSubOutline] = useState("none");
  const [subWeight, setSubWeight] = useState("normal");
  const [subStyle, setSubStyle] = useState("normal");

  // 3. Box Config
  const [boxBg, setBoxBg] = useState("rgba(0, 0, 0, 0.5)");
  const [boxBorder, setBoxBorder] = useState("none");
  const [boxRadius, setBoxRadius] = useState(12);
  const [boxPadding, setBoxPadding] = useState(16);
  
  // Placement
  const [stickerWidth, setStickerWidth] = useState(320);
  const [stickerPos, setStickerPos] = useState({ x: 50, y: 70 }); 
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  // --- Engine States ---
  const [campaignState, setCampaignState] = useState('idle');
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ sent: 0, failed: 0, total: 0 });
  const [progress, setProgress] = useState(0);
  const [delay, setDelay] = useState(2);

  const imageContainerRef = useRef(null);
  const stopRef = useRef(false);
  const API_URL = "https://reachify-api.selt-3232.workers.dev";
  const user = JSON.parse(localStorage.getItem('reachify_user')) || { email: 'demo@reachify.com' };

  // FONT OPTIONS
  const fontOptions = [
    { label: "Modern (Arial)", value: "Arial, sans-serif" },
    { label: "Classic (Times)", value: "'Times New Roman', serif" },
    { label: "Typewriter", value: "'Courier New', monospace" },
    { label: "Elegant (Georgia)", value: "Georgia, serif" },
    { label: "Heavy (Impact)", value: "'Impact', sans-serif" },
    { label: "Clean (Verdana)", value: "Verdana, sans-serif" },
    { label: "Round (Comic Sans)", value: "'Comic Sans MS', cursive" },
    { label: "Stylish Script", value: "'Brush Script MT', cursive" }
  ];

  const outlineOptions = [
    { label: "No Outline", value: "none" },
    { label: "Black", value: "#000000" },
    { label: "White", value: "#ffffff" },
    { label: "Red", value: "#ef4444" },
    { label: "Blue", value: "#3b82f6" },
    { label: "Gold", value: "#fbbf24" }
  ];

  // 0. REAL API CHECK
  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch(`${API_URL}/get-settings`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email })
        });
        const data = await res.json();
        if (data.instance_id && data.access_token) setWaStatus('connected');
        else setWaStatus('disconnected');
      } catch (err) { setWaStatus('disconnected'); }
    };
    checkApi();
  }, [user.email]);

  // 1. Media Upload
  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    } else {
      alert("❌ Pro Studio only accepts Image files (.jpg, .png).");
    }
  };

  // 2. Smart Excel Scanner
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" }); 
        
        const formattedContacts = data.map((row) => {
          let phoneVal = ''; let nameVal = 'Guest';
          Object.keys(row).forEach(key => {
            const lowerKey = key.toLowerCase();
            if (lowerKey.includes('phone') || lowerKey.includes('mob') || lowerKey.includes('num') || lowerKey.includes('contact') || lowerKey.includes('whatsapp') || lowerKey.includes('मोबा')) {
              if (!phoneVal && row[key]) phoneVal = String(row[key]).trim();
            }
            if (lowerKey.includes('name') || lowerKey.includes('customer') || lowerKey.includes('नाम')) {
              if (nameVal === 'Guest' && row[key]) nameVal = String(row[key]).trim();
            }
          });

          if (!phoneVal) {
             Object.keys(row).forEach(key => {
                const val = String(row[key]).trim();
                const numbersOnly = val.replace(/\D/g, '');
                if (numbersOnly.length >= 9 && numbersOnly.length <= 14 && !phoneVal) phoneVal = val;
                else if (nameVal === 'Guest' && val.length > 2 && isNaN(val)) nameVal = val;
             });
          }
          return { phone: phoneVal, name: nameVal };
        }).filter(c => c.phone && c.phone.length > 5); 

        if (formattedContacts.length > 0) {
           setContacts(formattedContacts);
           setStats({ sent: 0, failed: 0, total: formattedContacts.length });
           setShowContactPreview(true);
        } else alert("❌ No valid numbers found in Excel.");
      } catch (error) { alert("❌ Error reading Excel."); }
    };
    reader.readAsBinaryString(file);
  };

  // 3. Canvas Drag & Resize Engine
  const handleDragStart = () => { if(!isResizing) setIsDragging(true); };
  const handleResizeStart = (e) => { e.stopPropagation(); setIsResizing(true); };
  const handleMouseUp = () => { setIsDragging(false); setIsResizing(false); };

  const handleMouseMove = (e) => {
    if ((!isDragging && !isResizing) || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0].clientX;
    const clientY = e.clientY || e.touches?.[0].clientY;

    if (isDragging) {
      let x = ((clientX - rect.left) / rect.width) * 100;
      let y = ((clientY - rect.top) / rect.height) * 100;
      setStickerPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    } else if (isResizing) {
      const stickerCenterX = (stickerPos.x / 100) * rect.width + rect.left;
      const newWidth = Math.abs(clientX - stickerCenterX) * 2;
      setStickerWidth(Math.max(120, Math.min(newWidth, rect.width * 0.95))); 
    }
  };

  // 4. API Trigger
  const startBlast = async () => {
    if (waStatus !== 'connected') return alert("❌ WhatsApp is Disconnected! Please configure API first.");
    if (!mediaFile) return alert("❌ Please upload a Base Image!");
    if (contacts.length === 0) return alert("❌ Please upload Contacts!");
    
    setCampaignState('running'); stopRef.current = false; setLogs([]); setProgress(0);
    let currentSent = 0, currentFailed = 0;

    for (let i = 0; i < contacts.length; i++) {
      if (stopRef.current) { setCampaignState('stopped'); break; }
      const contact = contacts[i];
      setLogs(prev => [{ id: i + 1, to: contact.name, status: "Sending..." }, ...prev]);

      try {
        const payload = {
          email: user.email, phone: contact.phone, message: "Here is your personalized invite!", media_type: 'image',
          sticker_config: { 
             name: { text: contact.name, font: nameFont, size: nameSize, color: nameColor, outline: nameOutline, weight: nameWeight, style: nameStyle },
             sub: { text: subText, font: subFont, size: subSize, color: subColor, outline: subOutline, weight: subWeight, style: subStyle },
             box: { bg: boxBg, border: boxBorder, radius: boxRadius, padding: boxPadding, width: stickerWidth },
             x: stickerPos.x, y: stickerPos.y 
          }
        };

        const res = await fetch(`${API_URL}/send-message`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) { currentSent++; setLogs(prev => prev.map(l => l.id === i + 1 ? { ...l, status: "✅ Sent" } : l)); }
        else { currentFailed++; setLogs(prev => prev.map(l => l.id === i + 1 ? { ...l, status: "❌ Failed" } : l)); }
      } catch (err) {
        currentFailed++; setLogs(prev => prev.map(l => l.id === i + 1 ? { ...l, status: "⚠️ Error" } : l));
      }
      
      setStats({ sent: currentSent, failed: currentFailed, total: contacts.length });
      setProgress(Math.round(((i + 1) / contacts.length) * 100));
      if (i < contacts.length - 1) await new Promise(r => setTimeout(r, delay * 1000));
    }
    if(!stopRef.current) setCampaignState('completed');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-[1400px] mx-auto p-2 animate-fade-in" onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp} onMouseLeave={handleMouseUp}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-xl mb-4">
         <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
               🎨 Pro Graphic Studio
               {waStatus === 'checking' && <span className="text-xs text-gray-400">Checking...</span>}
               {waStatus === 'connected' && <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded text-[10px] text-green-400">API Linked</span>}
               {waStatus === 'disconnected' && <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-[10px] text-red-400">API Disconnected</span>}
            </h2>
         </div>
         <div className="flex items-center gap-4">
            <div className="bg-[#0f172a] px-3 py-1.5 rounded-lg border border-gray-600 flex items-center gap-2">
              <span className="text-gray-400 text-xs">Delay:</span>
              <input type="number" value={delay} onChange={e => setDelay(e.target.value)} className="w-8 bg-transparent text-white font-bold text-center outline-none text-sm" />
            </div>
            {campaignState === 'running' ? (
               <button onClick={() => stopRef.current = true} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all">⏹ Stop Blast</button>
            ) : (
               <button onClick={startBlast} disabled={contacts.length === 0 || !mediaPreview || waStatus !== 'connected'} className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:scale-105 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50">
                  🚀 Start Auto-Blast
               </button>
            )}
         </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        
        {/* LEFT: ADVANCED TOOLS PANEL */}
        <div className="w-[340px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar pb-4">
           
           {/* Step 1 & 2: Uploads (Compact) */}
           <div className="grid grid-cols-2 gap-3 flex-shrink-0">
             <div className="bg-[#1e293b] p-3 rounded-xl border border-gray-700 shadow-md">
               <h3 className="text-white font-bold text-[11px] mb-2">1. Base Image</h3>
               <div className="relative cursor-pointer border border-dashed border-gray-600 rounded p-2 text-center bg-[#0f172a] hover:border-fuchsia-500">
                 <input type="file" accept="image/*" onChange={handleMediaUpload} className="absolute inset-0 w-full h-full opacity-0" />
                 <p className="text-lg">🖼️</p>
                 <p className="text-[9px] text-gray-400 truncate">{mediaFile ? mediaFile.name : "Upload Image"}</p>
               </div>
             </div>
             <div className="bg-[#1e293b] p-3 rounded-xl border border-gray-700 shadow-md">
               <h3 className="text-white font-bold text-[11px] mb-2">2. Excel List</h3>
               <div className="relative cursor-pointer border border-dashed border-gray-600 rounded p-2 text-center bg-[#0f172a] hover:border-fuchsia-500">
                 <input type="file" accept=".xlsx, .csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0" />
                 <p className="text-lg">📊</p>
                 <p className="text-[9px] text-gray-400">{contacts.length > 0 ? `${contacts.length} Ready` : "Upload List"}</p>
               </div>
             </div>
           </div>

           {/* Step 3: THE ULTIMATE STYLING ENGINE */}
           {mediaPreview && (
             <div className="bg-[#1e293b] rounded-xl border border-gray-700 shadow-md flex-1 flex flex-col overflow-hidden">
               
               {/* TABS */}
               <div className="flex bg-[#0f172a] p-1 border-b border-gray-700">
                  <button onClick={()=>setActiveTab('name')} className={`flex-1 py-2 text-[11px] font-bold rounded-md transition-all ${activeTab === 'name' ? 'bg-fuchsia-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>Name Tag</button>
                  <button onClick={()=>setActiveTab('sub')} className={`flex-1 py-2 text-[11px] font-bold rounded-md transition-all ${activeTab === 'sub' ? 'bg-fuchsia-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>Sub-Text</button>
                  <button onClick={()=>setActiveTab('box')} className={`flex-1 py-2 text-[11px] font-bold rounded-md transition-all ${activeTab === 'box' ? 'bg-fuchsia-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>Box Design</button>
               </div>

               {/* TAB CONTENTS */}
               <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                  
                  {/* --- NAME TAB --- */}
                  {activeTab === 'name' && (
                     <div className="space-y-4 animate-fade-in">
                        <div>
                          <label className="text-[10px] text-gray-400 flex justify-between">Font Size <span>{nameSize}px</span></label>
                          <input type="range" min="12" max="72" value={nameSize} onChange={e=>setNameSize(e.target.value)} className="w-full accent-fuchsia-500 mt-1"/>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                             <label className="text-[10px] text-gray-400 block mb-1">Font Family</label>
                             <select value={nameFont} onChange={e=>setNameFont(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded p-1.5 text-[11px] text-white outline-none">
                                {fontOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                             </select>
                           </div>
                           <div>
                             <label className="text-[10px] text-gray-400 block mb-1">Format</label>
                             <div className="flex gap-1">
                                <button onClick={() => setNameWeight(nameWeight === 'bold' ? 'normal' : 'bold')} className={`flex-1 p-1 rounded border text-xs font-bold ${nameWeight === 'bold' ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-[#0f172a] border-gray-600 text-gray-400'}`}>B</button>
                                <button onClick={() => setNameStyle(nameStyle === 'italic' ? 'normal' : 'italic')} className={`flex-1 p-1 rounded border text-xs italic ${nameStyle === 'italic' ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-[#0f172a] border-gray-600 text-gray-400'}`}>I</button>
                             </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Text Color</label>
                            <input type="color" value={nameColor} onChange={e=>setNameColor(e.target.value)} className="w-full h-8 rounded cursor-pointer bg-transparent border border-gray-600"/>
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Border (Outline)</label>
                            <select value={nameOutline} onChange={e=>setNameOutline(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded p-1.5 text-[11px] text-white outline-none">
                               {outlineOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </div>
                        </div>
                     </div>
                  )}

                  {/* --- SUB-TEXT TAB --- */}
                  {activeTab === 'sub' && (
                     <div className="space-y-4 animate-fade-in">
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-1">Sub-Text Content</label>
                          <input type="text" value={subText} onChange={e=>setSubText(e.target.value)} placeholder="Type here..." className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-xs text-white outline-none focus:border-fuchsia-500"/>
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-400 flex justify-between">Font Size <span>{subSize}px</span></label>
                          <input type="range" min="10" max="48" value={subSize} onChange={e=>setSubSize(e.target.value)} className="w-full accent-fuchsia-500 mt-1"/>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                             <label className="text-[10px] text-gray-400 block mb-1">Font Family</label>
                             <select value={subFont} onChange={e=>setSubFont(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded p-1.5 text-[11px] text-white outline-none">
                                {fontOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                             </select>
                           </div>
                           <div>
                             <label className="text-[10px] text-gray-400 block mb-1">Format</label>
                             <div className="flex gap-1">
                                <button onClick={() => setSubWeight(subWeight === 'bold' ? 'normal' : 'bold')} className={`flex-1 p-1 rounded border text-xs font-bold ${subWeight === 'bold' ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-[#0f172a] border-gray-600 text-gray-400'}`}>B</button>
                                <button onClick={() => setSubStyle(subStyle === 'italic' ? 'normal' : 'italic')} className={`flex-1 p-1 rounded border text-xs italic ${subStyle === 'italic' ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-[#0f172a] border-gray-600 text-gray-400'}`}>I</button>
                             </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Text Color</label>
                            <input type="color" value={subColor} onChange={e=>setSubColor(e.target.value)} className="w-full h-8 rounded cursor-pointer bg-transparent border border-gray-600"/>
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Border (Outline)</label>
                            <select value={subOutline} onChange={e=>setSubOutline(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded p-1.5 text-[11px] text-white outline-none">
                               {outlineOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </div>
                        </div>
                     </div>
                  )}

                  {/* --- BOX TAB --- */}
                  {activeTab === 'box' && (
                     <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Box Background</label>
                            <select value={boxBg} onChange={e=>setBoxBg(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded p-1.5 text-[11px] text-white outline-none">
                               <option value="rgba(0, 0, 0, 0.5)">Dark Glass</option>
                               <option value="rgba(255, 255, 255, 0.5)">Light Glass</option>
                               <option value="transparent">Transparent</option>
                               <option value="#000000">Solid Black</option>
                               <option value="#ffffff">Solid White</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Box Border</label>
                            <select value={boxBorder} onChange={e=>setBoxBorder(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded p-1.5 text-[11px] text-white outline-none">
                               <option value="none">No Border</option>
                               <option value="2px solid white">Solid White</option>
                               <option value="2px solid black">Solid Black</option>
                               <option value="2px dashed #d946ef">Dashed Pink</option>
                               <option value="2px solid #fbbf24">Solid Gold</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-400 flex justify-between">Corner Sharpness (Radius) <span>{boxRadius}px</span></label>
                          <input type="range" min="0" max="50" value={boxRadius} onChange={e=>setBoxRadius(e.target.value)} className="w-full accent-fuchsia-500 mt-1"/>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 flex justify-between">Inside Spacing (Padding) <span>{boxPadding}px</span></label>
                          <input type="range" min="0" max="40" value={boxPadding} onChange={e=>setBoxPadding(e.target.value)} className="w-full accent-fuchsia-500 mt-1"/>
                        </div>
                     </div>
                  )}
               </div>
             </div>
           )}
        </div>

        {/* CENTER: THE PRO CANVAS */}
        <div className="flex-1 bg-[#0f172a] rounded-xl border border-gray-700 shadow-inner flex flex-col relative overflow-hidden">
           <div className="absolute top-3 left-3 z-10 bg-black/80 px-4 py-1.5 rounded-full text-xs text-white border border-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse"></span> Visual Editor
           </div>

           <div className="flex-1 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5" onMouseMove={handleMouseMove} onTouchMove={handleMouseMove}>
             {mediaPreview ? (
               <div ref={imageContainerRef} className="relative max-w-full max-h-full shadow-2xl border-4 border-gray-800 rounded-lg select-none">
                 <img src={mediaPreview} alt="Base" className="max-w-full max-h-[70vh] object-contain pointer-events-none" />

                 {/* ADVANCED STICKER ELEMENT */}
                 <div 
                   onMouseDown={handleDragStart} onTouchStart={handleDragStart}
                   style={{ 
                     top: `${stickerPos.y}%`, left: `${stickerPos.x}%`, width: `${stickerWidth}px`, 
                     transform: 'translate(-50%, -50%)', cursor: isDragging ? 'grabbing' : 'grab',
                     background: boxBg, border: boxBorder, borderRadius: `${boxRadius}px`, padding: `${boxPadding}px`,
                     backdropFilter: boxBg.includes('rgba') ? 'blur(6px)' : 'none',
                   }}
                   className="absolute flex flex-col items-center justify-center transition-shadow z-20 group hover:ring-2 hover:ring-fuchsia-500 shadow-lg"
                 >
                   {/* DYNAMIC LINE 1: NAME */}
                   <div 
                     style={{ 
                        color: nameColor, fontFamily: nameFont, fontWeight: nameWeight, fontStyle: nameStyle, fontSize: `${nameSize}px`,
                        WebkitTextStroke: nameOutline !== 'none' ? `1px ${nameOutline}` : 'none',
                        textShadow: nameOutline === 'none' && nameColor === '#ffffff' ? '1px 1px 4px rgba(0,0,0,0.8)' : 'none',
                        lineHeight: '1.2'
                     }}
                     className="text-center w-full break-words"
                   >
                      {nameText}
                   </div>
                   
                   {/* DYNAMIC LINE 2: SUB-TEXT */}
                   {subText && (
                     <div 
                       style={{ 
                          color: subColor, fontFamily: subFont, fontWeight: subWeight, fontStyle: subStyle, fontSize: `${subSize}px`,
                          WebkitTextStroke: subOutline !== 'none' ? `0.5px ${subOutline}` : 'none',
                          marginTop: '4px', lineHeight: '1.2'
                       }}
                       className="text-center w-full break-words opacity-90"
                     >
                        {subText}
                     </div>
                   )}
                   
                   {/* RESIZE DOT */}
                   <div onMouseDown={handleResizeStart} onTouchStart={handleResizeStart} className="absolute -bottom-2 -right-2 w-6 h-6 bg-white border-2 border-fuchsia-600 rounded-full cursor-nwse-resize opacity-0 group-hover:opacity-100 shadow-xl transition-opacity flex items-center justify-center z-30">
                     <span className="text-[10px] text-fuchsia-600">⤡</span>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="text-gray-600 text-center flex flex-col items-center">
                 <span className="text-6xl mb-4 opacity-50">🖼️</span>
                 <p className="font-bold">Canvas is Empty</p>
                 <p className="text-xs mt-2">Upload a Base Image from the left panel.</p>
               </div>
             )}
           </div>
        </div>

        {/* RIGHT: LIVE LOGS */}
        <div className="w-[280px] bg-[#1e293b] rounded-xl border border-gray-700 shadow-md flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-700 bg-[#0f172a] font-bold text-white text-sm">
            📡 Delivery Logs
          </div>

          {campaignState !== 'idle' && (
             <div className="p-3 bg-[#0f172a] border-b border-gray-700">
               <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2"><div className="bg-fuchsia-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div></div>
               <p className="text-[10px] text-gray-400 text-center flex justify-between">
                 <span className="text-green-400">Sent: {stats.sent}</span>
                 <span className="text-red-400">Failed: {stats.failed}</span>
               </p>
             </div>
          )}

          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {logs.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                  <span className="text-3xl mb-2">⏳</span>
                  <span className="text-xs">Logs appear here</span>
               </div>
            ) : logs.map(log => (
               <div key={log.id} className="bg-[#0f172a] p-2 rounded-lg border border-gray-700/50 text-xs animate-fade-in">
                  <div className="flex justify-between font-bold mb-1">
                     <span className="text-gray-300 truncate w-[140px]" title={log.to}>{log.to}</span>
                     <span className={log.status.includes('Sent') ? 'text-green-400' : 'text-red-400'}>{log.status}</span>
                  </div>
               </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PersonalizedSender;
