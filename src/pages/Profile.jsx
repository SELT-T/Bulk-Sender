import React, { useState } from 'react';

const Profile = ({ user, onLogout }) => {
  const [name, setName] = useState(user.name || 'Admin');
  const [pass, setPass] = useState(user.password || '');
  const [msg, setMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    const API_URL = "https://reachify-api.selt-3232.workers.dev"; 
    
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
    // Mobile par margin kam rakha hai (mt-4) aur PC par (mt-10)
    <div className="max-w-2xl mx-auto mt-4 md:mt-10 p-2 md:p-0 animate-fade-in-up">
      <div className="bg-[#1e293b] border border-gray-700 rounded-3xl p-5 md:p-8 shadow-2xl">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white">My Profile</h2>
          <button 
             onClick={onLogout} 
             className="bg-red-500/10 text-red-400 border border-red-500/50 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold hover:bg-red-500 hover:text-white transition-all shadow-md"
          >
            Logout 🚪
          </button>
        </div>

        {msg && (
           <div className="mb-5 p-3 md:p-4 bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300 rounded-xl text-xs md:text-sm font-medium text-center animate-fade-in">
              {msg}
           </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4 md:space-y-5">
          <div>
            <label className="block text-gray-400 text-[10px] md:text-xs font-bold mb-1.5 uppercase tracking-wider ml-1">Email (Read Only)</label>
            <input 
               type="text" 
               value={user.email} 
               disabled 
               className="w-full bg-[#0f172a]/50 border border-gray-700 rounded-xl p-3.5 md:p-3 text-gray-500 text-base md:text-sm cursor-not-allowed" 
            />
          </div>
          <div>
            <label className="block text-gray-400 text-[10px] md:text-xs font-bold mb-1.5 uppercase tracking-wider ml-1">Full Name</label>
            <input 
               type="text" 
               value={name} 
               onChange={(e) => setName(e.target.value)} 
               className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3.5 md:p-3 text-white text-base md:text-sm focus:border-fuchsia-500 outline-none transition-all focus:shadow-[0_0_10px_rgba(217,70,239,0.2)]" 
            />
          </div>
          <div>
            <label className="block text-gray-400 text-[10px] md:text-xs font-bold mb-1.5 uppercase tracking-wider ml-1">Password</label>
            <input 
               type="text" 
               value={pass} 
               onChange={(e) => setPass(e.target.value)} 
               className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3.5 md:p-3 text-white text-base md:text-sm focus:border-fuchsia-500 outline-none transition-all focus:shadow-[0_0_10px_rgba(217,70,239,0.2)]" 
            />
          </div>
          
          <div className="pt-3">
             <button className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:scale-[1.02] text-white font-bold py-3.5 md:py-4 rounded-xl mt-2 transition-all shadow-lg text-sm md:text-base uppercase tracking-wider">
               Save Changes
             </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Profile;
