import { useState } from 'react';
import { MdCalendarToday } from 'react-icons/md';
import { HiOutlineTrash, HiPencilAlt, HiUpload } from "react-icons/hi";
import { useAuth } from '../../Context/AuthContext';
import { createEvent } from '../../services/api';
import { uploadFiles } from '../../utils/uploadToStorage';

import './CoordinatorDashboard.css';
import './SponsorSection.css';

// Fixed tier metadata
const SPONSOR_TIERS = [
  { key: 'platinum', label: 'Platinum', emoji: '🏆', badgeClass: 'sponsor-tier--platinum' },
  { key: 'gold',     label: 'Gold',     emoji: '⭐', badgeClass: 'sponsor-tier--gold'     },
  { key: 'silver',   label: 'Silver',   emoji: '🥈', badgeClass: 'sponsor-tier--silver'   },
];

function EventManagementSection() {
  const { currentUser } = useAuth();
  const [eventData, setEventData] = useState({
    eventName: 'Tech Innovation Summit 2024',
    date: '2024-06-15',
    venue: 'Main Auditorium',
    description: 'Join us for an exciting day of technological innovation and networking with industry leaders.',
    accountName: '',
    accountNumber: '',
    accountEmail: '',
    accountPhone: '',
    accountRole: ''
  });

  const [scheduleItems, setScheduleItems] = useState([
    { id: 1, title: 'Registration & Breakfast', time: '09:00 AM', duration: '1 hour' },
    { id: 2, title: 'Opening Keynote', time: '10:00 AM', duration: '45 mins' },
    { id: 3, title: 'Panel Discussion: AI & Future', time: '11:00 AM', duration: '1 hour' },
    { id: 4, title: 'Lunch Break', time: '12:00 PM', duration: '1 hour' }
  ]);

  const [newScheduleItem, setNewScheduleItem] = useState({ title: '', time: '', duration: '' });
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isSaving, setIsSaving]             = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // null | 0-100


  // Ticket management states
  const [ticketsEnabled, setTicketsEnabled] = useState(false);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({ categoryName: '', price: '', availableCount: '' });

  // Sponsorship state — one entry per tier
  const [sponsors, setSponsors] = useState({
    platinum: { name: '', amount: '' },
    gold:     { name: '', amount: '' },
    silver:   { name: '', amount: '' },
  });

  const handleSponsorChange = (tier, field, value) => {
    setSponsors(prev => ({ ...prev, [tier]: { ...prev[tier], [field]: value } }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id:      Date.now() + Math.random(),
      file,                              // keep the raw File for upload
      preview: URL.createObjectURL(file), // local preview only
      name:    file.name,
    }));
    setUploadedImages(prev => [...prev, ...newImages]);
  };


  const handleRemoveImage = (id) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };


  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (!currentUser) {
      alert('You must be logged in to create an event');
      return;
    }
    if (!eventData.eventName || !eventData.date || !eventData.venue || !eventData.description) {
      alert('Please fill in all required event details (Name, Date, Venue, Description)');
      return;
    }

    setIsSaving(true);
    try {
      const token  = await currentUser.getIdToken();
      const uid    = currentUser.uid;

      // ── 1. Upload images to Firebase Storage ─────────────────────────
      let imageUrls = [];
      const filesToUpload = uploadedImages.map(img => img.file).filter(Boolean);
      if (filesToUpload.length > 0) {
        setUploadProgress(0);
        imageUrls = await uploadFiles(
          filesToUpload,
          `events/${uid}`,
          (pct) => setUploadProgress(pct)
        );
        setUploadProgress(null);
      }

      // Build sellItems from filled-in sponsor tiers
      const sellItems = SPONSOR_TIERS
        .filter(tier => sponsors[tier.key].name.trim())
        .map(tier => ({
          itemName:    sponsors[tier.key].name.trim(),
          description: tier.label,                           // "Platinum" | "Gold" | "Silver"
          price:       parseFloat(sponsors[tier.key].amount) || 0,
          imageUrls:   []
        }));

      const eventPayload = {
        title: eventData.eventName,
        venue: eventData.venue,
        dateTime: eventData.date,
        description: eventData.description,
        status: 'DRAFT',
        ticketsAvailable: ticketsEnabled,
        ticketCategories: ticketsEnabled ? ticketCategories.map(ticket => ({
          categoryName: ticket.categoryName,
          price: ticket.price,
          availableCount: ticket.availableCount
        })) : [],
        pastEventDetails: [],
        eventImageUrls: imageUrls,
        sellItems,
        organizingDepartment: null,
        category: null,
        schedule: scheduleItems.map(item => ({
          id: String(item.id),
          title: item.title,
          time: item.time,
          duration: item.duration
        })),
        accountDetails: eventData.accountName || eventData.accountNumber || eventData.accountEmail || eventData.accountPhone || eventData.accountRole ? {
          accountName:   eventData.accountName   || null,
          accountNumber: eventData.accountNumber || null,
          email:         eventData.accountEmail  || null,
          phone:         eventData.accountPhone  || null,
          role:          eventData.accountRole   || null
        } : null
      };

      console.log('Creating event with data:', eventPayload);
      const response = await createEvent(eventPayload, token);
      console.log('Event created successfully:', response);
      alert('Event created successfully! Event ID: ' + response.eventId);
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddScheduleItem = () => {
    if (newScheduleItem.title && newScheduleItem.time && newScheduleItem.duration) {
      const newItem = {
        id: Math.max(...scheduleItems.map(item => item.id), 0) + 1,
        ...newScheduleItem
      };
      setScheduleItems([...scheduleItems, newItem]);
      setNewScheduleItem({ title: '', time: '', duration: '' });
      setShowAddSchedule(false);
    } else {
      alert('Please fill in all fields');
    }
  };

  const handleDeleteScheduleItem = (id) => setScheduleItems(scheduleItems.filter(item => item.id !== id));
  const handleEditScheduleItem = (id) => {
    const item = scheduleItems.find(i => i.id === id);
    setNewScheduleItem(item);
    setShowAddSchedule(true);
  };

  const handleAddTicketCategory = () => {
    if (newTicket.categoryName && newTicket.price && newTicket.availableCount) {
      const ticket = {
        id: Math.max(...ticketCategories.map(t => t.id || 0), 0) + 1,
        categoryName: newTicket.categoryName,
        price: parseFloat(newTicket.price),
        availableCount: parseInt(newTicket.availableCount)
      };
      setTicketCategories([...ticketCategories, ticket]);
      setNewTicket({ categoryName: '', price: '', availableCount: '' });
      setShowAddTicket(false);
    } else {
      alert('Please fill in all ticket fields');
    }
  };

  const handleDeleteTicketCategory = (id) => setTicketCategories(ticketCategories.filter(ticket => ticket.id !== id));
  const handleEditTicketCategory = (id) => {
    const ticket = ticketCategories.find(t => t.id === id);
    setNewTicket({ categoryName: ticket.categoryName, price: String(ticket.price), availableCount: String(ticket.availableCount) });
    setShowAddTicket(true);
    setTicketCategories(ticketCategories.filter(t => t.id !== id));
  };

  return (
    <div className="coordinator-content">
      <div className="event-dashboard-header">
        <h1 className="dashboard-title">Event Dashboard</h1>
        <p className="event-subtitle">{eventData.eventName}</p>
      </div>

      <div className="event-details-management">
        <h2 className="section-heading">Event Details Management</h2>

        {/* ── Basic Information ── */}
        <div className="form-section">
          <h3 className="form-section-title">Basic Information</h3>
          <div className="form-group full-width">
            <label className="form-label">Event Name</label>
            <input type="text" name="eventName" value={eventData.eventName} onChange={handleEventInputChange} className="form-input" placeholder="Enter event name" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" name="date" value={eventData.date} onChange={handleEventInputChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Venue</label>
              <input type="text" name="venue" value={eventData.venue} onChange={handleEventInputChange} className="form-input" placeholder="Enter venue" />
            </div>
          </div>
          <div className="form-group full-width">
            <label className="form-label">Description</label>
            <textarea name="description" value={eventData.description} onChange={handleEventInputChange} className="form-textarea" placeholder="Enter event description" rows="4"></textarea>
          </div>
        </div>

        {/* ── Account Details ── */}
        <div className="form-section">
          <h3 className="form-section-title">Account Details</h3>
          <div className="form-group full-width">
            <label className="form-label">Account Name</label>
            <input type="text" name="accountName" value={eventData.accountName} onChange={handleEventInputChange} className="form-input" placeholder="Enter account holder name" />
          </div>
          <div className="form-group full-width">
            <label className="form-label">Account Number</label>
            <input type="text" name="accountNumber" value={eventData.accountNumber} onChange={handleEventInputChange} className="form-input" placeholder="Enter account number" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" name="accountEmail" value={eventData.accountEmail} onChange={handleEventInputChange} className="form-input" placeholder="Enter email" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" name="accountPhone" value={eventData.accountPhone} onChange={handleEventInputChange} className="form-input" placeholder="Enter phone number" />
            </div>
          </div>
          <div className="form-group full-width">
            <label className="form-label">Role</label>
            <input type="text" name="accountRole" value={eventData.accountRole} onChange={handleEventInputChange} className="form-input" placeholder="Enter role/position" />
          </div>
        </div>

        {/* ── Sponsorship ── */}
        <div className="form-section">
          <h3 className="form-section-title">Sponsorship</h3>
          <p className="sponsor-hint">
            Add sponsors for each tier. Leave a tier blank if there is no sponsor — it will not appear on the public event page.
          </p>

          <div className="sponsor-tiers-grid">
            {SPONSOR_TIERS.map(tier => (
              <div key={tier.key} className={`sponsor-tier-card ${tier.badgeClass}`}>
                <div className="sponsor-tier-header">
                  <span className="sponsor-tier-emoji">{tier.emoji}</span>
                  <span className="sponsor-tier-label">{tier.label}</span>
                </div>
                <div className="sponsor-field">
                  <label className="sponsor-field-label">Sponsor / Company Name</label>
                  <input
                    type="text"
                    className="sponsor-input"
                    placeholder={`e.g., ABC ${tier.label} Partner`}
                    value={sponsors[tier.key].name}
                    onChange={e => handleSponsorChange(tier.key, 'name', e.target.value)}
                  />
                </div>
                <div className="sponsor-field">
                  <label className="sponsor-field-label">Amount (LKR)</label>
                  <input
                    type="number"
                    className="sponsor-input"
                    placeholder="e.g., 50000"
                    min="0"
                    step="1000"
                    value={sponsors[tier.key].amount}
                    onChange={e => handleSponsorChange(tier.key, 'amount', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Ticket Management ── */}
        <div className="form-section">
          <h3 className="form-section-title">Ticket Management</h3>
          <div className="form-group full-width">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" checked={ticketsEnabled} onChange={(e) => setTicketsEnabled(e.target.checked)} style={{ width: 'auto', cursor: 'pointer' }} />
              Enable Tickets for this Event
            </label>
          </div>

          {ticketsEnabled && (
            <>
              <div className="schedule-header" style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '500' }}>Ticket Categories</h4>
                <button type="button" className="add-item-btn" onClick={() => setShowAddTicket(!showAddTicket)}>
                  <span>+</span> Add Ticket
                </button>
              </div>

              {showAddTicket && (
                <div className="add-schedule-form" style={{ marginTop: '15px' }}>
                  <div className="schedule-form-row">
                    <div className="schedule-form-group">
                      <input type="text" placeholder="Category Name (e.g., VIP, Normal)" value={newTicket.categoryName} onChange={(e) => setNewTicket({ ...newTicket, categoryName: e.target.value })} className="schedule-input" />
                    </div>
                    <div className="schedule-form-group">
                      <input type="number" placeholder="Price" value={newTicket.price} onChange={(e) => setNewTicket({ ...newTicket, price: e.target.value })} className="schedule-input" min="0" step="0.01" />
                    </div>
                    <div className="schedule-form-group">
                      <input type="number" placeholder="Available Count" value={newTicket.availableCount} onChange={(e) => setNewTicket({ ...newTicket, availableCount: e.target.value })} className="schedule-input" min="1" />
                    </div>
                  </div>
                  <div className="schedule-form-actions">
                    <button type="button" className="schedule-save-btn" onClick={handleAddTicketCategory}>Save</button>
                    <button type="button" className="schedule-cancel-btn" onClick={() => setShowAddTicket(false)}>Cancel</button>
                  </div>
                </div>
              )}

              <div className="schedule-list" style={{ marginTop: '15px' }}>
                {ticketCategories.map((ticket) => (
                  <div key={ticket.id} className="schedule-item">
                    <div className="schedule-item-left">
                      <h3 className="schedule-item-title">{ticket.categoryName}</h3>
                      <p className="schedule-item-time">Price: LKR {ticket.price} • Available: {ticket.availableCount} tickets</p>
                    </div>
                    <div className="schedule-item-actions">
                      <button type="button" className="schedule-edit-btn" onClick={() => handleEditTicketCategory(ticket.id)}><HiPencilAlt /></button>
                      <button type="button" className="schedule-delete-btn" onClick={() => handleDeleteTicketCategory(ticket.id)}><HiOutlineTrash /></button>
                    </div>
                  </div>
                ))}
                {ticketCategories.length === 0 && (
                  <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No ticket categories added yet</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Upload progress */}
        {uploadProgress !== null && (
          <div style={{ margin: '12px 0' }}>
            <div style={{ fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
              Uploading images… {uploadProgress}%
            </div>
            <div style={{ background: '#e2e8f0', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg,#0284c7,#38bdf8)', borderRadius: '99px', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}
        <button className="save-button" onClick={handleSaveChanges} disabled={isSaving || uploadProgress !== null}>
          {uploadProgress !== null ? `Uploading… ${uploadProgress}%` : isSaving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* ── Event Schedule ── */}
      <div className="event-schedule-container">
        <div className="schedule-header">
          <h2 className="schedule-title">Event Schedule</h2>
          <button className="add-item-btn" onClick={() => setShowAddSchedule(!showAddSchedule)}>
            <span>+</span> Add Item
          </button>
        </div>

        {showAddSchedule && (
          <div className="add-schedule-form">
            <div className="schedule-form-row">
              <div className="schedule-form-group">
                <input type="text" placeholder="Schedule Title" value={newScheduleItem.title} onChange={(e) => setNewScheduleItem({ ...newScheduleItem, title: e.target.value })} className="schedule-input" />
              </div>
              <div className="schedule-form-group">
                <input type="time" placeholder="Time" value={newScheduleItem.time} onChange={(e) => setNewScheduleItem({ ...newScheduleItem, time: e.target.value })} className="schedule-input" />
              </div>
              <div className="schedule-form-group">
                <input type="text" placeholder="Duration (e.g., 1 hour)" value={newScheduleItem.duration} onChange={(e) => setNewScheduleItem({ ...newScheduleItem, duration: e.target.value })} className="schedule-input" />
              </div>
            </div>
            <div className="schedule-form-actions">
              <button className="schedule-save-btn" onClick={handleAddScheduleItem}>Save</button>
              <button className="schedule-cancel-btn" onClick={() => setShowAddSchedule(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="schedule-list">
          {scheduleItems.map((item) => (
            <div key={item.id} className="schedule-item">
              <div className="schedule-item-left">
                <h3 className="schedule-item-title">{item.title}</h3>
                <p className="schedule-item-time">{item.time} • {item.duration}</p>
              </div>
              <div className="schedule-item-actions">
                <button className="schedule-edit-btn" onClick={() => handleEditScheduleItem(item.id)}><HiPencilAlt /></button>
                <button className="schedule-delete-btn" onClick={() => handleDeleteScheduleItem(item.id)}><HiOutlineTrash /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Event Flyers & Posters ── */}
      <div className="event-flyers-container">
        <h2 className="flyers-title">Event Flyers & Posters</h2>
        <div className="flyers-grid">
          <label className="upload-box">
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
            <HiUpload className="upload-icon" />
            <span className="upload-text">Upload Image</span>
          </label>
          {uploadedImages.map((image) => (
            <div key={image.id} className="image-preview-box">
              <img src={image.preview} alt={image.name} className="preview-image" />
              <button className="remove-image-btn" onClick={() => handleRemoveImage(image.id)}>×</button>
            </div>
          ))}
          {uploadedImages.length === 0 && (
            <>
              <div className="placeholder-box"><MdCalendarToday className="placeholder-icon" /></div>
              <div className="placeholder-box"><MdCalendarToday className="placeholder-icon" /></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventManagementSection;
