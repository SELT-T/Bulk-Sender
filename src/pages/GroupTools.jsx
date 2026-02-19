import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

const GroupTools = () => {
  const [activeMode, setActiveMode] = useState('extract'); // 'extract' or 'send'

  // ==========================================
  // STATE: GROUP EXTRACTOR
  // ==========================================
  const [groupLink, setGroupLink] = useState('');
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

  // ==========================================
  // LOGIC: ADVANCED GROUP EXTRACTOR
  // ==========================================
  const handleFetchMembers = async () => {
    if (!groupLink.trim()) return alert("❌ Please enter a Group Link or ID!");
    
    setIsFetching(true);
    setExtractedData([]);

    // Yahan Asli API Call hogi tumhare provider ke through.
    // Abhi UI test aur download check karne ke liye main ek Smart Simulator daal raha hu
    // jo backend connect hone tak realistic data dega.
    setTimeout(() => {
      const dummyMembers = Array.from({ length: 124 }, (_, i) => ({
        id: i + 1,
        name: `Group Member ${i + 1}`,
        phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
        isAdmin: i < 3 // Pehle 3 log admin
      }));
      setExtractedData(dummyMembers);
      setIsFetching(false);
    }, 2000);
  };

  const handleExportExcel = () => {
    if (extractedData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(extractedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, "Group_Members.xlsx");
  };

  // NAYA FEATURE: Mobile Contacts me Save karne ke liye vCard (.vcf)
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
    a.download = "Group_Contacts.vcf";
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
          let linkVal = '';
          let nameVal = 'Unnamed Group';
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
    setCampaignState('running');
    stopRef.current = false;
    setLogs([]);
    setProgress(0);
    let currentSent = 0, currentFailed = 0;

    for (let i = 0; i < groups.length; i++) {
      if (stopRef.current) { setCampaignState('completed'); break; }
      const group = groups[i];
      const newLog = { id: i + 1, to: group.name, status: "Sending..." };
      setLogs(prev => [newLog, ...prev]);

      try {
        const res = await fetch(`${API_URL}/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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

  // ==========================================
  // RENDER UI (COMPACT & SHARP)
  // ==========================================
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] gap-4 max-w-7xl mx-auto p-2 animate-fade-in-up">
      
      {/* TOP NAVIGATION TOGGLE (Compact) */}
      <div className="flex justify-between items-center bg-[#1e293b] p-3 rounded-xl border border-gray-700 shadow-md">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
           ⚙️ Group Automation
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
      {/* VIEW 1: EXTRACT CONTACTS (Advanced Data Table) */}
      {/* ======================================================== */}
      {activeMode === 'extract' && (
        <div className="flex flex-col h-full gap-4 overflow-hidden">
          
          {/* Top Control Bar */}
          <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-4 shadow-md flex gap-4 items-end">
            <div className="flex-1">
               <label className="text-xs text-gray-400 font-bold mb-1 block">Group Invite Link or ID</label>
               <input 
                 type="text" 
                 value={groupLink}
                 onChange={(e) => setGroupLink(e.target.value)}
                 placeholder="e.g. https://chat.whatsapp.com/invite-link"
                 className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-2.5 text-sm text-white outline-none focus:border-fuchsia-500" 
               />
            </div>
            <button 
               onClick={handleFetchMembers} disabled={isFetching}
               className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {isFetching ? '⏳ Fetching...' : 'Fetch Members ⚡'}
            </button>
          </div>

          {/* Bottom Table Area */}
          <div className="bg-[#1e293b] border border-gray-700 rounded-xl flex flex-col flex-1 shadow-md overflow-hidden">
            <div className="p-3 border-b border-gray-700 flex justify-between items-center bg-[#0f172a]">
              <h3 className="text-white font-bold text-sm">Extracted Members ({extractedData.length})</h3>
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
                    <p className="text-xs">Enter link and fetch to see members.</p>
                  </div>
               ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1e293b] text-gray-400 sticky top-0 shadow-sm">
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
                          <td className="p-2.5 text-center text-gray-600">{idx + 1}</td>
                          <td className="p-2.5 text-gray-300 font-medium">{item.name}</td>
                          <td className="p-2.5 text-fuchsia-400 font-mono tracking-wide">{item.phone}</td>
                          <td className="p-2.5 text-center">
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
      {/* VIEW 2: SEND TO GROUPS (Compact Dashboard) */}
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
                 <button onClick={startGroupCampaign} disabled={groups.length === 0 || campaignState === 'running'} className={`px-6 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all ${(groups.length === 0 || campaignState === 'running') ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105'}`}>
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
