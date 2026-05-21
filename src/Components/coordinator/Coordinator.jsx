import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import '../admin/Admin.css';
import { MdEvent, MdFeedback, MdConfirmationNumber, MdStorefront } from 'react-icons/md';

import logo from '../../assets/logo-alt.png';
import EventManagementSection from './EventManagementSection';
import TicketManagementSection from './TicketManagementSection';
import CommunityFeedbackSection from './CommunityFeedbackSection';
import CoordinatorProductSection from './CoordinatorProductSection';

function Coordinator() {
  const [activeSection, setActiveSection] = useState('community');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'events':
        return <EventManagementSection />;
      case 'tickets':
        return <TicketManagementSection />;
      case 'products':
        return <CoordinatorProductSection />;
      case 'community':
        return <CommunityFeedbackSection />;
      default:
        return <CommunityFeedbackSection />;
    }
  };

  return (
    <>
      {/* TOPBAR - Fixed */}
      <div className="admin-topbar">
        <div className="topbar-left">
          <img src={logo} alt="Campus Aura Logo" className="topbar-logo" />
        </div>
        <div className="topbar-center">
          <h2>Coordinator Dashboard</h2>
        </div>
        <div className="topbar-right">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* SIDEBAR + MAIN CONTENT WRAPPER */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
        {/* SIDEBAR - Fixed */}
        <div className="admin-sidebar">
          <ul className="admin-sidebar-list" style={{listStyle: 'none', padding: 0, margin: 0}}>
            <li
              className={activeSection === "community" ? "active" : ""}
              onClick={() => setActiveSection("community")}
              style={{display: 'flex', alignItems: 'center', gap: '14px'}}
            >
              <MdFeedback className="sidebar-icon" />
              <span>Community & Feedback</span>
            </li>
            <li
              className={activeSection === "events" ? "active" : ""}
              onClick={() => setActiveSection("events")}
              style={{display: 'flex', alignItems: 'center', gap: '14px'}}
            >
              <MdEvent className="sidebar-icon" />
              <span>Event Management</span>
            </li>
            <li
              className={activeSection === "tickets" ? "active" : ""}
              onClick={() => setActiveSection("tickets")}
              style={{display: 'flex', alignItems: 'center', gap: '14px'}}
            >
              <MdConfirmationNumber className="sidebar-icon" />
              <span>Ticket Management</span>
            </li>
            <li
              className={activeSection === "products" ? "active" : ""}
              onClick={() => setActiveSection("products")}
              style={{display: 'flex', alignItems: 'center', gap: '14px'}}
            >
              <MdStorefront className="sidebar-icon" />
              <span>My Products</span>
            </li>
          </ul>
        </div>

        {/* MAIN CONTENT - Scrollable */}
        <div className="admin-main-content" style={{ flex: 1 }}>
          {renderContent()}
        </div>
      </div>
    </>
  );
}

export default Coordinator;
