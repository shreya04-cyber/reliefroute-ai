import React from 'react';
import { HeartHandshake, LayoutDashboard, Database, ShieldAlert, FileText } from 'lucide-react';

export default function Navigation({ currentPage, navigate }) {
  return (
    <header className="nav-bar">
      <div className="nav-brand" onClick={() => navigate('landing')}>
        <HeartHandshake size={24} />
        <span>ReliefRoute AI</span>
      </div>
      <nav className="nav-links">
        <button 
          onClick={() => navigate('landing')} 
          className={`nav-link ${currentPage === 'landing' ? 'active' : ''}`}
        >
          Portal Home
        </button>
        <button 
          onClick={() => navigate('citizen-request')} 
          className={`nav-link ${currentPage === 'citizen-request' ? 'active' : ''}`}
        >
          Citizen Help Form
        </button>
        <button 
          onClick={() => navigate('dashboard')} 
          className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
        >
          <LayoutDashboard size={16} />
          Coordinator Dashboard
        </button>
        <button 
          onClick={() => navigate('resources')} 
          className={`nav-link ${currentPage === 'resources' ? 'active' : ''}`}
        >
          <Database size={16} />
          Resource Hub
        </button>
        <button 
          onClick={() => navigate('safety-privacy')} 
          className={`nav-link ${currentPage === 'safety-privacy' ? 'active' : ''}`}
        >
          <FileText size={16} />
          Safety & Privacy
        </button>
      </nav>
    </header>
  );
}
