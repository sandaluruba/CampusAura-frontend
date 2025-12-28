import React from "react";
import "../../Styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>CampusAura</h3>
          <p>Your all-in-one platform for campus events, fundraising, and marketplace.</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#events">Events</a></li>
            <li><a href="#marketplace">Marketplace</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: info@campusaura.com</p>
          <p>Phone: (123) 456-7890</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 CampusAura. All rights reserved.</p>
      </div>
    </footer>
  );
}
