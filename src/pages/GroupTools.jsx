import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

const GroupTools = () => {
  const [activeMode, setActiveMode] = useState('extract'); // 'extract' or 'send'

  // ==========================================
  // STATE: GROUP EXTRACTOR
  // ==========================================
  const [rawText, setRawText] = useState('');
  const [extractedData, setExtractedData] = useState([]);

  // ==========================================
  // STATE: GROUP SENDER
  // ==========================================
  const [groups, setGroups] = useState([]);
  const [message, setMessage] = useState("Hello everyone! Here is an important update.");
  const [file, setFile] = useState(null); 
  const [media, setMedia] = useState(null); 
  const [delay, setDelay] = useState(3);
  const [campaignState, setCampaignState] = useState('idle'); // idle, running, completed
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ sent: 0, failed: 0, total: 0 });

  const stopRef = useRef(false);
  const API_URL = "https://reachify-api.selt-3232.workers.dev";
  const user = JSON.parse(localStorage.getItem('reachify_user')) || { email: 'demo@reachify.com' };

  // ==========================================
  // LOGIC: GROUP EXTRACTOR
  // ==========================================
  const handleExtractText = () => {
    if (!rawText.trim()) return alert("❌ Please paste some text first!");
    
    // Advanced Regex for International & Local Phone Numbers
    const phoneRegex = /\+?\d{1,4}[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
    const foundNumbers = rawText.match(phoneRegex);

    if (foundNumbers) {
      // Clean numbers (remove spaces, brackets) and remove duplicates
      const uniqueNumbers = [...new Set(foundNumbers.map(n => n.replace(/[^0-9+]/g, '')))];
      
      const formattedData = uniqueNumbers.filter(n => n.length >= 10).map((num, index) => ({
        id: index + 1,
        name: `Group Member ${index + 1}`,
        phone: num
      }));
      
      setExtractedData(formattedData);
    } else {
      alert("❌ No valid phone numbers found in the text.");
    }
  };

  const handleExport = () => {
    if (extractedData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(extractedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Extracted_Contacts");
    XLSX.writeFile(wb, "Group_Members_List.xlsx");
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
        
        if (data.length === 0) return alert("❌ Your Excel file is empty!");

        const formattedGroups = data.map((row) => {
          let linkVal = '';
          let nameVal = 'Unnamed Group';
          
          Object.keys(row).forEach(key => {
            const lowerKey = key.toLowerCase();
            if (lowerKey.includes('link') || lowerKey.includes('id') || lowerKey.includes('group') || lowerKey.includes('url')) {
              if (!linkVal && row[key]) linkVal = String(row[key]).trim();
            }
            if (lowerKey.includes('name') || lowerKey.includes('title')) {
              if (nameVal === 'Unnamed Group' && row[key]) nameVal = String(row[key]).trim();
            }
          });

          return { link: linkVal, name: nameVal };
        }).filter(g => g.link);

        if (formattedGroups.length === 0) alert("❌ Could not find Group Links or IDs in the file.");
        else {
           setGroups(formattedGroups);
           setStats({ sent: 0, failed: 0, total: formattedGroups.length });
        }
      } catch (error) {
         alert("❌ Error reading the Excel file.");
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const startGroupCampaign = async () => {
    if (groups.length === 0) return alert("❌ Please upload Group Links first!");
    
    setCampaignState('running');
    stopRef.current = false;
    setLogs([]);
    setProgress(0);
    let currentSent = 0;
    let currentFailed = 0;

    for (let i = 0; i < groups.length; i++) {
      if (stopRef.current) { setCampaignState('completed'); break; }

      const group = groups[i];
      const newLog = { id: i + 1, to: group.name, status: "Sending..." };
      setLogs(prev => [newLog, ...prev]);

      try {
        const res = await fetch(`${API_URL}/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            phone: group.link, // We pass group link/ID to the backend
            message: message,
            media_type: media?.type || 'text',
            is_group: true // Special flag for backend
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
      
      setStats({ sent: currentSent, failed: currentFailed, total: groups.length });
      setProgress(Math.round(((i + 1) / groups.length) * 100));

      if (i < groups.length - 1) await new Promise(r => setTimeout(r, delay * 1000));
    }
    setCampaignState('completed');
  };

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-6 max-w-7xl mx-auto p-2 animate-fade-in-up">
      
      {/* TOP NAVIGATION TOGGLE */}
      <div className="flex flex-col items-center justify-center mb-4">
        <h2 className="text-3xl font-bold text-white mb-6">Group Automation Tools</h2>
        <div className="flex bg-[#1e293b] p-1.5 rounded-xl border border-gray-700 shadow-xl">
          <button 
            onClick={() => setActiveMode('extract')} 
            className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${activeMode === 'extract' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            🔍 Extract Contacts
          </button>
          <button 
            onClick={() => setActiveMode('send')} 
            className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${activeMode === 'send' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            🚀 Send to Groups
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: EXTRACT CONTACTS */}
      {/* ======================================================== */}
      {activeMode === 'extract' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
          
          {/* Left: Input */}
          <div className="bg-[#1e293b] border border-gray-700 rounded-2xl p-6 shadow-xl flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Smart Text Parser</h3>
            <p className="text-gray-400 text-xs mb-4">Open WhatsApp Web, open group info, copy the comma-separated numbers, and paste them below to extract.</p>
            
            <textarea 
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste copied text here... (e.g. You, +91 98765 43210, +1 234 567...)"
              className="flex-1 w-full bg-[#0f172a] border border-gray-600 rounded-xl p-4 text-white outline-none focus:border-fuchsia-500 resize-none font-mono text-sm mb-4 custom-scrollbar"
            ></textarea>
            
            <button onClick={handleExtractText} className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:scale-[1.02] text-white py-3.5 rounded-xl font-bold shadow-lg transition-all">
              Clean & Extract Numbers
            </button>
          </div>

          {/* Right: Output */}
          <div className="bg-[#1e293b] border border-gray-700 rounded-2xl flex flex-col shadow-xl overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#0f172a]">
              <h3 className="text-white font-bold">Extracted List ({extractedData.length})</h3>
              <button 
                onClick={handleExport} 
                disabled={extractedData.length === 0}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${extractedData.length > 0 ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
              >
                ⬇ Download Excel
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-[#0f172a]/50 custom-scrollbar">
               {extractedData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                    <span className="text-5xl mb-4">📋</span>
                    <p className="text-sm">Paste text and click Extract to see numbers.</p>
                  </div>
               ) : (
                  <div className="space-y-2">
                    {extractedData.map(item => (
                      <div key={item.id} className="bg-[#1e293b] p-3 rounded-lg border border-gray-700 flex justify-between items-center animate-fade-in">
                        <span className="text-gray-400 text-xs font-medium">{item.name}</span>
                        <span className="text-fuchsia-400 font-mono text-sm font-bold bg-fuchsia-500/10 px-2 py-1 rounded">{item.phone}</span>
                      </div>
                    ))}
                  </div>
               )}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: SEND TO GROUPS */}
      {/* ======================================================== */}
      {activeMode === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden">
          
          {/* Left Column: Setup */}
          <div className="lg:col-span-4 space-y-4 overflow-y-auto pr-2 pb-10 custom-scrollbar">
            
            <div className="bg-[#1e293b] p-5 rounded-2xl border border-gray-700 shadow-lg">
              <h3 className="text-white font-bold mb-3">1. Upload Group Links</h3>
              <div className="relative group cursor-pointer border border-dashed border-gray-600 rounded-xl p-4 text-center hover:border-fuchsia-500 bg-[#0f172a] transition-all">
                <input type="file" accept=".xlsx, .csv" onChange={handleGroupUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <p className="text-2xl mb-1">🔗</p>
                <p className="text-xs text-gray-300">{file ? file.name : "Upload Excel with Group Links"}</p>
              </div>
              {groups.length > 0 && <p className="text-xs font-bold text-green-400 mt-3">✅ {groups.length} Groups Loaded</p>}
            </div>

            <div className="bg-[#1e293b] p-5 rounded-2xl border border-gray-700 shadow-lg">
               <h3 className="text-white font-bold mb-3">2. Attach File</h3>
               <div className="relative group cursor-pointer border border-dashed border-gray-600 rounded-xl p-4 text-center hover:border-fuchsia-500 bg-[#0f172a] transition-all">
                  <input type="file" accept="*/*" onChange={(e) => setMedia(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <p className="text-2xl mb-1">📎</p>
                  <p className="text-xs text-gray-300 truncate px-2">{media ? media.name : "Attach Image, Video or Doc"}</p>
                </div>
            </div>

            <div className="bg-[#1e293b] p-5 rounded-2xl border border-gray-700 shadow-lg">
              <h3 className="text-white font-bold mb-3">3. Message</h3>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full h-32 bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white text-sm outline-none focus:border-fuchsia-500 resize-none"
                placeholder="Type group message here..."
              ></textarea>
            </div>

          </div>

          {/* Middle/Right Column: Campaign Controls & Logs */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Control Panel */}
            <div className="bg-[#1e293b] p-5 rounded-2xl border border-gray-700 shadow-lg flex items-center justify-between">
              <div>
                 <h3 className="text-white font-bold text-lg">Group Broadcaster</h3>
                 <p className="text-xs text-gray-400">Blast messages to multiple groups instantly.</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="bg-[#0f172a] px-3 py-2 rounded-lg border border-gray-600 flex items-center gap-2">
                    <span className="text-gray-400 text-xs">Delay:</span>
                    <input type="number" value={delay} onChange={e => setDelay(e.target.value)} className="w-10 bg-transparent text-white font-bold text-center outline-none text-sm" />
                 </div>
                 <button 
                   onClick={startGroupCampaign} 
                   disabled={groups.length === 0 || campaignState === 'running'}
                   className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${(groups.length === 0 || campaignState === 'running') ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105'}`}
                 >
                   {campaignState === 'running' ? '🚀 Sending...' : 'Start Blast ▶'}
                 </button>
              </div>
            </div>

            {/* Progress Bar */}
            {campaignState !== 'idle' && (
              <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-lg animate-fade-in">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-sm font-bold text-white">Blast Progress</span>
                   <span className="text-sm font-mono text-blue-400">{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
                   <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 font-medium">
                   <span className="text-green-400">✅ Delivered: {stats.sent}</span>
                   <span className="text-red-400">❌ Failed: {stats.failed}</span>
                   <span className="text-yellow-400">⏳ Pending: {stats.total - stats.sent - stats.failed}</span>
                </div>
              </div>
            )}

            {/* Logs Area */}
            <div className="bg-[#1e293b] rounded-2xl border border-gray-700 shadow-lg flex flex-col flex-1 overflow-hidden">
              <div className="p-4 border-b border-gray-700 bg-[#0f172a] font-bold text-white flex justify-between items-center">
                <span>📡 Action Logs</span>
                <span className="text-[10px] bg-gray-800 px-2 py-1 rounded">Total Groups: {stats.total}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
                {logs.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center opacity-50 text-gray-500">
                      <span className="text-5xl mb-3">💬</span>
                      <p className="text-sm">Upload group links and start campaign.</p>
                   </div>
                ) : logs.map(log => (
                   <div key={log.id} className="flex justify-between items-center bg-[#0f172a] p-3 rounded-lg border border-gray-700/50 hover:border-gray-500 transition-colors animate-fade-in">
                      <div className="flex flex-col">
                         <span className="text-xs font-bold text-gray-300 truncate w-48">{log.to}</span>
                         <span className="text-[10px] text-gray-500 mt-0.5">Group ID / Link processed</span>
                      </div>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider ${
                         log.status.includes('Sent') ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                         log.status.includes('Failed') ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                         'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
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
