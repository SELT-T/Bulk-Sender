import React, { useState } from 'react';

const Profile = ({ user, onLogout }) => {
  const [name, setName] = useState(user.name || 'Admin');
  const [pass, setPass] = useState(user.password || '');
  const [msg, setMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    // Yahan Backend URL dalna hoga (Step 4 mein set karenge)
    const API_URL = "https://reachify-api.SELT-T.workers.dev"; // Example URL, replace later
    
    try {
      await fetch(`${API_URL}/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, newName: name, newPassword: pass })
      });
      setMsg("✅ Profile Updated Successfully!");
    } catch (err) {
      setMsg("❌ Error updating profile");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-[#1e293b] border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">My Profile</h2>
          <button onClick={onLogout} className="bg-red-500/10 text-red-400 border border-red-500/50 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all">
            Logout 🚪
          </button>
        </div>

        {msg && <div className="mb-4 p-3 bg-fuchsia-500/20 text-fuchsia-300 rounded-lg text-sm">{msg}</div>}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Email (Read Only)</label>
            <input type="text" value={user.email} disabled className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-gray-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-white focus:border-fuchsia-500 outline-none" />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Password</label>
            <input type="text" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-white focus:border-fuchsia-500 outline-none" />
          </div>
          <button className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-3 rounded-xl mt-4">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
