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

// Auth Pages (Naye)
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  // Authentication State (False = Lock Laga Hai)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPage, setAuthPage] = useState('login'); // login or signup

  // App Navigation State
  const [activePage, setActivePage] = useState('dashboard');

  // Login Handle Karna
  const handleLogin = (email, password) => {
    // Abhi temporary check (Backend aane par API call hogi)
    if(email && password) {
      setIsAuthenticated(true);
    }
  };

  // Agar user Login nahi hai, toh Login/Signup page dikhao
  if (!isAuthenticated) {
    return authPage === 'login' 
      ? <Login onLogin={handleLogin} switchToSignup={() => setAuthPage('signup')} />
      : <Signup switchToLogin={() => setAuthPage('login')} />;
  }

  // Agar Login hai, toh Dashboard dikhao (Wahi purana code)
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard setActivePage={setActivePage} />;
      case 'campaign': return <BulkSender />;
      case 'grouptools': return <GroupTools />;
      case 'ai-tools': return <AITools />;
      case 'social': return <SocialConnect />;
      case 'settings': return <Settings />;
      default: return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a]">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 transition-all duration-300">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
