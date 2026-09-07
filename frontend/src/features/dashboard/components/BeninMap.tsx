import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { RecentReport } from '../services/dashboard.types';

// Icones Leaflet par défaut (les images ne sont pas embarquées par bundlers)
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface BeninMapProps {
  reports: RecentReport[];
  isLoading?: boolean;
}

function styleFeature() {
  return {
    color: '#1F2937',
    weight: 1,
    fillColor: '#D1D5DB',
    fillOpacity: 0.4,
  };
}

function onEachFeature(feature: any, layer: any) {
  const name = feature?.properties?.shapeName ?? 'Territoire';
  layer.bindPopup(`<strong>${name}</strong>`);
}

export function BeninMap({ reports, isLoading }: BeninMapProps) {
  const [geoJson, setGeoJson] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/geojson/geoBoundaries-BEN-ADM1.geojson')
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(setGeoJson)
      .catch((e) => setLoadError(e?.message ?? 'Erreur de chargement de la carte'));
  }, []);

  const markers = (reports ?? []).filter(
    (r) => typeof r.latitude === 'number' && typeof r.longitude === 'number'
  );

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-900">
          Carte des signalements (Bénin)
        </h2>
        <span className="text-xs text-gray-500 font-medium">{markers.length} signalement(s) localisé(s)</span>
      </div>

      {loadError && (
        <div className="bg-red-50 text-red-600 text-xs p-2 rounded mb-2">{loadError}</div>
      )}

      <div className="h-[420px] w-full rounded overflow-hidden border border-gray-200">
        <MapContainer
          center={[9.3077, 2.3158]}
          zoom={7}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geoJson && (
            <GeoJSON
              data={geoJson}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
          )}
          {isLoading
            ? null
            : markers.map((r) => (
                <Marker key={r.id} position={[r.latitude as number, r.longitude as number]}>
                  <Popup>
                    <div className="text-sm">
                      <strong className="block">{r.title}</strong>
                      <span className="text-gray-500">{r.category}</span>
                      <span className="block text-gray-500">{r.territory} · {r.status}</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
        </MapContainer>
      </div>
    </div>
  );
}