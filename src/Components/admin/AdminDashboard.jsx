import { useState, useEffect } from 'react';
import './AdminDashboard.css';
import {
  MdEvent, MdPeople, MdShoppingBag, MdShoppingCart,
  MdPerson, MdCheckCircle, MdPending, MdBlock,
  MdTrendingUp, MdNotifications, MdAdminPanelSettings,
  MdOpenInNew, MdCalendarToday, MdVerified,
} from 'react-icons/md';
import { fetchDashboardStats } from '../../services/api';

function AdminDashboard({ onNavigate = () => {} }) {

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [now, setNow]                     = useState(new Date());

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardStats();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();

    // Live clock
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatPercentageChange = (value) => {
    if (!value && value !== 0) return null;
    const sign = value >= 0 ? '↑' : '↓';
    return `${sign} ${Math.abs(value)}%`;
  };

  const getChangeClass = (value) => {
    if (!value && value !== 0) return '';
    if (value === 0) return 'neutral';
    return value > 0 ? 'positive' : 'negative';
  };

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (d) =>
    d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Derived metrics from dashboardData
  const totalEvents    = dashboardData?.totalEvents    || 0;
  const activeUsers    = dashboardData?.activeUsers    || 0;
  const totalProducts  = dashboardData?.totalProducts  || 0;
  const productsSold   = dashboardData?.productsSold   || 0;
  const publishedEvents = dashboardData?.publishedEvents ?? 0;
  const draftEvents    = dashboardData?.draftEvents    ?? 0;


  // Quick action tiles — section key maps to Admin.jsx switch cases
  const quickActions = [
    { icon: <MdEvent />,               label: 'Manage Events',    color: '#0284c7', bg: '#f0f9ff',  section: 'events'       },
    { icon: <MdPeople />,              label: 'Manage Users',     color: '#7c3aed', bg: '#f5f3ff',  section: 'users'        },
    { icon: <MdAdminPanelSettings />,  label: 'Coordinators',     color: '#0891b2', bg: '#ecfeff',  section: 'coordinators' },
    { icon: <MdShoppingBag />,         label: 'Marketplace',      color: '#d97706', bg: '#fffbeb',  section: 'products'     },
    { icon: <MdTrendingUp />,          label: 'Sales Reports',    color: '#059669', bg: '#ecfdf5',  section: 'productSales' },
    { icon: <MdNotifications />,       label: 'Ticket Sales',     color: '#dc2626', bg: '#fef2f2',  section: 'ticketSales'  },
  ];

  // System health / status items
  const systemItems = [
    { label: 'Published Events',   value: publishedEvents, icon: <MdCheckCircle />,  color: '#10b981' },
    { label: 'Draft Events',       value: draftEvents,     icon: <MdPending />,      color: '#f59e0b' },
    { label: 'Total Coordinators', value: dashboardData?.topCoordinators?.length || 0, icon: <MdVerified />, color: '#0284c7' },
    { label: 'Products Sold',      value: productsSold,    icon: <MdShoppingCart />, color: '#7c3aed' },
  ];

  return (
    <div className="admin-dashboard">

      {/* ── Welcome Banner ── */}
      <div className="ov-welcome-banner">
        <div className="ov-welcome-left">
          <h1 className="ov-welcome-title">{greeting()}, Admin 👋</h1>
          <p className="ov-welcome-sub">{formatDate(now)} — Here's what's happening on CampusAura today.</p>
        </div>
        <div className="ov-welcome-date-badge">
          <MdCalendarToday className="ov-date-icon" />
          <span>{now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {loading && <div className="loading-message">Loading dashboard data…</div>}
      {error   && <div className="error-message">{error}</div>}

      {/* ── KPI Stat Cards ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper"><MdEvent className="stat-icon" /></div>
          <div className="stat-header">TOTAL EVENTS</div>
          <div className="stat-value">{totalEvents}</div>
          <div className={`stat-change ${getChangeClass(dashboardData?.eventsPercentageChange)}`}>
            {formatPercentageChange(dashboardData?.eventsPercentageChange) || '—'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#f5f3ff' }}><MdPeople className="stat-icon" style={{ color: '#7c3aed' }} /></div>
          <div className="stat-header">ACTIVE USERS</div>
          <div className="stat-value">{activeUsers.toLocaleString()}</div>
          <div className={`stat-change ${getChangeClass(dashboardData?.usersPercentageChange)}`}>
            {formatPercentageChange(dashboardData?.usersPercentageChange) || '—'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fffbeb' }}><MdShoppingBag className="stat-icon" style={{ color: '#d97706' }} /></div>
          <div className="stat-header">TOTAL PRODUCTS</div>
          <div className="stat-value">{totalProducts}</div>
          <div className={`stat-change ${getChangeClass(dashboardData?.productsPercentageChange)}`}>
            {formatPercentageChange(dashboardData?.productsPercentageChange) || '—'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#ecfdf5' }}><MdShoppingCart className="stat-icon" style={{ color: '#059669' }} /></div>
          <div className="stat-header">PRODUCTS SOLD</div>
          <div className="stat-value">{productsSold}</div>
          <div className="stat-change positive">
            {dashboardData?.productsSoldIsNew ? 'New' : `${productsSold} sold`}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="ov-section-label">Quick Actions</div>
      <div className="ov-quick-actions">
        {quickActions.map((a, i) => (
          <button
            key={i}
            className="ov-action-tile"
            style={{ '--tile-color': a.color, '--tile-bg': a.bg }}
            onClick={() => onNavigate(a.section)}
            title={`Go to ${a.label}`}
          >
            <span className="ov-action-icon">{a.icon}</span>
            <span className="ov-action-label">{a.label}</span>
            <MdOpenInNew className="ov-action-arrow" />
          </button>
        ))}
      </div>

      {/* ── Middle Row: System Status + Recent Events ── */}
      <div className="ov-middle-row">

        {/* System Status */}
        <div className="ov-panel">
          <div className="ov-panel-header">
            <h3>Platform Status</h3>
            <span className="ov-badge ov-badge--green">● All Systems Operational</span>
          </div>
          <div className="ov-status-list">
            {systemItems.map((item, i) => (
              <div key={i} className="ov-status-row">
                <span className="ov-status-icon" style={{ color: item.color }}>{item.icon}</span>
                <span className="ov-status-label">{item.label}</span>
                <span className="ov-status-value" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
          {/* Mini progress bars */}
          <div className="ov-progress-section">
            <div className="ov-progress-label">
              <span>Event Publish Rate</span>
              <span>{totalEvents ? Math.round((publishedEvents / totalEvents) * 100) : 0}%</span>
            </div>
            <div className="ov-progress-bar">
              <div className="ov-progress-fill ov-fill--blue" style={{ width: `${totalEvents ? (publishedEvents / totalEvents) * 100 : 0}%` }} />
            </div>
            <div className="ov-progress-label" style={{ marginTop: '12px' }}>
              <span>Marketplace Activity</span>
              <span>{totalProducts ? Math.min(Math.round((productsSold / totalProducts) * 100), 100) : 0}%</span>
            </div>
            <div className="ov-progress-bar">
              <div className="ov-progress-fill ov-fill--green" style={{ width: `${totalProducts ? Math.min((productsSold / totalProducts) * 100, 100) : 0}%` }} />
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="ov-panel">
          <div className="ov-panel-header">
            <h3>Recent Events</h3>
          </div>
          <div className="ov-event-list">
            {dashboardData?.recentEvents && dashboardData.recentEvents.length > 0 ? (
              dashboardData.recentEvents.map((event, i) => {
                const status = (event.status || 'draft').toLowerCase();
                return (
                  <div key={i} className="ov-event-row">
                    <div className="ov-event-dot" data-status={status} />
                    <div className="ov-event-info">
                      <span className="ov-event-title">{event.title || event.name || 'Untitled Event'}</span>
                      {event.dateTime && (
                        <span className="ov-event-date">{new Date(event.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      )}
                    </div>
                    <span className={`ov-status-badge ov-status--${status}`}>{event.status || 'Draft'}</span>
                  </div>
                );
              })
            ) : (
              <div className="ov-empty-state">No recent events found.</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Top Coordinators ── */}
      {dashboardData?.topCoordinators && dashboardData.topCoordinators.length > 0 && (
        <>
          <div className="ov-section-label" style={{ marginTop: '2rem' }}>Top Coordinators</div>
          <div className="ov-coordinators-grid">
            {dashboardData.topCoordinators.map((c, i) => {
              const name    = c.name || 'Coordinator';
              const initial = name.charAt(0).toUpperCase();
              const events  = c.eventCount || 0;
              const sub     = c.degree || c.email || null;
              return (
                <div key={i} className="ov-coord-card">
                  <div className="ov-coord-avatar" data-rank={i}>
                    {initial}
                    {i < 3 && <span className="ov-coord-rank">#{i + 1}</span>}
                  </div>
                  <div className="ov-coord-info">
                    <span className="ov-coord-name">{name}</span>
                    {sub && <span className="ov-coord-sub">{sub}</span>}
                  </div>
                  <div className="ov-coord-stat">
                    <span className="ov-coord-count">{events}</span>
                    <span className="ov-coord-count-label">events</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
}

export default AdminDashboard;
