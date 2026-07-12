// Single boundary to the SWP backend. Every authenticated screen goes through
// here so the Bearer token and error handling live in one place.
//
// The base URL matches the questionnaire flow (Quiz/Loading.jsx): it defaults
// to the local backend and can be overridden with VITE_API_URL in production.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TOKEN_KEY = 'koyash_token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable (private mode) — auth just won't persist */
  }
}

// Thrown for any non-2xx response, carrying the backend's Russian `detail`
// message so screens can show it verbatim next to the offending field.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Не удалось связаться с сервером. Проверь соединение.', 0);
  }

  if (res.status === 204) return null;

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const detail = data && typeof data.detail === 'string' ? data.detail : 'Что-то пошло не так';
    throw new ApiError(detail, res.status);
  }
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const registerUser = (payload) =>
  request('/auth/register', { method: 'POST', body: payload });

export const loginUser = (payload) => request('/auth/login', { method: 'POST', body: payload });

export const fetchMe = () => request('/auth/me', { auth: true });

// ── Account (profile + security) ───────────────────────────────────────────
export const fetchProfile = () => request('/profile', { auth: true });

export const updateAccount = (payload) =>
  request('/account', { method: 'PATCH', body: payload, auth: true });

export const changePassword = (payload) =>
  request('/account/password', { method: 'PUT', body: payload, auth: true });

export const deleteAccount = (payload) =>
  request('/account/delete', { method: 'POST', body: payload, auth: true });

// ── Cosmetic bag (косметичка) ──────────────────────────────────────────────
export const fetchCare = () => request('/care', { auth: true });

export const setItemFeedback = (productId, payload) =>
  request(`/care/items/${productId}/feedback`, { method: 'PUT', body: payload, auth: true });

export const clearItemFeedback = (productId) =>
  request(`/care/items/${productId}/feedback`, { method: 'DELETE', auth: true });

export const fetchAlternatives = (productId) =>
  request(`/care/items/${productId}/alternatives`, { auth: true });

export const replaceItem = (productId, newProductId) =>
  request(`/care/items/${productId}/replace`, {
    method: 'POST',
    body: { new_product_id: newProductId },
    auth: true,
  });

// ── Result tracker ─────────────────────────────────────────────────────────
export const fetchTracker = () => request('/tracker', { auth: true });

// payload: { scores: {criterion: 1..5}, overall: 'better'|'same'|'worse', comment? }
export const submitCheckpoint = (index, payload) =>
  request(`/tracker/checkpoints/${index}`, { method: 'PUT', body: payload, auth: true });
