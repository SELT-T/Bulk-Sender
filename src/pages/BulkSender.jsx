import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';

const BulkSender = () => {
  // --- States ---
  const [contacts, setContacts] = useState([]);
  const [showContactPreview, setShowContactPreview] = useState(false);
  
  const [message, setMessage] = useState("Hello {{Name}}, here is your file!");
  const [file, setFile] = useState(null); 
  const [media, setMedia] = useState(null); 
  const [mediaPreview, setMediaPreview] = useState(null);
  
  // --- Sticker States (Only for Images) ---
  const [showSticker, setShowSticker] = useState(false);
  const [stickerText, setStickerText] = useState("{{Name}}");
  const [subText, setSubText] = useState("सपरिवार आमंत्रित हैं");
  const [stickerColor, setStickerColor] = useState("#ffffff");
  const [stickerPos, setStickerPos] = useState({ x: 50, y: 50 }); 
  const [isDragging, setIsDragging] = useState(false);
  
  // --- Campaign Control States ---
  const [campaignState, setCampaignState] = useState('idle'); // idle, running, paused, stopped, completed
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ sent: 0, failed: 0, total: 0 });
  const [delay, setDelay] = useState(2);
  const [waStatus, setWaStatus] = useState('connected'); // Simulated Status

  // Refs for async loop control
  const pauseRef = useRef(false);
  const stopRef = useRef(false);
  const imageContainerRef = useRef(null);

  // 1. Handle ANY Media/File Upload (Images, Videos, Docs, APKs)
  const handleMediaUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setMedia(uploadedFile);
      // Only create image preview if it's actually an image
      if (uploadedFile.type.startsWith('image/')) {
        setMediaPreview(URL.createObjectURL(uploadedFile));
        setShowSticker(true);
      } else {
        setMediaPreview(null);
        setShowSticker(false); // Disable sticker for non-images
      }
    }
  };

  // 2. Smart Excel Scanner
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" }); 
        
        if (data.length === 0) return alert("❌ Your Excel file is empty!");

        const formattedContacts = data.map((row) => {
          let phoneVal = '';
          let nameVal = 'Guest';
          const keys = Object.keys(row);

          keys.forEach(key => {
            const lowerKey = key.toLowerCase();
            if (lowerKey.includes('phone') || lowerKey.includes('mob') || lowerKey.includes('num') || lowerKey.includes('contact') || lowerKey.includes('whatsapp') || lowerKey.includes('मोबा') || lowerKey.includes('फोन') || lowerKey.includes('नंबर')) {
              if (!phoneVal && row[key]) phoneVal = String(row[key]).trim();
            }
            if (lowerKey.includes('name') || lowerKey.includes('customer') || lowerKey.includes('नाम') || lowerKey.includes('सदस्य') || lowerKey.includes('पार्षद')) {
              if (nameVal === 'Guest' && row[key]) nameVal = String(row[key]).trim();
            }
          });

          if (!phoneVal) {
             keys.forEach(key => {
                const val = String(row[key]).trim();
                const numbersOnly = val.replace(/\D/g, '');
                if (numbersOnly.length >= 9 && numbersOnly.length <= 14 && !phoneVal) phoneVal = val;
                else if (nameVal === 'Guest' && val.length > 2 && isNaN(val)) nameVal = val;
             });
          }
          return { phone: phoneVal, name: nameVal };
        }).filter(c => c.phone && c.phone.length > 5); 

        if (formattedContacts.length === 0) alert("❌ Could not extract any numbers!");
        else {
           setContacts(formattedContacts);
           setStats({ sent: 0, failed: 0, total: formattedContacts.length });
           setShowContactPreview(true);
        }
      } catch (error) {
         alert("❌ Error reading the Excel file.");
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  // 3. Drag Logic for Image Sticker
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0].clientX;
    const clientY = e.clientY || e.touches?.[0].clientY;
    let x = ((clientX - rect.left) / rect.width) * 100;
    let y = ((clientY - rect.top) / rect.height) * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    setStickerPos({ x, y });
  };

  // 4. CAMPAIGN CONTROLS
  const startCampaign = async () => {
    if (contacts.length === 0) return alert("❌ Please upload Contacts first!");
    
    setCampaignState('running');
    pauseRef.current = false;
    stopRef.current = false;
    setLogs([]);
    setProgress(0);
    let currentSent = 0;
    let currentFailed = 0;

    const API_URL = "https://reachify-api.selt-3232.workers.dev";
    const user = JSON.parse(localStorage.getItem('reachify_user')) || { email: 'demo@reachify.com' };

    for (let i = 0; i < contacts.length; i++) {
      // Check Stop
      if (stopRef.current) {
        setCampaignState('stopped');
        break;
      }
      
      // Check Pause
      while (pauseRef.current) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (stopRef.current) break; // Allow stopping while paused
      }
      if (stopRef.current) break;

      const contact = contacts[i];
      const personalizedMsg = message.replace(/{{Name}}/gi, contact.name);

      const newLog = { id: i + 1, to: contact.phone, status: "Sending...", name: contact.name };
      setLogs(prev => [newLog, ...prev]);

      try {
        const res = await fetch(`${API_URL}/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            phone: contact.phone,
            message: personalizedMsg,
            media_type: media?.type || 'text',
            sticker_config: (showSticker && media?.type.startsWith('image')) ? {
              name_text: contact.name, sub_text: subText, color: stickerColor, x: stickerPos.x, y: stickerPos.y,
            } : null
          })
        });

        if (res.ok) {
          currentSent++;
          setLogs(prev => prev.map(l => l.id === i + 1 ? { ...l, status: "✅ Sent" } : l));
        } else {
          currentFailed++;
          setLogs(prev => prev.map(l => l.id === i + 1 ? { ...l, status: "❌ Failed" } : l));
        }
      } catch (err) {
        currentFailed++;
        setLogs(prev => prev.map(l => l.id === i + 1 ? { ...l, status: "⚠️ Error" } : l));
      }
      
      setStats({ sent: currentSent, failed: currentFailed, total: contacts.length });
      setProgress(Math.round(((i + 1) / contacts.length) * 100));

      // Wait for delay before next message (unless it's the last one)
      if (i < contacts.length - 1) {
        await new Promise(r => setTimeout(r, delay * 1000));
      }
    }
    
    if (!stopRef.current) {
       setCampaignState('completed');
    }
  };

  const togglePause = () => {
    pauseRef.current = !pauseRef.current;
    setCampaignState(pauseRef.current ? 'paused' : 'running');
  };

  const stopCampaign = () => {
    stopRef.current = true;
    setCampaignState('stopped');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-6 max-w-7xl mx-auto p-2"
         onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp} onMouseLeave={handleMouseUp}>
      
      {/* HEADER WITH WHATSAPP STATUS */}
      <div className="flex justify-between items-center bg-[#1e293b] p-4 rounded-2xl border border-gray-700 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
             Bulk Sender Pro
             {waStatus === 'connected' ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-xs text-green-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> WhatsApp Connected
                </span>
             ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-xs text-red-400">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span> Disconnected
                </span>
             )}
          </h2>
          <p className="text-gray-400 text-sm mt-1">Send Messages, Images, Videos, PDFs, and Apps securely.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="bg-[#0f172a] px-3 py-2 rounded-lg border border-gray-600 flex items-center gap-2">
              <span className="text-gray-400 text-xs">Delay:</span>
              <input type="number" value={delay} onChange={e => setDelay(e.target.value)} className="w-10 bg-transparent text-white font-bold text-center outline-none text-sm" />
              <span className="text-gray-400 text-xs">sec</span>
           </div>

           {/* DYNAMIC CAMPAIGN CONTROLS */}
           {campaignState === 'idle' || campaignState === 'completed' || campaignState === 'stopped' ? (
             <button onClick={startCampaign} disabled={contacts.length === 0} className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all ${contacts.length === 0 ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:scale-105'}`}>
               {campaignState === 'completed' ? '🔄 Resend Campaign' : '▶ Start Campaign'}
             </button>
           ) : (
             <div className="flex gap-2">
               <button onClick={togglePause} className="px-5 py-2.5 rounded-xl font-bold text-white bg-yellow-600 hover:bg-yellow-500 shadow-lg transition-all flex items-center gap-2">
                 {campaignState === 'paused' ? '▶ Resume' : '⏸ Pause'}
               </button>
               <button onClick={stopCampaign} className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 shadow-lg transition-all flex items-center gap-2">
                 ⏹ Stop
               </button>
             </div>
           )}
        </div>
      </div>

      {/* PROGRESS BAR (Visible when running/paused/completed) */}
      {campaignState !== 'idle' && (
        <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-lg animate-fade-in">
          <div className="flex justify-between items-center mb-2">
             <span className="text-sm font-bold text-white">Campaign Progress</span>
             <span className="text-sm font-mono text-fuchsia-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
             <div className="bg-gradient-to-r from-fuchsia-600 to-purple-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 font-medium">
             <span className="text-green-400">✅ Sent: {stats.sent}</span>
             <span className="text-red-400">❌ Failed: {stats.failed}</span>
             <span className="text-blue-400">⏳ Pending: {stats.total - stats.sent - stats.failed}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden">
        
        {/* LEFT COLUMN: SETUP */}
        <div className="lg:col-span-3 space-y-4 overflow-y-auto pr-2 pb-10 custom-scrollbar">
          
          <div className="bg-[#1e293b] p-5 rounded-2xl border border-gray-700 shadow-lg">
            <h3 className="text-white font-bold mb-3">1. Upload Contacts</h3>
            <div className="relative group cursor-pointer border border-dashed border-gray-600 rounded-xl p-4 text-center hover:border-fuchsia-500 bg-[#0f172a] transition-all">
              <input type="file" accept=".xlsx, .csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <p className="text-2xl mb-1">📊</p>
              <p className="text-xs text-gray-300">{file ? file.name : "Upload Excel File"}</p>
            </div>

            {contacts.length > 0 && (
              <div className="mt-4 animate-fade-in-up">
                <div className="flex justify-between items-center mb-2 bg-green-500/10 border border-green-500/30 px-3 py-2 rounded-lg">
                  <span className="text-xs font-bold text-green-400">✅ {contacts.length} Ready</span>
                  <button onClick={() => setShowContactPreview(!showContactPreview)} className="text-xs text-fuchsia-400 hover:text-white font-bold">
                    {showContactPreview ? 'Hide List ▲' : 'View List ▼'}
                  </button>
                </div>
                {showContactPreview && (
                  <div className="max-h-64 overflow-y-auto bg-[#0f172a] border border-gray-700 rounded-lg p-3 space-y-2 shadow-inner scroll-smooth">
                    {contacts.map((c, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] border-b border-gray-800 pb-1">
                        <span className="text-gray-300 font-bold truncate w-1/2 pr-2" title={c.name}>{c.name}</span>
                        <span className="text-fuchsia-400 font-mono bg-fuchsia-500/10 px-2 py-0.5 rounded flex-shrink-0">{c.phone}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-[#1e293b] p-5 rounded-2xl border border-gray-700 shadow-lg">
             <h3 className="text-white font-bold mb-1">2. Upload File (Any)</h3>
             <p className="text-[10px] text-gray-400 mb-3">Images, Videos, PDFs, Audios, APKs allowed.</p>
             <div className="relative group cursor-pointer border border-dashed border-gray-600 rounded-xl p-4 text-center hover:border-fuchsia-500 bg-[#0f172a] transition-all">
                {/* Changed Accept to * to allow all files */}
                <input type="file" accept="*/*" onChange={handleMediaUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <p className="text-2xl mb-1">📎</p>
                <p className="text-xs text-gray-300 truncate px-2">{media ? media.name : "Click to attach file"}</p>
              </div>
          </div>

          <div className="bg-[#1e293b] p-5 rounded-2xl border border-gray-700 shadow-lg">
            <h3 className="text-white font-bold mb-3">3. Personalization</h3>
            
            <div className="flex items-center justify-between bg-[#0f172a] p-3 rounded-lg border border-gray-600 mb-3">
               <span className="text-sm text-white font-medium">✨ Image Sticker</span>
               <input 
                 type="checkbox" 
                 checked={showSticker} 
                 onChange={(e) => setShowSticker(e.target.checked)} 
                 disabled={!mediaPreview} // Disabled if not an image
                 className="w-5 h-5 accent-fuchsia-500 disabled:opacity-50" 
               />
            </div>
            {!mediaPreview && <p className="text-[10px] text-yellow-500 mb-2">Stickers only work on Images.</p>}

            {showSticker && mediaPreview && (
              <div className="space-y-3 mb-4 p-3 border border-fuchsia-500/30 bg-fuchsia-500/5 rounded-lg animate-fade-in">
                 <div>
                   <label className="text-[10px] text-gray-400">Sub-text (Niche wali line)</label>
                   <input type="text" value={subText} onChange={(e) => setSubText(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-xs text-white outline-none mt-1"/>
                 </div>
                 <div>
                   <label className="text-[10px] text-gray-400 block mb-1">Text Color</label>
                   <div className="flex items-center gap-2">
                     <input type="color" value={stickerColor} onChange={(e) => setStickerColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"/>
                     <span className="text-xs text-gray-300">{stickerColor}</span>
                   </div>
                 </div>
              </div>
            )}

            <label className="text-xs text-gray-400 mb-1 block">WhatsApp Message Text</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-24 bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white text-sm outline-none focus:border-fuchsia-500 resize-none"
              placeholder="Message..."
            ></textarea>
          </div>
        </div>

        {/* MIDDLE COLUMN: CANVAS EDITOR / FILE PREVIEW */}
        <div className="lg:col-span-5 bg-[#0f172a] rounded-2xl border border-gray-700 shadow-lg flex flex-col relative overflow-hidden">
           <div className="absolute top-4 left-4 z-10 bg-black/70 px-4 py-1.5 rounded-full text-xs text-white border border-white/10 flex items-center gap-2 shadow-lg">
              <span className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></span> Live File Preview
           </div>
           
           <div 
             className="flex-1 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10"
             onMouseMove={handleMouseMove}
             onTouchMove={handleMouseMove}
           >
             {media ? (
               <div 
                 ref={imageContainerRef}
                 className="relative max-w-full max-h-full shadow-2xl border-2 border-dashed border-gray-600 rounded-lg overflow-hidden select-none"
               >
                 {mediaPreview ? (
                    <img src={mediaPreview} alt="Preview" className="max-w-full max-h-[65vh] object-contain pointer-events-none cursor-crosshair" />
                 ) : (
                    <div className="w-64 h-64 bg-gray-800 flex items-center justify-center text-gray-300 flex-col px-6 text-center rounded-xl">
                       <span className="text-6xl mb-4">
                         {media.type.startsWith('video') ? '🎥' : 
                          media.type.startsWith('audio') ? '🎵' : 
                          media.type.includes('pdf') ? '📕' : 
                          media.name.endsWith('.apk') ? '🤖' : '📁'}
                       </span>
                       <span className="font-bold text-sm truncate w-full">{media.name}</span>
                       <span className="text-xs text-gray-500 mt-2">{(media.size / (1024*1024)).toFixed(2)} MB</span>
                       <span className="text-[10px] text-fuchsia-400 mt-4">File is ready to send</span>
                    </div>
                 )}

                 {/* DRAGGABLE DOUBLE-LINE STICKER (Only for Images) */}
                 {showSticker && mediaPreview && (
                   <div 
                     onMouseDown={handleMouseDown}
                     onTouchStart={handleMouseDown}
                     style={{ 
                       top: `${stickerPos.y}%`, left: `${stickerPos.x}%`, transform: 'translate(-50%, -50%)', cursor: isDragging ? 'grabbing' : 'grab',
                       color: stickerColor, textShadow: stickerColor === '#ffffff' ? '1px 1px 4px rgba(0,0,0,0.8)' : '1px 1px 4px rgba(255,255,255,0.5)'
                     }}
                     className="absolute text-center hover:scale-105 transition-transform z-20"
                   >
                     <div className="font-bold text-2xl tracking-wide whitespace-nowrap bg-black/20 px-4 pt-2 pb-1 rounded-t-lg backdrop-blur-sm border border-white/20 border-b-0">
                        {stickerText}
                     </div>
                     {subText && (
                       <div className="text-sm font-medium whitespace-nowrap bg-black/20 px-4 pb-2 pt-1 rounded-b-lg backdrop-blur-sm border border-white/20 border-t-0">
                          {subText}
                       </div>
                     )}
                     {isDragging && <div className="absolute -inset-2 border-2 border-dashed border-fuchsia-500 rounded-xl"></div>}
                   </div>
                 )}
               </div>
             ) : (
               <div className="text-gray-500 text-center">
                 <p className="text-5xl mb-4 opacity-50">📤</p>
                 <p>Upload any file to preview</p>
               </div>
             )}
           </div>
           
           {/* Position Indicator */}
           {showSticker && mediaPreview && (
             <div className="bg-[#1e293b] p-3 flex justify-between items-center text-xs text-gray-400 border-t border-gray-700">
                <span>Drag text to position.</span>
                <span className="font-mono bg-black/50 px-2 py-1 rounded">X: {Math.round(stickerPos.x)}% | Y: {Math.round(stickerPos.y)}%</span>
             </div>
           )}
        </div>

        {/* RIGHT COLUMN: SCROLLABLE LOGS */}
        <div className="lg:col-span-4 bg-[#1e293b] rounded-2xl border border-gray-700 shadow-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-700 bg-[#0f172a] font-bold text-white flex justify-between items-center">
            <span>📡 Action Logs</span>
            <div className="flex gap-2">
               <span className="text-[10px] bg-gray-800 px-2 py-1 rounded">Total: {stats.total}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar scroll-smooth">
            {logs.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center opacity-50 text-gray-500">
                  <span className="text-4xl mb-2">⏳</span>
                  <p className="text-sm">Activity will appear here</p>
               </div>
            ) : logs.map(log => (
               <div key={log.id} className="flex flex-col bg-[#0f172a] p-3 rounded-lg border border-gray-700/50 hover:border-gray-500 transition-colors animate-fade-in">
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-xs font-bold text-gray-300 truncate w-32" title={log.name}>{log.name}</span>
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        log.status.includes('Sent') ? 'bg-green-500/20 text-green-400' : 
                        log.status.includes('Failed') ? 'bg-red-500/20 text-red-400' : 
                        'bg-yellow-500/20 text-yellow-400'
                     }`}>
                       {log.status}
                     </span>
                  </div>
                  <span className="text-xs font-mono text-gray-500">{log.to}</span>
               </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BulkSender;
