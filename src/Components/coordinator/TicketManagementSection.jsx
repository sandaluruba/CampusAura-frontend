import { useState, useEffect, useCallback } from 'react';
import { fetchCoordinatorTicketSales } from '../../services/api';
import './TicketManagementSection.css';

// ─── helpers ───────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function categoryBadgeClass(cat) {
  if (!cat) return 'badge-general';
  const lower = cat.toLowerCase();
  if (lower.includes('vvip')) return 'badge-vvip';
  if (lower.includes('vip')) return 'badge-vip';
  return 'badge-general';
}

// ─── Summary cards ─────────────────────────────────────────────────────────

function SummaryCards({ sales }) {
  const totalTickets = sales.reduce((s, x) => s + (x.ticketCount || 0), 0);
  const totalRevenue = sales.reduce((s, x) => s + (x.totalAmount || 0), 0);
  const uniqueBuyers = new Set(sales.map(x => x.userId)).size;
  const uniqueEvents = new Set(sales.map(x => x.eventId)).size;

  return (
    <div className="tm-summary-row">
      <div className="tm-summary-card tm-card-blue">
        <span className="tm-summary-num">{totalTickets}</span>
        <span className="tm-summary-label">Tickets Sold</span>
      </div>
      <div className="tm-summary-card tm-card-green">
        <span className="tm-summary-num">LKR {totalRevenue.toLocaleString()}</span>
        <span className="tm-summary-label">Total Revenue</span>
      </div>
      <div className="tm-summary-card tm-card-purple">
        <span className="tm-summary-num">{uniqueBuyers}</span>
        <span className="tm-summary-label">Unique Buyers</span>
      </div>
      <div className="tm-summary-card tm-card-orange">
        <span className="tm-summary-num">{uniqueEvents}</span>
        <span className="tm-summary-label">Events with Sales</span>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

function TicketManagementSection() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterEvent, setFilterEvent] = useState('All');
  const [expandedEvent, setExpandedEvent] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCoordinatorTicketSales();
      setSales(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load ticket sales');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── derived data ──────────────────────────────────────────────────────────

  const allCategories = ['All', ...new Set(sales.map(s => s.ticketCategory).filter(Boolean))];
  const allEvents = ['All', ...new Set(sales.map(s => s.eventTitle).filter(Boolean))];

  const filtered = sales.filter(s => {
    const matchSearch = !search ||
      (s.userName && s.userName.toLowerCase().includes(search.toLowerCase())) ||
      (s.userEmail && s.userEmail.toLowerCase().includes(search.toLowerCase())) ||
      (s.eventTitle && s.eventTitle.toLowerCase().includes(search.toLowerCase()));
    const matchCat = filterCategory === 'All' || s.ticketCategory === filterCategory;
    const matchEv = filterEvent === 'All' || s.eventTitle === filterEvent;
    return matchSearch && matchCat && matchEv;
  });

  // Group filtered sales by event
  const byEvent = filtered.reduce((acc, sale) => {
    const key = sale.eventId || 'unknown';
    if (!acc[key]) acc[key] = { eventTitle: sale.eventTitle || 'Unknown Event', sales: [] };
    acc[key].sales.push(sale);
    return acc;
  }, {});

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="ticket-management-container">
      {/* Header */}
      <div className="ticket-header">
        <h1 className="ticket-title">Ticket Management</h1>
        <p className="ticket-subtitle">Buyer details for your events after payment completion</p>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="tm-state-box">
          <div className="tm-spinner" />
          <span>Loading ticket sales…</span>
        </div>
      )}
      {error && !loading && (
        <div className="tm-state-box tm-error-box">
          <span>⚠ {error}</span>
          <button className="tm-retry-btn" onClick={load}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Summary */}
          <SummaryCards sales={sales} />

          {/* Filters */}
          <div className="tm-filters-row">
            <input
              className="tm-search-input"
              type="text"
              placeholder="Search by buyer name, email or event…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="tm-select"
              value={filterEvent}
              onChange={e => setFilterEvent(e.target.value)}
            >
              {allEvents.map(ev => <option key={ev}>{ev}</option>)}
            </select>
            <select
              className="tm-select"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            >
              {allCategories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* No data */}
          {Object.keys(byEvent).length === 0 && (
            <div className="tm-state-box">
              <span>
                {sales.length === 0
                  ? '🎟️ No tickets have been purchased for your events yet.'
                  : '🔍 No results match your filters.'}
              </span>
            </div>
          )}

          {/* Event groups */}
          {Object.entries(byEvent).map(([eventId, group]) => {
            const isOpen = expandedEvent === eventId;
            const groupRevenue = group.sales.reduce((s, x) => s + (x.totalAmount || 0), 0);
            const groupTickets = group.sales.reduce((s, x) => s + (x.ticketCount || 0), 0);

            return (
              <div key={eventId} className="tm-event-group">
                {/* Event group header */}
                <div
                  className={`tm-event-header ${isOpen ? 'tm-event-header--open' : ''}`}
                  onClick={() => setExpandedEvent(isOpen ? null : eventId)}
                >
                  <div className="tm-event-header-left">
                    <span className="tm-event-chevron">{isOpen ? '▾' : '▸'}</span>
                    <div>
                      <div className="tm-event-name">{group.eventTitle}</div>
                      <div className="tm-event-meta">
                        {group.sales.length} purchase{group.sales.length !== 1 ? 's' : ''} ·{' '}
                        {groupTickets} ticket{groupTickets !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="tm-event-revenue">
                    LKR {groupRevenue.toLocaleString()}
                  </div>
                </div>

                {/* Buyer table */}
                {isOpen && (
                  <div className="tm-table-wrapper">
                    <table className="tm-table">
                      <thead>
                        <tr>
                          <th>Buyer</th>
                          <th>Email</th>
                          <th>Category</th>
                          <th>Qty</th>
                          <th>Price / ticket</th>
                          <th>Total</th>
                          <th>Payment ID</th>
                          <th>Purchased At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.sales.map(sale => (
                          <tr key={sale.saleId}>
                            <td>
                              <div className="tm-buyer-name">{sale.userName || '—'}</div>
                            </td>
                            <td className="tm-email">{sale.userEmail || '—'}</td>
                            <td>
                              <span className={`tm-badge ${categoryBadgeClass(sale.ticketCategory)}`}>
                                {sale.ticketCategory || '—'}
                              </span>
                            </td>
                            <td className="tm-center">{sale.ticketCount ?? '—'}</td>
                            <td className="tm-center">
                              {sale.pricePerTicket != null
                                ? `LKR ${Number(sale.pricePerTicket).toLocaleString()}`
                                : '—'}
                            </td>
                            <td className="tm-amount">
                              {sale.totalAmount != null
                                ? `LKR ${Number(sale.totalAmount).toLocaleString()}`
                                : '—'}
                            </td>
                            <td className="tm-payment-id">
                              {sale.stripePaymentId
                                ? <span title={sale.stripePaymentId}>
                                    {sale.stripePaymentId.slice(0, 14)}…
                                  </span>
                                : '—'}
                            </td>
                            <td className="tm-date">{formatDate(sale.purchasedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default TicketManagementSection;
