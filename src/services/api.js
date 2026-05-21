// ============================================================
// CampusAura API Service
// Consolidated API layer for all backend communication
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const ADMIN_BASE_URL = `${API_BASE_URL}/api/admin`;

// ============================================================
// API Endpoints (public constants)
// ============================================================
export const API_ENDPOINTS = {
  // Public Event Endpoints (no authentication required)
  LANDING_PAGE_CAROUSEL: `${API_BASE_URL}/api/events/landing-page`,
  LATEST_EVENTS: `${API_BASE_URL}/api/events/latest`,
  PUBLIC_EVENTS: `${API_BASE_URL}/api/events/public`,
  EVENT_BY_ID: (eventId) => `${API_BASE_URL}/api/events/public/${eventId}`,
  PUBLIC_PRODUCTS: `${API_BASE_URL}/api/firestore/products`,
};

// ============================================================
// Internal Helpers
// ============================================================

/**
 * Get Firebase auth token for authenticated requests
 * @returns {Promise<string>} Firebase ID token
 */
const getAuthToken = async () => {
  const { auth } = await import('../firebase/firebaseConfig');
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return await user.getIdToken();
};

/**
 * Make an authenticated admin API request
 * @param {string} endpoint - Path relative to /api/admin
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Parsed JSON response
 */
const adminRequest = async (endpoint, options = {}) => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${ADMIN_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Admin API request error:', error);
    throw error;
  }
};

// ============================================================
// Public Event APIs (no auth required)
// ============================================================

/** Fetch random ongoing events for landing page carousel */
export const fetchCarouselEvents = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.LANDING_PAGE_CAROUSEL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching carousel events:', error);
    throw error;
  }
};

/** Fetch latest 3 published events for the landing page */
export const fetchLatestEvents = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.LATEST_EVENTS);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log('Latest events from API:', data);
    return data;
  } catch (error) {
    console.error('Error fetching latest events:', error);
    throw error;
  }
};

/**
 * Fetch all public events with optional filtering and sorting
 * @param {string} category - Filter by category. Default: All
 * @param {string} sortBy - Sort order (upcoming, latest, popular). Default: upcoming
 */
export const fetchPublicEvents = async (category = 'All', sortBy = 'upcoming') => {
  try {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (sortBy) params.append('sortBy', sortBy);
    const response = await fetch(`${API_ENDPOINTS.PUBLIC_EVENTS}?${params.toString()}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log('Public events from API:', data);
    return data;
  } catch (error) {
    console.error('Error fetching public events:', error);
    throw error;
  }
};

/** Fetch a single event by ID */
export const fetchEventById = async (eventId) => {
  try {
    const response = await fetch(API_ENDPOINTS.EVENT_BY_ID(eventId));
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching event:', { eventId, error });
    throw error;
  }
};

// ============================================================
// Auth / Registration APIs
// ============================================================

/**
 * Validate email and user type before registration
 * @param {string} email
 * @param {string} userType - 'student' or 'external'
 */
export const validateRegistration = async (email, userType) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/validate-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, userType }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Validation failed');
    return data;
  } catch (error) {
    console.error('Validation error:', error);
    throw error;
  }
};

/** Complete student registration with backend */
export const completeStudentRegistration = async (token, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register/student/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Student registration failed');
    return data;
  } catch (error) {
    console.error('Student registration error:', error);
    throw error;
  }
};

/** Complete external user registration with backend */
export const completeExternalUserRegistration = async (token, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register/external/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'External user registration failed');
    return data;
  } catch (error) {
    console.error('External user registration error:', error);
    throw error;
  }
};

/** Get current user data from backend */
export const getCurrentUser = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch user data');
    return data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

/** Get user session information */
export const getSession = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch session');
    return data;
  } catch (error) {
    console.error('Get session error:', error);
    throw error;
  }
};

// ============================================================
// Admin - Dashboard Stats
// ============================================================

export const fetchDashboardStats = async () => adminRequest('/dashboard/stats');

// ============================================================
// Admin - Coordinator Management
// ============================================================

export const fetchCoordinators = async () => adminRequest('/coordinators');
export const fetchCoordinatorById = async (id) => adminRequest(`/coordinators/${id}`);
export const createCoordinator = async (coordinatorData) =>
  adminRequest('/coordinators', { method: 'POST', body: JSON.stringify(coordinatorData) });
export const updateCoordinatorStatus = async (id, active) =>
  adminRequest(`/coordinators/${id}/status`, { method: 'PATCH', body: JSON.stringify({ active }) });
export const deleteCoordinator = async (id) =>
  adminRequest(`/coordinators/${id}`, { method: 'DELETE' });
export const fetchDepartments = async () => adminRequest('/coordinators/departments');
export const fetchDegreeProgrammes = async () => adminRequest('/coordinators/degree-programmes');

/** Update coordinator details (token-explicit overload kept for backward compat) */
export const fetchAllCoordinators = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/coordinators`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching coordinators:', error);
    throw error;
  }
};

export const updateCoordinator = async (id, coordinatorData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/coordinators/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(coordinatorData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error updating coordinator:', error);
    throw error;
  }
};

// ============================================================
// Admin - Event Management
// ============================================================

export const fetchAdminEvents = async () => adminRequest('/events');
export const fetchAdminEventById = async (id) => adminRequest(`/events/${id}`);
export const filterEventsByCategory = async (category) =>
  adminRequest(`/events/filter?category=${category}`);
export const approveEvent = async (id) =>
  adminRequest(`/events/${id}/approve`, { method: 'POST' });
export const rejectEvent = async (id) =>
  adminRequest(`/events/${id}/reject`, { method: 'POST' });
export const fetchPendingEventsCount = async () => adminRequest('/events/pending/count');
export const deleteEvent = async (id) =>
  adminRequest(`/events/${id}`, { method: 'DELETE' });

// ============================================================
// Coordinator - Event Management
// ============================================================

/** Create a new event (explicit token for coordinator use) */
export const createEvent = async (eventData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// ============================================================
// Admin - User Management
// ============================================================

export const fetchUsers = async () => adminRequest('/users');
export const fetchUniversityStudents = async () => adminRequest('/users/university-students');
export const fetchExternalUsers = async () => adminRequest('/users/external-users');
export const fetchPendingVerificationUsers = async () => adminRequest('/users/pending-verification');
export const fetchUserStats = async () => adminRequest('/users/stats');
export const updateUserStatus = async (id, active) =>
  adminRequest(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ active }) });
export const verifyStudentId = async (id, status) =>
  adminRequest(`/users/${id}/verify`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const deleteUser = async (id) =>
  adminRequest(`/users/${id}`, { method: 'DELETE' });

// ============================================================
// Admin - Product Management
// ============================================================

export const fetchAdminProducts = async () => adminRequest('/products');
export const fetchAdminProductById = async (id) => adminRequest(`/products/${id}`);
export const approveProduct = async (id) =>
  adminRequest(`/products/${id}/approve`, { method: 'POST' });
export const disableProduct = async (id) =>
  adminRequest(`/products/${id}/disable`, { method: 'POST' });
export const fetchPendingProductsCount = async () => adminRequest('/products/pending/count');
export const deleteProduct = async (id) =>
  adminRequest(`/products/${id}`, { method: 'DELETE' });

// ============================================================
// Coordinator - Product Management
// ============================================================

const coordinatorProductRequest = async (path, options = {}) => {
  const { getAuth } = await import('firebase/auth');
  const token = await getAuth().currentUser?.getIdToken();
  const res = await fetch(`${API_BASE_URL}/api/coordinator/products${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const fetchMyProducts        = () => coordinatorProductRequest('/my');
export const fetchMyOrders          = () => coordinatorProductRequest('/orders');
export const createCoordinatorProduct = (data) =>
  coordinatorProductRequest('', { method: 'POST', body: JSON.stringify(data) });
export const updateCoordinatorProduct = (id, data) =>
  coordinatorProductRequest(`/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCoordinatorProduct = (id) =>
  coordinatorProductRequest(`/${id}`, { method: 'DELETE' });

// ============================================================
// Admin - Payment / Transaction Management
// ============================================================

export const fetchPaymentStats = async () => adminRequest('/payments/stats');
export const fetchTransactions = async () => adminRequest('/payments/transactions');
export const fetchRecentTransactions = async (limit = 10) =>
  adminRequest(`/payments/transactions/recent?limit=${limit}`);

// ============================================================
// Public Marketplace APIs
// ============================================================

export const fetchMarketplaceProducts = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.PUBLIC_PRODUCTS);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data
      .map((doc) => {
        const product = doc.data ? doc.data() : doc;
        return { ...product, id: doc.id || product.id };
      })
      .filter((p) => p.status === 'AVAILABLE' || p.status === 'APPROVED');
  } catch (error) {
    console.error('Error fetching marketplace products:', error);
    throw error;
  }
};

// ============================================================
// Feedback APIs
// ============================================================

export const fetchEventFeedback = async (eventId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events/public/${eventId}/feedback`);
    if (!response.ok) throw new Error('Failed to fetch feedback');
    return await response.json();
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }
};

export const postEventFeedback = async (eventId, text) => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('Failed to post feedback');
    return await response.json();
  } catch (error) {
    console.error('Error posting feedback:', error);
    throw error;
  }
};

// ============================================================
// Payment APIs
// ============================================================

export const createTicketPaymentIntent = async (data) => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/payments/create-ticket-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create payment intent');
    return await response.json();
  } catch (error) {
    console.error('Error creating ticket payment intent:', error);
    throw error;
  }
};

export const confirmTicketPurchase = async (saleData) => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/payments/confirm-ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(saleData),
    });
    if (!response.ok) throw new Error('Failed to confirm ticket purchase');
    return await response.json();
  } catch (error) {
    console.error('Error confirming ticket purchase:', error);
    throw error;
  }
};

export const createProductPaymentIntent = async (data) => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/payments/create-product-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create product payment intent');
    return await response.json();
  } catch (error) {
    console.error('Error creating product payment intent:', error);
    throw error;
  }
};

export const confirmProductPurchase = async (saleData) => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/payments/confirm-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(saleData),
    });
    if (!response.ok) throw new Error('Failed to confirm product purchase');
    return await response.json();
  } catch (error) {
    console.error('Error confirming product purchase:', error);
    throw error;
  }
};

// ============================================================
// Admin Sales APIs
// ============================================================

export const fetchTicketSales = async () => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/admin/sales/tickets`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch ticket sales');
    return await response.json();
  } catch (error) {
    console.error('Error fetching ticket sales:', error);
    throw error;
  }
};

export const fetchProductSales = async () => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/admin/sales/products`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch product sales');
    return await response.json();
  } catch (error) {
    console.error('Error fetching product sales:', error);
    throw error;
  }
};

/**
 * Fetch ticket sales for events managed by the authenticated coordinator
 * Uses GET /api/events/coordinator/ticket-sales
 */
export const fetchCoordinatorTicketSales = async () => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/events/coordinator/ticket-sales`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch coordinator ticket sales');
    return await response.json();
  } catch (error) {
    console.error('Error fetching coordinator ticket sales:', error);
    throw error;
  }
};


// ============================================================
// Utility Helpers
// ============================================================

/** Format ISO date to readable long format */
export const formatEventDate = (isoDate) => {
  if (!isoDate) return 'Date TBA';
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

/** Format ISO date to short carousel format */
export const formatCarouselDate = (isoDate) => {
  if (!isoDate) return 'Date TBA';
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

/** Get the primary image URL from an event object */
export const getEventImageUrl = (event) => {
  if (event.eventImageUrls && event.eventImageUrls.length > 0) {
    return event.eventImageUrls[0];
  }
  return 'https://picsum.photos/1400/700?grayscale';
};

/** Truncate text to a max length */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
