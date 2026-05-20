import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { jsPDF } from 'jspdf';
import { createProductPaymentIntent, confirmProductPurchase } from '../services/api';
import { useAuth } from '../Context/AuthContext';
import '../Styles/Checkout.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_PLACEHOLDER');

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#0f172a',
      fontFamily: "'Inter', system-ui, sans-serif",
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: { color: '#dc2626' },
  },
};

function generateProductReceipt(purchaseData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(10, 93, 184);
  doc.rect(0, 0, pageWidth, 45, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CampusAura', pageWidth / 2, 22, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Purchase Receipt', pageWidth / 2, 35, { align: 'center' });

  // Items table header
  doc.setTextColor(15, 23, 42);
  let y = 60;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Product', 20, y);
  doc.text('Qty', 120, y);
  doc.text('Price', 145, y);
  doc.text('Total', 175, y);
  y += 5;
  doc.setDrawColor(10, 93, 184);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  // Items
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (purchaseData.items) {
    purchaseData.items.forEach(item => {
      const name = item.productName || item.name || 'Product';
      doc.text(name.substring(0, 30), 20, y);
      doc.text(String(item.quantity), 120, y);
      doc.text(`LKR ${(item.price || 0).toLocaleString()}`, 145, y);
      doc.text(`LKR ${((item.price || 0) * (item.quantity || 0)).toLocaleString()}`, 175, y);
      y += 10;
    });
  }

  // Totals
  y += 5;
  doc.line(20, y, pageWidth - 20, y);
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', 120, y);
  doc.text(`LKR ${(purchaseData.subtotal || 0).toLocaleString()}`, 175, y);
  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(10, 93, 184);
  doc.text('Total:', 120, y);
  doc.text(`LKR ${(purchaseData.totalAmount || 0).toLocaleString()}`, 175, y);

  // Payment info
  y += 20;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment ID: ${purchaseData.stripePaymentId || 'N/A'}`, 20, y);
  y += 8;
  doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`, 20, y);

  // Footer
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 260, pageWidth, 30, 'F');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text('Thank you for shopping at CampusAura Marketplace!', pageWidth / 2, 275, { align: 'center' });

  doc.save('CampusAura_Purchase_Receipt.pdf');
}

function CartCheckoutForm({ cartData }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // 1. Create payment intent
      const { clientSecret, paymentIntentId } = await createProductPaymentIntent({
        amount: cartData.total,
      });

      // 2. Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: userData?.name || 'CampusAura User',
            email: userData?.email,
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
        setProcessing(false);
        return;
      }

      if (result.paymentIntent.status === 'succeeded') {
        // 3. Save sale record
        const saleData = {
          items: cartData.items.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: cartData.total,
          stripePaymentId: paymentIntentId,
        };

        await confirmProductPurchase(saleData);

        // 4. Generate PDF receipt
        generateProductReceipt({
          ...saleData,
          subtotal: cartData.subtotal,
        });

        // 5. Clear cart
        localStorage.removeItem('cart');

        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    }

    setProcessing(false);
  };

  if (success) {
    return (
      <div className="checkout-success">
        <div className="success-icon">✓</div>
        <h2>Payment Successful!</h2>
        <p>Your purchase receipt has been downloaded as a PDF.</p>
        <div className="success-details">
          <p><strong>Items:</strong> {cartData.items.length} product(s)</p>
          <p><strong>Total:</strong> LKR {cartData.total.toLocaleString()}</p>
        </div>
        <Link to="/marketplace" className="checkout-back-btn">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="checkout-summary">
        <h3>Order Summary</h3>
        {cartData.items.map(item => (
          <div key={item.id} className="summary-row">
            <span>{item.name} × {item.quantity}</span>
            <span>LKR {(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div className="summary-total">
          <span>Total</span>
          <span>LKR {cartData.total.toLocaleString()}</span>
        </div>
      </div>

      <div className="card-element-wrapper">
        <label>Card Details</label>
        <div className="card-element-container">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && <div className="checkout-error">{error}</div>}

      <button type="submit" disabled={!stripe || processing} className="pay-btn">
        {processing ? 'Processing...' : `Pay LKR ${cartData.total.toLocaleString()}`}
      </button>
    </form>
  );
}

export default function CartCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const cartData = location.state;

  if (!cartData || !cartData.items || cartData.items.length === 0) {
    return (
      <div className="checkout-container">
        <div className="checkout-empty">
          <h2>No items to checkout</h2>
          <p>Please add items to your cart first.</p>
          <Link to="/marketplace" className="checkout-back-btn">Browse Marketplace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <Link to="/cart" className="back-link">← Back to Cart</Link>
      <h1 className="checkout-title">Complete Your Purchase</h1>
      <Elements stripe={stripePromise}>
        <CartCheckoutForm cartData={cartData} />
      </Elements>
    </div>
  );
}
