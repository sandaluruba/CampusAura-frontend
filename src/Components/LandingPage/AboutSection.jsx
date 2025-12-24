import React from "react";
import "../../Styles/AboutSection.css";

export default function AboutSection() {
  return (
    <section className="about-section">
      <div className="about-container">
        <h2 className="about-title">About CampusAura</h2>
        <p className="about-subtitle">
          CampusAura connects students with events, projects, resources, and a vibrant marketplace.
          Discover what's happening on campus, collaborate with peers, and showcase your work.
        </p>

        <div className="about-grid">
          <div className="about-card">
            <div className="about-icon about-icon-green" aria-hidden="true">👁️</div>
            <h3>Our Vision</h3>
            <p>
              A connected campus where students discover opportunities, share ideas, and grow together.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon about-icon-blue" aria-hidden="true">📊</div>
            <h3>Our Mission</h3>
            <p>
              Empower student communities with tools to organize, promote, and participate in campus life.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon about-icon-purple" aria-hidden="true">💙</div>
            <h3>Our Values</h3>
            <p>
              Inclusivity, collaboration, and innovation—supporting students to make an impact.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
