import {
  apiFetch,
  debounce,
  formatDateRange,
  formatPrice,
  getStoredPreferences,
  savePreferences,
  createElement,
} from './util.js';
import { createMap, createMarkerCluster, syncListAndMap, watchMapBounds } from './maps.js';

const state = {
  events: [],
  pagination: { limit: 20, offset: 0 },
  query: '',
  filters: {},
  range: 'now',
  bbox: null,
  map: null,
  markerLayer: null,
  destroyMapWatch: null,
};

const preferences = getStoredPreferences();

function renderEventCard(event) {
  const card = createElement('li', { className: 'event-card' });
  const image = createElement('img', {
    src: event.imagen_url || 'https://placehold.co/320x180?text=Evento',
    alt: `Imagen del evento ${event.titulo}`,
    loading: 'lazy',
  });
  const info = createElement('div', { className: 'info' });
  const title = createElement('h3', {
    text: event.titulo,
  });
  const date = createElement('p', { text: formatDateRange(event.fecha_inicio, event.fecha_fin) });
  const location = createElement('p', {
    text: [event.venue?.nombre, event.municipio?.nombre, event.departamento?.nombre]
      .filter(Boolean)
      .join(', '),
  });
  const price = createElement('p', { text: formatPrice(event.precio || 0) });

  const actions = createElement('div', { className: 'actions' });
  const detailBtn = createElement('button', { className: 'btn secondary', text: 'Ver detalle' });
  detailBtn.addEventListener('click', () => openDetailModal(event.id));
  const directionsBtn = createElement('a', {
    className: 'btn secondary',
    text: 'Cómo llegar',
    href: `https://www.google.com/maps/dir/?api=1&destination=${event.geom?.coordinates?.[1]},${event.geom?.coordinates?.[0]}`,
    target: '_blank',
    rel: 'noopener noreferrer',
  });
  const favoriteBtn = createElement('button', { className: 'btn secondary', text: 'Favorito' });
  favoriteBtn.addEventListener('click', () => toggleFavorite(event.id));
  const reminderBtn = createElement('button', { className: 'btn secondary', text: 'Recordar' });
  reminderBtn.addEventListener('click', () => addReminder(event.id, event.fecha_inicio));

  actions.append(detailBtn, directionsBtn, favoriteBtn, reminderBtn);
  info.append(title, date, location, price, actions);
  card.append(image, info);
  return card;
}

function renderEvents(reset = false) {
  const container = document.getElementById('eventsContainer');
  if (reset) {
    container.innerHTML = '';
  }
  state.events.forEach((event) => {
    if (!container.querySelector(`[data-event-id="${event.id}"]`)) {
      const card = renderEventCard(event);
      card.dataset.eventId = event.id;
      container.appendChild(card);
    }
  });
  syncListAndMap(state.map, state.markerLayer, state.events, (event) => openDetailModal(event.id));
}

function openDetailModal(eventId) {
  apiFetch(`/events/${eventId}`).then((event) => {
    const modal = document.getElementById('eventDetailModal');
    const body = document.getElementById('eventDetailBody');
    document.getElementById('eventDetailTitle').textContent = event.titulo;
    body.innerHTML = '';
    body.appendChild(
      createElement('p', { text: formatDateRange(event.fecha_inicio, event.fecha_fin) }),
    );
    body.appendChild(
      createElement('p', {
        text: [event.venue?.nombre, event.municipio?.nombre, event.departamento?.nombre]
          .filter(Boolean)
          .join(', '),
      }),
    );
    body.appendChild(createElement('p', { text: event.descripcion || 'Sin descripción.' }));
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    modal.querySelector('.modal-close').focus();
  });
}

function closeModal() {
  const modal = document.getElementById('eventDetailModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function fetchCatalogs() {
  return Promise.all([
    apiFetch('/departments'),
    apiFetch('/categories'),
  ]).then(([departments, categories]) => {
    const departmentSelect = document.getElementById('departmentSelect');
    const municipalitySelect = document.getElementById('municipalitySelect');
    departments.forEach((dept) => {
      const option = document.createElement('option');
      option.value = dept.id;
      option.textContent = dept.nombre;
      departmentSelect.appendChild(option);
    });
    departmentSelect.addEventListener('change', () => {
      const value = departmentSelect.value;
      municipalitySelect.innerHTML = '<option value="">Todos</option>';
      municipalitySelect.disabled = !value;
      if (value) {
        apiFetch(`/departments/${value}/municipalities`).then((municipalities) => {
          municipalities.forEach((muni) => {
            const option = document.createElement('option');
            option.value = muni.id;
            option.textContent = muni.nombre;
            municipalitySelect.appendChild(option);
          });
        });
      }
    });

    const categorySelect = document.getElementById('categorySelect');
    categories.forEach((cat) => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.nombre;
      categorySelect.appendChild(option);
    });
  });
}

const queryEvents = debounce(() => loadEvents(true), 350);

function setupFilters() {
  const form = document.getElementById('searchForm');
  const orderSelect = document.getElementById('orderSelect');

  form.addEventListener('input', () => {
    collectFilters();
    queryEvents();
  });

  document.getElementById('tab-now-btn').addEventListener('click', () => switchRange('now'));
  document.getElementById('tab-soon-btn').addEventListener('click', () => switchRange('soon'));

  orderSelect.addEventListener('change', () => {
    collectFilters();
    loadEvents(true);
  });

  document.getElementById('loadMoreBtn').addEventListener('click', () => {
    state.pagination.offset += state.pagination.limit;
    loadEvents();
  });

  document.getElementById('eventDetailModal').addEventListener('click', (event) => {
    if (event.target.matches('.modal-close') || event.target.id === 'eventDetailModal') {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
}

function switchRange(range) {
  if (state.range === range) return;
  state.range = range;
  document.getElementById('tab-now-btn').setAttribute('aria-selected', range === 'now');
  document.getElementById('tab-soon-btn').setAttribute('aria-selected', range === 'soon');
  savePreferences({ ...preferences, range });
  loadEvents(true);
}

function collectFilters() {
  const form = document.getElementById('searchForm');
  const formData = new FormData(form);
  const filters = Object.fromEntries(formData.entries());
  filters.category_id = Array.from(document.getElementById('categorySelect').selectedOptions).map((opt) => opt.value);
  filters.free_only = document.getElementById('freeOnly').checked;
  filters.visible_area = document.getElementById('visibleArea').checked;
  state.filters = filters;
  savePreferences({ ...preferences, filters, order: document.getElementById('orderSelect').value });
  return filters;
}

function buildQueryParams(reset = false) {
  const params = new URLSearchParams();
  const filters = state.filters;
  if (state.query) params.set('q', state.query);
  if (filters.department_id) params.set('department_id', filters.department_id);
  if (filters.municipality_id) params.set('municipality_id', filters.municipality_id);
  if (filters.category_id?.length) {
    filters.category_id.forEach((id) => params.append('category_id', id));
  }
  if (filters.price_max) params.set('price_max', filters.price_max);
  if (filters.date_from) params.set('date_from', filters.date_from);
  if (filters.date_to) params.set('date_to', filters.date_to);
  if (filters.free_only) params.set('free_only', 'true');
  if (filters.visible_area && state.bbox) {
    const { minLng, minLat, maxLng, maxLat } = state.bbox;
    params.set('bbox', `${minLng},${minLat},${maxLng},${maxLat}`);
  }
  params.set('order', document.getElementById('orderSelect').value);
  params.set('range', state.range);
  params.set('limit', state.pagination.limit);
  params.set('offset', reset ? 0 : state.pagination.offset);
  return params.toString();
}

function loadEvents(reset = false) {
  if (reset) {
    state.pagination.offset = 0;
    state.events = [];
  }
  const query = buildQueryParams(reset);
  apiFetch(`/events?${query}`)
    .then((data) => {
      state.events = reset ? data.items : [...state.events, ...data.items];
      renderEvents(reset);
      document.getElementById('loadMoreBtn').toggleAttribute('hidden', !data.hasMore);
    })
    .catch((error) => {
      console.error('Error al cargar eventos', error);
    });
}

function toggleFavorite(eventId) {
  apiFetch(`/events/${eventId}/favorite`, { method: 'POST' }).then(() => {
    document.getElementById('favoritesCount').textContent = Number(document.getElementById('favoritesCount').textContent) + 1;
  });
}

function addReminder(eventId, when) {
  apiFetch(`/events/${eventId}/reminders`, {
    method: 'POST',
    body: JSON.stringify({ at: when }),
  }).then(() => {
    document.getElementById('remindersCount').textContent = Number(document.getElementById('remindersCount').textContent) + 1;
  });
}

function setupMap() {
  state.map = createMap('map');
  state.markerLayer = createMarkerCluster(state.map);
  if (state.destroyMapWatch) state.destroyMapWatch();
  state.destroyMapWatch = watchMapBounds(state.map, (bbox) => {
    state.bbox = bbox;
    if (document.getElementById('visibleArea').checked) {
      loadEvents(true);
    }
  });
}

function bootstrap() {
  setupFilters();
  fetchCatalogs().then(() => {
    collectFilters();
    setupMap();
    if (preferences.range) {
      switchRange(preferences.range);
    }
    loadEvents(true);
  });
}

document.addEventListener('DOMContentLoaded', bootstrap);
