import React from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/LatestEvents.css";

export default function LatestEvents() {
  const navigate = useNavigate();

  const events = [
    {
      id: 1,
      title: "Tech Innovation Fair",
      date: "May 15, 2024",
      image: "/images/event1.jpg",
    },
    {
      id: 2,
      title: "Music Fest",
      date: "June 5, 2024",
      image: "/images/event2.jpg",
    },
    {
      id: 3,
      title: "Career Workshop",
      date: "June 12, 2024",
      image: "/images/event3.jpg",
    },
  ];

  return (
    <section className="latest-events">
      <div className="events-header">
        <h2>Latest Events</h2>
        <button
          className="view-all-btn"
          onClick={() => navigate("/events")}
        >
          View All Events
        </button>
      </div>

      <div className="events-container">
        {events.map((event) => (
          <div className="event-card" key={event.id}>
            <img src={event.image} alt={event.title} />
            <div className="event-content">
              <h3>{event.title}</h3>
              <p>{event.date}</p>
              <button
                className="view-btn"
                onClick={() => navigate("/events")}
              >
                View Event
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}