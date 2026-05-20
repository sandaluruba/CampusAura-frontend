import React, { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../../assets/logo-alt.png";

import { useAuth } from "../../Context/AuthContext";
import { MdAccountCircle, MdShoppingCart } from "react-icons/md";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isMarketplace = location.pathname.toLowerCase().includes('marketplace');

  const getCartCount = () => {
    const cart = localStorage.getItem('cart');
    if (cart) {
      try {
        const items = JSON.parse(cart);
        return items.reduce((sum, item) => sum + item.quantity, 0);
      } catch (error) {
        return 0;
      }
    }
    return 0;
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src={logo} alt="Campus Aura Logo" className="navbar-logo" />
      </div>

      <ul className="nav-links">
        <li><NavLink to="/events" className={({ isActive }) => (isActive ? "active" : "")}>Events</NavLink></li>
        <li><NavLink to="/Marketplace" className={({ isActive }) => (isActive ? "active" : "")}>Marketplace</NavLink></li>
      </ul>

      <div className="nav-actions">
        {/* Cart Icon - Only show on marketplace */}
        {isMarketplace && (
          <button className="nav-cart-icon" onClick={() => navigate('/cart')}>
            <MdShoppingCart size={28} />
            {getCartCount() > 0 && (
              <span className="nav-cart-badge">{getCartCount()}</span>
            )}
          </button>
        )}

        {currentUser ? (
          <div className="nav-profile" style={{ position: 'relative' }}>
            <div
              className="profile-trigger"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <MdAccountCircle className="profile-icon" size={32} />
            </div>

            {isProfileOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <span className="user-name">{currentUser.email?.split('@')[0]}</span>
                  <span className="user-email">{currentUser.email}</span>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                  Profile
                </Link>
                <div className="dropdown-item logout" onClick={() => { logout(); setIsProfileOpen(false); }}>
                  Sign Out
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login">
              <button className="btn-primary">Sign In</button>
            </Link>
            <Link to="/signup">
              <button className="btn-primary">Sign Up</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
