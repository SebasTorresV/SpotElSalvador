import { debounce } from './util.js';

const DEFAULT_CENTER = [13.6929, -89.2182];
const DEFAULT_ZOOM = 12;

export function createMap(elementId = 'map') {
  const map = L.map(elementId, {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    zoomControl: true,
    preferCanvas: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map);

  return map;
}

export function createMarkerCluster(map) {
  const markers = L.markerClusterGroup?.({ showCoverageOnHover: false }) || L.layerGroup();
  map.addLayer(markers);
  return markers;
}

export function syncListAndMap(map, markerLayer, events, onMarkerClick) {
  markerLayer.clearLayers();
  events.forEach((event) => {
    if (!event.geom || !event.geom.coordinates) return;
    const [lng, lat] = event.geom.coordinates;
    const marker = L.marker([lat, lng]);
    marker.bindPopup(`
      <strong>${event.titulo}</strong><br />
      ${event.municipio?.nombre || ''}${event.municipio ? ', ' : ''}${event.departamento?.nombre || ''}<br />
      <button data-event-id="${event.id}" class="popup-detail">Ver detalle</button>
    `);
    marker.on('popupopen', () => {
      const btn = marker.getPopup().getElement().querySelector('.popup-detail');
      if (btn) {
        btn.addEventListener('click', () => onMarkerClick(event));
      }
    });
    markerLayer.addLayer(marker);
  });
  if (events.length) {
    const bounds = markerLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.15));
    }
  }
}

export function watchMapBounds(map, callback) {
  const notify = debounce(() => {
    const bounds = map.getBounds();
    callback({
      minLat: bounds.getSouth(),
      minLng: bounds.getWest(),
      maxLat: bounds.getNorth(),
      maxLng: bounds.getEast(),
    });
  }, 250);

  map.on('moveend', notify);
  return () => map.off('moveend', notify);
}
