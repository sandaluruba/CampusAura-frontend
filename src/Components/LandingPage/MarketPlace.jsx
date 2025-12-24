import React from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/Marketplace.css";

export default function Marketplace() {
  const navigate = useNavigate();

  const products = [
    {
      id: 1,
      name: "College Hoodie",
      price: "$25",
      image: "/images/market1.jpg",
    },
    {
      id: 2,
      name: "Textbooks Bundle",
      price: "$60",
      image: "/images/market2.jpg",
    },
    {
      id: 3,
      name: "Dorm Decor Prints",
      price: "$15",
      image: "/images/market3.jpg",
    },
    {
      id: 4,
      name: "Custom Laptop Stickers",
      price: "$8",
      image: "/images/market4.jpg",
    },
  ];

  return (
    <section className="marketplace-section">
      <div className="marketplace-header">
        <h2 className="marketplace-title">CampusAura Marketplace</h2>
        <button
          className="view-all-btn"
          onClick={() => navigate("/marketplace")}
        >
          View All Items
        </button>
      </div>

      <div className="marketplace-container">
        {products.map((item) => (
          <div className="market-card" key={item.id}>
            <img src={item.image} alt={item.name} />
            <div className="market-content">
              <h3>{item.name}</h3>
              <p className="price">{item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
