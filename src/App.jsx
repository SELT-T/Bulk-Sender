import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// Pages
import Dashboard from './pages/Dashboard';
import BulkSender from './pages/BulkSender';
import AITools from './pages/AITools';
import SocialConnect from './pages/SocialConnect';
import Settings from './pages/Settings';
import GroupTools from './pages/GroupTools';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import PersonalizedSender from './pages/PersonalizedSender';
import GmapScraper from './pages/GmapScraper';

// 👑 NEW: Admin Panel Page
import AdminPanel from './pages/AdminPanel';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('reachify_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activePage, setActivePage] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login');
  
  // Mobile Sidebar control
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('reachify_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('reachify_user');
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setAuthMode('login');
  };

  // Login Screen
  if (!user) {
    if (authMode === 'signup') return <Signup switchToLogin={() => setAuthMode('login')} />;
    return <Login onLogin={setUser} switchToSignup={() => setAuthMode('signup')} />;
  }

  // Pending Status Check (Sirf approved logo ko aandar aane dega)
  // Agar Admin ne ban ya pending rakha hai, toh ye dikhega
  if (user.role !== 'admin' && user.status !== 'approved') {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] p-4 text-center">
              <div className="bg-[#1e293b] p-8 rounded-2xl border border-gray-700 shadow-2xl max-w-md">
                 <span className="text-6xl block mb-4">⏳</span>
                 <h2 className="text-2xl font-bold text-white mb-2">Account Pending</h2>
                 <p className="text-gray-400 mb-6">Your account is currently waiting for Administrator approval. Please check back later.</p>
                 <button onClick={handleLogout} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2 px-6 rounded-lg transition-all">
                    Logout
                 </button>
              </div>
          </div>
      );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard setActivePage={setActivePage} />;
      case 'campaign': return <BulkSender />;
      case 'grouptools': return <GroupTools />;
      case 'ai-tools': return <AITools />;
      case 'social': return <SocialConnect />;
      case 'settings': return <Settings />;
      case 'profile': return <Profile user={user} onLogout={handleLogout} />;
      case 'personalized': return <PersonalizedSender />;
      case 'gmap-scraper': return <GmapScraper />;
      // 👑 NEW: Admin Panel Route
      case 'admin-panel': return <AdminPanel />;
      default: return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a]">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        userRole={user?.role} // 👑 Passing role to hide/show Admin button in Sidebar
      />
      
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Topbar 
          user={user} 
          setActivePage={setActivePage} 
          onLogout={handleLogout} 
          toggleSidebar={() => setIsSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-2 md:p-6 transition-all duration-300">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
