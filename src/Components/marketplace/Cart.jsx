import React, { useState, useEffect } from "react";
import { MdDelete, MdAdd, MdRemove } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import "./Cart.css";

export default function Cart() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const updateQuantity = (itemId, change) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;


  const handleCheckout = () => {
    if (!currentUser) {
      alert('Please sign in to proceed to checkout.');
      return;
    }
    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    navigate('/cart/checkout', {
      state: {
        items: cartItems,
        subtotal,
        total,
      }
    });
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <h2>Your cart is empty</h2>
            <button className="cart-continue-btn" onClick={() => navigate("/marketplace")}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-section">
              {cartItems.map(item => (
                <div className="cart-item-card" key={item.id}>
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <p className="cart-item-price-green">LKR {item.price.toFixed(2)}</p>
                    <p className="cart-item-stock">In stock</p>
                  </div>
                  <div className="cart-item-actions">
                    <p className="cart-item-total">LKR {(item.price * item.quantity).toFixed(2)}</p>
                    <div className="cart-quantity-controls">
                      <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, -1)}>
                        <MdRemove size={16} />
                      </button>
                      <span className="cart-qty-display">{item.quantity}</span>
                      <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, 1)}>
                        <MdAdd size={16} />
                      </button>
                    </div>
                    <button className="cart-remove-btn" onClick={() => removeItem(item.id)}>
                      <MdDelete size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary-section">
              <div className="cart-summary-card">
                <h2 className="cart-summary-title">Order Summary</h2>
                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span>LKR {subtotal.toFixed(2)}</span>
                </div>
                <div className="cart-summary-row" style={{ color: '#16a34a', fontWeight: 600 }}>
                  <span>Delivery</span>
                  <span>Free</span>
                </div>
                <div className="cart-summary-divider"></div>
                <div className="cart-summary-total">
                  <span>Total</span>
                  <span>LKR {total.toFixed(2)}</span>
                </div>
                <button className="cart-checkout-btn" onClick={handleCheckout}>
                  Proceed to Checkout
                </button>
                <button className="cart-continue-shopping-btn" onClick={() => navigate("/marketplace")}>
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
