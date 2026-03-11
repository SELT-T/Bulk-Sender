import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';

const GroupTools = () => {
  const [activeMode, setActiveMode] = useState('extract'); // 'extract' or 'send'
  
  // 🟢 Connection States
  const [waStatus, setWaStatus] = useState('checking'); 
  const [connectionMode, setConnectionMode] = useState('api'); // 'api' or 'web'

  // ==========================================
  // STATE: GROUP EXTRACTOR
  // ==========================================
  const [extractMethod, setExtractMethod] = useState('parser');
  const [groupLink, setGroupLink] = useState('');
  const [rawText, setRawText] = useState('');
  const [extractedData, setExtractedData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  // ==========================================
  // STATE: GROUP SENDER & FETCHER
  // ==========================================
  const [groups, setGroups] = useState([]); // Excel Groups
  
  // 🟢 NAYE STATES: Live Group Fetching ke liye
  const [fetchedGroups, setFetchedGroups] = useState([]); // Asli groups from WA
  const [selectedGroupIds, setSelectedGroupIds] = useState([]); // Jo user tick karega
  const [isFetchingGroups, setIsFetchingGroups] = useState(false);

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
  const WA_ENGINE_URL = "https://reachify-wa-engine.onrender.com"; 
  const user = JSON.parse(localStorage.getItem('reachify_user')) || { email: 'demo@reachify.com' };

  // 0. 🔥 FIXED: PROPER API / WEB CONNECTION CHECK 🔥
  useEffect(() => {
    let interval;
    const checkRealConnection = async () => {
      if (!user) return setWaStatus('disconnected');
      
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
           const res = await fetch(`${API_URL}/get-settings`, {
             method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email })
           });
           const data = await res.json();
           if (data.instance_id && data.access_token) setWaStatus('connected');
           else setWaStatus('disconnected');
        }
      } catch (err) {
        setWaStatus('sleeping'); 
      }
    };
    
    checkRealConnection();

    interval = setInterval(() => {
        checkRealConnection();
        const savedSettings = JSON.parse(localStorage.getItem('reachify_api_settings') || '{}');
        if (savedSettings.wa_connection_mode === 'web') fetch(`${WA_ENGINE_URL}/`).catch(() => {});
    }, 15000); 

    return () => clearInterval(interval);
  }, [user.email]);


  // ==========================================
  // LOGIC: EXTRACTOR
  // ==========================================
  const handleApiFetch = async () => {
    if (!groupLink.trim()) return alert("❌ Please enter a Group Link or ID!");
    if (waStatus !== 'connected') return alert("❌ WhatsApp API is NOT connected!");
    
    setIsFetching(true);
    setExtractedData([]);

    try {
      const res = await fetch(`${API_URL}/extract-group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, group_id: groupLink })
      });
      if (!res.ok) throw new Error("API Gateway rejected the request.");
      const data = await res.json();
      if (data.members && data.members.length > 0) setExtractedData(data.members);
      else alert("❌ No members found or Bot is not in this group.");
    } catch (err) {
      alert(`❌ API Error: ${err.message}`);
    }
    setIsFetching(false);
  };

  const handleParseText = () => {
    if (!rawText.trim()) return alert("❌ Please paste some WhatsApp group text first!");
    const phoneRegex = /\+?\d{1,4}[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
    const foundNumbers = rawText.match(phoneRegex);

    if (foundNumbers) {
      const uniqueNumbers = [...new Set(foundNumbers.map(n => n.replace(/[^0-9+]/g, '')))];
      const formattedData = uniqueNumbers.filter(n => n.length >= 10).map((num, index) => ({
        id: index + 1, name: `Contact ${index + 1}`, phone: num, isAdmin: false
      }));
      setExtractedData(formattedData);
    } else {
      alert("❌ No real phone numbers found.");
    }
  };

  const handleExportExcel = () => {
    if (extractedData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(extractedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, "Extracted_Members.xlsx");
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
    a.href = url; a.download = "Extracted_Contacts.vcf"; a.click();
  };

  // ==========================================
  // LOGIC: GROUP SENDER & LIVE FETCHING
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
        } else alert("❌ No Group Links found in file.");
      } catch (error) { alert("❌ Error reading Excel."); }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  // 🟢 NAYA FUNCTION: REAL WHATSAPP GROUPS FETCH KAREGA
  const fetchMyGroups = async () => {
    if (waStatus !== 'connected') return alert("❌ Your WhatsApp is not connected!");
    if (connectionMode !== 'web') return alert("⚠️ This feature works best with WhatsApp Web mode. Please switch in Settings.");

    setIsFetchingGroups(true);
    try {
        // Backend Render Server ko hit karega groups lane ke liye
        const res = await fetch(`${WA_ENGINE_URL}/api/wa-get-groups`);
        const data = await res.json();
        
        if (data.success && data.groups && data.groups.length > 0) {
            setFetchedGroups(data.groups); // Expecting array of { id: '123@g.us', name: 'Group Name' }
            alert(`✅ Successfully fetched ${data.groups.length} groups!`);
        } else {
            alert("❌ No groups found in your WhatsApp account.");
        }
    } catch (error) {
        alert("⚠️ Error fetching groups from server. Ensure your WhatsApp Web engine is running.");
    }
    setIsFetchingGroups(false);
  };

  const toggleGroupSelection = (groupId) => {
      setSelectedGroupIds(prev => 
          prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
      );
  };

  const selectAllGroups = () => {
      if (selectedGroupIds.length === fetchedGroups.length) {
          setSelectedGroupIds([]); // Deselect all
      } else {
          setSelectedGroupIds(fetchedGroups.map(g => g.id)); // Select all
      }
  };

  const startGroupCampaign = async () => {
    // 🟢 Dono list mila kar check karo
    const finalTargets = [];
    
    // Add Excel Groups
    groups.forEach(g => finalTargets.push({ id: g.link, name: g.name }));
    // Add Live Fetched Groups
    fetchedGroups.filter(g => selectedGroupIds.includes(g.id)).forEach(g => {
        finalTargets.push({ id: g.id, name: g.name });
    });

    if (finalTargets.length === 0) return alert("❌ Please upload an Excel list OR fetch and select groups first!");
    if (waStatus !== 'connected') return alert("❌ WhatsApp API is disconnected!");
    
    setCampaignState('running'); stopRef.current = false; setLogs([]); setProgress(0);
    let currentSent = 0, currentFailed = 0;

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
          alert("❌ Error processing media.");
          setCampaignState('stopped'); return;
       }
    }

    for (let i = 0; i < finalTargets.length; i++) {
      if (stopRef.current) { setCampaignState('completed'); break; }
      const group = finalTargets[i];
      setLogs(prev => [{ id: i + 1, to: group.name, status: "Sending..." }, ...prev]);

      try {
        let res;
        if (connectionMode === 'web') {
           res = await fetch(`${WA_ENGINE_URL}/api/wa-send`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               target: group.id, // group ID like 12345@g.us
               text: message,
               isGroup: true, // Tell backend it's a group
               mediaBase64: rawBase64MediaData, 
               mediaType: mimeType,           
               fileName: originalFileName     
             })
           });
        } else {
           res = await fetch(`${API_URL}/send-message`, {
             method: 'POST', headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ email: user.email, phone: group.id, message, media_type: media?.type || 'text', is_group: true })
           });
        }

        if (res.ok) { currentSent++; setLogs(prev => prev.map(l => l.id === i + 1 ? { ...l, status: "✅ Sent" } : l)); } 
        else { currentFailed++; setLogs(prev => prev.map(l => l.id === i + 1 ? { ...l, status: "❌ Failed" } : l)); }
      } catch (err) {
        currentFailed++; setLogs(prev => prev.map(l => l.id === i + 1 ? { ...l, status: "⚠️ Error" } : l));
      }
      setStats({ sent: currentSent, failed: currentFailed, total: finalTargets.length });
      setProgress(Math.round(((i + 1) / finalTargets.length) * 100));
      if (i < finalTargets.length - 1) await new Promise(r => setTimeout(r, delay * 1000));
    }
    setCampaignState('completed');
  };

  return (
    <div className="flex flex-col h-auto min-h-screen lg:min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] gap-4 max-w-7xl mx-auto p-2 md:p-4 animate-fade-in-up pb-20 lg:pb-0">
      
      {/* TOP NAVIGATION TOGGLE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#1e293b] p-3 md:p-4 rounded-xl border border-gray-700 shadow-md gap-3 sm:gap-0">
        <h2 className="text-lg md:text-xl font-bold text-white flex flex-wrap items-center gap-2 md:gap-3">
           ⚙️ Group Automation
           {waStatus === 'connected' ? (
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded text-[9px] md:text-[10px] text-green-400">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> {connectionMode === 'web' ? 'Web Connected' : 'API Connected'}
              </span>
           ) : waStatus === 'sleeping' ? (
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 rounded text-[9px] md:text-[10px] text-yellow-400">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span> Waking Server...
              </span>
           ) : (
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-[9px] md:text-[10px] text-red-400">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Disconnected
              </span>
           )}
        </h2>
        <div className="flex bg-[#0f172a] p-1 rounded-lg border border-gray-600 w-full sm:w-auto">
          <button onClick={() => setActiveMode('extract')} className={`flex-1 sm:flex-none px-3 md:px-5 py-1.5 md:py-2 rounded-md text-[10px] md:text-xs font-bold transition-all ${activeMode === 'extract' ? 'bg-fuchsia-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
            🔍 Extract
          </button>
          <button onClick={() => setActiveMode('send')} className={`flex-1 sm:flex-none px-3 md:px-5 py-1.5 md:py-2 rounded-md text-[10px] md:text-xs font-bold transition-all ${activeMode === 'send' ? 'bg-fuchsia-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
            🚀 Send
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: EXTRACT CONTACTS */}
      {/* ======================================================== */}
      {activeMode === 'extract' && (
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 flex-1 overflow-y-auto lg:overflow-hidden">
          {/* Left: Input Modes */}
          <div className="w-full lg:w-[400px] flex flex-col gap-4 overflow-y-visible lg:overflow-y-auto pr-1 custom-scrollbar flex-shrink-0">
            <div className="flex bg-[#1e293b] border border-gray-700 rounded-xl p-1 shadow-md">
               <button onClick={() => setExtractMethod('api')} className={`flex-1 py-2 md:py-2.5 rounded-lg text-[10px] md:text-xs font-bold transition-all ${extractMethod === 'api' ? 'bg-[#0f172a] text-white border border-gray-600' : 'text-gray-500 hover:text-gray-300'}`}>🔗 Link (API)</button>
               <button onClick={() => setExtractMethod('parser')} className={`flex-1 py-2 md:py-2.5 rounded-lg text-[10px] md:text-xs font-bold transition-all ${extractMethod === 'parser' ? 'bg-[#0f172a] text-white border border-gray-600' : 'text-gray-500 hover:text-gray-300'}`}>📝 Parser (Free)</button>
            </div>
            {extractMethod === 'api' ? (
              <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-4 md:p-5 shadow-md animate-fade-in flex flex-col gap-3 md:gap-4">
                 <div>
                    <h3 className="text-white font-bold text-xs md:text-sm mb-1">Group Link / ID</h3>
                    <p className="text-[9px] md:text-[10px] text-gray-400 mb-2 md:mb-3">Requires a paid API config in Settings.</p>
                    <input type="text" value={groupLink} onChange={(e) => setGroupLink(e.target.value)} placeholder="https://chat.whatsapp.com/..." className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-2.5 md:p-3 text-xs md:text-sm text-white outline-none focus:border-fuchsia-500" />
                 </div>
                 <button onClick={handleApiFetch} disabled={isFetching} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] text-white py-2.5 md:py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 text-xs md:text-sm">
                    {isFetching ? '⏳ Querying API...' : 'Fetch via API ⚡'}
                 </button>
              </div>
            ) : (
              <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-4 md:p-5 shadow-md animate-fade-in flex flex-col gap-3 md:gap-4 flex-1">
                 <div>
                    <h3 className="text-white font-bold text-xs md:text-sm mb-1">Smart Text Parser</h3>
                    <p className="text-[9px] md:text-[10px] text-gray-400 mb-1 md:mb-2">Paste copied text from WhatsApp Web Group Info.</p>
                 </div>
                 <textarea value={rawText} onChange={(e) => setRawText(e.target.value)} placeholder="Paste copied text here..." className="flex-1 w-full min-h-[150px] lg:min-h-0 bg-[#0f172a] border border-gray-600 rounded-lg p-2.5 md:p-3 text-white outline-none focus:border-fuchsia-500 resize-none font-mono text-[10px] md:text-xs custom-scrollbar"></textarea>
                 <button onClick={handleParseText} className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:scale-[1.02] text-white py-2.5 md:py-3 rounded-xl font-bold shadow-lg transition-all text-xs md:text-sm">
                    Clean & Extract
                 </button>
              </div>
            )}
          </div>

          {/* Right: Output Table */}
          <div className="flex-1 bg-[#1e293b] border border-gray-700 rounded-xl flex flex-col shadow-md overflow-hidden min-h-[300px] lg:min-h-0">
            <div className="p-3 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#0f172a] gap-2 sm:gap-0">
              <h3 className="text-white font-bold text-xs md:text-sm">Extracted Members ({extractedData.length})</h3>
              <div className="flex gap-2 w-full sm:w-auto">
                 <button onClick={handleExportExcel} disabled={extractedData.length === 0} className={`flex-1 sm:flex-none px-2 md:px-3 py-1.5 rounded text-[10px] md:text-xs font-bold transition-all ${extractedData.length > 0 ? 'bg-green-600/20 text-green-400 border border-green-500/50 hover:bg-green-600 hover:text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>📊 Excel</button>
                 <button onClick={handleExportVCard} disabled={extractedData.length === 0} className={`flex-1 sm:flex-none px-2 md:px-3 py-1.5 rounded text-[10px] md:text-xs font-bold transition-all ${extractedData.length > 0 ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50 hover:bg-blue-600 hover:text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>📱 vCard</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar bg-[#0f172a]/50">
               {extractedData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60 min-h-[200px]">
                    <span className="text-3xl md:text-4xl mb-2">👥</span><p className="text-[10px] md:text-xs">Numbers will appear here.</p>
                  </div>
               ) : (
                  <table className="w-full text-left text-[10px] md:text-xs whitespace-nowrap min-w-[400px]">
                    <thead className="bg-[#1e293b] text-gray-400 sticky top-0 shadow-sm z-10">
                      <tr><th className="p-2 md:p-3 w-10 md:w-16 text-center">#</th><th className="p-2 md:p-3">Name</th><th className="p-2 md:p-3">Phone Number</th><th className="p-2 md:p-3 text-center">Role</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {extractedData.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-2 text-center text-gray-600">{idx + 1}</td>
                          <td className="p-2 text-gray-300 font-medium">{item.name}</td>
                          <td className="p-2 text-fuchsia-400 font-mono tracking-wide">{item.phone}</td>
                          <td className="p-2 text-center">{item.isAdmin ? <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-[8px] md:text-[10px] font-bold">ADMIN</span> : <span className="text-gray-600 text-[8px] md:text-[10px]">MEMBER</span>}</td>
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
      {/* VIEW 2: SEND TO GROUPS (🔥 NOW WITH LIVE FETCH 🔥) */}
      {/* ======================================================== */}
      {activeMode === 'send' && (
         <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-y-auto lg:overflow-hidden">
          
         {/* Left Column: Setup */}
         <div className="w-full lg:w-[400px] flex flex-col gap-4 overflow-y-visible lg:overflow-y-auto pr-1 custom-scrollbar flex-shrink-0">
           
           {/* 🟢 NEW: LIVE FETCH GROUPS SECTION 🟢 */}
           <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-md">
             <div className="flex justify-between items-center mb-2">
                 <h3 className="text-white font-bold text-xs md:text-sm">1. Select Destination Groups</h3>
                 <span className="text-[10px] text-fuchsia-400 font-bold bg-fuchsia-500/10 px-2 py-1 rounded">Total: {groups.length + selectedGroupIds.length}</span>
             </div>

             {/* Tab Switcher inside Setup */}
             <div className="flex gap-2 mb-3">
                <button className="flex-1 bg-[#0f172a] border border-fuchsia-500 text-fuchsia-400 text-[10px] py-1.5 rounded font-bold">From WhatsApp</button>
             </div>
             
             {/* The Live Fetcher Box */}
             <div className="bg-[#0f172a] rounded-lg border border-gray-600 p-3 mb-3 flex flex-col relative overflow-hidden">
                 {fetchedGroups.length === 0 ? (
                     <div className="text-center py-4">
                         <span className="text-3xl mb-2 block opacity-50 text-gray-400">📱</span>
                         <p className="text-xs text-gray-300 font-bold mb-1">Load Active Groups</p>
                         <p className="text-[9px] text-gray-500 mb-3">Fetch groups directly from your connected WhatsApp.</p>
                         <button onClick={fetchMyGroups} disabled={isFetchingGroups} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] px-4 py-2 rounded font-bold transition-all shadow-lg w-full disabled:opacity-50">
                             {isFetchingGroups ? '⏳ Fetching from Phone...' : 'Fetch My Groups'}
                         </button>
                     </div>
                 ) : (
                     <div className="flex flex-col h-[200px]">
                         <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-700">
                             <span className="text-[10px] text-green-400 font-bold">✅ Found {fetchedGroups.length} Groups</span>
                             <button onClick={selectAllGroups} className="text-[10px] text-fuchsia-400 hover:text-white transition-all">
                                 {selectedGroupIds.length === fetchedGroups.length ? 'Deselect All' : 'Select All'}
                             </button>
                         </div>
                         <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                             {fetchedGroups.map(grp => (
                                 <label key={grp.id} className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded cursor-pointer transition-colors border border-transparent hover:border-gray-600">
                                     <input 
                                         type="checkbox" 
                                         checked={selectedGroupIds.includes(grp.id)} 
                                         onChange={() => toggleGroupSelection(grp.id)}
                                         className="w-3.5 h-3.5 accent-fuchsia-500 cursor-pointer"
                                     />
                                     <span className="text-[11px] text-gray-300 truncate font-medium">{grp.name}</span>
                                 </label>
                             ))}
                         </div>
                     </div>
                 )}
             </div>

             <div className="relative flex items-center justify-center my-3">
                 <div className="border-t border-gray-600 w-full"></div>
                 <span className="bg-[#1e293b] px-3 text-[10px] text-gray-500 absolute font-bold uppercase">OR</span>
             </div>

             <div className="relative group cursor-pointer border border-dashed border-gray-600 rounded-lg p-3 text-center hover:border-fuchsia-500 bg-[#0f172a] transition-all">
               <input type="file" accept=".xlsx, .csv" onChange={handleGroupUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
               <p className="text-xl mb-1">🔗</p>
               <p className="text-[9px] md:text-[10px] text-gray-400">{file ? file.name : "Upload Excel with Group IDs"}</p>
             </div>
           </div>

           <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-md">
              <h3 className="text-white font-bold text-xs md:text-sm mb-2">2. Attach Media (Optional)</h3>
              <div className="relative group cursor-pointer border border-dashed border-gray-600 rounded-lg p-3 text-center hover:border-fuchsia-500 bg-[#0f172a] transition-all">
                 <input type="file" accept="*/*" onChange={(e) => setMedia(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                 <p className="text-xl mb-1">📎</p>
                 <p className="text-[9px] md:text-[10px] text-gray-400 truncate px-2">{media ? media.name : "Any File / Image"}</p>
               </div>
           </div>

           <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-md flex-1 flex flex-col min-h-[150px]">
             <h3 className="text-white font-bold text-xs md:text-sm mb-2">3. Message Text</h3>
             <textarea 
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               className="flex-1 w-full min-h-[100px] bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-white text-[10px] md:text-xs outline-none focus:border-fuchsia-500 resize-none custom-scrollbar"
               placeholder="Type group message here..."
             ></textarea>
           </div>

         </div>

         {/* Right Column: Controls & Logs */}
         <div className="flex-1 flex flex-col gap-4">
           
           <div className="bg-[#1e293b] p-3 md:p-4 rounded-xl border border-gray-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
             <div>
                <h3 className="text-white font-bold text-sm md:text-base">Group Broadcaster</h3>
                <p className="text-[9px] md:text-[10px] text-gray-400">Blast to selected live groups or uploaded lists.</p>
             </div>
             <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                <div className="bg-[#0f172a] px-2 py-1.5 md:py-2 rounded-lg border border-gray-600 flex items-center justify-center gap-2 flex-1 md:flex-none">
                   <span className="text-gray-400 text-[9px] md:text-[10px]">Delay:</span>
                   <input type="number" value={delay} onChange={e => setDelay(e.target.value)} className="w-8 bg-transparent text-white font-bold text-center outline-none text-[10px] md:text-xs" />
                </div>
                <button onClick={startGroupCampaign} disabled={(groups.length === 0 && selectedGroupIds.length === 0) || campaignState === 'running' || waStatus !== 'connected'} className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold text-white shadow-lg transition-all ${((groups.length === 0 && selectedGroupIds.length === 0) || campaignState === 'running' || waStatus !== 'connected') ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105'}`}>
                  {campaignState === 'running' ? '🚀 Sending...' : 'Start Blast ▶'}
                </button>
             </div>
           </div>

           {campaignState !== 'idle' && (
             <div className="bg-[#1e293b] p-3 rounded-xl border border-gray-700 shadow-md">
               <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] md:text-xs font-bold text-white">Blast Progress</span>
                  <span className="text-[10px] md:text-xs font-mono text-blue-400">{progress}%</span>
               </div>
               <div className="w-full bg-gray-700 rounded-full h-1.5 md:h-2 mb-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
               </div>
               <div className="flex justify-between text-[9px] md:text-[10px] text-gray-400 font-medium">
                  <span className="text-green-400">Delivered: {stats.sent}</span>
                  <span className="text-red-400">Failed: {stats.failed}</span>
                  <span className="text-yellow-400">Pending: {stats.total - stats.sent - stats.failed}</span>
               </div>
             </div>
           )}

           <div className="bg-[#1e293b] rounded-xl border border-gray-700 shadow-md flex flex-col flex-1 overflow-hidden min-h-[300px] lg:min-h-0">
             <div className="p-3 border-b border-gray-700 bg-[#0f172a] font-bold text-white flex justify-between items-center">
               <span className="text-xs md:text-sm">📡 Action Logs</span>
               <span className="text-[9px] md:text-[10px] bg-gray-800 px-2 py-1 rounded">Total: {stats.total}</span>
             </div>
             <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 custom-scrollbar bg-[#0f172a]/30">
               {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-40 text-gray-500">
                     <span className="text-3xl md:text-4xl mb-2">💬</span>
                     <p className="text-[10px] md:text-xs">Select groups and start blasting.</p>
                  </div>
               ) : logs.map(log => (
                  <div key={log.id} className="flex justify-between items-center bg-[#0f172a] p-2 rounded-lg border border-gray-700/50 hover:border-gray-500 transition-colors">
                     <span className="text-[10px] md:text-xs font-bold text-gray-300 truncate w-[150px] md:w-48">{log.to}</span>
                     <span className={`text-[8px] md:text-[9px] font-bold px-1.5 md:px-2 py-0.5 rounded uppercase ${log.status.includes('Sent') ? 'bg-green-500/20 text-green-400' : log.status.includes('Failed') ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
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
