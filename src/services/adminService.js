/**
 * Service for Admin API requests.
 * Handles communication with backend admin endpoints with Bearer token authentication.
 * Includes intelligent multi-target fallback (relative proxy -> direct localhost:5000 -> configured API_URL).
 */

let cachedWorkingBase = null;

export const getCandidateBases = () => {
  if (cachedWorkingBase) {
    return [cachedWorkingBase];
  }

  const isLocal = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.') ||
    window.location.hostname.endsWith('.local')
  );

  const configured = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '';
  const bases = [];

  // Priority 1: Relative /api/admin (works seamlessly for Vite proxy & Vercel)
  bases.push('/api/admin');

  // Priority 2: Direct localhost:5000 if running locally (bypasses any proxy issue)
  if (isLocal) {
    bases.push('http://localhost:5000/api/admin');
    bases.push('http://127.0.0.1:5000/api/admin');
  }

  // Priority 3: Configured remote URL if present
  if (configured) {
    const remoteAdmin = `${configured}/api/admin`;
    if (!bases.includes(remoteAdmin)) {
      bases.push(remoteAdmin);
    }
  }

  return bases;
};

/**
 * Common fetch helper with intelligent endpoint fallback, JSON parsing and error handling
 */
const request = async (path, options = {}, token = null) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const bases = getCandidateBases();
  let lastError = null;

  for (let i = 0; i < bases.length; i++) {
    const base = bases[i];
    const url = `${base}${normalizedPath}`;

    try {
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

      // If this endpoint returned 404 and we have other candidates, try next candidate
      if (res.status === 404 && i < bases.length - 1) {
        console.warn(`[adminService] 404 at ${url}, trying alternative candidate...`);
        continue;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const error = new Error(data.message || `Request failed with status ${res.status}`);
        error.status = res.status;
        error.data = data;
        throw error;
      }

      // Success! Cache this working base URL for subsequent requests
      cachedWorkingBase = base;
      return data;
    } catch (err) {
      lastError = err;
      // If it's a network error (e.g. Failed to fetch or 404) and we have alternatives, try next
      if (i < bases.length - 1 && (err.name === 'TypeError' || err.status === 404)) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All admin API endpoints failed');
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
