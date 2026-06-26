import React, { useState } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import CitizenRequest from './pages/CitizenRequest.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Resources from './pages/Resources.jsx';
import SafetyPrivacy from './pages/SafetyPrivacy.jsx';
import Navigation from './components/Navigation.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // Navigate utility to change page and optional parameter
  const navigate = (page, param = null) => {
    setCurrentPage(page);
    if (page === 'dashboard' && param) {
      setSelectedRequestId(param);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage navigate={navigate} />;
      case 'citizen-request':
        return <CitizenRequest navigate={navigate} />;
      case 'dashboard':
        return (
          <Dashboard 
            navigate={navigate} 
            selectedRequestId={selectedRequestId} 
            setSelectedRequestId={setSelectedRequestId} 
          />
        );
      case 'resources':
        return <Resources navigate={navigate} />;
      case 'safety-privacy':
        return <SafetyPrivacy navigate={navigate} />;
      default:
        return <LandingPage navigate={navigate} />;
    }
  };

  return (
    <div className="app-container">
      <Navigation currentPage={currentPage} navigate={navigate} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
