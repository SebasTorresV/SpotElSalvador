import { apiFetch, formatNumber, formatPercentage } from './util.js';

const state = {
  events: [],
  summary: {},
  distribution: {},
};

async function loadEvents() {
  const data = await apiFetch('/org/events');
  state.events = data.items || data;
  const select = document.getElementById('kpiEventSelect');
  select.innerHTML = '<option value="">Todos mis eventos</option>';
  state.events.forEach((event) => {
    const option = document.createElement('option');
    option.value = event.id;
    option.textContent = event.titulo;
    select.append(option);
  });
}

function getFilters() {
  const params = new URLSearchParams();
  const eventId = document.getElementById('kpiEventSelect').value;
  if (eventId) params.set('event_id', eventId);
  const from = document.getElementById('kpiFrom').value;
  const to = document.getElementById('kpiTo').value;
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (document.getElementById('kpiCompare').checked) params.set('compare', 'true');
  return params;
}

async function loadSummary() {
  const params = getFilters();
  const data = await apiFetch(`/kpi/organizer/summary?${params.toString()}`);
  state.summary = data;
  renderSummary();
}

async function loadDistribution() {
  const params = getFilters();
  const data = await apiFetch(`/kpi/organizer/distribution?${params.toString()}`);
  state.distribution = data;
  renderDistribution();
}

async function loadTimeseries() {
  const params = getFilters();
  const data = await apiFetch(`/kpi/organizer/timeseries?${params.toString()}`);
  renderTimeseries(data);
}

function renderSummary() {
  const container = document.getElementById('kpiSummary');
  container.innerHTML = '';
  Object.entries(state.summary).forEach(([key, value]) => {
    const formatted = typeof value === 'number' ? formatNumber(value) : value;
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `<h3>${key}</h3><p>${formatted}</p>`;
    container.append(card);
  });
}

function renderDistribution() {
  const container = document.getElementById('kpiDistribution');
  container.innerHTML = '';
  Object.entries(state.distribution).forEach(([key, value]) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `<h3>${key}</h3><p>${formatPercentage(value)}</p>`;
    container.append(card);
  });
}

function renderTimeseries(data) {
  const canvas = document.getElementById('kpiTimeseries');
  const context = canvas.getContext('2d');
  const width = canvas.width = canvas.clientWidth || 800;
  const height = canvas.height = canvas.clientHeight || 320;
  context.clearRect(0, 0, width, height);
  if (!data || !data.length) return;
  const values = data.map((point) => point.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const padding = 32;
  const xStep = (width - padding * 2) / (data.length - 1 || 1);
  context.beginPath();
  context.strokeStyle = '#1565c0';
  context.lineWidth = 2;
  data.forEach((point, index) => {
    const x = padding + index * xStep;
    const range = max - min || 1;
    const y = height - padding - ((point.value - min) / range) * (height - padding * 2);
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });
  context.stroke();
}

async function exportCSV() {
  const params = getFilters();
  const csv = await apiFetch(`/kpi/organizer/export.csv?${params.toString()}`, { headers: { Accept: 'text/csv' } });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'chivospot-kpi.csv';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function bootstrap() {
  document.getElementById('kpiFilters').addEventListener('submit', (event) => {
    event.preventDefault();
    loadSummary();
    loadDistribution();
    loadTimeseries();
  });
  document.getElementById('kpiExport').addEventListener('click', exportCSV);
  loadEvents().then(() => {
    loadSummary();
    loadDistribution();
    loadTimeseries();
  });
}

document.addEventListener('DOMContentLoaded', bootstrap);
