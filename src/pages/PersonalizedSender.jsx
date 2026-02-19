import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';

const PersonalizedSender = () => {
  // --- States ---
  const [contacts, setContacts] = useState([]);
  const [showContactPreview, setShowContactPreview] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [waStatus, setWaStatus] = useState('checking'); // Real API Status
  
  // --- Pro Studio Typography States ---
  const [stickerText, setStickerText] = useState("{{Name}}");
  const [subText, setSubText] = useState("सपरिवार आमंत्रित हैं");
  
  // Font Styling
  const [fontFamily, setFontFamily] = useState("Arial, sans-serif");
  const [fontWeight, setFontWeight] = useState("bold");
  const [fontStyle, setFontStyle] = useState("normal");
  
  // Colors & Borders
  const [textColor, setTextColor] = useState("#ffffff");
  const [textOutline, setTextOutline] = useState("none"); // Font Border
  const [bgColor, setBgColor] = useState("rgba(0, 0, 0, 0.4)");
  const [boxBorder, setBoxBorder] = useState("none"); 
  
  // Dimensions
  const [stickerWidth, setStickerWidth] = useState(300);
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

  // 2. Smart Excel Scanner with Preview
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
           setShowContactPreview(true); // Automatically open preview
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
      setStickerWidth(Math.max(120, Math.min(newWidth, rect.width * 0.9))); 
    }
  };

  // 4. REAL API Campaign Trigger
  const startBlast = async () => {
    if (waStatus !== 'connected') return alert("❌ ERROR: WhatsApp is Disconnected! Please configure your API Provider in 'Advanced Settings' before starting.");
    if (!mediaFile) return alert("❌ Please upload a Base Image to personalize!");
    if (contacts.length === 0) return alert("❌ Please upload Contacts List!");
    
    setCampaignState('running'); stopRef.current = false; setLogs([]); setProgress(0);
    let currentSent = 0, currentFailed = 0;

    for (let i = 0; i < contacts.length; i++) {
      if (stopRef.current) { setCampaignState('stopped'); break; }
      const contact = contacts[i];
      setLogs(prev => [{ id: i + 1, to: contact.name, status: "Sending..." }, ...prev]);

      try {
        const res = await fetch(`${API_URL}/send-message`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email, phone: contact.phone, message: "Here is your personalized invite!", media_type: 'image',
            sticker_config: { 
               name_text: contact.name, sub_text: subText, color: textColor, bg_color: bgColor, 
               font: fontFamily, weight: fontWeight, style: fontStyle, text_outline: textOutline,
               width: stickerWidth, border: boxBorder, x: stickerPos.x, y: stickerPos.y 
            }
          })
        });

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
      
      {/* STUDIO HEADER */}
      <div className="flex justify-between items-center bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-xl mb-4">
         <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
               ✨ Pro Graphic Studio
               {waStatus === 'checking' && <span className="text-xs text-gray-400">Checking API...</span>}
               {waStatus === 'connected' && <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded text-[10px] text-green-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> API Linked</span>}
               {waStatus === 'disconnected' && <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-[10px] text-red-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> API Disconnected</span>}
            </h2>
            <p className="text-gray-400 text-xs mt-1">Design once, generate hundreds of personalized images automatically.</p>
         </div>
         <div className="flex items-center gap-4">
            <div className="bg-[#0f172a] px-3 py-1.5 rounded-lg border border-gray-600 flex items-center gap-2">
              <span className="text-gray-400 text-xs">Delay:</span>
              <input type="number" value={delay} onChange={e => setDelay(e.target.value)} className="w-8 bg-transparent text-white font-bold text-center outline-none text-sm" />
            </div>
            {campaignState === 'running' ? (
               <button onClick={() => stopRef.current = true} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all">⏹ Stop Blast</button>
            ) : (
               <button onClick={startBlast} disabled={contacts.length === 0 || !mediaPreview || waStatus !== 'connected'} className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:scale-105 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  🚀 Start Auto-Blast
               </button>
            )}
         </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        
        {/* LEFT: ADVANCED TOOLS PANEL */}
        <div className="w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar pb-4">
           
           {/* Step 1: Base Image */}
           <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-md flex-shrink-0">
             <h3 className="text-white font-bold text-sm mb-2">1. Base Image</h3>
             <div className="relative group cursor-pointer border-2 border-dashed border-gray-600 rounded-lg p-3 text-center hover:border-fuchsia-500 bg-[#0f172a] transition-all">
               <input type="file" accept="image/*" onChange={handleMediaUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
               <p className="text-2xl mb-1">🖼️</p>
               <p className="text-[10px] text-gray-400 truncate px-2">{mediaFile ? mediaFile.name : "Upload Blank Card/Invite"}</p>
             </div>
           </div>

           {/* Step 2: Excel Data & Preview */}
           <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-md flex-shrink-0">
             <h3 className="text-white font-bold text-sm mb-2">2. Audience List</h3>
             <div className="relative group cursor-pointer border-2 border-dashed border-gray-600 rounded-lg p-3 text-center hover:border-fuchsia-500 bg-[#0f172a] transition-all">
               <input type="file" accept=".xlsx, .csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
               <p className="text-xl mb-1">📊</p>
               <p className="text-[10px] text-gray-400">{contacts.length > 0 ? `Update Excel File` : "Upload Excel File"}</p>
             </div>
             
             {/* CONTACT PREVIEW LIST FIX */}
             {contacts.length > 0 && (
                <div className="mt-3 animate-fade-in-up">
                  <div className="flex justify-between items-center bg-green-500/10 border border-green-500/30 px-3 py-2 rounded-lg">
                    <span className="text-xs font-bold text-green-400">✅ {contacts.length} Ready</span>
                    <button onClick={() => setShowContactPreview(!showContactPreview)} className="text-[10px] text-fuchsia-400 hover:text-white font-bold bg-fuchsia-500/10 px-2 py-1 rounded">
                      {showContactPreview ? 'Hide ▲' : 'View ▼'}
                    </button>
                  </div>
                  {showContactPreview && (
                    <div className="max-h-32 mt-2 overflow-y-auto bg-[#0f172a] border border-gray-700 rounded-lg p-2 space-y-1 shadow-inner custom-scrollbar">
                      {contacts.map((c, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] border-b border-gray-800 pb-1">
                          <span className="text-gray-300 font-bold truncate w-1/2 pr-2" title={c.name}>{c.name}</span>
                          <span className="text-fuchsia-400 font-mono bg-fuchsia-500/10 px-1.5 py-0.5 rounded flex-shrink-0">{c.phone}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
             )}
           </div>

           {/* Step 3: Advanced Typography Controls */}
           <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-md flex-1">
             <h3 className="text-white font-bold text-sm mb-3">3. Pro Text Settings</h3>
             
             <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-400 mb-1 block">Sub-Text (Line 2)</label>
                  <input type="text" value={subText} onChange={e => setSubText(e.target.value)} placeholder="e.g. सपरिवार आमंत्रित हैं" className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-xs text-white outline-none focus:border-fuchsia-500"/>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 mb-1 block">Font Style</label>
                    <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded p-1.5 text-xs text-white outline-none">
                       <option value="Arial, sans-serif">Modern (Arial)</option>
                       <option value="'Times New Roman', serif">Classic (Times)</option>
                       <option value="'Courier New', monospace">Typewriter</option>
                       <option value="Georgia, serif">Elegant</option>
                       <option value="'Impact', serif">Heavy (Impact)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 mb-1 block">Text Format</label>
                    <div className="flex gap-1">
                       <button onClick={() => setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold')} className={`flex-1 p-1.5 rounded border text-xs font-bold ${fontWeight === 'bold' ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-[#0f172a] border-gray-600 text-gray-400'}`}>B</button>
                       <button onClick={() => setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')} className={`flex-1 p-1.5 rounded border text-xs italic ${fontStyle === 'italic' ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-[#0f172a] border-gray-600 text-gray-400'}`}>I</button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 mb-1 block">Font Color</label>
                    <div className="flex items-center gap-2 bg-[#0f172a] p-1 rounded border border-gray-600">
                      <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"/>
                      <span className="text-[10px] text-gray-300">{textColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 mb-1 block">Font Border (Outline)</label>
                    <select value={textOutline} onChange={e => setTextOutline(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded p-1.5 text-xs text-white outline-none">
                       <option value="none">No Border</option>
                       <option value="#000000">Black Border</option>
                       <option value="#ffffff">White Border</option>
                       <option value="#ef4444">Red Border</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-gray-700 pt-3">
                   <div>
                      <label className="text-[10px] text-gray-400 mb-1 block">Box Background</label>
                      <select value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded p-1.5 text-[10px] text-white outline-none">
                         <option value="rgba(0, 0, 0, 0.4)">Dark Glass</option>
                         <option value="rgba(255, 255, 255, 0.4)">Light Glass</option>
                         <option value="transparent">Transparent</option>
                         <option value="#000000">Solid Black</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 mb-1 block">Box Border</label>
                      <select value={boxBorder} onChange={e => setBoxBorder(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded p-1.5 text-[10px] text-white outline-none">
                         <option value="none">No Border</option>
                         <option value="2px solid white">Solid White</option>
                         <option value="2px dashed #d946ef">Dashed Pink</option>
                         <option value="2px solid gold">Solid Gold</option>
                      </select>
                    </div>
                </div>

             </div>
           </div>
        </div>

        {/* CENTER: THE PRO CANVAS */}
        <div className="flex-1 bg-[#0f172a] rounded-xl border border-gray-700 shadow-inner flex flex-col relative overflow-hidden">
           <div className="absolute top-3 left-3 z-10 bg-black/80 px-4 py-1.5 rounded-full text-xs text-white border border-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse"></span> Canvas Area
           </div>

           <div className="flex-1 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5" onMouseMove={handleMouseMove} onTouchMove={handleMouseMove}>
             {mediaPreview ? (
               <div ref={imageContainerRef} className="relative max-w-full max-h-full shadow-2xl border-4 border-gray-800 rounded-lg select-none">
                 <img src={mediaPreview} alt="Base" className="max-w-full max-h-[70vh] object-contain pointer-events-none" />

                 {/* PRO STICKER ELEMENT */}
                 <div 
                   onMouseDown={handleDragStart} onTouchStart={handleDragStart}
                   style={{ 
                     top: `${stickerPos.y}%`, left: `${stickerPos.x}%`, width: `${stickerWidth}px`, 
                     transform: 'translate(-50%, -50%)', cursor: isDragging ? 'grabbing' : 'grab',
                     background: bgColor, border: boxBorder, 
                     backdropFilter: bgColor.includes('rgba') ? 'blur(6px)' : 'none',
                   }}
                   className="absolute flex flex-col items-center justify-center transition-shadow z-20 rounded-xl group hover:ring-2 hover:ring-fuchsia-500"
                 >
                   <div 
                     style={{ 
                        color: textColor, fontFamily: fontFamily, fontWeight: fontWeight, fontStyle: fontStyle,
                        WebkitTextStroke: textOutline !== 'none' ? `1px ${textOutline}` : 'none',
                        textShadow: textOutline === 'none' && textColor === '#ffffff' ? '1px 1px 4px rgba(0,0,0,0.8)' : 'none'
                     }}
                     className="text-3xl tracking-wide text-center pt-3 pb-1 px-4 w-full truncate"
                   >
                      {stickerText}
                   </div>
                   
                   {subText && (
                     <div 
                       style={{ 
                          color: textColor, fontFamily: fontFamily, fontStyle: fontStyle,
                          WebkitTextStroke: textOutline !== 'none' ? `0.5px ${textOutline}` : 'none',
                       }}
                       className="text-sm font-medium text-center pb-3 pt-1 px-4 w-full break-words opacity-90"
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
        <div className="w-64 bg-[#1e293b] rounded-xl border border-gray-700 shadow-md flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-700 bg-[#0f172a] font-bold text-white text-sm">
            📡 Delivery Logs
          </div>

          {/* Progress Mini */}
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
                     <span className="text-gray-300 truncate w-24" title={log.to}>{log.to}</span>
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
