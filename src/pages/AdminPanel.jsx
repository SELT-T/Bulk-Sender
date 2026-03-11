import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const adminUser = JSON.parse(localStorage.getItem('reachify_user'));
  const API_URL = "https://reachify-api.selt-3232.workers.dev"; // Tumhara Cloudflare worker URL

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

  const handleAction = async (targetEmail, action) => {
    const confirmMsg = action === 'delete' ? `Are you sure you want to permanently delete ${targetEmail}?` : `Change status of ${targetEmail} to ${action}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${API_URL}/admin/update-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: adminUser.email, targetEmail, action })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchUsers(); // Refresh list
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Action failed. Server error.");
    }
  };

  if (adminUser?.role !== 'admin') {
      return <div className="text-red-500 p-10 text-center font-bold text-2xl">🚫 Access Denied. Admin privileges required.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl md:text-3xl font-black text-white">👑 Admin Master Panel</h2>
           <p className="text-gray-400 text-sm mt-1">Approve, Ban, or Delete users from the system.</p>
        </div>
        <div className="bg-fuchsia-600/20 text-fuchsia-400 px-4 py-2 rounded-lg font-bold border border-fuchsia-500/30">
          Total Users: {users.length}
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
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
                    {u.status === 'approved' && <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">Approved</span>}
                    {u.status === 'pending' && <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse">Pending</span>}
                    {u.status === 'banned' && <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold">Banned</span>}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-fuchsia-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    {u.role !== 'admin' && (
                        <>
                          {u.status !== 'approved' && (
                             <button onClick={() => handleAction(u.email, 'approve')} className="bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-green-500/30">Approve</button>
                          )}
                          {u.status !== 'banned' && (
                             <button onClick={() => handleAction(u.email, 'ban')} className="bg-yellow-600/20 hover:bg-yellow-600 text-yellow-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-yellow-500/30">Ban</button>
                          )}
                          <button onClick={() => handleAction(u.email, 'delete')} className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-red-500/30">Delete</button>
                        </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
