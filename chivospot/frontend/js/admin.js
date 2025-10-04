import { apiFetch, createElement, formatDateRange } from './util.js';

const state = {
  queue: [],
  current: null,
  categories: [],
  departments: [],
};

async function loadCatalogs() {
  const [categories, departments] = await Promise.all([
    apiFetch('/categories'),
    apiFetch('/departments'),
  ]);
  state.categories = categories;
  state.departments = departments;
  const categorySelect = document.getElementById('adminCategoryFilter');
  const departmentSelect = document.getElementById('adminDepartmentFilter');
  categories.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.nombre;
    categorySelect.append(option);
  });
  departments.forEach((dept) => {
    const option = document.createElement('option');
    option.value = dept.id;
    option.textContent = dept.nombre;
    departmentSelect.append(option);
  });
}

async function loadQueue() {
  const params = new URLSearchParams();
  params.set('state', document.getElementById('adminStateFilter').value);
  if (document.getElementById('adminCategoryFilter').value) params.set('category_id', document.getElementById('adminCategoryFilter').value);
  if (document.getElementById('adminDepartmentFilter').value) params.set('department_id', document.getElementById('adminDepartmentFilter').value);
  if (document.getElementById('adminFrom').value) params.set('from', document.getElementById('adminFrom').value);
  if (document.getElementById('adminTo').value) params.set('to', document.getElementById('adminTo').value);
  const data = await apiFetch(`/admin/events?${params.toString()}`);
  state.queue = data.items || data;
  renderQueue();
}

function renderQueue() {
  const container = document.getElementById('adminQueue');
  container.innerHTML = '';
  state.queue.forEach((event) => {
    const item = createElement('article', { className: 'card' });
    item.append(
      createElement('h3', { text: event.titulo }),
      createElement('p', { text: formatDateRange(event.fecha_inicio, event.fecha_fin) }),
      createElement('p', { text: `Organizador: ${event.organizacion?.nombre || 'N/D'}` }),
      createElement('p', { text: `Estado: ${event.estado_publicacion}` }),
    );
    item.addEventListener('click', () => selectEvent(event.id));
    container.append(item);
  });
}

async function selectEvent(eventId) {
  const event = await apiFetch(`/events/${eventId}`);
  state.current = event;
  const details = document.getElementById('reviewDetails');
  details.innerHTML = '';
  details.append(
    createElement('h3', { text: event.titulo }),
    createElement('p', { text: `Categoría: ${event.categoria?.nombre || ''}` }),
    createElement('p', { text: formatDateRange(event.fecha_inicio, event.fecha_fin) }),
    createElement('p', { text: event.descripcion || 'Sin descripción' }),
  );
  loadAuditLog(eventId);
}

async function loadAuditLog(eventId) {
  const log = await apiFetch(`/admin/audit?entity_id=${eventId}`);
  const container = document.getElementById('auditLog');
  container.innerHTML = '';
  log.forEach((entry) => {
    container.append(
      createElement('div', {
        className: 'card',
        text: `${entry.created_at}: ${entry.action} por ${entry.usuario?.email || entry.user_id}`,
      }),
    );
  });
}

function getModerationPayload(action) {
  const comment = document.getElementById('moderationComment').value;
  return { action, comentario: comment };
}

async function moderate(action) {
  if (!state.current) return;
  const payload = getModerationPayload(action);
  await apiFetch(`/admin/events/${state.current.id}/${action}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  await loadQueue();
}

async function featureEvent() {
  if (!state.current) return;
  const desde = prompt('Fecha de inicio del destaque (YYYY-MM-DD)');
  const hasta = prompt('Fecha fin (YYYY-MM-DD)');
  await apiFetch(`/admin/events/${state.current.id}/feature`, {
    method: 'POST',
    body: JSON.stringify({ desde, hasta }),
  });
  await loadQueue();
}

async function loadOverview() {
  const params = new URLSearchParams();
  if (document.getElementById('adminFrom').value) params.set('from', document.getElementById('adminFrom').value);
  if (document.getElementById('adminTo').value) params.set('to', document.getElementById('adminTo').value);
  const data = await apiFetch(`/kpi/admin/overview?${params.toString()}`);
  const container = document.getElementById('adminOverview');
  container.innerHTML = '';
  Object.entries(data).forEach(([key, value]) => {
    container.append(
      createElement('div', {
        className: 'card',
        html: `<strong>${key}</strong><p>${value}</p>`,
      }),
    );
  });
}

function bootstrap() {
  document.getElementById('adminStateFilter').addEventListener('change', loadQueue);
  document.getElementById('adminCategoryFilter').addEventListener('change', loadQueue);
  document.getElementById('adminDepartmentFilter').addEventListener('change', loadQueue);
  document.getElementById('adminFrom').addEventListener('change', () => {
    loadQueue();
    loadOverview();
  });
  document.getElementById('adminTo').addEventListener('change', () => {
    loadQueue();
    loadOverview();
  });
  document.getElementById('approveBtn').addEventListener('click', () => moderate('approve'));
  document.getElementById('rejectBtn').addEventListener('click', () => moderate('reject'));
  document.getElementById('archiveBtn').addEventListener('click', () => moderate('archive'));
  document.getElementById('featureBtn').addEventListener('click', featureEvent);

  loadCatalogs().then(() => {
    loadQueue();
    loadOverview();
  });
}

document.addEventListener('DOMContentLoaded', bootstrap);
