import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';

const BulkSender = () => {
  // --- Core States ---
  const [contacts, setContacts] = useState([]);
  const [showContactPreview, setShowContactPreview] = useState(false);
  const [countryCode, setCountryCode] = useState('91'); 
  const [message, setMessage] = useState("Hello {{Name}}, here is your file!");
  const [file, setFile] = useState(null); 
  const [media, setMedia] = useState(null); 
  const [mediaPreview, setMediaPreview] = useState(null);
  
  const [waStatus, setWaStatus] = useState('checking'); 
  const [connectionMode, setConnectionMode] = useState('api');
  
  // --- Advanced Studio States (Merged from Personalized Sender) ---
  const [showSticker, setShowSticker] = useState(false);
  const [activeTab, setActiveTab] = useState('name');

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
  const [subColor, setSubColor] = useState("#fbcfe8"); 
  const [subOutline, setSubOutline] = useState("none");
  const [subWeight, setSubWeight] = useState("normal");
  const [subStyle, setSubStyle] = useState("normal");

  // 3. Box Config
  const [boxBg, setBoxBg] = useState("rgba(0, 0, 0, 0.5)");
  const [boxBorder, setBoxBorder] = useState("none");
  const [boxRadius, setBoxRadius] = useState(12);
  const [boxPadding, setBoxPadding] = useState(16);
  
  // Placement
  const [stickerWidth, setStickerWidth] = useState(250); 
  const [stickerPos, setStickerPos] = useState({ x: 50, y: 70 }); 
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  // --- Campaign States ---
  const [campaignState, setCampaignState] = useState('idle'); 
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ sent: 0, failed: 0, total: 0 });
  
  // 🟢 DEFAULT TIME 10 
  const [delay, setDelay] = useState(10);

  const pauseRef = useRef(false);
  const stopRef = useRef(false);
  const imageContainerRef = useRef(null);
  
  const API_URL = "https://reachify-api.selt-3232.workers.dev";
  const WA_ENGINE_URL = "https://reachify-wa-engine.onrender.com"; 
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
    { label: "Stylish Script", value: "'Brush Script MT', cursive" },
    { label: "Devanagari (Mukta)", value: "'Mukta', sans-serif" },
    { label: "Devanagari (Kalam)", value: "'Kalam', cursive" },
    { label: "Devanagari (Poppins)", value: "'Poppins', sans-serif" }
  ];

  const outlineOptions = [
    { label: "No Outline", value: "none" },
    { label: "Black", value: "#000000" },
    { label: "White", value: "#ffffff" },
    { label: "Red", value: "#ef4444" },
    { label: "Blue", value: "#3b82f6" },
    { label: "Gold", value: "#fbbf24" },
    { label: "Fuchsia", value: "#d946ef" }
  ];

  useEffect(() => {
    let interval;
    const checkRealConnection = async () => {
      if (!user.email || user.email === 'demo@reachify.com') return setWaStatus('disconnected');
      const savedSettings = JSON.parse(localStorage.getItem('reachify_api_settings') || '{}');
      const mode = savedSettings.wa_connection_mode || 'api';
      setConnectionMode(mode);

      try {
        if (mode === 'web') {
           const res = await fetch(`${WA_ENGINE_URL}/api/wa-status`);
           const data = await res.json();
           if (data.status === 'connected') setWaStatus('connected');
           else setWaStatus('disconnected');
        } else {
           // 🟢 Agar BYOK model hai to API server check karega
           const res = await fetch(`${API_URL}/get-settings`, {
             method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email })
           });
           const data = await res.json();
           // Yahan hum local storage ka data bhi use kar sakte hain
           if (savedSettings.wa_access_token) setWaStatus('connected');
           else setWaStatus('disconnected');
        }
      } catch (err) {
        setWaStatus('sleeping'); 
      }
    };
    
    checkRealConnection();

    interval = setInterval(() => {
        const savedSettings = JSON.parse(localStorage.getItem('reachify_api_settings') || '{}');
        if (savedSettings.wa_connection_mode === 'web') fetch(`${WA_ENGINE_URL}/`).catch(() => {}); 
    }, 45000); 

    return () => clearInterval(interval);
  }, [user.email]);

  const handleMediaUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setMedia(uploadedFile);
      if (uploadedFile.type.startsWith('image/')) {
        setMediaPreview(URL.createObjectURL(uploadedFile));
        setShowSticker(true); // Auto-enable sticker for images
      } else {
        setMediaPreview(null);
        setShowSticker(false); // Disable for PDF/Video
      }
    }
  };

  const clearMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    setShowSticker(false);
  };

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
      } catch (error) { alert("❌ Error reading the Excel file."); }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const clearContacts = () => {
    setContacts([]);
    setFile(null);
    setShowContactPreview(false);
    setStats({ sent: 0, failed: 0, total: 0 });
  };

  const applyCountryCode = () => {
    if (!countryCode.trim()) return alert("❌ Please enter a country code (e.g., 91)");
    const code = countryCode.replace('+', '').trim();
    const updatedContacts = contacts.map(c => {
      let phone = String(c.phone).replace(/\D/g, ''); 
      if (phone.length === 10) phone = code + phone;
      else if (phone.length === 11 && phone.startsWith('0')) phone = code + phone.substring(1);
      return { ...c, phone: phone };
    });
    setContacts(updatedContacts);
    alert(`✅ Success! Country Code (+${code}) added to all numbers.`);
  };

  const handleDragStart = (e) => { if(!isResizing) setIsDragging(true); };
  const handleResizeStart = (e) => { e.stopPropagation(); setIsResizing(true); };
  const handleMouseUp = () => { setIsDragging(false); setIsResizing(false); };

  const handleMouseMove = (e) => {
    if ((!isDragging && !isResizing) || !imageContainerRef.current) return;
    if(e.touches && e.cancelable) e.preventDefault(); 

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
      setStickerWidth(Math.max(100, Math.min(newWidth, rect.width * 0.95))); 
    }
  };

  const generatePersonalizedImageBase64 = async (rawBase64, contactName) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(img, 0, 0, img.width, img.height);
            const containerWidth = imageContainerRef.current ? imageContainerRef.current.offsetWidth : 400;
            const scale = img.width / containerWidth;

            const x = (stickerPos.x / 100) * img.width;
            const y = (stickerPos.y / 100) * img.height;

            const textStr = nameText.replace(/{{Name}}/gi, contactName || '');
            const subTextStr = subText || '';

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const dynamicNameSize = Math.max(nameSize * scale * (stickerWidth/320), 16);
            const dynamicSubSize = Math.max(subSize * scale * (stickerWidth/320), 10);
            const dynamicPadding = boxPadding * scale;
            const dynamicRadius = boxRadius * scale;

            ctx.font = `${nameWeight} ${dynamicNameSize}px ${nameFont}`;
            const tWidth1 = ctx.measureText(textStr).width;
            ctx.font = `${subWeight} ${dynamicSubSize}px ${subFont}`;
            const tWidth2 = subTextStr ? ctx.measureText(subTextStr).width : 0;

            const boxW = Math.max(tWidth1, tWidth2) + (dynamicPadding * 4);
            const boxH = subTextStr ? (dynamicNameSize + dynamicSubSize + (dynamicPadding * 3)) : (dynamicNameSize + (dynamicPadding * 2));

            if (boxBg && boxBg !== 'transparent') {
                ctx.fillStyle = boxBg;
                ctx.beginPath();
                ctx.roundRect(x - boxW/2, y - boxH/2, boxW, boxH, dynamicRadius);
                ctx.fill();
            }

            if (boxBorder && boxBorder !== 'none') {
                if (boxBorder.includes('fuchsia')) ctx.strokeStyle = '#d946ef';
                else if (boxBorder.includes('gold')) ctx.strokeStyle = 'gold';
                else if (boxBorder.includes('black')) ctx.strokeStyle = 'black';
                else ctx.strokeStyle = 'white';
                ctx.lineWidth = 3 * scale;
                if (boxBorder.includes('dashed')) ctx.setLineDash([8*scale, 6*scale]);
                ctx.beginPath();
                ctx.roundRect(x - boxW/2, y - boxH/2, boxW, boxH, dynamicRadius);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            if (subTextStr) {
                ctx.fillStyle = subColor;
                ctx.font = `${subStyle} ${subWeight} ${dynamicSubSize}px ${subFont}`;
                if (subOutline !== 'none') {
                   ctx.strokeStyle = subOutline;
                   ctx.lineWidth = 2 * scale;
                   ctx.strokeText(subTextStr, x, y + dynamicNameSize/2 + dynamicPadding/2);
                }
                ctx.fillText(subTextStr, x, y + dynamicNameSize/2 + dynamicPadding/2);
            }

            ctx.fillStyle = nameColor;
            ctx.font = `${nameStyle} ${nameWeight} ${dynamicNameSize}px ${nameFont}`;
            
            if (nameOutline !== 'none') {
                ctx.strokeStyle = nameOutline;
                ctx.lineWidth = 3 * scale;
                ctx.strokeText(textStr, x, subTextStr ? y - dynamicSubSize/2 : y);
            }
            ctx.fillText(textStr, x, subTextStr ? y - dynamicSubSize/2 : y);

            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => resolve(rawBase64); 
        img.src = rawBase64;
    });
  };

  const waitWithCheck = async (ms) => {
    const start = Date.now();
    while (Date.now() - start < ms) {
      if (stopRef.current) throw new Error('Stopped');
      if (pauseRef.current) {
        await new Promise(r => setTimeout(r, 500));
        continue;
      }
      await new Promise(r => setTimeout(r, 100));
    }
  };

  const startCampaign = async () => {
    if (contacts.length === 0) return alert("❌ Please upload Contacts first!");
    
    // 🟢 FETCH CURRENT SETTINGS FOR BYOK (Bring Your Own Key)
    const savedSettings = JSON.parse(localStorage.getItem('reachify_api_settings') || '{}');
    const waProvider = savedSettings.wa_provider || 'meta';
    const waInstanceId = savedSettings.wa_instance_id || '';
    const waToken = savedSettings.wa_access_token || '';

    setCampaignState('running');
    pauseRef.current = false;
    stopRef.current = false;
    setLogs([]);
    setProgress(0);
    let currentSent = 0;
    let currentFailed = 0;
    
    let messagesProcessed = 0;                      
    let nextPauseTarget = Math.floor(Math.random() * (30 - 20 + 1) + 20); 
    const BATCH_PAUSE_MS = 30000;                  

    let rawBase64MediaData = null;
    let mimeType = null;
    let originalFileName = null;

    if (media) {
       try {
          const reader = new FileReader();
          rawBase64MediaData = await new Promise((resolve, reject) => {
              reader.onload = () => resolve(reader.result);
              reader.onerror = error => reject(error);
              reader.readAsDataURL(media); 
          });
          mimeType = media.type;
          originalFileName = media.name;
       } catch (e) {
          alert("❌ Error processing the media file.");
          setCampaignState('stopped');
          return;
       }
    }

    for (let i = 0; i < contacts.length; i++) {
      if (stopRef.current) { setCampaignState('stopped'); break; }
      while (pauseRef.current) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (stopRef.current) break; 
      }
      if (stopRef.current) break;

      const contact = contacts[i];
      const personalizedMsg = message.replace(/{{Name}}/gi, contact.name);

      const newLog = { id: i + 1, to: contact.phone, status: "Sending...", name: contact.name };
      setLogs(prev => [newLog, ...prev]);

      let isMessageSuccessful = false; 

      try {
        let res;
        let finalMediaToSend = rawBase64MediaData;
        
        // 🔥 FIX APPLIED HERE: Ab Canvas dono mode (Web aur API) mein generate hoga!
        if (showSticker && mimeType && mimeType.startsWith('image/')) {
            finalMediaToSend = await generatePersonalizedImageBase64(rawBase64MediaData, contact.name);
        }

        if (connectionMode === 'web') {
           // UNOFFICIAL QR MODE
           res = await fetch(`${WA_ENGINE_URL}/api/wa-send`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               target: contact.phone,
               text: personalizedMsg,
               isGroup: false,
               mediaBase64: finalMediaToSend, 
               mediaType: mimeType,            
               fileName: originalFileName      
             })
           });
        } else {
           // 🟢 OFFICIAL API MODE (BYOK) - Sends client's keys to backend
           const payload = {
             email: user?.email || 'demo@reachify.com', 
             phone: contact.phone, 
             message: personalizedMsg, 
             media_type: media?.type || 'text',
             media_base64: finalMediaToSend,
             fileName: originalFileName,
             // 🟢 Client Credentials injected here
             provider: waProvider,         
             instance_id: waInstanceId,    
             access_token: waToken,        
             sticker_config: (showSticker && media?.type.startsWith('image')) ? { 
                 name: { text: contact.name, font: nameFont, size: nameSize, color: nameColor, outline: nameOutline, weight: nameWeight, style: nameStyle },
                 sub: { text: subText, font: subFont, size: subSize, color: subColor, outline: subOutline, weight: subWeight, style: subStyle },
                 box: { bg: boxBg, border: boxBorder, radius: boxRadius, padding: boxPadding, width: stickerWidth },
                 x: stickerPos.x, y: stickerPos.y 
             } : null
           };
           res = await fetch(`${API_URL}/send-message`, {
             method: 'POST', headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(payload)
           });
        }

        const data = await res.json(); 

        if (res.ok && data.success !== false) {
          currentSent++;
          isMessageSuccessful = true; 
          setLogs(prev => prev.map(l => l.id === i + 1 ? { ...l, status: "✅ Sent" } : l));
        } else {
          currentFailed++;
          
          // 🟢 FIX: Smart Error Handling for Meta Template Restrictions
          let errorMsg = data.error || "Failed to Send";
          if (errorMsg.includes("Template") || errorMsg.includes("template")) {
              errorMsg = "Template Required";
          } else {
              errorMsg = errorMsg.substring(0, 35);
          }
          
          setLogs(prev => prev.map(l => l.id === i + 1 ? { ...l, status: `❌ ${errorMsg}` } : l));
          
          if (data.error && data.error.includes("disconnected")) {
              alert("❌ Server disconnected! Please go to Settings > Refresh QR Code or Check API Keys.");
              setCampaignState('stopped');
              break;
          }
        }
      } catch (err) {
        currentFailed++;
        setLogs(prev => prev.map(l => l.id === i + 1 ? { ...l, status: "⚠️ Error" } : l));
      }
      
      setStats({ sent: currentSent, failed: currentFailed, total: contacts.length });
      setProgress(Math.round(((i + 1) / contacts.length) * 100));

      if (i < contacts.length - 1 && !stopRef.current) {
        if (isMessageSuccessful) {
           messagesProcessed++; 
           
           if (connectionMode === 'web') {
              // Only apply strict anti-ban pauses if using Unofficial Web Mode
              if (messagesProcessed >= nextPauseTarget) {
                try {
                  setLogs(prev => [{ id: 'pause', to: 'System', status: '⏸ Batch Pause (30s)...', name: 'Wait' }, ...prev]);
                  await waitWithCheck(BATCH_PAUSE_MS);
                  nextPauseTarget = messagesProcessed + Math.floor(Math.random() * (30 - 20 + 1) + 20);
                  setLogs(prev => prev.filter(l => l.id !== 'pause')); 
                } catch (err) { break; }
              }
           }

           // Normal delay between messages (Client controls this via dashboard)
           const randomDelaySec = Number(delay) + Math.floor(Math.random() * 3);
           try {
             await waitWithCheck(randomDelaySec * 1000);
           } catch (err) { break; }

        } else {
           try { await waitWithCheck(1500); } catch (err) { break; }
        }
      }
    }
    
    if (!stopRef.current) setCampaignState('completed');
  };

  const togglePause = () => { pauseRef.current = !pauseRef.current; setCampaignState(pauseRef.current ? 'paused' : 'running'); };
  const stopCampaign = () => { stopRef.current = true; setCampaignState('stopped'); };

  return (
    // 🔥 MOBILE WRAPPER FIX: min-h-screen for mobile, fixed height for PC
    <div className="flex flex-col min-h-screen lg:h-[calc(100vh-100px)] gap-4 md:gap-6 max-w-[1400px] mx-auto p-2 pb-20 lg:pb-2" onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp} onMouseLeave={handleMouseUp}>
      
      {/* HEADER SECTION (Responsive wrap) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#1e293b] p-3 md:p-4 rounded-2xl border border-gray-700 shadow-lg gap-4 flex-shrink-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex flex-wrap items-center gap-2 md:gap-3">
             Bulk Sender Pro
             {waStatus === 'checking' && <span className="text-[10px] md:text-xs text-yellow-400">Waking Server...</span>}
             {waStatus === 'sleeping' && <span className="text-[10px] md:text-xs text-yellow-500 animate-pulse">Server Asleep.</span>}
             {waStatus === 'connected' && (
                <span className="flex items-center gap-1.5 px-2 md:px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-[10px] md:text-xs text-green-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> {connectionMode === 'web' ? 'Web Connected' : 'API Connected'}
                </span>
             )}
             {waStatus === 'disconnected' && (
                <span className="flex items-center gap-1.5 px-2 md:px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-[10px] md:text-xs text-red-400">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span> Disconnected
                </span>
             )}
          </h2>
          <p className="text-gray-400 text-[10px] md:text-sm mt-1">Send Messages, Images, Videos, PDFs, and Apps securely.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
           <div className="bg-[#0f172a] px-2 md:px-3 py-1.5 md:py-2 rounded-lg border border-gray-600 flex items-center gap-2 flex-1 md:flex-none justify-center">
              <span className="text-gray-400 text-[10px] md:text-xs">Delay:</span>
              <input type="number" value={delay} onChange={e => setDelay(e.target.value)} className="w-8 md:w-10 bg-transparent text-white font-bold text-center outline-none text-xs md:text-sm" />
              <span className="text-gray-400 text-[10px] md:text-xs">sec</span>
           </div>

           {campaignState === 'idle' || campaignState === 'completed' || campaignState === 'stopped' ? (
             <button onClick={startCampaign} disabled={contacts.length === 0} className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm text-white shadow-lg transition-all ${contacts.length === 0 ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:scale-105'}`}>
               {campaignState === 'completed' ? '🔄 Resend Campaign' : '▶ Start Campaign'}
             </button>
           ) : (
             <div className="flex gap-2 w-full md:w-auto">
               <button onClick={togglePause} className="flex-1 md:flex-none px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm text-white bg-yellow-600 hover:bg-yellow-500 shadow-lg transition-all flex items-center justify-center gap-2">
                 {campaignState === 'paused' ? '▶ Resume' : '⏸ Pause'}
               </button>
               <button onClick={stopCampaign} className="flex-1 md:flex-none px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm text-white bg-red-600 hover:bg-red-500 shadow-lg transition-all flex items-center justify-center gap-2">
                 ⏹ Stop
               </button>
             </div>
           )}
        </div>
      </div>

      {campaignState !== 'idle' && (
        <div className="bg-[#1e293b] p-3 md:p-4 rounded-xl border border-gray-700 shadow-lg animate-fade-in flex-shrink-0">
          <div className="flex justify-between items-center mb-2"><span className="text-xs md:text-sm font-bold text-white">Campaign Progress</span><span className="text-xs md:text-sm font-mono text-fuchsia-400">{progress}%</span></div>
          <div className="w-full bg-gray-700 rounded-full h-2 md:h-3 mb-2 overflow-hidden"><div className="bg-gradient-to-r from-fuchsia-600 to-purple-600 h-2 md:h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
          <div className="flex justify-between text-[10px] md:text-xs text-gray-400 font-medium"><span className="text-green-400">✅ Sent: {stats.sent}</span><span className="text-red-400">❌ Failed: {stats.failed}</span><span className="text-blue-400">⏳ Pending: {stats.total - stats.sent - stats.failed}</span></div>
        </div>
      )}

      {/* 🔥 MOBILE LAYOUT FIX: Changed from grid to flex-col on mobile, flex-row on PC */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 overflow-y-auto lg:overflow-hidden custom-scrollbar">
        
        {/* COLUMN 1: SETUP (Excel, File, Stylings) */}
        <div className="w-full lg:w-[340px] flex flex-col gap-4 overflow-y-visible lg:overflow-y-auto pr-1 custom-scrollbar flex-shrink-0 lg:pb-10">
          
          {/* STEP 1 & 2 GRIDS */}
          <div className="grid grid-cols-2 gap-2 md:gap-3 flex-shrink-0">
             <div className="bg-[#1e293b] p-3 rounded-xl border border-gray-700 shadow-md">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="text-white font-bold text-[10px] md:text-[11px]">1. Contacts</h3>
                 {contacts.length > 0 && <button onClick={clearContacts} className="text-[9px] text-red-400 hover:text-red-300 font-bold bg-red-500/10 px-1.5 py-0.5 rounded">Clear</button>}
               </div>
               <div className="relative cursor-pointer border border-dashed border-gray-600 rounded p-2 text-center bg-[#0f172a] hover:border-fuchsia-500 transition-all h-16 flex flex-col justify-center items-center">
                 <input type="file" accept=".xlsx, .csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                 <p className="text-base md:text-lg mb-0.5">📊</p>
                 <p className="text-[8px] md:text-[9px] text-gray-300 truncate w-full px-1">{file ? file.name : "Upload Excel"}</p>
               </div>
             </div>
             <div className="bg-[#1e293b] p-3 rounded-xl border border-gray-700 shadow-md">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="text-white font-bold text-[10px] md:text-[11px]">2. Any File</h3>
                 {media && <button onClick={clearMedia} className="text-[9px] text-red-400 hover:text-red-300 font-bold bg-red-500/10 px-1.5 py-0.5 rounded">Clear</button>}
               </div>
               <div className="relative cursor-pointer border border-dashed border-gray-600 rounded p-2 text-center bg-[#0f172a] hover:border-fuchsia-500 transition-all h-16 flex flex-col justify-center items-center">
                  <input type="file" accept="*/*" onChange={handleMediaUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <p className="text-base md:text-lg mb-0.5">📎</p>
                  <p className="text-[8px] md:text-[9px] text-gray-300 truncate w-full px-1">{media ? media.name : "Attach File"}</p>
               </div>
             </div>
          </div>

          {/* EXCEL PREVIEW */}
          {contacts.length > 0 && (
            <div className="bg-[#1e293b] p-3 rounded-xl border border-gray-700 shadow-md flex-shrink-0 animate-fade-in-up">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] md:text-xs font-bold text-green-400">✅ {contacts.length} Ready</span>
                <button onClick={() => setShowContactPreview(!showContactPreview)} className="text-[9px] md:text-[10px] text-fuchsia-400 hover:text-white font-bold bg-fuchsia-500/10 px-2 py-1 rounded transition-all">{showContactPreview ? 'Hide ▲' : 'View ▼'}</button>
              </div>
              {showContactPreview && (
                <div className="animate-fade-in">
                  <div className="flex gap-2 mb-3 p-2 bg-[#0f172a] rounded-lg border border-gray-600 items-center">
                    <span className="text-[9px] md:text-[10px] text-gray-400 font-bold whitespace-nowrap">Add Code: +</span>
                    <input type="text" value={countryCode} onChange={e => setCountryCode(e.target.value)} className="w-8 bg-transparent text-white text-[10px] md:text-xs outline-none font-mono border-b border-gray-600 focus:border-fuchsia-500 text-center" placeholder="91" />
                    <button onClick={applyCountryCode} className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-[9px] md:text-[10px] rounded font-bold py-1.5 transition-all">Apply to All</button>
                  </div>
                  <div className="max-h-32 overflow-y-auto bg-[#0f172a] border border-gray-700 rounded-lg p-2 space-y-1 shadow-inner scroll-smooth custom-scrollbar">
                    {contacts.map((c, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[9px] md:text-[10px] border-b border-gray-800 pb-1">
                        <span className="text-gray-300 font-bold truncate w-1/2 pr-2" title={c.name}>{c.name}</span>
                        <span className="text-fuchsia-400 font-mono bg-fuchsia-500/10 px-1.5 py-0.5 rounded flex-shrink-0">{c.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: ADVANCED STYLING (MERGED FROM PERSONALIZED) */}
          <div className="bg-[#1e293b] p-3 rounded-xl border border-gray-700 shadow-md flex-shrink-0 flex flex-col">
            <h3 className="text-white font-bold text-[10px] md:text-[11px] mb-2">3. WhatsApp Message</h3>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full h-16 md:h-20 bg-[#0f172a] border border-gray-600 rounded-lg p-2 text-white text-[10px] md:text-xs outline-none focus:border-fuchsia-500 resize-none custom-scrollbar mb-3" placeholder="Message text... use {{Name}}"></textarea>

            {/* SHOW ADVANCED STUDIO ONLY IF IMAGE IS UPLOADED */}
            {mediaPreview && (
               <div className="border border-fuchsia-500/40 rounded-lg overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between bg-fuchsia-500/10 p-2 md:p-3 border-b border-fuchsia-500/40">
                     <span className="text-[10px] md:text-xs text-white font-bold">✨ Smart Image Sticker</span>
                     <input type="checkbox" checked={showSticker} onChange={(e) => setShowSticker(e.target.checked)} className="w-4 h-4 md:w-5 md:h-5 accent-fuchsia-500" />
                  </div>
                  
                  {showSticker && (
                     <>
                        {/* TABS */}
                        <div className="flex bg-[#0f172a] p-1 border-b border-gray-700">
                           <button onClick={()=>setActiveTab('name')} className={`flex-1 py-1.5 text-[9px] md:text-[11px] font-bold rounded-md transition-all ${activeTab === 'name' ? 'bg-fuchsia-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>Name</button>
                           <button onClick={()=>setActiveTab('sub')} className={`flex-1 py-1.5 text-[9px] md:text-[11px] font-bold rounded-md transition-all ${activeTab === 'sub' ? 'bg-fuchsia-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>Sub-Text</button>
                           <button onClick={()=>setActiveTab('box')} className={`flex-1 py-1.5 text-[9px] md:text-[11px] font-bold rounded-md transition-all ${activeTab === 'box' ? 'bg-fuchsia-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>Box</button>
                        </div>

                        {/* TAB CONTENTS */}
                        <div className="p-3 bg-[#0f172a] space-y-3 lg:max-h-[250px] overflow-y-auto custom-scrollbar">
                           
                           {/* --- NAME TAB --- */}
                           {activeTab === 'name' && (
                              <div className="space-y-3 animate-fade-in">
                                 <div>
                                    <label className="text-[9px] md:text-[10px] text-gray-400 flex justify-between">Font Size <span>{nameSize}px</span></label>
                                    <input type="range" min="12" max="72" value={nameSize} onChange={e=>setNameSize(e.target.value)} className="w-full accent-fuchsia-500 mt-1"/>
                                 </div>
                                 <div className="grid grid-cols-2 gap-2">
                                    <div>
                                       <label className="text-[9px] text-gray-400 block mb-1">Font Family</label>
                                       <select value={nameFont} onChange={e=>setNameFont(e.target.value)} className="w-full bg-[#1e293b] border border-gray-600 rounded p-1.5 text-[9px] text-white outline-none">
                                          {fontOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                       </select>
                                    </div>
                                    <div>
                                       <label className="text-[9px] text-gray-400 block mb-1">Format</label>
                                       <div className="flex gap-1">
                                          <button onClick={() => setNameWeight(nameWeight === 'bold' ? 'normal' : 'bold')} className={`flex-1 p-1 rounded border text-[9px] font-bold ${nameWeight === 'bold' ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-[#1e293b] border-gray-600 text-gray-400'}`}>B</button>
                                          <button onClick={() => setNameStyle(nameStyle === 'italic' ? 'normal' : 'italic')} className={`flex-1 p-1 rounded border text-[9px] italic ${nameStyle === 'italic' ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-[#1e293b] border-gray-600 text-gray-400'}`}>I</button>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-2">
                                    <div>
                                       <label className="text-[9px] text-gray-400 block mb-1">Text Color</label>
                                       <input type="color" value={nameColor} onChange={e=>setNameColor(e.target.value)} className="w-full h-6 rounded cursor-pointer bg-transparent border border-gray-600"/>
                                    </div>
                                    <div>
                                       <label className="text-[9px] text-gray-400 block mb-1">Border (Outline)</label>
                                       <select value={nameOutline} onChange={e=>setNameOutline(e.target.value)} className="w-full bg-[#1e293b] border border-gray-600 rounded p-1.5 text-[9px] text-white outline-none">
                                          {outlineOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                       </select>
                                    </div>
                                 </div>
                              </div>
                           )}

                           {/* --- SUB-TEXT TAB --- */}
                           {activeTab === 'sub' && (
                              <div className="space-y-3 animate-fade-in">
                                 <div>
                                    <label className="text-[9px] text-gray-400 block mb-1">Sub-Text</label>
                                    <input type="text" value={subText} onChange={e=>setSubText(e.target.value)} placeholder="Type here..." className="w-full bg-[#1e293b] border border-gray-600 rounded p-1.5 text-[10px] text-white outline-none focus:border-fuchsia-500"/>
                                 </div>
                                 <div>
                                    <label className="text-[9px] text-gray-400 flex justify-between">Font Size <span>{subSize}px</span></label>
                                    <input type="range" min="10" max="48" value={subSize} onChange={e=>setSubSize(e.target.value)} className="w-full accent-fuchsia-500 mt-1"/>
                                 </div>
                                 <div className="grid grid-cols-2 gap-2">
                                    <div>
                                       <label className="text-[9px] text-gray-400 block mb-1">Font</label>
                                       <select value={subFont} onChange={e=>setSubFont(e.target.value)} className="w-full bg-[#1e293b] border border-gray-600 rounded p-1.5 text-[9px] text-white outline-none">
                                          {fontOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                       </select>
                                    </div>
                                    <div>
                                       <label className="text-[9px] text-gray-400 block mb-1">Format</label>
                                       <div className="flex gap-1">
                                          <button onClick={() => setSubWeight(subWeight === 'bold' ? 'normal' : 'bold')} className={`flex-1 p-1 rounded border text-[9px] font-bold ${subWeight === 'bold' ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-[#1e293b] border-gray-600 text-gray-400'}`}>B</button>
                                          <button onClick={() => setSubStyle(subStyle === 'italic' ? 'normal' : 'italic')} className={`flex-1 p-1 rounded border text-[9px] italic ${subStyle === 'italic' ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-[#1e293b] border-gray-600 text-gray-400'}`}>I</button>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-2">
                                    <div>
                                       <label className="text-[9px] text-gray-400 block mb-1">Text Color</label>
                                       <input type="color" value={subColor} onChange={e=>setSubColor(e.target.value)} className="w-full h-6 rounded cursor-pointer bg-transparent border border-gray-600"/>
                                    </div>
                                    <div>
                                       <label className="text-[9px] text-gray-400 block mb-1">Outline</label>
                                       <select value={subOutline} onChange={e=>setSubOutline(e.target.value)} className="w-full bg-[#1e293b] border border-gray-600 rounded p-1.5 text-[9px] text-white outline-none">
                                          {outlineOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                       </select>
                                    </div>
                                 </div>
                              </div>
                           )}

                           {/* --- BOX TAB --- */}
                           {activeTab === 'box' && (
                              <div className="space-y-3 animate-fade-in">
                                 <div className="grid grid-cols-2 gap-2">
                                    <div>
                                       <label className="text-[9px] text-gray-400 block mb-1">Background</label>
                                       <select value={boxBg} onChange={e=>setBoxBg(e.target.value)} className="w-full bg-[#1e293b] border border-gray-600 rounded p-1.5 text-[9px] text-white outline-none">
                                          <option value="rgba(0, 0, 0, 0.5)">Dark Glass</option>
                                          <option value="rgba(255, 255, 255, 0.5)">Light Glass</option>
                                          <option value="transparent">Transparent</option>
                                          <option value="#000000">Solid Black</option>
                                       </select>
                                    </div>
                                    <div>
                                       <label className="text-[9px] text-gray-400 block mb-1">Border</label>
                                       <select value={boxBorder} onChange={e=>setBoxBorder(e.target.value)} className="w-full bg-[#1e293b] border border-gray-600 rounded p-1.5 text-[9px] text-white outline-none">
                                          <option value="none">No Border</option>
                                          <option value="2px solid white">Solid White</option>
                                          <option value="2px dashed #d946ef">Dashed Pink</option>
                                          <option value="2px solid #fbbf24">Solid Gold</option>
                                       </select>
                                    </div>
                                 </div>
                                 <div>
                                    <label className="text-[9px] text-gray-400 flex justify-between">Radius <span>{boxRadius}px</span></label>
                                    <input type="range" min="0" max="50" value={boxRadius} onChange={e=>setBoxRadius(e.target.value)} className="w-full accent-fuchsia-500 mt-1"/>
                                 </div>
                                 <div>
                                    <label className="text-[9px] text-gray-400 flex justify-between">Padding <span>{boxPadding}px</span></label>
                                    <input type="range" min="0" max="40" value={boxPadding} onChange={e=>setBoxPadding(e.target.value)} className="w-full accent-fuchsia-500 mt-1"/>
                                 </div>
                              </div>
                           )}
                        </div>
                     </>
                  )}
               </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: THE CANVAS (Middle) */}
        <div className="flex-1 bg-[#0f172a] rounded-2xl border border-gray-700 shadow-lg flex flex-col relative overflow-hidden min-h-[350px] lg:min-h-0">
           <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 bg-black/80 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs text-white border border-gray-700 flex items-center gap-2 shadow-lg">
             <span className="animate-pulse w-2 h-2 bg-fuchsia-500 rounded-full"></span> Live Preview
           </div>
           
           <div className="flex-1 flex items-center justify-center p-2 md:p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5 overflow-hidden" style={{touchAction: 'none'}} onMouseMove={handleMouseMove} onTouchMove={handleMouseMove}>
             {media ? (
               <div ref={imageContainerRef} className={`relative max-w-full max-h-full shadow-2xl rounded-lg select-none flex items-center justify-center ${!mediaPreview ? 'border-2 border-dashed border-gray-600 p-8' : 'border-4 border-gray-800'}`}>
                 {mediaPreview ? ( 
                    <img src={mediaPreview} alt="Preview" className="max-w-full max-h-[50vh] lg:max-h-[65vh] object-contain pointer-events-none" /> 
                 ) : ( 
                    <div className="w-48 h-48 md:w-64 md:h-64 bg-gray-800 flex items-center justify-center text-gray-300 flex-col px-4 md:px-6 text-center rounded-xl">
                       <span className="text-4xl md:text-6xl mb-3 md:mb-4">{media.type.startsWith('video') ? '🎥' : media.type.startsWith('audio') ? '🎵' : media.type.includes('pdf') ? '📕' : media.name.endsWith('.apk') ? '🤖' : '📁'}</span>
                       <span className="font-bold text-[10px] md:text-sm truncate w-full">{media.name}</span>
                       <span className="text-[8px] md:text-[10px] text-fuchsia-400 mt-3 md:mt-4">File ready to send (Universal)</span>
                    </div> 
                 )}
                 
                 {/* ADVANCED DRAGGABLE STICKER */}
                 {showSticker && mediaPreview && (
                   <div 
                     onMouseDown={handleDragStart} onTouchStart={handleDragStart} 
                     style={{ 
                        top: `${stickerPos.y}%`, left: `${stickerPos.x}%`, width: `${stickerWidth}px`, transform: 'translate(-50%, -50%)', cursor: isDragging ? 'grabbing' : 'grab', 
                        background: boxBg, border: boxBorder, borderRadius: `${boxRadius}px`, padding: `${boxPadding}px`,
                        backdropFilter: boxBg.includes('rgba') ? 'blur(6px)' : 'none',
                     }} 
                     className="absolute flex flex-col items-center justify-center transition-shadow z-20 group hover:ring-2 hover:ring-fuchsia-500 shadow-lg"
                   >
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
                     <div onMouseDown={handleResizeStart} onTouchStart={handleResizeStart} className="absolute -bottom-2 -right-2 w-8 h-8 md:w-6 md:h-6 bg-white border-2 border-fuchsia-600 rounded-full cursor-nwse-resize opacity-80 md:opacity-0 md:group-hover:opacity-100 shadow-xl transition-opacity flex items-center justify-center z-30"><span className="text-[12px] md:text-[10px] text-fuchsia-600">⤡</span></div>
                   </div>
                 )}
               </div>
             ) : ( <div className="text-gray-500 text-center flex flex-col items-center"><p className="text-4xl md:text-5xl mb-3 md:mb-4 opacity-50">📤</p><p className="font-bold text-xs md:text-base">Canvas is Empty</p><p className="text-[9px] md:text-xs mt-1 md:mt-2">Upload any file or image</p></div> )}
           </div>
        </div>

        {/* COLUMN 3: LOGS (Right side on PC, Bottom on mobile) */}
        <div className="w-full lg:w-[280px] bg-[#1e293b] rounded-2xl border border-gray-700 shadow-lg flex flex-col overflow-hidden h-[300px] lg:h-auto flex-shrink-0">
          <div className="p-3 md:p-4 border-b border-gray-700 bg-[#0f172a] font-bold text-white flex justify-between items-center"><span className="text-xs md:text-base">📡 Action Logs</span><span className="text-[9px] md:text-[10px] bg-gray-800 px-2 py-1 rounded">Total: {stats.total}</span></div>
          <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 custom-scrollbar scroll-smooth">
            {logs.length === 0 ? ( <div className="h-full flex flex-col items-center justify-center opacity-50 text-gray-500"><span className="text-3xl md:text-4xl mb-2">⏳</span><p className="text-[10px] md:text-sm">Activity will appear here</p></div> ) : logs.map(log => (
               <div key={log.id} className="flex flex-col bg-[#0f172a] p-2 md:p-3 rounded-lg border border-gray-700/50 hover:border-gray-500 transition-colors animate-fade-in">
                  <div className="flex justify-between items-center mb-1"><span className="text-[10px] md:text-xs font-bold text-gray-300 truncate w-32" title={log.name}>{log.name}</span><span className={`text-[8px] md:text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${log.status.includes('Sent') ? 'bg-green-500/20 text-green-400' : log.status.includes('Failed') || log.status.includes('❌') || log.status.includes('Timeout') ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{log.status}</span></div>
                  <span className="text-[9px] md:text-xs font-mono text-gray-500">{log.to}</span>
               </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BulkSender;
