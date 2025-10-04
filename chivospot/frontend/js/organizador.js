import {
  apiFetch,
  createElement,
  formatDateRange,
  getStoredPreferences,
  savePreferences,
  parseCSV,
} from './util.js';

const state = {
  venues: [],
  events: [],
  selectedEvent: null,
  departments: [],
  municipalities: {},
  categories: [],
};

async function loadCatalogs() {
  const [departments, categories] = await Promise.all([
    apiFetch('/departments'),
    apiFetch('/categories'),
  ]);
  state.departments = departments;
  state.categories = categories;
  const departmentSelect = document.getElementById('eventDepartment');
  departments.forEach((dept) => {
    const option = document.createElement('option');
    option.value = dept.id;
    option.textContent = dept.nombre;
    departmentSelect.append(option);
  });
  const categorySelect = document.getElementById('eventCategory');
  categories.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.nombre;
    categorySelect.append(option);
  });
}

async function loadOrganizationProfile() {
  const profile = await apiFetch('/org/profile');
  document.getElementById('orgName').value = profile.nombre || '';
  document.getElementById('orgPhone').value = profile.telefono || '';
  document.getElementById('orgWebsite').value = profile.sitio || '';
  document.getElementById('orgLogo').value = profile.logo_url || '';
  document.getElementById('orgSocial').value = JSON.stringify(profile.redes_json || {}, null, 2);
}

async function loadVenues() {
  state.venues = await apiFetch('/org/venues');
  const container = document.getElementById('venuesList');
  container.innerHTML = '';
  state.venues.forEach((venue) => {
    const card = createElement('article', { className: 'card' });
    const heading = createElement('h3', { text: venue.nombre });
    const address = createElement('p', { text: venue.direccion });
    const coords = createElement('p', { text: `${venue.lat}, ${venue.lng}` });
    const actions = createElement('div', { className: 'actions' });
    const editBtn = createElement('button', { className: 'btn secondary', text: 'Editar' });
    editBtn.addEventListener('click', () => editVenue(venue));
    const deleteBtn = createElement('button', { className: 'btn danger', text: 'Eliminar' });
    deleteBtn.addEventListener('click', () => deleteVenue(venue.id));
    actions.append(editBtn, deleteBtn);
    card.append(heading, address, coords, actions);
    container.append(card);
  });
}

async function loadEvents(stateFilter = '') {
  const query = stateFilter ? `?state=${encodeURIComponent(stateFilter)}` : '';
  const data = await apiFetch(`/org/events${query}`);
  state.events = data.items || data;
  renderEventList();
}

function renderEventList() {
  const container = document.getElementById('organizerEvents');
  container.innerHTML = '';
  state.events.forEach((event) => {
    const card = createElement('article', { className: 'card' });
    card.append(
      createElement('h3', { text: event.titulo }),
      createElement('p', { text: formatDateRange(event.fecha_inicio, event.fecha_fin) }),
      createElement('p', { text: `Estado: ${event.estado_publicacion}` }),
    );
    const actions = createElement('div', { className: 'actions' });
    const editBtn = createElement('button', { className: 'btn secondary', text: 'Editar' });
    editBtn.addEventListener('click', () => loadEventIntoForm(event));
    const duplicateBtn = createElement('button', { className: 'btn secondary', text: 'Duplicar' });
    duplicateBtn.addEventListener('click', () => duplicateEvent(event));
    const submitBtn = createElement('button', { className: 'btn', text: 'Enviar a revisión' });
    submitBtn.addEventListener('click', () => submitEvent(event.id));
    const cancelBtn = createElement('button', { className: 'btn danger', text: 'Cancelar' });
    cancelBtn.addEventListener('click', () => cancelEvent(event.id));
    actions.append(editBtn, duplicateBtn, submitBtn, cancelBtn);
    card.append(actions);
    container.append(card);
  });
}

function getMunicipalities(departmentId) {
  if (!departmentId) return Promise.resolve([]);
  if (state.municipalities[departmentId]) {
    return Promise.resolve(state.municipalities[departmentId]);
  }
  return apiFetch(`/departments/${departmentId}/municipalities`).then((data) => {
    state.municipalities[departmentId] = data;
    return data;
  });
}

function handleDepartmentChange(event) {
  const departmentId = event.target.value;
  const municipalitySelect = document.getElementById('eventMunicipality');
  municipalitySelect.innerHTML = '<option value="">Selecciona municipio</option>';
  getMunicipalities(departmentId).then((municipalities) => {
    municipalities.forEach((muni) => {
      const option = document.createElement('option');
      option.value = muni.id;
      option.textContent = muni.nombre;
      municipalitySelect.append(option);
    });
  });
}

function formToPayload(form) {
  const data = new FormData(form);
  const payload = Object.fromEntries(data.entries());
  if (payload.coords) {
    const [lat, lng] = payload.coords.split(',').map((value) => parseFloat(value.trim()));
    payload.lat = lat;
    payload.lng = lng;
  }
  if (payload.etiquetas) {
    payload.etiquetas = payload.etiquetas.split(',').map((tag) => tag.trim());
  }
  delete payload.coords;
  return payload;
}

async function submitProfile(event) {
  event.preventDefault();
  const payload = formToPayload(event.target);
  await apiFetch('/org/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

async function saveVenue(event) {
  event.preventDefault();
  const form = event.target;
  const payload = formToPayload(form);
  const method = payload.id ? 'PUT' : 'POST';
  const url = payload.id ? `/org/venues/${payload.id}` : '/org/venues';
  await apiFetch(url, {
    method,
    body: JSON.stringify(payload),
  });
  document.getElementById('venueModal').close?.();
  await loadVenues();
}

function editVenue(venue) {
  const form = document.getElementById('venueForm');
  form.reset();
  form.elements.id.value = venue.id;
  form.elements.nombre.value = venue.nombre;
  form.elements.direccion.value = venue.direccion;
  form.elements.coords.value = `${venue.lat},${venue.lng}`;
  document.getElementById('venueModal').showModal?.();
}

async function deleteVenue(id) {
  if (!confirm('¿Eliminar sede?')) return;
  await apiFetch(`/org/venues/${id}`, { method: 'DELETE' });
  await loadVenues();
}

function loadEventIntoForm(event) {
  const form = document.getElementById('eventForm');
  form.reset();
  state.selectedEvent = event;
  form.elements.id.value = event.id;
  form.elements.titulo.value = event.titulo;
  form.elements.category_id.value = event.category_id;
  form.elements.descripcion.value = event.descripcion || '';
  form.elements.department_id.value = event.department_id;
  handleDepartmentChange({ target: { value: event.department_id } });
  setTimeout(() => {
    form.elements.municipality_id.value = event.municipality_id || '';
  }, 200);
  form.elements.direccion.value = event.direccion || '';
  form.elements.coords.value = `${event.geom?.coordinates?.[1] || ''},${event.geom?.coordinates?.[0] || ''}`;
  form.elements.fecha_inicio.value = event.fecha_inicio?.slice(0, 16);
  form.elements.fecha_fin.value = event.fecha_fin?.slice(0, 16);
  form.elements.precio.value = event.precio;
  form.elements.etiquetas.value = (event.etiquetas || []).join(',');
  form.elements.imagen_url.value = event.imagen_url || '';
}

async function saveDraft() {
  const form = document.getElementById('eventForm');
  const payload = formToPayload(form);
  if (payload.id) {
    await apiFetch(`/org/events/${payload.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  } else {
    await apiFetch('/org/events', {
      method: 'POST',
      body: JSON.stringify({ ...payload, estado_publicacion: 'borrador' }),
    });
  }
  await loadEvents(document.getElementById('eventStateFilter').value);
}

async function submitEvent(eventId) {
  await apiFetch(`/org/events/${eventId}/submit`, { method: 'POST' });
  await loadEvents(document.getElementById('eventStateFilter').value);
}

async function duplicateEvent(event) {
  const payload = { ...event, id: undefined, titulo: `${event.titulo} (copia)` };
  await apiFetch('/org/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  await loadEvents(document.getElementById('eventStateFilter').value);
}

async function cancelEvent(eventId) {
  const motivo = prompt('Motivo de cancelación');
  if (!motivo) return;
  await apiFetch(`/org/events/${eventId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ motivo }),
  });
  await loadEvents(document.getElementById('eventStateFilter').value);
}

async function handleEventSubmit(event) {
  event.preventDefault();
  const payload = formToPayload(event.target);
  if (payload.id) {
    await apiFetch(`/org/events/${payload.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    await submitEvent(payload.id);
  } else {
    const created = await apiFetch('/org/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await submitEvent(created.id);
  }
  await loadEvents(document.getElementById('eventStateFilter').value);
}

function parseICS(text) {
  return text
    .split('BEGIN:VEVENT')
    .slice(1)
    .map((chunk) => {
      const summary = chunk.match(/SUMMARY:(.*)/)?.[1]?.trim();
      const dtStart = chunk.match(/DTSTART.*:(.*)/)?.[1]?.trim();
      const dtEnd = chunk.match(/DTEND.*:(.*)/)?.[1]?.trim();
      return { titulo: summary, fecha_inicio: dtStart, fecha_fin: dtEnd };
    });
}

function handleImportPreview() {
  const fileInput = document.getElementById('importFile');
  const file = fileInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result;
    let records = [];
    if (file.name.endsWith('.csv')) {
      records = parseCSV(text);
    } else {
      records = parseICS(text);
    }
    renderImportPreview(records);
  };
  reader.readAsText(file);
}

function renderImportPreview(records) {
  const container = document.getElementById('importPreview');
  container.innerHTML = '';
  records.forEach((record) => {
    const item = createElement('div', { className: 'card' });
    item.append(
      createElement('strong', { text: record.titulo || 'Sin título' }),
      createElement('p', { text: record.fecha_inicio || 'Sin fecha' }),
    );
    container.append(item);
  });
}

function restorePreferences() {
  const prefs = getStoredPreferences();
  if (prefs.organizerStateFilter) {
    document.getElementById('eventStateFilter').value = prefs.organizerStateFilter;
  }
}

function persistStateFilter(value) {
  const prefs = getStoredPreferences();
  savePreferences({ ...prefs, organizerStateFilter: value });
}

function bootstrap() {
  document.getElementById('orgProfileForm').addEventListener('submit', submitProfile);
  document.getElementById('eventForm').addEventListener('submit', handleEventSubmit);
  document.getElementById('eventDepartment').addEventListener('change', handleDepartmentChange);
  document.getElementById('eventStateFilter').addEventListener('change', (event) => {
    persistStateFilter(event.target.value);
    loadEvents(event.target.value);
  });
  document.getElementById('saveDraftBtn').addEventListener('click', saveDraft);
  document.getElementById('previewImportBtn').addEventListener('click', handleImportPreview);

  loadCatalogs()
    .then(loadOrganizationProfile)
    .then(loadVenues)
    .then(() => loadEvents(document.getElementById('eventStateFilter').value));
  restorePreferences();
}

document.addEventListener('DOMContentLoaded', bootstrap);
