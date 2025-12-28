import React from "react";
import "../../Styles/IntroSection.css";
import introImage from "../../assets/ChatGPT Image Dec 21, 2025, 12_09_30 AM.png";

export default function IntroSection() {
  return (
    <section className="intro-section">
      <div className="intro-container">
        
        {/* Left side - Text */}
        <div className="intro-text">
          <h2>Welcome to CampusAura</h2>
          <p>
            CampusAura is a platform where students can discover university
            events, promote projects, raise funds, and buy or sell items within
            the campus.
          </p>
        </div>

        {/* Right side - Image */}
        <div className="intro-image">
          <img
            src={introImage}
            alt="CampusAura community illustration"
          />
        </div>

      </div>
    </section>
  );
}