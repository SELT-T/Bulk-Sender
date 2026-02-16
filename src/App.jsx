import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// All Real Pages Import
import Dashboard from './pages/Dashboard';
import BulkSender from './pages/BulkSender';
import AITools from './pages/AITools';
import SocialConnect from './pages/SocialConnect';
import Settings from './pages/Settings';
import GroupTools from './pages/GroupTools'; 

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      // setActivePage pass kar rahe hain taaki andar ke buttons bhi page change kar sakein
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