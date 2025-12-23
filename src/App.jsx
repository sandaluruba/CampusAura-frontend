import React from "react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./Components/Navbar.jsx";
import HeroSlider from "./Components/HeroSlider.jsx";
import IntroSection from "./Components/IntroSection.jsx";   
import LatestEvents from "./Components/LatestEvents.jsx"; 

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <HeroSlider />
      <IntroSection />
      <LatestEvents />
    </BrowserRouter>
  );
}

export default App;

