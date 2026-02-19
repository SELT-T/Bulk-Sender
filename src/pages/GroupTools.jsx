import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';

const GroupTools = () => {
  const [activeMode, setActiveMode] = useState('extract'); // 'extract' or 'send'
  const [waStatus, setWaStatus] = useState('checking'); // Real API connection status

  // ==========================================
  // STATE: GROUP EXTRACTOR (REAL)
  // ==========================================
  const [extractMethod, setExtractMethod] = useState('parser'); // 'api' or 'parser'
  const [groupLink, setGroupLink] = useState('');
  const [rawText, setRawText] = useState('');
  const [extractedData, setExtractedData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  // ==========================================
  // STATE: GROUP SENDER
  // ==========================================
  const [groups, setGroups] = useState([]);
  const [message, setMessage] = useState("Hello everyone! Important update here.");
  const [file, setFile] = useState(null); 
  const [media, setMedia] = useState(null); 
  const [delay, setDelay] = useState(3);
  const [campaignState, setCampaignState] = useState('idle'); 
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ sent: 0, failed: 0, total: 0 });

  const stopRef = useRef(false);
  const API_URL = "https://reachify-api.selt-3232.workers.dev";
  const user = JSON.parse(localStorage.getItem('reachify_user')) || { email: 'demo@reachify.com' };

  // 0. CHECK REAL API CONNECTION
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

  // ==========================================
  // LOGIC: REAL ADVANCED EXTRACTOR
  // ==========================================
  
  // METHOD 1: REAL API FETCH (Link Based)
  const handleApiFetch = async () => {
    if (!groupLink.trim()) return alert("❌ Please enter a Group Link or ID!");
    if (waStatus !== 'connected') return alert("❌ WhatsApp API is NOT connected! Go to Advanced Settings to link your API first. Use 'Smart Parser' method for now.");
    
    setIsFetching(true);
    setExtractedData([]);

    try {
      // REAL Backend call (Will only work when you configure a real API provider in settings)
      const res = await fetch(`${API_URL}/extract-group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, group_id: groupLink })
      });
      
      if (!res.ok) throw new Error("API Gateway rejected the request. Check your API Keys.");
      const data = await res.json();
      
      if (data.members && data.members.length > 0) {
         setExtractedData(data.members);
      } else {
         alert("❌ No members found or Bot is not in this group.");
      }
    } catch (err) {
      alert(`❌ API Error: ${err.message}`);
    }
    setIsFetching(false);
  };

  // METHOD 2: REAL SMART PARSER (Manual Copy-Paste - 100% Accurate)
  const handleParseText = () => {
    if (!rawText.trim()) return alert("❌ Please paste some WhatsApp group text first!");
    
    // Finds international numbers and local 10-digit numbers
    const phoneRegex = /\+?\d{1,4}[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
    const foundNumbers = rawText.match(phoneRegex);

    if (foundNumbers) {
      const uniqueNumbers = [...new Set(foundNumbers.map(n => n.replace(/[^0-9+]/g, '')))];
      const formattedData = uniqueNumbers.filter(n => n.length >= 10).map((num, index) => ({
        id: index + 1,
        name: `Contact ${index + 1}`,
        phone: num,
        isAdmin: false
      }));
      setExtractedData(formattedData);
    } else {
      alert("❌ No real phone numbers found in the pasted text.");
    }
  };

  // EXPORT FUNCTIONS
  const handleExportExcel = () => {
    if (extractedData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(extractedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, "Real_Group_Members.xlsx");
  };

  const handleExportVCard = () => {
    if (extractedData.length === 0) return;
    let vcard = "";
    extractedData.forEach(m => {
      vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:${m.name}\nTEL:${m.phone}\nEND:VCARD\n`;
    });
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Real_Group_Contacts.vcf";
    a.click();
  };

  // ==========================================
  // LOGIC: GROUP SENDER
  // ==========================================
  const handleGroupUpload = (e) => {
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
        
        const formattedGroups = data.map((row) => {
          let linkVal = ''; let nameVal = 'Unnamed Group';
          Object.keys(row).forEach(key => {
            const lowerKey = key.toLowerCase();
            if (lowerKey.includes('link') || lowerKey.includes('id') || lowerKey.includes('group')) {
              if (!linkVal && row[key]) linkVal = String(row[key]).trim();
            }
            if (lowerKey.includes('name') || lowerKey.includes('title')) {
              if (nameVal === 'Unnamed Group' && row[key]) nameVal = String(row[key]).trim();
            }
          });
          return { link: linkVal, name: nameVal };
        }).filter(g => g.link);

        if (formattedGroups.length > 0) {
           setGroups(formattedGroups);
           setStats({ sent: 0, failed: 0, total: formattedGroups.length });
        } else alert("❌ No Group Links found in file.");
      } catch (error) { alert("❌ Error reading Excel."); }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const startGroupCampaign = async () => {
    if (groups.length === 0) return alert("❌ Upload Group Links first!");
    if (waStatus !== 'connected') return alert("❌ WhatsApp API is disconnected!");
    
    setCampaignState('running'); stopRef.current = false; setLogs([]); setProgress(0);
    let currentSent = 0, currentFailed = 0;

    for (let i = 0; i < groups.length; i++) {
      if (stopRef.current) { setCampaignState('completed'); break; }
      const group = groups[i];
      setLogs(prev => [{ id: i + 1, to: group.name, status: "Sending..." }, ...prev]);

      try {
        const res = await fetch(`${API_URL}/send-message`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, phone: group.link, message, media_type: media?.type || 'text', is_group: true })
        });
        if (res.ok) { currentSent++; setLogs(prev => prev.map(l => l.id === i + 1 ? { ...l, status: "✅ Sent" } : l)); } 
        else { currentFailed++; setLogs(prev => prev.map(l => l.id === i + 1 ? { ...l, status: "❌ Failed" } : l)); }
      } catch (err) {
        currentFailed++; setLogs(prev => prev.map(l => l.id === i + 1 ? { ...l, status: "⚠️ Error" } : l));
      }
      setStats({ sent: currentSent, failed: currentFailed, total: groups.length });
      setProgress(Math.round(((i + 1) / groups.length) * 100));
      if (i < groups.length - 1) await new Promise(r => setTimeout(r, delay * 1000));
    }
    setCampaignState('completed');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] gap-4 max-w-7xl mx-auto p-2 animate-fade-in-up">
      
      {/* TOP NAVIGATION TOGGLE */}
      <div className="flex justify-between items-center bg-[#1e293b] p-3 rounded-xl border border-gray-700 shadow-md">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
           ⚙️ Group Automation
           {waStatus === 'connected' ? (
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded text-[10px] text-green-400">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> API Linked
              </span>
           ) : (
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-[10px] text-red-400">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> No API Detected
              </span>
           )}
        </h2>
        <div className="flex bg-[#0f172a] p-1 rounded-lg border border-gray-600">
          <button onClick={() => setActiveMode('extract')} className={`px-5 py-1.5 rounded-md text-xs font-bold transition-all ${activeMode === 'extract' ? 'bg-fuchsia-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
            🔍 Extract Contacts
          </button>
          <button onClick={() => setActiveMode('send')} className={`px-5 py-1.5 rounded-md text-xs font-bold transition-all ${activeMode === 'send' ? 'bg-fuchsia-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
            🚀 Send to Groups
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: EXTRACT CONTACTS (Real Tools Only) */}
      {/* ======================================================== */}
      {activeMode === 'extract' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
          
          {/* Left: Input Modes */}
          <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
            
            {/* Mode Selection */}
            <div className="flex bg-[#1e293b] border border-gray-700 rounded-xl p-1 shadow-md">
               <button onClick={() => setExtractMethod('api')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${extractMethod === 'api' ? 'bg-[#0f172a] text-white border border-gray-600' : 'text-gray-500 hover:text-gray-300'}`}>
                 🔗 Link Extractor (Needs API)
               </button>
               <button onClick={() => setExtractMethod('parser')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${extractMethod === 'parser' ? 'bg-[#0f172a] text-white border border-gray-600' : 'text-gray-500 hover:text-gray-300'}`}>
                 📝 Smart Parser (100% Free)
               </button>
            </div>

            {/* Input Area Based on Mode */}
            {extractMethod === 'api' ? (
              <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-5 shadow-md animate-fade-in flex flex-col gap-4">
                 <div>
                    <h3 className="text-white font-bold text-sm mb-1">Group Link / ID</h3>
                    <p className="text-[10px] text-gray-400 mb-3">Fetches Name, Number, and Admin status. Requires a paid API configuration in Advanced Settings.</p>
                    <input type="text" value={groupLink} onChange={(e) => setGroupLink(e.target.value)} placeholder="https://chat.whatsapp.com/..." className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-sm text-white outline-none focus:border-fuchsia-500" />
                 </div>
                 <button onClick={handleApiFetch} disabled={isFetching} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] text-white py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50">
                    {isFetching ? '⏳ Querying API...' : 'Fetch via API ⚡'}
                 </button>
                 {waStatus !== 'connected' && (
                    <p className="text-[10px] text-red-400 text-center border border-red-500/30 bg-red-500/10 p-2 rounded">⚠️ API is disconnected. This will fail until configured.</p>
                 )}
              </div>
            ) : (
              <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-5 shadow-md animate-fade-in flex flex-col gap-4 flex-1">
                 <div>
                    <h3 className="text-white font-bold text-sm mb-1">Smart Text Parser</h3>
                    <p className="text-[10px] text-gray-400 mb-2">1. Open WhatsApp Web > 2. Open Group Info > 3. Select & Copy all numbers > 4. Paste below.</p>
                 </div>
                 <textarea value={rawText} onChange={(e) => setRawText(e.target.value)} placeholder="Paste copied text here..." className="flex-1 w-full bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-white outline-none focus:border-fuchsia-500 resize-none font-mono text-xs custom-scrollbar"></textarea>
                 <button onClick={handleParseText} className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:scale-[1.02] text-white py-3 rounded-xl font-bold shadow-lg transition-all">
                    Clean & Extract Numbers
                 </button>
              </div>
            )}
          </div>

          {/* Right: Output Table */}
          <div className="lg:col-span-7 bg-[#1e293b] border border-gray-700 rounded-xl flex flex-col shadow-md overflow-hidden">
            <div className="p-3 border-b border-gray-700 flex justify-between items-center bg-[#0f172a]">
              <h3 className="text-white font-bold text-sm">Real Extracted Members ({extractedData.length})</h3>
              <div className="flex gap-2">
                 <button onClick={handleExportExcel} disabled={extractedData.length === 0} className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${extractedData.length > 0 ? 'bg-green-600/20 text-green-400 border border-green-500/50 hover:bg-green-600 hover:text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
                   📊 Download Excel
                 </button>
                 <button onClick={handleExportVCard} disabled={extractedData.length === 0} className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${extractedData.length > 0 ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50 hover:bg-blue-600 hover:text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
                   📱 Save to Contacts (vCard)
                 </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar bg-[#0f172a]/50">
               {extractedData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                    <span className="text-4xl mb-2">👥</span>
                    <p className="text-xs">Extracted real numbers will appear here.</p>
                  </div>
               ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1e293b] text-gray-400 sticky top-0 shadow-sm z-10">
                      <tr>
                        <th className="p-3 w-16 text-center">#</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Phone Number</th>
                        <th className="p-3 text-center">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {extractedData.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-2 text-center text-gray-600">{idx + 1}</td>
                          <td className="p-2 text-gray-300 font-medium">{item.name}</td>
                          <td className="p-2 text-fuchsia-400 font-mono tracking-wide">{item.phone}</td>
                          <td className="p-2 text-center">
                            {item.isAdmin ? <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-[10px] font-bold">ADMIN</span> : <span className="text-gray-600 text-[10px]">MEMBER</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               )}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: SEND TO GROUPS (Unchanged) */}
      {/* ======================================================== */}
      {activeMode === 'send' && (
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
          
         {/* Left Column: Setup */}
         <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-md">
             <h3 className="text-white font-bold text-sm mb-2">1. Upload Group List</h3>
             <div className="relative group cursor-pointer border border-dashed border-gray-600 rounded-lg p-3 text-center hover:border-fuchsia-500 bg-[#0f172a] transition-all">
               <input type="file" accept=".xlsx, .csv" onChange={handleGroupUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
               <p className="text-xl mb-1">🔗</p>
               <p className="text-[10px] text-gray-400">{file ? file.name : "Upload Excel with Links"}</p>
             </div>
             {groups.length > 0 && <p className="text-[10px] font-bold text-green-400 mt-2">✅ {groups.length} Groups Loaded</p>}
           </div>

           <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-md">
              <h3 className="text-white font-bold text-sm mb-2">2. Attach Media (Optional)</h3>
              <div className="relative group cursor-pointer border border-dashed border-gray-600 rounded-lg p-3 text-center hover:border-fuchsia-500 bg-[#0f172a] transition-all">
                 <input type="file" accept="*/*" onChange={(e) => setMedia(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                 <p className="text-xl mb-1">📎</p>
                 <p className="text-[10px] text-gray-400 truncate px-2">{media ? media.name : "Any File / Image"}</p>
               </div>
           </div>

           <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-md flex-1 flex flex-col">
             <h3 className="text-white font-bold text-sm mb-2">3. Message Text</h3>
             <textarea 
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               className="flex-1 w-full bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-white text-xs outline-none focus:border-fuchsia-500 resize-none"
               placeholder="Type group message here..."
             ></textarea>
           </div>

         </div>

         {/* Right Column: Controls & Logs */}
         <div className="lg:col-span-8 flex flex-col gap-4">
           
           <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-md flex items-center justify-between">
             <div>
                <h3 className="text-white font-bold text-base">Group Broadcaster</h3>
                <p className="text-[10px] text-gray-400">Blast to multiple groups safely.</p>
             </div>
             <div className="flex items-center gap-3">
                <div className="bg-[#0f172a] px-2 py-1.5 rounded-lg border border-gray-600 flex items-center gap-2">
                   <span className="text-gray-400 text-[10px]">Delay:</span>
                   <input type="number" value={delay} onChange={e => setDelay(e.target.value)} className="w-8 bg-transparent text-white font-bold text-center outline-none text-xs" />
                </div>
                <button onClick={startGroupCampaign} disabled={groups.length === 0 || campaignState === 'running' || waStatus !== 'connected'} className={`px-6 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all ${(groups.length === 0 || campaignState === 'running' || waStatus !== 'connected') ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105'}`}>
                  {campaignState === 'running' ? '🚀 Sending...' : 'Start Blast ▶'}
                </button>
             </div>
           </div>

           {campaignState !== 'idle' && (
             <div className="bg-[#1e293b] p-3 rounded-xl border border-gray-700 shadow-md">
               <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-white">Blast Progress</span>
                  <span className="text-xs font-mono text-blue-400">{progress}%</span>
               </div>
               <div className="w-full bg-gray-700 rounded-full h-2 mb-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
               </div>
               <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                  <span className="text-green-400">Delivered: {stats.sent}</span>
                  <span className="text-red-400">Failed: {stats.failed}</span>
                  <span className="text-yellow-400">Pending: {stats.total - stats.sent - stats.failed}</span>
               </div>
             </div>
           )}

           <div className="bg-[#1e293b] rounded-xl border border-gray-700 shadow-md flex flex-col flex-1 overflow-hidden">
             <div className="p-3 border-b border-gray-700 bg-[#0f172a] font-bold text-white flex justify-between items-center">
               <span className="text-sm">📡 Action Logs</span>
               <span className="text-[10px] bg-gray-800 px-2 py-1 rounded">Total: {stats.total}</span>
             </div>
             <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-[#0f172a]/30">
               {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-40 text-gray-500">
                     <span className="text-4xl mb-2">💬</span>
                     <p className="text-xs">Upload group links and start.</p>
                  </div>
               ) : logs.map(log => (
                  <div key={log.id} className="flex justify-between items-center bg-[#0f172a] p-2 rounded-lg border border-gray-700/50 hover:border-gray-500 transition-colors">
                     <span className="text-xs font-bold text-gray-300 truncate w-48">{log.to}</span>
                     <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${log.status.includes('Sent') ? 'bg-green-500/20 text-green-400' : log.status.includes('Failed') ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                       {log.status}
                     </span>
                  </div>
               ))}
             </div>
           </div>

         </div>
       </div>
      )}

    </div>
  );
};

export default GroupTools;
