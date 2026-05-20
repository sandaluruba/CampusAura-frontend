import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../Context/AuthContext';
import {
  MdEvent, MdLocationOn, MdCalendarToday, MdPeople,
  MdConfirmationNumber, MdCheckCircle, MdSchedule,
  MdDrafts, MdCancel, MdRefresh
} from 'react-icons/md';
import './CommunityFeedbackSection.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(dt) {
  if (!dt) return '—';
  try {
    return new Date(dt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return dt; }
}

function statusMeta(status) {
  switch ((status || '').toUpperCase()) {
    case 'PUBLISHED': return { label: 'Published', cls: 'cd-badge--published', Icon: MdCheckCircle };
    case 'ONGOING':   return { label: 'Ongoing',   cls: 'cd-badge--ongoing',   Icon: MdCheckCircle };
    case 'DRAFT':     return { label: 'Draft',     cls: 'cd-badge--draft',     Icon: MdDrafts      };
    case 'PENDING':   return { label: 'Pending',   cls: 'cd-badge--pending',   Icon: MdSchedule    };
    case 'COMPLETED': return { label: 'Completed', cls: 'cd-badge--completed', Icon: MdCheckCircle };
    case 'CANCELLED': return { label: 'Cancelled', cls: 'cd-badge--cancelled', Icon: MdCancel      };
    default:          return { label: status || 'Unknown', cls: 'cd-badge--draft', Icon: MdSchedule };
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className={`cd-stat-card cd-stat-${color}`}>
      <div className="cd-stat-icon"><Icon /></div>
      <div>
        <div className="cd-stat-value">{value}</div>
        <div className="cd-stat-label">{label}</div>
      </div>
    </div>
  );
}

function EventCard({ event }) {
  const { label, cls, Icon: StatusIcon } = statusMeta(event.status);
  const tickets = Array.isArray(event.ticketCategories) ? event.ticketCategories : [];

  return (
    <div className="cd-event-card">
      {/* Left accent bar keyed to status */}
      <div className={`cd-event-accent ${cls.replace('cd-badge--', 'cd-accent--')}`} />

      <div className="cd-event-body">
        {/* Top row: title + status */}
        <div className="cd-event-top">
          <h3 className="cd-event-title">{event.title || 'Untitled Event'}</h3>
          <span className={`cd-badge ${cls}`}>
            <StatusIcon style={{ fontSize: '13px' }} />
            {label}
          </span>
        </div>

        {/* Meta row */}
        <div className="cd-event-meta">
          {event.dateTime && (
            <span className="cd-meta-item">
              <MdCalendarToday className="cd-meta-icon" />
              {formatDate(event.dateTime)}
            </span>
          )}
          {event.venue && (
            <span className="cd-meta-item">
              <MdLocationOn className="cd-meta-icon" />
              {event.venue}
            </span>
          )}
          {event.category && (
            <span className="cd-meta-item cd-category-chip">
              {event.category}
            </span>
          )}
          {event.organizingDepartment && (
            <span className="cd-meta-item">
              🏢 {event.organizingDepartment}
            </span>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="cd-event-desc">{event.description}</p>
        )}

        {/* Bottom row: attendees + tickets */}
        <div className="cd-event-footer">
          <span className="cd-footer-item">
            <MdPeople className="cd-meta-icon" />
            {event.attendeeCount ?? 0} attendees
          </span>

          {event.ticketsAvailable && tickets.length > 0 ? (
            <div className="cd-ticket-chips">
              <MdConfirmationNumber className="cd-meta-icon" style={{ color: '#7c3aed' }} />
              {tickets.map((t, i) => (
                <span key={i} className="cd-ticket-chip">
                  {t.categoryName} · LKR {Number(t.price).toLocaleString()}
                  <span className="cd-ticket-avail"> ({t.availableCount} left)</span>
                </span>
              ))}
            </div>
          ) : (
            <span className="cd-footer-item cd-no-tickets">
              {event.ticketsAvailable ? 'Tickets enabled' : 'No tickets'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard component ──────────────────────────────────────────────────

function CommunityFeedbackSection() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${API_BASE}/api/events/my-events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { load(); }, [load]);

  // ── derived stats ──────────────────────────────────────────────────────────
  const total     = events.length;
  const published = events.filter(e => ['PUBLISHED','ONGOING'].includes((e.status||'').toUpperCase())).length;
  const drafts    = events.filter(e => (e.status||'').toUpperCase() === 'DRAFT').length;
  const totalAtt  = events.reduce((s, e) => s + (e.attendeeCount || 0), 0);

  // ── filtered list ──────────────────────────────────────────────────────────
  const allStatuses = ['All', ...new Set(events.map(e => e.status).filter(Boolean))];
  const filtered = events.filter(e => {
    const matchStatus = filterStatus === 'All' || e.status === filterStatus;
    const matchSearch = !search ||
      (e.title && e.title.toLowerCase().includes(search.toLowerCase())) ||
      (e.venue && e.venue.toLowerCase().includes(search.toLowerCase())) ||
      (e.category && e.category.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="community-feedback-container">
      {/* Page header */}
      <div className="cd-page-header">
        <div>
          <h1 className="cd-page-title">Dashboard</h1>
          <p className="cd-page-subtitle">Overview of all your events and activities</p>
        </div>
        <button className="cd-refresh-btn" onClick={load} title="Refresh">
          <MdRefresh style={{ fontSize: '20px' }} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="cd-stats-row">
        <StatCard icon={MdEvent}              label="Total Events"  value={total}     color="blue"   />
        <StatCard icon={MdCheckCircle}        label="Published"     value={published} color="green"  />
        <StatCard icon={MdDrafts}             label="Drafts"        value={drafts}    color="gray"   />
        <StatCard icon={MdPeople}             label="Attendees"     value={totalAtt}  color="purple" />
      </div>

      {/* Filters */}
      <div className="cd-filters-row">
        <input
          className="cd-search-input"
          type="text"
          placeholder="Search events by title, venue or category…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="cd-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          {allStatuses.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="cd-state-box">
          <div className="cd-spinner" />
          <span>Loading your events…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="cd-state-box cd-error-box">
          <span>⚠ {error}</span>
          <button className="cd-retry-btn" onClick={load}>Retry</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="cd-state-box">
          <MdEvent style={{ fontSize: '48px', color: '#cbd5e1' }} />
          <span>
            {events.length === 0
              ? "You haven't created any events yet. Go to Event Management to create your first event!"
              : 'No events match your filters.'}
          </span>
        </div>
      )}

      {/* Event cards */}
      {!loading && !error && filtered.length > 0 && (
        <div className="cd-events-list">
          {filtered.map(event => (
            <EventCard key={event.eventId || event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommunityFeedbackSection;
