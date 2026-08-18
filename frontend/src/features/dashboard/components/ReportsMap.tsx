import { useEffect, useRef, useState } from 'react';
import { FiMapPin, FiAlertTriangle, FiAlertCircle, FiInfo, FiMaximize, FiMinimize, FiEye, FiEyeOff } from 'react-icons/fi';
import { useTerritory } from '../../territory/hooks/useTerritory';

// Leaflet is loaded via CDN-style dynamic import to avoid SSR issues
let leafletLoaded = false;

interface ReportMapPoint {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  latitude: number;
  longitude: number;
  territory: string;
}

interface ReportsMapProps {
  reports: ReportMapPoint[];
  isLoading: boolean;
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#E53935',
  high: '#F57C00',
  medium: '#1E88E5',
  low: '#43A047',
};

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Nouveau',
  in_review: 'En cours',
  assigned: 'Assigné',
  resolved: 'Résolu',
  closed: 'Fermé',
  rejected: 'Rejeté',
};

const CATEGORY_LABELS: Record<string, string> = {
  drainage: 'Drainage',
  road: 'Route',
  waste: 'Déchets',
  biodiversity: 'Biodiversité',
  environment: 'Environnement',
  other: 'Autre',
};

const LEGEND_ITEMS = [
  { key: 'critical', label: 'Critique', color: '#E53935' },
  { key: 'high', label: 'Haute', color: '#F57C00' },
  { key: 'medium', label: 'Moyenne', color: '#1E88E5' },
  { key: 'low', label: 'Basse', color: '#43A047' },
];

const STATS = [
  { key: 'critical', label: 'Critique', icon: FiAlertTriangle, color: 'text-[#E53935]', bg: 'bg-[#FFEBEE]' },
  { key: 'high', label: 'Haute priorité', icon: FiAlertCircle, color: 'text-[#F57C00]', bg: 'bg-[#FFF3E0]' },
  { key: 'medium', label: 'Moyenne', icon: FiInfo, color: 'text-[#1E88E5]', bg: 'bg-[#E3F2FD]' },
];

export function ReportsMap({ reports, isLoading }: ReportsMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  const [visibleLayers, setVisibleLayers] = useState({
    DEPARTMENT: true,
    COMMUNE: true,
    ARRONDISSEMENT: true,
    QUARTIER: true,
    labels: true,
    critical: true,
    high: true,
    medium: true,
    low: true,
  });

  const [isMapReady, setIsMapReady] = useState(false);

  const toggleLayer = (layer: keyof typeof visibleLayers) => {
    setVisibleLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const { territories, loadForMap } = useTerritory();

  useEffect(() => {
    loadForMap();
  }, [loadForMap]);

  // Initialize map ONLY once (or on isLoading change)
  useEffect(() => {
    if (!mapRef.current || isLoading) return;

    let isMounted = true;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (!isMounted) return;

      if (!leafletLoaded) {
        leafletLoaded = true;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // If map is already initialized, do nothing
      if (mapInstanceRef.current) return;

      // Create map
      const map = L.map(mapRef.current!, {
        center: [9.3077, 2.3158],
        zoom: 6.5,
        zoomControl: true,
        attributionControl: false,
      });

      // Tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      setIsMapReady(true);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setIsMapReady(false);
      }
    };
  }, [isLoading]);

  // Draw layers whenever data or filters change
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || isLoading) return;

    const drawLayers = async () => {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;

      // Clear existing layers (except tile layer)
      map.eachLayer((layer: any) => {
        if (!layer._url) {
          map.removeLayer(layer);
        }
      });

      // Add territories (polygons & custom labels)
      territories.forEach(territory => {
        if (territory.geometry) {
          try {
            const geojson = typeof territory.geometry === 'string' ? JSON.parse(territory.geometry) : territory.geometry;
            const type = territory.territoryTypeCode;
            
            let color = '#9CA3AF';
            let weight = 1;
            let dashArray = '';
            let labelSize = '8px';
            let labelWeight = '500';
            let labelOpacity = '0.3';
            let labelTransform = 'capitalize';

            if (type === 'DEPARTMENT') {
              color = '#10B981';
              weight = 2;
              labelSize = '12px';
              labelWeight = 'bold';
              labelOpacity = '0.7';
              labelTransform = 'uppercase';
            } else if (type === 'COMMUNE') {
              color = '#6366F1';
              weight = 1;
              dashArray = '3';
              labelSize = '10px';
              labelWeight = '600';
              labelOpacity = '0.5';
            } else if (type === 'ARRONDISSEMENT') {
              color = '#F59E0B';
              weight = 1;
              dashArray = '2,4';
              labelSize = '9px';
              labelOpacity = '0.4';
            } else if (type === 'QUARTIER') {
              color = '#EF4444';
              weight = 0.5;
              dashArray = '1,5';
              labelSize = '8px';
              labelOpacity = '0.3';
            }

            // Only draw geometries if toggled ON
            if (geojson && visibleLayers[type as keyof typeof visibleLayers]) {
              L.geoJSON(geojson, {
                style: {
                  color: color,
                  weight: weight,
                  opacity: 0.6,
                  fillColor: color,
                  fillOpacity: 0.02,
                  dashArray: dashArray,
                },
                onEachFeature: (_feature: any, layer: any) => {
                  layer.bindTooltip(`
                    <div style="font-family: Inter, sans-serif;">
                      <span style="font-size: 10px; color: #6b7280; font-weight: 600;">${type}</span><br/>
                      <span style="font-size: 13px; color: #111827; font-weight: 600;">${territory.name}</span>
                    </div>
                  `, { sticky: true, direction: 'auto' });
                }
              }).addTo(map);
            }

            // Add text label at centroid
            if (territory.centroid && type !== 'QUARTIER' && visibleLayers.labels && visibleLayers[type as keyof typeof visibleLayers]) {
              const centroidGeojson = typeof territory.centroid === 'string' ? JSON.parse(territory.centroid) : territory.centroid;
              if (centroidGeojson.type === 'Point' && centroidGeojson.coordinates) {
                const [lng, lat] = centroidGeojson.coordinates;

                const labelIcon = L.divIcon({
                  className: 'bg-transparent border-0',
                  html: `<div style="
                    font-size: ${labelSize}; 
                    font-weight: ${labelWeight}; 
                    color: #4B5563; 
                    opacity: ${labelOpacity};
                    text-transform: ${labelTransform};
                    text-shadow: 1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white;
                    white-space: nowrap;
                    text-align: center;
                  ">${territory.name}</div>`,
                  iconSize: [100, 20],
                  iconAnchor: [50, 10], // center the text
                });

                L.marker([lat, lng], { icon: labelIcon, interactive: false }).addTo(map);
              }
            }
          } catch (e) {
            console.error('Erreur parsing geometry', e);
          }
        }
      });

      // Add markers
      const validReports = reports.filter(r => r.latitude && r.longitude);
      validReports.forEach(report => {
        const priorityKey = (report.priority?.toLowerCase() || 'medium') as keyof typeof visibleLayers;
        if (!visibleLayers[priorityKey]) return; // Skip if layer is hidden

        const color = PRIORITY_COLORS[priorityKey] || '#9CA3AF';
        
        const markerHtml = `
          <div style="
            width: 28px; height: 28px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            display: flex; align-items: center; justify-content: center;
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -18],
        });

        const popup = `
          <div style="font-family: Inter, sans-serif; min-width: 200px;">
            <div style="font-weight: 600; font-size: 13px; color: #1f2937; margin-bottom: 8px; line-height: 1.3;">
              ${report.title}
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px;">
                <span style="color: #6b7280;">Territoire</span>
                <span style="color: #374151; font-weight: 500;">${report.territory}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px;">
                <span style="color: #6b7280;">Catégorie</span>
                <span style="color: #374151; font-weight: 500;">${CATEGORY_LABELS[report.category] ?? report.category}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px;">
                <span style="color: #6b7280;">Statut</span>
                <span style="color: #374151; font-weight: 500;">${STATUS_LABELS[report.status] ?? report.status}</span>
              </div>
              <div style="margin-top: 6px;">
                <span style="
                  display: inline-block;
                  padding: 2px 8px;
                  border-radius: 9999px;
                  font-size: 10px;
                  font-weight: 600;
                  background: ${color}22;
                  color: ${color};
                ">
                  ${report.priority?.charAt(0).toUpperCase() + report.priority?.slice(1)}
                </span>
              </div>
            </div>
          </div>
        `;

        L.marker([report.latitude, report.longitude], { icon })
          .addTo(map)
          .bindPopup(popup, { maxWidth: 240 });
      });

      // Only fit bounds if we have just initialized or if it's the first time we get valid reports.
      // But actually, just fitting bounds every time is okay, but it might jump.
      // Let's avoid jumpy map.
    };

    drawLayers();
  }, [reports, territories, visibleLayers, isLoading, isMapReady]);

  // When fullscreen changes, we need to invalidate Leaflet size
  useEffect(() => {
    if (mapInstanceRef.current) {
      // Small timeout to allow CSS transition/rendering to finish
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 200);
    }
  }, [isFullscreen]);

  // Stats from reports
  const criticalCount = reports.filter(r => r.priority === 'critical').length;
  const highCount = reports.filter(r => r.priority === 'high').length;
  const mediumCount = reports.filter(r => r.priority === 'medium').length;
  const statCounts: Record<string, number> = { critical: criticalCount, high: highCount, medium: mediumCount };

  if (isLoading) {
    return (
      <div className="bg-white rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
        <div className="p-5 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-40 bg-gray-100 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
          </div>
          <div className="h-[380px] bg-gray-50 rounded-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border-gray-100 overflow-hidden flex flex-col ${
      isFullscreen 
        ? 'fixed inset-0 z-[9999] rounded-none shadow-none' 
        : 'rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] border'
    }`}>
      {/* Header */}
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#E1EFFF] flex items-center justify-center">
            <FiMapPin className="w-4 h-4 text-[#1E88E5]" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#4B5563]">Carte des Signalements</h2>
            <p className="text-[11px] text-gray-400">{reports.length} signalement{reports.length > 1 ? 's' : ''} géolocalisé{reports.length > 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Actions & Mini stats */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {STATS.map(s => (
              <div key={s.key} className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-3 h-3 ${s.color}`} />
                </div>
                <span className="text-[12px] font-semibold text-gray-700">{statCounts[s.key]}</span>
                <span className="text-[11px] text-gray-400 hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
          
          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            title={isFullscreen ? "Réduire la carte" : "Agrandir la carte"}
          >
            {isFullscreen ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Map container */}
      <div className={`relative flex-1 ${isFullscreen ? 'h-full' : ''}`}>
        {/* Wrapper avec la hauteur responsive — Leaflet lit la hauteur via le style inline sur le div interne */}
        <div className={`w-full relative ${isFullscreen ? 'h-full absolute inset-0' : 'h-[300px] sm:h-[380px] lg:h-[420px]'}`}>
          <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-100 p-4 min-w-[170px] select-none">
          <h4 className="text-xs font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">Légende & Filtres</h4>
          
          {/* Section Territoires */}
          <div className="mb-3">
            <p className="text-[10px] font-semibold text-gray-500 tracking-wide mb-1.5">Découpage administratif</p>
            <div className="flex flex-col gap-0.5">
              
              <div 
                className={`flex items-center justify-between gap-3 cursor-pointer p-1.5 -mx-1.5 rounded hover:bg-gray-50 transition-colors ${!visibleLayers.DEPARTMENT ? 'opacity-50' : ''}`}
                onClick={() => toggleLayer('DEPARTMENT')}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 bg-[#10B981]/10 border-2 border-[#10B981] rounded-[2px]" />
                  <span className="text-[11px] text-gray-600">Département</span>
                </div>
                {visibleLayers.DEPARTMENT ? <FiEye className="w-3.5 h-3.5 text-gray-400" /> : <FiEyeOff className="w-3.5 h-3.5 text-gray-300" />}
              </div>
              
              <div 
                className={`flex items-center justify-between gap-3 cursor-pointer p-1.5 -mx-1.5 rounded hover:bg-gray-50 transition-colors ${!visibleLayers.COMMUNE ? 'opacity-50' : ''}`}
                onClick={() => toggleLayer('COMMUNE')}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 bg-[#6366F1]/10 border border-[#6366F1] border-dashed rounded-[2px]" />
                  <span className="text-[11px] text-gray-600">Commune</span>
                </div>
                {visibleLayers.COMMUNE ? <FiEye className="w-3.5 h-3.5 text-gray-400" /> : <FiEyeOff className="w-3.5 h-3.5 text-gray-300" />}
              </div>

              <div 
                className={`flex items-center justify-between gap-3 cursor-pointer p-1.5 -mx-1.5 rounded hover:bg-gray-50 transition-colors ${!visibleLayers.ARRONDISSEMENT ? 'opacity-50' : ''}`}
                onClick={() => toggleLayer('ARRONDISSEMENT')}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 bg-[#F59E0B]/10 border border-[#F59E0B] border-dashed opacity-70 rounded-[2px]" />
                  <span className="text-[11px] text-gray-600">Arrondissement</span>
                </div>
                {visibleLayers.ARRONDISSEMENT ? <FiEye className="w-3.5 h-3.5 text-gray-400" /> : <FiEyeOff className="w-3.5 h-3.5 text-gray-300" />}
              </div>

              <div 
                className={`flex items-center justify-between gap-3 cursor-pointer p-1.5 -mx-1.5 rounded hover:bg-gray-50 transition-colors ${!visibleLayers.QUARTIER ? 'opacity-50' : ''}`}
                onClick={() => toggleLayer('QUARTIER')}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 bg-[#EF4444]/10 border border-[#EF4444] border-dashed opacity-50 rounded-[2px]" />
                  <span className="text-[11px] text-gray-600">Quartier/Village</span>
                </div>
                {visibleLayers.QUARTIER ? <FiEye className="w-3.5 h-3.5 text-gray-400" /> : <FiEyeOff className="w-3.5 h-3.5 text-gray-300" />}
              </div>

              <div 
                className={`flex items-center justify-between gap-3 cursor-pointer p-1.5 -mx-1.5 rounded hover:bg-gray-50 transition-colors mt-0.5 ${!visibleLayers.labels ? 'opacity-50' : ''}`}
                onClick={() => toggleLayer('labels')}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 flex items-center justify-center font-bold text-[10px] text-gray-400">Aa</div>
                  <span className="text-[11px] text-gray-600">Nom du territoire</span>
                </div>
                {visibleLayers.labels ? <FiEye className="w-3.5 h-3.5 text-gray-400" /> : <FiEyeOff className="w-3.5 h-3.5 text-gray-300" />}
              </div>

            </div>
          </div>

          {/* Section Signalements */}
          <div>
            <p className="text-[10px] font-semibold text-gray-500 tracking-wide mb-1.5">Signalements</p>
            <div className="flex flex-col gap-0.5">
              {LEGEND_ITEMS.map(item => {
                const isVisible = visibleLayers[item.key as keyof typeof visibleLayers];
                return (
                  <div 
                    key={item.key} 
                    className={`flex items-center justify-between gap-3 cursor-pointer p-1.5 -mx-1.5 rounded hover:bg-gray-50 transition-colors ${!isVisible ? 'opacity-50' : ''}`}
                    onClick={() => toggleLayer(item.key as keyof typeof visibleLayers)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                        style={{ background: item.color }}
                      />
                      <span className="text-[11px] text-gray-600">{item.label}</span>
                    </div>
                    {isVisible ? <FiEye className="w-3.5 h-3.5 text-gray-400" /> : <FiEyeOff className="w-3.5 h-3.5 text-gray-300" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {reports.filter(r => r.latitude && r.longitude).length === 0 && (
          <div className="absolute inset-0 z-[999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <FiMapPin className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-400">Aucun signalement géolocalisé</p>
            <p className="text-xs text-gray-300 mt-1">Les signalements avec coordonnées GPS apparaîtront ici</p>
          </div>
        )}
      </div>
    </div>
  );
}
