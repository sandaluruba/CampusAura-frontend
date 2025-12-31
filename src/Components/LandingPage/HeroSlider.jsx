import { useCallback, useEffect, useState } from "react";
import "../../Styles/HeroSlide.css";

const slides = [
  {
    title: "This love story burns so bright!",
    subtitle: "Witness it on the big screen.",
    image: "https://picsum.photos/id/1018/1400/700",
  },
  {
    title: "Mr. Family",
    subtitle: "A family's love keeps them together.",
    image: "https://picsum.photos/id/1015/1400/700",
  },
  {
    title: "Bravery on the frontlines",
    subtitle: "Action. Power. Courage.",
    image: "https://picsum.photos/id/1011/1400/700",
  },
  {
    title: "Race day energy",
    subtitle: "Feel the speed and thrill.",
    image: "https://picsum.photos/id/1003/1400/700",
  },
];

const VISIBLE = 3;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, []);

  useEffect(() => {
    const id = setInterval(nextSlide, 4500);
    return () => clearInterval(id);
  }, [nextSlide]);

  const offsetPercent = (100 / VISIBLE) * current;

  return (
    <div className="hero-slider">
      <div className="slider-window">
        <div
          className="slider-track"
          style={{ transform: `translateX(-${offsetPercent}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="slide-card"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="slide-overlay">
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="arrow left-arrow" onClick={prevSlide} aria-label="Previous slide">
        &#10094;
      </button>
      <button className="arrow right-arrow" onClick={nextSlide} aria-label="Next slide">
        &#10095;
      </button>
    </div>
  );
}
