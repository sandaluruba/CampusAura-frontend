import { useState } from 'react';
import './CoordinatorDashboard.css';
import { MdEvent, MdMail, MdDashboard } from 'react-icons/md';
import { MdConfirmationNumber } from 'react-icons/md';
import EventManagementSection from './EventManagementSection';
import TicketManagementSection from './TicketManagementSection';
import CommunityFeedbackSection from './CommunityFeedbackSection';

function CoordinatorDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'events':
        return <EventManagementSection />;
      case 'tickets':
        return <TicketManagementSection />;
      case 'dashboard':
        return <CommunityFeedbackSection />;
      default:
        return <CommunityFeedbackSection />;
    }
  };

  return (
    <>
      {/* TOPBAR - Fixed */}
      <div className="coordinator-topbar">
        <div className="topbar-left">
          <img src="/logo.png" alt="Project Logo" className="topbar-logo" />
          <span className="project-name">CampusAura</span>
        </div>
        <div className="topbar-center">
          <h2>COORDINATOR DASHBOARD</h2>
        </div>
        <div className="topbar-right">
          <div className="notification-icon">
            <MdMail style={{ color: '#0A5DB8', fontSize: '2rem', verticalAlign: 'middle' }} />
            <span className="notification-badge">3</span>
          </div>
          <button className="logout-btn">Logout</button>
        </div>
      </div>

      {/* SIDEBAR + MAIN CONTENT WRAPPER */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
        {/* SIDEBAR - Fixed */}
        <div className="coordinator-sidebar">
          <ul className="coordinator-sidebar-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li
              className={activeSection === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveSection('dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '14px' }}
            >
              <MdDashboard className="sidebar-icon" />
              <span>Dashboard</span>
            </li>
            <li
              className={activeSection === 'events' ? 'active' : ''}
              onClick={() => setActiveSection('events')}
              style={{ display: 'flex', alignItems: 'center', gap: '14px' }}
            >
              <MdEvent className="sidebar-icon" />
              <span>Event Management</span>
            </li>
            <li
              className={activeSection === 'tickets' ? 'active' : ''}
              onClick={() => setActiveSection('tickets')}
              style={{ display: 'flex', alignItems: 'center', gap: '14px' }}
            >
              <MdConfirmationNumber className="sidebar-icon" />
              <span>Ticket Management</span>
            </li>
          </ul>
        </div>

        {/* MAIN CONTENT - Scrollable */}
        <div className="coordinator-main-content" style={{ flex: 1 }}>
          {renderContent()}
        </div>
      </div>
    </>
  );
}

export default CoordinatorDashboard;
