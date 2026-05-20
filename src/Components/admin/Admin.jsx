import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import './Admin.css';
import { MdDashboard, MdPeople, MdEvent, MdPerson, MdShoppingCart, MdConfirmationNumber, MdStorefront } from 'react-icons/md';

import logo from '../../assets/logo-alt.png';
import AdminDashboard from './AdminDashboard';
import ManageCoordinators from './ManageCoordinators';
import EventManagement from '../events/EventManagement';
import UserManagement from './UserManagement';
import ProductManagement from '../marketplace/ProductManagement';
import TicketSales from '../TicketSales';
import ProductSales from '../ProductSales';

function AdminTopBar() {
  const [activeSection, setActiveSection] = useState('overview');
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
      case 'overview':
        return <AdminDashboard onNavigate={setActiveSection} />;

      case 'events':
        return <EventManagement />;
      case 'coordinators':
        return <ManageCoordinators />;
      case 'users':
        return <UserManagement />;
      case 'products':
        return <ProductManagement />;
      case 'ticketSales':
        return <TicketSales />;
      case 'productSales':
        return <ProductSales />;
      default:
        return <AdminDashboard />;
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
          <h2>Admin Dashboard</h2>
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
              className={activeSection === "overview" ? "active" : ""}
              onClick={() => setActiveSection("overview")}
              style={{display: 'flex', alignItems: 'center', gap: '14px'}}
            >
              <MdDashboard className="sidebar-icon" />
              <span>Overview</span>
            </li>
            <li
              className={activeSection === "coordinators" ? "active" : ""}
              onClick={() => setActiveSection("coordinators")}
              style={{display: 'flex', alignItems: 'center', gap: '14px'}}
            >
              <MdPeople className="sidebar-icon" />
              <span>Manage Coordinators</span>
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
              className={activeSection === "users" ? "active" : ""}
              onClick={() => setActiveSection("users")}
              style={{display: 'flex', alignItems: 'center', gap: '14px'}}
            >
              <MdPerson className="sidebar-icon" />
              <span>User Management</span>
            </li>
            <li
              className={activeSection === "products" ? "active" : ""}
              onClick={() => setActiveSection("products")}
              style={{display: 'flex', alignItems: 'center', gap: '14px'}}
            >
              <MdShoppingCart className="sidebar-icon" />
              <span>Product Management</span>
            </li>
            <li
              className={activeSection === "ticketSales" ? "active" : ""}
              onClick={() => setActiveSection("ticketSales")}
              style={{display: 'flex', alignItems: 'center', gap: '14px'}}
            >
              <MdConfirmationNumber className="sidebar-icon" />
              <span>Ticket Sales</span>
            </li>
            <li
              className={activeSection === "productSales" ? "active" : ""}
              onClick={() => setActiveSection("productSales")}
              style={{display: 'flex', alignItems: 'center', gap: '14px'}}
            >
              <MdStorefront className="sidebar-icon" />
              <span>Product Sales</span>
            </li>
            {/* Payment Monitoring removed */}
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

export default AdminTopBar;
