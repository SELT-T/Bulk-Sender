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
// ✅ 1. Naya Advance Page yahan import kiya hai
import PersonalizedSender from './pages/PersonalizedSender';

function App() {
  // YADDASHT FIX: Shuruat mein hi check karo ki purana user saved hai kya?
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('reachify_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activePage, setActivePage] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login');

  // Jab bhi User login/logout ho, use Memory (LocalStorage) mein save karo
  useEffect(() => {
    if (user) {
      localStorage.setItem('reachify_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('reachify_user');
    }
  }, [user]);

  // Logout Function
  const handleLogout = () => {
    setUser(null);
    setAuthMode('login');
    // localStorage useEffect se apne aap clear ho jayega
  };

  // Agar user login nahi hai, to Login Screen dikhao
  if (!user) {
    if (authMode === 'signup') return <Signup switchToLogin={() => setAuthMode('login')} />;
    return <Login onLogin={setUser} switchToSignup={() => setAuthMode('signup')} />;
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
      // ✅ 2. Yahan naya route set kar diya hai
      case 'personalized': return <PersonalizedSender />;
      default: return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a]">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Topbar 
          user={user} 
          setActivePage={setActivePage} 
          onLogout={handleLogout} 
        />
        <main className="flex-1 overflow-y-auto p-6 transition-all duration-300">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
