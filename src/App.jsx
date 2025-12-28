
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./Components/Navbar.jsx";
import HeroSlider from "./Components/LandingPage/HeroSlider.jsx";
import IntroSection from "./Components/LandingPage/IntroSection.jsx";
import LatestEvents from "./Components/LandingPage/LatestEvents.jsx";
import AboutSection from "./Components/LandingPage/AboutSection.jsx";
import Marketplace from "./Components/LandingPage/MarketPlace.jsx";
import Features from "./Components/LandingPage/Features.jsx";
import ContactUs from "./Components/LandingPage/ContactUs.jsx";
import Footer from "./Components/LandingPage/Footer.jsx";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <HeroSlider />
      <IntroSection />
      <LatestEvents />
      <AboutSection />
      <Marketplace />
      <Features />
      <ContactUs />
      <Footer />
    </BrowserRouter>
  );
}
export default App;
