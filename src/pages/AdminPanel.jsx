import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add User Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const adminUser = JSON.parse(localStorage.getItem('reachify_user'));
  const API_URL = "https://reachify-api.selt-3232.workers.dev"; 

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: adminUser.email })
      });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error("Failed to fetch users");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Approve, Ban, Delete
  const handleAction = async (targetEmail, action) => {
    const confirmMsg = action === 'delete' ? `⚠️ Are you sure you want to permanently delete ${targetEmail}?` : `Change status of ${targetEmail} to ${action}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${API_URL}/admin/update-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: adminUser.email, targetEmail, action })
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers(); 
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Action failed. Server error.");
    }
  };

  // Handle Create New User from Admin Panel
  const handleAddUser = async (e) => {
      e.preventDefault();
      setIsAdding(true);
      try {
          // Backend ke /signup route ka hi use karenge background me
          const res = await fetch(`${API_URL}/signup`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: newUserName, email: newUserEmail, password: newUserPassword })
          });
          const data = await res.json();
          
          if (res.ok) {
              alert("✅ User created successfully! (They are pending approval by default)");
              setShowAddModal(false);
              setNewUserName(''); setNewUserEmail(''); setNewUserPassword('');
              fetchUsers(); // Refresh list
          } else {
              alert(data.error || "Failed to create user");
          }
      } catch (err) {
          alert("Network Error");
      }
      setIsAdding(false);
  };

  if (adminUser?.role !== 'admin') {
      return <div className="text-red-500 p-10 text-center font-bold text-2xl mt-20">🚫 Access Denied. Super Admin privileges required.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
           <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">👑 Admin Master Panel</h2>
           <p className="text-gray-400 text-sm mt-1">Create, Approve, Ban, or Delete users from the system.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
             onClick={() => setShowAddModal(true)}
             className="flex-1 md:flex-none bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:scale-105 transition-all text-white px-4 py-2 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2"
          >
             ➕ Create User
          </button>
          <div className="bg-[#1e293b] text-fuchsia-400 px-4 py-2 rounded-lg font-bold border border-gray-700 shadow-md">
            Total Users: {users.length}
          </div>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left whitespace-nowrap min-w-[700px]">
            <thead className="bg-[#0f172a] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700">
              <tr>
                <th className="p-4 font-bold">ID</th>
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Email</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-center">Role</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                 <tr><td colSpan="6" className="p-6 text-center text-gray-500">Loading users...</td></tr>
              ) : users.length === 0 ? (
                 <tr><td colSpan="6" className="p-6 text-center text-gray-500">No users found.</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors text-sm">
                  <td className="p-4 text-gray-500 font-mono">#{u.id}</td>
                  <td className="p-4 text-white font-bold">{u.name}</td>
                  <td className="p-4 text-gray-400">{u.email}</td>
                  <td className="p-4 text-center">
                    {u.status === 'approved' && <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">Approved</span>}
                    {u.status === 'pending' && <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse border border-yellow-500/20">Pending</span>}
                    {u.status === 'banned' && <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20">Banned</span>}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-fuchsia-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    {/* 🔥 FIX: Admin khud ko delete/ban nahi kar sakta, par baaki sab ko (chahe wo bhi admin ho) kar sakta hai */}
                    {u.email !== adminUser.email ? (
                        <>
                          {u.status !== 'approved' && (
                             <button onClick={() => handleAction(u.email, 'approve')} className="bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-green-500/30">Approve</button>
                          )}
                          {u.status !== 'banned' && (
                             <button onClick={() => handleAction(u.email, 'ban')} className="bg-yellow-600/20 hover:bg-yellow-600 text-yellow-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-yellow-500/30">Ban</button>
                          )}
                          <button onClick={() => handleAction(u.email, 'delete')} className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-red-500/30">Delete</button>
                        </>
                    ) : (
                        <span className="text-xs text-gray-500 italic px-2 py-1">You (Super Admin)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ➕ Add User Modal Popup */}
      {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#1e293b] w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl p-6 relative animate-fade-in-up">
                  <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">✕</button>
                  <h3 className="text-xl font-bold text-white mb-4">Create New User</h3>
                  <form onSubmit={handleAddUser} className="space-y-4">
                      <div>
                          <label className="text-xs text-gray-400 font-bold mb-1 block">Full Name</label>
                          <input type="text" required value={newUserName} onChange={e=>setNewUserName(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-white outline-none focus:border-fuchsia-500" placeholder="John Doe" />
                      </div>
                      <div>
                          <label className="text-xs text-gray-400 font-bold mb-1 block">Email Address</label>
                          <input type="email" required value={newUserEmail} onChange={e=>setNewUserEmail(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-white outline-none focus:border-fuchsia-500" placeholder="user@reachify.com" />
                      </div>
                      <div>
                          <label className="text-xs text-gray-400 font-bold mb-1 block">Password</label>
                          <input type="text" required minLength="6" value={newUserPassword} onChange={e=>setNewUserPassword(e.target.value)} className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-white outline-none focus:border-fuchsia-500" placeholder="Min 6 characters" />
                      </div>
                      <button type="submit" disabled={isAdding} className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold py-3 rounded-xl mt-2 hover:scale-[1.02] transition-all disabled:opacity-50">
                          {isAdding ? 'Creating...' : 'Create Account'}
                      </button>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
};

export default AdminPanel;
