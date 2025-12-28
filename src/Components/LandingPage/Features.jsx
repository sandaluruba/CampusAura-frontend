import React from "react";
import "../../Styles/Features.css";

export default function Features() {
  return (
    <section className="why-section">
      <h2 className="why-title">Why Choose CampusAura?</h2>
      <p className="why-subtitle">
        Smart features designed to manage university events, fundraising,
        and student marketplaces in one platform.
      </p>

      <div className="why-container">
        <div className="why-card">
          <div className="why-icon green">🎓</div>
          <h3>Event Management</h3>
          <p>
            Categorized event listings, ticket booking, and access to past
            event records.
          </p>
        </div>

        <div className="why-card">
          <div className="why-icon blue">📊</div>
          <h3>Coordinator Dashboards</h3>
          <p>
            Dedicated dashboards for coordinators and admins to manage
            events and operations efficiently.
          </p>
        </div>

        <div className="why-card">
          <div className="why-icon orange">🔐</div>
          <h3>Secure & Verified Access</h3>
          <p>
            Student authentication with ID verification for safe and trusted
            participation.
          </p>
        </div>

        <div className="why-card">
          <div className="why-icon purple">🛒</div>
          <h3>Campus Marketplace</h3>
          <p>
            Buy and sell university-related products within a secure campus
            environment.
          </p>
        </div>
      </div>
    </section>
  );
}
