import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [instanceId, setInstanceId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [gatewayUrl, setGatewayUrl] = useState('https://wa-api.example.com'); // Default placeholder
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Backend URL (Automatic connect)
  const API_URL = "https://reachify-api.selt-3232.workers.dev";
  
  // User Email (Local storage se lo)
  const user = JSON.parse(localStorage.getItem('reachify_user'));
  const email = user ? user.email : 'demo@reachify.com';

  // 1. Load Saved Settings (Jab page khule)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/get-settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (data.instance_id) {
          setInstanceId(data.instance_id);
          setAccessToken(data.access_token);
          setGatewayUrl(data.gateway_url);
        }
      } catch (err) {
        console.error("Error fetching settings");
      }
    };
    fetchSettings();
  }, [email]);

  // 2. Save Settings Function
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const res = await fetch(`${API_URL}/save-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, instance_id: instanceId, access_token: accessToken, gateway_url: gatewayUrl })
      });
      
      if (res.ok) {
        setMsg('✅ API Settings Saved Successfully!');
      } else {
        setMsg('❌ Failed to save.');
      }
    } catch (err) {
      setMsg('❌ Connection Error.');
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in-up max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">System Settings</h2>

      <div className="bg-[#1e293b] border border-gray-700 rounded-2xl p-8 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-6 border-b border-gray-700 pb-2">WhatsApp API Configuration</h3>
        
        {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msg.includes('✅') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{msg}</div>}

        <form onSubmit={handleSave} className="space-y-6">
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Gateway URL (Provider Link)</label>
            <input 
              type="text" 
              value={gatewayUrl} 
              onChange={(e) => setGatewayUrl(e.target.value)} 
              placeholder="https://api.wamatics.com"
              className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white focus:border-fuchsia-500 outline-none" 
            />
            <p className="text-xs text-gray-500 mt-1">Enter the base URL of your WhatsApp API provider.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Instance ID</label>
              <input 
                type="text" 
                value={instanceId} 
                onChange={(e) => setInstanceId(e.target.value)} 
                placeholder="Ex: 609238492"
                className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white focus:border-fuchsia-500 outline-none" 
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Access Token</label>
              <input 
                type="text" 
                value={accessToken} 
                onChange={(e) => setAccessToken(e.target.value)} 
                placeholder="Ex: a8s7d8a7sd87..."
                className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white focus:border-fuchsia-500 outline-none" 
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">Your keys are stored securely in your private database.</p>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-fuchsia-500/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
