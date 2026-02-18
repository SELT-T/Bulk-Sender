import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

const BulkSender = () => {
  // --- Asli Data States ---
  const [contacts, setContacts] = useState([]); // Excel se aaye numbers
  const [message, setMessage] = useState("Hello {{Name}}, here is a special offer for you!");
  const [file, setFile] = useState(null);
  const [media, setMedia] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState([]); // Sending history log
  
  // --- Features Toggles ---
  const [useSticker, setUseSticker] = useState(false); // Sticker wala feature
  const [delay, setDelay] = useState(2); // Speed control

  // Backend URL
  const API_URL = "https://reachify-api.selt-3232.workers.dev";
  const user = JSON.parse(localStorage.getItem('reachify_user'));

  // 1. EXCEL FILE UPLOAD & READ
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      // Data format check (Phone aur Name column dhoondo)
      const formattedContacts = data.map(row => ({
        phone: row.Phone || row.Mobile || row.Number || row.contact, // Inme se koi bhi column name chalega
        name: row.Name || row.Customer || 'Friend'
      })).filter(c => c.phone); // Khali row hatao

      setContacts(formattedContacts);
      // alert(`✅ Loaded ${formattedContacts.length} Contacts from Excel!`);
    };
    reader.readAsBinaryString(uploadedFile);
  };

  // 2. SENDING LOGIC (The Main Loop)
  const startCampaign = async () => {
    if (contacts.length === 0) return alert("❌ Please upload Excel file first!");
    if (!user) return alert("❌ Please Login first!");
    
    setIsSending(true);
    setLogs([]); // Purane logs saaf karo

    // Loop through contacts
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      
      // 3. PERSONALIZATION (Name Replacement)
      // Agar {{Name}} likha hai to usko asli naam se badal do
      const personalizedMsg = message.replace(/{{Name}}/gi, contact.name);

      // Log update (UI par dikhane ke liye)
      const currentLog = { 
        id: i + 1, 
        to: contact.phone, 
        status: "Sending...", 
        time: new Date().toLocaleTimeString() 
      };
      setLogs(prev => [currentLog, ...prev]);

      try {
        // 4. API CALL TO BACKEND
        const res = await fetch(`${API_URL}/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            phone: contact.phone,
            message: personalizedMsg,
            media_url: media ? "https://example.com/image.jpg" : null, // Future: Real upload URL
            add_sticker: useSticker, // Sticker Instruction
            sticker_text: contact.name // Naam ka sticker banega
          })
        });

        if (res.ok) {
          updateLogStatus(i + 1, "✅ Sent");
        } else {
          updateLogStatus(i + 1, "❌ Failed");
        }

      } catch (err) {
        updateLogStatus(i + 1, "❌ Error");
      }

      // Delay (Taaki WhatsApp block na kare)
      await new Promise(r => setTimeout(r, delay * 1000));
    }

    setIsSending(false);
    alert("🚀 Campaign Completed!");
  };

  const updateLogStatus = (id, status) => {
    setLogs(prev => prev.map(log => log.id === id ? { ...log, status } : log));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-6 max-w-7xl mx-auto p-2">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Bulk Campaign Runner</h2>
          <p className="text-gray-400 text-sm">Upload Excel, Set Message, and Blast.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-[#1e293b] px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-2">
              <span className="text-gray-400 text-sm">Speed Delay:</span>
              <input type="number" value={delay} onChange={e => setDelay(e.target.value)} className="w-12 bg-transparent text-white font-bold text-center outline-none" />
              <span className="text-gray-400 text-sm">sec</span>
           </div>
           <button 
             onClick={startCampaign} 
             disabled={isSending || contacts.length === 0}
             className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${isSending ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:scale-105'}`}
           >
             {isSending ? '🚀 Sending...' : 'Start Campaign ▶'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
        
        {/* LEFT: SETTINGS & INPUTS */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2">
          
          {/* 1. File Upload */}
          <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-700 shadow-lg">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">📂 Upload Excel / CSV</h3>
            <div className="relative group cursor-pointer">
              <input type="file" accept=".xlsx, .csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center group-hover:border-fuchsia-500 transition-all bg-[#0f172a]">
                <p className="text-4xl mb-2">📊</p>
                <p className="text-gray-300 font-medium">{file ? file.name : "Click to Upload File"}</p>
                <p className="text-xs text-gray-500 mt-1">Supports: Name, Phone columns</p>
              </div>
            </div>
            {contacts.length > 0 && (
               <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex justify-between items-center">
                 <span className="text-green-400 text-sm font-bold">✅ {contacts.length} Contacts Loaded</span>
                 <button onClick={() => setContacts([])} className="text-red-400 text-xs hover:text-white">Clear</button>
               </div>
            )}
          </div>

          {/* 2. Message Box */}
          <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-white font-bold">💬 Message Content</h3>
               <button onClick={() => setMessage(prev => prev + " {{Name}}")} className="text-xs bg-fuchsia-600 px-2 py-1 rounded text-white hover:bg-fuchsia-500">+ Name Variable</button>
            </div>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-40 bg-[#0f172a] border border-gray-600 rounded-xl p-4 text-white outline-none focus:border-fuchsia-500 resize-none"
              placeholder="Type your message here..."
            ></textarea>
            
            {/* Media & Stickers */}
            <div className="mt-4 space-y-3">
               <div className="flex items-center gap-3">
                  <label className="cursor-pointer text-gray-400 hover:text-white flex items-center gap-2 text-sm bg-[#0f172a] px-3 py-2 rounded-lg border border-gray-600">
                    📎 Attach Image/Video
                    <input type="file" className="hidden" onChange={(e) => setMedia(e.target.files[0])} />
                  </label>
                  {media && <span className="text-xs text-fuchsia-400 truncate max-w-[150px]">{media.name}</span>}
               </div>

               {/* Sticker Toggle */}
               <div className="flex items-center justify-between bg-[#0f172a] p-3 rounded-lg border border-gray-600">
                  <div>
                    <p className="text-sm text-white font-medium">✨ Personalize Image</p>
                    <p className="text-[10px] text-gray-400">Add name sticker on image automatically</p>
                  </div>
                  <input type="checkbox" checked={useSticker} onChange={(e) => setUseSticker(e.target.checked)} className="w-5 h-5 accent-fuchsia-500" />
               </div>
            </div>
          </div>

        </div>

        {/* RIGHT: LIVE PREVIEW & LOGS */}
        <div className="lg:col-span-2 bg-[#1e293b] rounded-2xl border border-gray-700 shadow-lg flex flex-col overflow-hidden">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-700 bg-[#0f172a]">
            <button className="flex-1 py-3 text-sm font-bold text-white border-b-2 border-fuchsia-500 bg-[#1e293b]">📡 Live Sending Logs</button>
            <button className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-300">📱 Preview</button>
          </div>

          {/* Logs Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#000000]/20">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                <div className="text-6xl mb-4">💤</div>
                <p>Waiting to start campaign...</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-[#0f172a] rounded-lg border border-gray-700/50 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs">#{log.id}</span>
                    <span className="text-white font-mono text-sm">{log.to}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs">{log.time}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      log.status === 'Sent' ? 'bg-green-500/20 text-green-400' : 
                      log.status === 'Failed' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Footer Stats */}
          <div className="bg-[#0f172a] p-4 border-t border-gray-700 flex justify-between text-xs text-gray-400">
             <span>Queue: {contacts.length}</span>
             <span>Success: {logs.filter(l => l.status.includes('Sent')).length}</span>
             <span>Failed: {logs.filter(l => l.status.includes('Failed')).length}</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BulkSender;
