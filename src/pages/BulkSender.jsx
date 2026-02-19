import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';

const BulkSender = () => {
  // --- States ---
  const [contacts, setContacts] = useState([]);
  const [message, setMessage] = useState("Hello {{Name}}, here is your invite!");
  const [file, setFile] = useState(null); // Excel File
  const [media, setMedia] = useState(null); // Image/Video/PDF
  const [mediaPreview, setMediaPreview] = useState(null);
  
  // --- Sticker Canvas States ---
  const [showSticker, setShowSticker] = useState(false);
  const [stickerText, setStickerText] = useState("{{Name}}");
  const [stickerPos, setStickerPos] = useState({ x: 50, y: 50 }); // Percentage based position
  const [isDragging, setIsDragging] = useState(false);
  
  // --- Sending States ---
  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState([]);
  const [delay, setDelay] = useState(2);

  const imageContainerRef = useRef(null);

  // 1. Handle Media Upload & Preview
  const handleMediaUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setMedia(uploadedFile);
      setMediaPreview(URL.createObjectURL(uploadedFile));
    }
  };

  // 2. Handle Excel Upload
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const formattedContacts = data.map(row => ({
        phone: row.Phone || row.Mobile || row.Number,
        name: row.Name || row.Customer || 'Valued Guest'
      })).filter(c => c.phone);

      setContacts(formattedContacts);
    };
    reader.readAsBinaryString(uploadedFile);
  };

  // 3. DRAG & DROP LOGIC (The Magic) 🖱️👆
  const handleMouseDown = (e) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0].clientX;
    const clientY = e.clientY || e.touches?.[0].clientY;

    // Calculate position in Percentage (%) to be responsive
    let x = ((clientX - rect.left) / rect.width) * 100;
    let y = ((clientY - rect.top) / rect.height) * 100;

    // Boundaries (0 to 100%)
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    setStickerPos({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 4. SENDING LOGIC (Using Coordinates)
  const startCampaign = async () => {
    if (contacts.length === 0) return alert("❌ Upload Excel First!");
    setIsSending(true);
    setLogs([]);

    const API_URL = "https://reachify-api.selt-3232.workers.dev";
    const user = JSON.parse(localStorage.getItem('reachify_user'));

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const personalizedMsg = message.replace(/{{Name}}/gi, contact.name);

      // Log Update
      const newLog = { id: i + 1, to: contact.phone, status: "Sending...", time: new Date().toLocaleTimeString() };
      setLogs(prev => [newLog, ...prev]);

      try {
        const res = await fetch(`${API_URL}/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user?.email || 'demo@reachify.com',
            phone: contact.phone,
            message: personalizedMsg,
            media_type: media?.type.split('/')[0] || 'text',
            // Sticker Data Bhej rahe hain Backend ko
            sticker_config: showSticker ? {
              text: contact.name, // Asli naam jayega
              x: stickerPos.x,    // Coordinate X
              y: stickerPos.y,    // Coordinate Y
              color: "#000000",   // Default Black (Future: Color Picker)
              size: 24            // Default Size
            } : null
          })
        });

        if (res.ok) {
          setLogs(prev => prev.map(l => l.id === i + 1 ? { ...l, status: "✅ Sent" } : l));
        } else {
          setLogs(prev => prev.map(l => l.id === i + 1 ? { ...l, status: "❌ Failed" } : l));
        }
      } catch (err) {
        setLogs(prev => prev.map(l => l.id === i + 1 ? { ...l, status: "⚠️ Error" } : l));
      }
      
      await new Promise(r => setTimeout(r, delay * 1000));
    }
    setIsSending(false);
    alert("Campaign Finished!");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-6 max-w-7xl mx-auto p-2"
         onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Advanced Campaign Manager</h2>
          <p className="text-gray-400 text-sm">Drag stickers, customize media, and blast.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-[#1e293b] px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-2">
              <span className="text-gray-400 text-sm">Delay:</span>
              <input type="number" value={delay} onChange={e => setDelay(e.target.value)} className="w-12 bg-transparent text-white font-bold text-center outline-none" />
              <span className="text-gray-400 text-sm">sec</span>
           </div>
           <button 
             onClick={startCampaign} 
             disabled={isSending || contacts.length === 0}
             className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${isSending ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:scale-105'}`}
           >
             {isSending ? '🚀 Sending...' : 'Start Campaign ▶'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden">
        
        {/* LEFT COLUMN: SETUP (3 Columns wide) */}
        <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2">
          
          {/* 1. Uploads */}
          <div className="bg-[#1e293b] p-5 rounded-2xl border border-gray-700 shadow-lg">
            <h3 className="text-white font-bold mb-3">1. Upload Data</h3>
            <div className="space-y-3">
              <div className="relative group cursor-pointer border border-dashed border-gray-600 rounded-xl p-4 text-center hover:border-fuchsia-500 bg-[#0f172a]">
                <input type="file" accept=".xlsx, .csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <p className="text-2xl mb-1">📊</p>
                <p className="text-xs text-gray-300">{file ? file.name : "Upload Excel"}</p>
              </div>
              <div className="relative group cursor-pointer border border-dashed border-gray-600 rounded-xl p-4 text-center hover:border-fuchsia-500 bg-[#0f172a]">
                <input type="file" accept="image/*, application/pdf, video/*" onChange={handleMediaUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <p className="text-2xl mb-1">🖼️</p>
                <p className="text-xs text-gray-300">{media ? media.name : "Upload Media"}</p>
              </div>
            </div>
            {contacts.length > 0 && <p className="text-xs text-green-400 mt-2">✅ {contacts.length} Contacts Ready</p>}
          </div>

          {/* 2. Message */}
          <div className="bg-[#1e293b] p-5 rounded-2xl border border-gray-700 shadow-lg">
            <h3 className="text-white font-bold mb-3">2. Message & Tools</h3>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-24 bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white text-sm outline-none focus:border-fuchsia-500 resize-none mb-3"
              placeholder="Message..."
            ></textarea>
            
            <div className="flex items-center justify-between bg-[#0f172a] p-3 rounded-lg border border-gray-600">
               <span className="text-sm text-white">Enable Sticker</span>
               <input type="checkbox" checked={showSticker} onChange={(e) => setShowSticker(e.target.checked)} className="w-5 h-5 accent-fuchsia-500" />
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: LIVE PREVIEW & EDITOR (5 Columns wide) */}
        <div className="lg:col-span-5 bg-[#0f172a] rounded-2xl border border-gray-700 shadow-lg flex flex-col relative overflow-hidden">
           <div className="absolute top-4 left-4 z-10 bg-black/50 px-3 py-1 rounded-full text-xs text-white">
              👁️ Live Preview Editor
           </div>
           
           <div 
             className="flex-1 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10"
             onMouseMove={handleMouseMove}
             onTouchMove={handleMouseMove}
           >
             {mediaPreview ? (
               <div 
                 ref={imageContainerRef}
                 className="relative max-w-full max-h-full shadow-2xl border-4 border-white/10 rounded-lg overflow-hidden cursor-crosshair select-none"
               >
                 {/* Main Image */}
                 {media?.type.startsWith('image') ? (
                    <img src={mediaPreview} alt="Preview" className="max-w-full max-h-[60vh] object-contain" />
                 ) : (
                    <div className="w-full h-64 bg-gray-800 flex items-center justify-center text-gray-400 flex-col">
                       <span className="text-4xl mb-2">📄</span>
                       <span>{media.name}</span>
                       <span className="text-xs mt-1">(PDF/Video Preview not supported for stickers yet)</span>
                    </div>
                 )}

                 {/* DRAGGABLE STICKER OVERLAY */}
                 {showSticker && media?.type.startsWith('image') && (
                   <div 
                     onMouseDown={handleMouseDown}
                     onTouchStart={handleMouseDown}
                     style={{ 
                       top: `${stickerPos.y}%`, 
                       left: `${stickerPos.x}%`,
                       transform: 'translate(-50%, -50%)',
                       cursor: isDragging ? 'grabbing' : 'grab'
                     }}
                     className="absolute bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg text-black font-bold shadow-xl border border-fuchsia-500 whitespace-nowrap z-20 hover:scale-105 transition-transform"
                   >
                     {stickerText}
                     {/* Resize Handle (Visual Only) */}
                     <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-fuchsia-500 rounded-full"></div>
                   </div>
                 )}
               </div>
             ) : (
               <div className="text-gray-500 text-center">
                 <p className="text-4xl mb-2">🖼️</p>
                 <p>Upload an image to start editing stickers</p>
               </div>
             )}
           </div>

           {/* Coordinates Display */}
           {showSticker && (
             <div className="bg-[#1e293b] p-2 text-center text-xs text-gray-400 border-t border-gray-700">
                Position: X: {Math.round(stickerPos.x)}% | Y: {Math.round(stickerPos.y)}%
             </div>
           )}
        </div>

        {/* RIGHT COLUMN: LOGS (4 Columns wide) */}
        <div className="lg:col-span-4 bg-[#1e293b] rounded-2xl border border-gray-700 shadow-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-700 bg-[#0f172a] font-bold text-white">
            📡 Sending Logs
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {logs.length === 0 ? (
               <p className="text-gray-500 text-sm text-center mt-10">Logs will appear here...</p>
            ) : logs.map(log => (
               <div key={log.id} className="flex justify-between items-center bg-[#0f172a] p-3 rounded border border-gray-700/50">
                  <span className="text-xs text-gray-400">#{log.id} {log.to}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${log.status.includes('Sent') ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {log.status}
                  </span>
               </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BulkSender;
