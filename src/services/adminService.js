/**
 * Service for Admin API requests.
 * Handles communication with backend admin endpoints with Bearer token authentication.
 */

const getAdminApiEndpoint = () => {
  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (import.meta.env.DEV || isLocalhost) {
    const configured = import.meta.env.VITE_API_URL;
    if (configured && configured.includes('localhost')) {
      return `${configured.replace(/\/+$/, '')}/api/admin`;
    }
    return '/api/admin';
  }

  const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '';
  return `${API_URL}/api/admin`;
};

/**
 * Common fetch helper with JSON parsing and error handling
 */
const request = async (path, options = {}, token = null) => {
  const base = getAdminApiEndpoint();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
};

/**
 * Admin Login
 */
export const adminLogin = async (username, password) => {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
};

/**
 * Verify Admin Token
 */
export const verifyAdminSession = async (token) => {
  return request('/verify', { method: 'GET' }, token);
};

/**
 * Fetch Admin Overview Stats
 */
export const fetchAdminStats = async (token) => {
  return request('/stats', { method: 'GET' }, token);
};

/**
 * Fetch Admin Orders (Paginated, filtered, searched)
 */
export const fetchAdminOrders = async (params = {}, token) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });

  const queryString = query.toString();
  const path = `/orders${queryString ? `?${queryString}` : ''}`;
  return request(path, { method: 'GET' }, token);
};

/**
 * Fetch Single Order Details
 */
export const fetchAdminOrderById = async (id, token) => {
  return request(`/orders/${id}`, { method: 'GET' }, token);
};

/**
 * Update Payment Status
 */
export const updatePaymentStatus = async (id, paymentData, token) => {
  const body = typeof paymentData === 'string'
    ? { paymentStatus: paymentData }
    : paymentData;

  return request(`/orders/${id}/payment`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }, token);
};

/**
 * Update Dispatch Status
 */
export const updateDispatchStatus = async (id, dispatchStatus, token) => {
  return request(`/orders/${id}/dispatch`, {
    method: 'PATCH',
    body: JSON.stringify({ dispatchStatus }),
  }, token);
};

/**
 * Update Delivery Status
 */
export const updateDeliveryStatus = async (id, deliveryStatus, token) => {
  return request(`/orders/${id}/delivery`, {
    method: 'PATCH',
    body: JSON.stringify({ deliveryStatus }),
  }, token);
};

/**
 * Fetch Payment Records Table
 */
export const fetchPaymentRecords = async (params = {}, token) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });

  const queryString = query.toString();
  const path = `/payments${queryString ? `?${queryString}` : ''}`;
  return request(path, { method: 'GET' }, token);
};
