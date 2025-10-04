const API_BASE = window.__APP_BASE_URL__ || '/api';
const SESSION_COOKIE_NAME = 'chsp_sid';

export function getStoredPreferences() {
  try {
    const data = JSON.parse(localStorage.getItem('chivospot:preferences') || '{}');
    return data;
  } catch (err) {
    console.warn('Preferencias inválidas en localStorage', err);
    return {};
  }
}

export function savePreferences(preferences) {
  localStorage.setItem('chivospot:preferences', JSON.stringify(preferences));
}

export function formatDateRange(start, end) {
  const tz = 'America/El_Salvador';
  const fmt = new Intl.DateTimeFormat('es-SV', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: tz,
  });
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : undefined;
  const startText = fmt.format(startDate);
  if (!endDate) return startText;
  return `${startText} – ${fmt.format(endDate)}`;
}

export function formatPrice(value) {
  if (value === 0) return 'Gratis';
  return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(value);
}

export function getAuthHeaders() {
  const accessToken = sessionStorage.getItem('chivospot:token');
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };
  const config = {
    credentials: 'include',
    ...options,
    headers,
  };
  const response = await fetch(`${API_BASE}${path}`, config);
  if (response.status === 401 && !(options.ignoreAuthError)) {
    window.dispatchEvent(new CustomEvent('auth:required'));
  }
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Error en la solicitud');
  }
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export function debounce(fn, delay = 350) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), delay);
  };
}

export function highlight(text = '', query = '') {
  if (!query) return text;
  const normalized = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${normalized})`, 'ig');
  return text.replace(regex, '<mark>$1</mark>');
}

export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'className') {
      el.className = value;
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.substring(2).toLowerCase(), value);
    } else if (key === 'html') {
      el.innerHTML = value;
    } else if (key === 'text') {
      el.textContent = value;
    } else {
      el.setAttribute(key, value);
    }
  });
  children.forEach((child) => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });
  return el;
}

export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function getSessionCookie() {
  const cookies = document.cookie.split(';').map((c) => c.trim());
  const entry = cookies.find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  return entry ? entry.split('=')[1] : null;
}

export function setAccessToken(token) {
  if (token) {
    sessionStorage.setItem('chivospot:token', token);
  } else {
    sessionStorage.removeItem('chivospot:token');
  }
}

export function parseCSV(text) {
  const rows = text.trim().split(/\r?\n/);
  const [headerLine, ...dataLines] = rows;
  const headers = headerLine.split(',').map((h) => h.trim());
  return dataLines.map((line) => {
    const values = line.split(',').map((v) => v.trim());
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index];
      return acc;
    }, {});
  });
}

export function formatNumber(value) {
  return new Intl.NumberFormat('es-SV').format(value);
}

export function formatPercentage(value) {
  return `${(value * 100).toFixed(1)}%`;
}
