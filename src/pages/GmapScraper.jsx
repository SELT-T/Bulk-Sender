import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const GmapScraper = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [leads, setLeads] = useState([]);
  const [isScraping, setIsScraping] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking'); // Real API Connection Status

  const API_URL = "https://reachify-api.selt-3232.workers.dev";
  const user = JSON.parse(localStorage.getItem('reachify_user')) || { email: 'demo@reachify.com' };

  // 1. Start Scraping Process (Real Connection)
  const handleStartScraping = async () => {
    if (!keyword.trim() || !location.trim()) {
      return alert("❌ Please enter both Keyword and Location (e.g., 'Real Estate' in 'Mumbai').");
    }

    setIsScraping(true);
    setLeads([]);

    try {
      // Real API Call to your Cloudflare Backend
      const res = await fetch(`${API_URL}/scrape-gmaps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, keyword, location })
      });

      if (!res.ok) {
        throw new Error("Google Places API is not configured in your backend yet.");
      }

      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
         setLeads(data.results);
      } else {
         alert("❌ No leads found or API Key is missing in backend.");
      }
    } catch (err) {
      alert(`⚠️ Server Notice: ${err.message}\n(Backend developer needs to add Google Places API key to activate this feature)`);
    }

    setIsScraping(false);
  };

  // 2. Export to Excel
  const handleExportExcel = () => {
    if (leads.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(leads);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `${keyword}_${location}_Leads.xlsx`);
  };

  // 3. Export to vCard (Phone Contacts)
  const handleExportVCard = () => {
    if (leads.length === 0) return;
    let vcard = "";
    leads.forEach(lead => {
      if (lead.phone) {
        vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:${lead.name}\nORG:${lead.name}\nTEL:${lead.phone}\nADR:;;${lead.address}\nEND:VCARD\n`;
      }
    });
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${keyword}_Contacts.vcf`;
    a.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-7xl mx-auto p-2 animate-fade-in-up">
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-md mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
             📍 Google Map Lead Scraper
             <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 rounded text-[10px] text-yellow-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span> API Setup Required
             </span>
          </h2>
          <p className="text-gray-400 text-xs mt-1">Extract highly targeted B2B leads, phone numbers, and ratings directly from Maps.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        
        {/* LEFT: SEARCH PANEL */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
          <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-5 shadow-md">
             <h3 className="text-white font-bold text-sm mb-4">Search Parameters</h3>
             
             <div className="space-y-4">
                <div>
                   <label className="text-xs text-gray-400 font-bold mb-1 block">Niche / Keyword</label>
                   <input 
                     type="text" 
                     value={keyword}
                     onChange={(e) => setKeyword(e.target.value)}
                     placeholder="e.g. Real Estate Brokers, Hospitals"
                     className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-sm text-white outline-none focus:border-fuchsia-500" 
                   />
                </div>
                
                <div>
                   <label className="text-xs text-gray-400 font-bold mb-1 block">Location (City, Area)</label>
                   <input 
                     type="text" 
                     value={location}
                     onChange={(e) => setLocation(e.target.value)}
                     placeholder="e.g. Raipur, Chhattisgarh"
                     className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-sm text-white outline-none focus:border-fuchsia-500" 
                   />
                </div>

                <div className="pt-2">
                   <button 
                     onClick={handleStartScraping} 
                     disabled={isScraping}
                     className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] text-white py-3.5 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50"
                   >
                     {isScraping ? '⏳ Scraping Data...' : 'Start Extraction ⚡'}
                   </button>
                </div>
             </div>

             <div className="mt-6 bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg flex gap-3">
                <span className="text-xl">ℹ️</span>
                <p className="text-[10px] text-gray-400">
                   <strong className="text-blue-400">Note:</strong> This tool requires a valid Google Places API Key or a proxy scraper API integrated into your Cloudflare Backend to fetch live data without getting blocked by Google.
                </p>
             </div>
          </div>
        </div>

        {/* RIGHT: RESULTS TABLE */}
        <div className="lg:col-span-8 bg-[#1e293b] border border-gray-700 rounded-xl flex flex-col shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#0f172a]">
            <h3 className="text-white font-bold text-sm">Extracted Leads ({leads.length})</h3>
            <div className="flex gap-2">
               <button 
                 onClick={handleExportExcel} 
                 disabled={leads.length === 0} 
                 className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${leads.length > 0 ? 'bg-green-600/20 text-green-400 border border-green-500/50 hover:bg-green-600 hover:text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
               >
                 📊 Download Excel
               </button>
               <button 
                 onClick={handleExportVCard} 
                 disabled={leads.length === 0} 
                 className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${leads.length > 0 ? 'bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/50 hover:bg-fuchsia-600 hover:text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
               >
                 📱 Save Contacts (vCard)
               </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar bg-[#0f172a]/50">
             {leads.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                  <span className="text-5xl mb-3">🕸️</span>
                  <p className="text-sm">Enter Keyword & Location to start scraping.</p>
                </div>
             ) : (
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-[#1e293b] text-gray-400 sticky top-0 shadow-sm z-10">
                    <tr>
                      <th className="p-3 w-10 text-center">#</th>
                      <th className="p-3">Business Name</th>
                      <th className="p-3">Phone Number</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3">Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {leads.map((lead, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 text-center text-gray-600">{idx + 1}</td>
                        <td className="p-3 text-gray-300 font-bold">{lead.name}</td>
                        <td className="p-3 text-fuchsia-400 font-mono tracking-wide">{lead.phone || 'N/A'}</td>
                        <td className="p-3 text-yellow-400 font-bold">⭐ {lead.rating || 'N/A'}</td>
                        <td className="p-3 text-gray-500 truncate max-w-[200px]" title={lead.address}>{lead.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GmapScraper;
