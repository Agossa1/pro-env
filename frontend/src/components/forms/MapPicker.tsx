import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  error?: string;
}

function LocationMarker({ position, onChange }: { position: L.LatLng | null, onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

export const MapPicker: React.FC<MapPickerProps> = ({ latitude, longitude, onChange, error }) => {
  const defaultCenter: [number, number] = [9.3077, 2.3158]; // Center of Benin
  const [position, setPosition] = useState<L.LatLng | null>(
    latitude && longitude ? new L.LatLng(latitude, longitude) : null
  );

  useEffect(() => {
    if (latitude && longitude) {
      setPosition(new L.LatLng(latitude, longitude));
    } else {
      setPosition(null);
    }
  }, [latitude, longitude]);

  const handleLocationChange = (lat: number, lng: number) => {
    setPosition(new L.LatLng(lat, lng));
    onChange(lat, lng);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className={`h-[300px] w-full rounded-md border overflow-hidden ${error ? 'border-red-500' : 'border-gray-300'}`}>
        <MapContainer
          center={position || defaultCenter}
          zoom={position ? 13 : 6}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onChange={handleLocationChange} />
        </MapContainer>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-gray-500">
        Cliquez sur la carte pour définir précisément l'emplacement de l'incident.
      </p>
    </div>
  );
};
