import React, { useState } from 'react';
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

function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login');

  // Master Key Login Bypass included
  if (!user) {
    if (authMode === 'signup') return <Signup switchToLogin={() => setAuthMode('login')} />;
    return <Login onLogin={setUser} switchToSignup={() => setAuthMode('signup')} />;
  }

  // Logout Function
  const handleLogout = () => {
    setUser(null);
    setAuthMode('login');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard setActivePage={setActivePage} />;
      case 'campaign': return <BulkSender />;
      case 'grouptools': return <GroupTools />;
      case 'ai-tools': return <AITools />;
      case 'social': return <SocialConnect />;
      case 'settings': return <Settings />;
      case 'profile': return <Profile user={user} onLogout={handleLogout} />;
      default: return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a]">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Topbar ko ab hum power de rahe hain page badalne ki aur logout ki */}
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
