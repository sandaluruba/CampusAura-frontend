import { useParams, Link, useNavigate } from "react-router-dom";
import { CiCalendar } from "react-icons/ci";
import { IoLocationOutline } from "react-icons/io5";
import { BsPeople } from "react-icons/bs";
import { AiOutlineHeart, AiOutlineShareAlt, AiOutlineSend } from "react-icons/ai";
import { useState, useEffect } from "react";
import { fetchEventById, fetchEventFeedback, postEventFeedback } from "../../services/api";
import { useAuth } from "../../Context/AuthContext";
import "./EventDetails.css";

// Format date from API to match design
const formatEventDate = (isoDate) => {
  if (!isoDate) return 'Date TBA';
  
  const date = new Date(isoDate);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  
  return date.toLocaleDateString('en-US', options).replace(',', ' |');
};

// Clean and validate image URL
const getValidImageUrl = (urls) => {
  if (!urls || urls.length === 0) return null;

  let imageUrl = urls[0];

  // Fix malformed data URI (e.g., "https:data:image/jpeg;base64,...")
  if (imageUrl && imageUrl.startsWith('https:data:')) {
    imageUrl = imageUrl.replace('https:', '');
  }

  if (!imageUrl) return null;
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  try {
    const parsed = new URL(imageUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    if (parsed.hostname === 'example.com' || parsed.hostname.endsWith('.example.com')) return null;
    return parsed.toString();
  } catch {
    return null;
  }
};

// Format relative time
const formatRelativeTime = (isoDate) => {
  if (!isoDate) return '';
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tickets, setTickets] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Load event details
  useEffect(() => {
    const loadEventDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEventById(id);
        setEvent(data);
        // Auto-select first ticket category if available
        if (data.ticketCategories && data.ticketCategories.length > 0) {
          setSelectedCategory(data.ticketCategories[0]);
        }
      } catch (err) {
        console.error('Failed to load event details:', err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadEventDetails();
    }
  }, [id]);

  // Load feedback from database
  useEffect(() => {
    const loadFeedback = async () => {
      try {
        setCommentsLoading(true);
        const data = await fetchEventFeedback(id);
        setComments(data || []);
      } catch (err) {
        console.error('Failed to load feedback:', err);
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    };

    if (id) {
      loadFeedback();
    }
  }, [id]);

  const handleAddComment = async () => {
    if (!feedback.trim()) return;
    if (!currentUser) {
      alert('Please sign in to post feedback.');
      return;
    }

    try {
      setSubmittingFeedback(true);
      const newFeedback = await postEventFeedback(id, feedback);
      setComments([...comments, newFeedback]);
      setFeedback("");
    } catch (err) {
      console.error('Failed to post feedback:', err);
      alert('Failed to post feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleReserveTickets = () => {
    if (!currentUser) {
      alert('Please sign in to reserve tickets.');
      return;
    }
    if (!selectedCategory) {
      alert('Please select a ticket category.');
      return;
    }
    // Navigate to checkout page with ticket details
    navigate(`/events/${id}/checkout`, {
      state: {
        event: {
          eventId: event.eventId,
          title: event.title,
          dateTime: event.dateTime,
          venue: event.venue,
        },
        ticketCategory: selectedCategory.categoryName,
        ticketPrice: selectedCategory.price,
        ticketCount: tickets,
        totalAmount: selectedCategory.price * tickets,
      }
    });
  };

  // Calculate total price
  const totalPrice = selectedCategory ? selectedCategory.price * tickets : 0;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'red' }}>
        <p>{error}</p>
        <Link to="/events" className="back-link">← Back to Events</Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Event not found</h2>
        <Link to="/events" className="back-link">← Back to Events</Link>
      </div>
    );
  }

  const imageUrl = getValidImageUrl(event.eventImageUrls);

  return (
    <>
      <Link to="/events" className="back-link">
        ← Back to Events
      </Link>

      <div className="event-details-wrapper">
        {/* LEFT SIDE - Image & Details (75%) */}
        <div className="event-details-left">
          {imageUrl ? (
            <img src={imageUrl} alt={event.title} className="details-banner" />
          ) : (
            <div className="details-banner-placeholder">
              <span>No Image Available</span>
            </div>
          )}

          <h1>{event.title}</h1>

          {/* Event Meta Info */}
          <div className="event-meta">
            <div className="meta-item">
              <CiCalendar className="meta-icon" />
              <div>
                <span className="meta-label">Date & Time</span>
                <p className="meta-value">{formatEventDate(event.dateTime)}</p>
              </div>
            </div>

            <div className="meta-item">
              <IoLocationOutline className="meta-icon" />
              <div>
                <span className="meta-label">Location</span>
                <p className="meta-value">{event.venue}</p>
              </div>
            </div>

            <div className="meta-item">
              <BsPeople className="meta-icon" />
              <div>
                <span className="meta-label">Attendees</span>
                <p className="meta-value">{event.attendeeCount || 0} going</p>
              </div>
            </div>
          </div>

          <h3>About This Event</h3>
          <p className="details-description">{event.description}</p>

          {event.category && (
            <div className="event-tags">
              <span className="tag">{event.category}</span>
              {event.organizingDepartment && (
                <span className="tag">{event.organizingDepartment}</span>
              )}
            </div>
          )}

          {/* Schedule Section */}
          {event.schedule && event.schedule.length > 0 && (
            <section className="section-block">
              <h3>Event Schedule</h3>
              <div className="schedule-list">
                {event.schedule.map((item, idx) => (
                  <div key={idx} className="schedule-item">
                    <div className="schedule-time">{item.time}</div>
                    <div className="schedule-event">{item.event}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Payment Details Section – shown only when coordinator filled in account details */}
          {event.accountDetails && event.accountDetails.accountName && (
            <section className="section-block">
              <h3>Payment Details</h3>
              <div className="payment-details-card">
                <div className="payment-details-grid">
                  {event.accountDetails.accountName && (
                    <div className="payment-row">
                      <span className="payment-label">Account Name</span>
                      <span className="payment-value">{event.accountDetails.accountName}</span>
                    </div>
                  )}
                  {event.accountDetails.accountNumber && (
                    <div className="payment-row">
                      <span className="payment-label">Account Number</span>
                      <span className="payment-value payment-mono">{event.accountDetails.accountNumber}</span>
                    </div>
                  )}
                  {event.accountDetails.phone && (
                    <div className="payment-row">
                      <span className="payment-label">Phone</span>
                      <span className="payment-value">{event.accountDetails.phone}</span>
                    </div>
                  )}
                  {event.accountDetails.role && (
                    <div className="payment-row">
                      <span className="payment-label">Role</span>
                      <span className="payment-value">{event.accountDetails.role}</span>
                    </div>
                  )}
                </div>

                {/* Coordinator email for posting receipts */}
                {event.coordinatorEmail && (
                  <div className="payment-receipt-row">
                    <span className="payment-receipt-label">📧 Send payment receipt to:</span>
                    <a
                      href={`mailto:${event.coordinatorEmail}?subject=Payment Receipt – ${event.title}&body=Hi, please find attached my payment receipt for the event: ${event.title}.`}
                      className="payment-email-link"
                    >
                      {event.coordinatorEmail}
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Sponsors Section – shown only when sponsors exist */}
          {event.sponsors && event.sponsors.length > 0 && (
            <section className="section-block">
              <h3>Our Sponsors</h3>
              <div className="sponsors-grid">
                {event.sponsors.map((sponsor, idx) => (
                  <div key={idx} className="sponsor-card">
                    <div className="sponsor-tier-badge sponsor-tier-badge--{(sponsor.tier || '').toLowerCase()}">
                      {sponsor.tier === 'Platinum' ? '🏆' : sponsor.tier === 'Gold' ? '⭐' : '🥈'}
                      {sponsor.tier || 'Sponsor'}
                    </div>
                    <div className="sponsor-name">{sponsor.name}</div>
                    {sponsor.amount && <div className="sponsor-amount">{sponsor.amount}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Past Event Gallery */}
          {event.galleryImages && event.galleryImages.length > 0 && (
            <section className="section-block">
              <h3>Event Gallery</h3>
              <div className="gallery-grid">
                {event.galleryImages.map((image, idx) => (
                  <img key={idx} src={image} alt={`Gallery ${idx + 1}`} className="gallery-image" />
                ))}
              </div>
            </section>
          )}

          {/* Community & Feedback Section */}
          <section className="section-block">
            <h3>Community Feedback</h3>
            
            {/* Feedback Form */}
            <div className="feedback-form">
              <input
                type="text"
                placeholder={currentUser ? "Share your thoughts about this event..." : "Sign in to share your thoughts..."}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="feedback-input"
                disabled={!currentUser || submittingFeedback}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button 
                onClick={handleAddComment} 
                className="feedback-btn"
                disabled={!currentUser || submittingFeedback || !feedback.trim()}
              >
                <AiOutlineSend /> {submittingFeedback ? 'Posting...' : 'Post'}
              </button>
            </div>

            {/* Comments List */}
            <div className="comments-section">
              {commentsLoading ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>Loading feedback...</p>
              ) : comments.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>No feedback yet. Be the first to share your thoughts!</p>
              ) : (
                comments.map((comment, idx) => (
                  <div key={comment.feedbackId || idx} className="comment-item">
                    <div className="comment-avatar">{(comment.userName || 'U').charAt(0).toUpperCase()}</div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-name">{comment.userName || 'User'}</span>
                        <span className="comment-time">{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Organizer Card */}
          {(event.coordinatorDegree || event.organizingDepartment) && (
            <div className="organizer-card">
              <h4 className="organizer-title">Organized by</h4>
              <div className="organizer-info">
                <div className="organizer-avatar">
                  {(event.coordinatorDegree || event.organizingDepartment).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="organizer-name">{event.coordinatorDegree || event.organizingDepartment}</p>
                  <p className="organizer-type">Campus Organization</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE - Ticket Booking (25%) */}
        <div className="event-ticket-panel">
          {/* Number of Tickets - Only if available */}
          {event.ticketsAvailable ? (
            <>
              {/* Ticket Categories */}
              {event.ticketCategories && event.ticketCategories.length > 0 && (
                <div className="ticket-categories-section">
                  <label className="tickets-label">Select Ticket Type</label>
                  <div className="ticket-category-list">
                    {event.ticketCategories.map((cat, idx) => (
                      <div
                        key={idx}
                        className={`ticket-category-card ${selectedCategory?.categoryName === cat.categoryName ? 'selected' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        <div className="ticket-cat-info">
                          <span className="ticket-cat-name">{cat.categoryName}</span>
                          <span className="ticket-cat-available">{cat.availableCount || 0} left</span>
                        </div>
                        <span className="ticket-cat-price">LKR {(cat.price || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="tickets-section">
                <label className="tickets-label">Number of Tickets</label>
                <div className="ticket-controls">
                  <button 
                    className="ticket-btn" 
                    onClick={() => setTickets(Math.max(1, tickets - 1))}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    className="ticket-input" 
                    value={tickets} 
                    onChange={(e) => setTickets(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                  />
                  <button 
                    className="ticket-btn" 
                    onClick={() => setTickets(tickets + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price Display */}
              {selectedCategory && (
                <div className="ticket-price-summary">
                  <div className="price-row">
                    <span>{selectedCategory.categoryName} × {tickets}</span>
                    <span>LKR {(selectedCategory.price * tickets).toLocaleString()}</span>
                  </div>
                  <div className="price-total-row">
                    <span>Total</span>
                    <span className="total-price">LKR {totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Reserve Button */}
              <button className="reserve-btn" onClick={handleReserveTickets}>
                Reserve Tickets — LKR {totalPrice.toLocaleString()}
              </button>
            </>
          ) : (
            <div className="sold-out-message">
              <p>Tickets Sold Out</p>
            </div>
          )}

          {/* Save and Share */}
          <div className="action-buttons">
            <button className="action-btn">
              <AiOutlineHeart /> Save
            </button>
            <button className="action-btn">
              <AiOutlineShareAlt /> Share
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
