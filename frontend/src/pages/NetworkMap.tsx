import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';
import { Station, Section } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { StatusBadge } from '../components/StatusBadge';
import {
  MapPin,
  Clock,
  Wrench,
  Layers,
  Info,
  ChevronRight,
  Compass
} from 'lucide-react';

// Color map for Section Statuses
const STATUS_COLORS: Record<string, string> = {
  Available: '#15803d',             // Green
  'Planned Maintenance': '#b45309', // Warm Amber
  'Active Block': '#c2410c',        // Orange
  'Critical/Conflict': '#b91c1c',   // Red
  'Train Route': '#2563eb',         // Blue
  Inactive: '#78716c'               // Warm Grey
};

const REGION_PRESETS = [
  { id: 'delhi', label: 'Delhi Division', center: [28.62, 77.26] as [number, number], zoom: 11 },
  { id: 'east-coast', label: 'Odisha & Bengal Corridor', center: [20.45, 85.85] as [number, number], zoom: 8 },
  { id: 'all', label: 'All India Overview', center: [23.5, 83.5] as [number, number], zoom: 6 }
];

const MapFlyController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

export const NetworkMap: React.FC<{ onNavigateToMaintenance?: (secId: number) => void }> = ({
  onNavigateToMaintenance
}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRegion, setActiveRegion] = useState(REGION_PRESETS[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [stnRes, secRes] = await Promise.all([
          api.getStations(),
          api.getSections()
        ]);
        setStations(stnRes.data);
        setSections(secRes.data);
      } catch (err) {
        console.error('Failed to load map network data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSkeleton rows={12} />
      </div>
    );
  }

  const stationMap: Record<number, Station> = {};
  stations.forEach((s) => {
    stationMap[s.id] = s;
  });

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden select-none">
      {/* Map Interactive Canvas */}
      <div className="flex-1 relative h-full">
        {/* Floating Corridor Focus Switcher */}
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 border border-[#E7E0D2] p-1.5 rounded-xl shadow-warm-lg backdrop-blur-md flex items-center gap-1.5 pointer-events-auto">
          <Compass className="w-3.5 h-3.5 text-[#9C7B4F] ml-1" />
          <span className="text-[11px] font-mono text-stone-500 mr-1">Corridor:</span>
          {REGION_PRESETS.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRegion(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeRegion.id === r.id
                  ? 'bg-[#FAF5E4] text-[#82653D] border border-[#E7E0D2] shadow-warm-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#F5EFE4]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <MapContainer
          center={activeRegion.center}
          zoom={activeRegion.zoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapFlyController center={activeRegion.center} zoom={activeRegion.zoom} />

          {/* Clean High-Contrast Light CartoDB Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &amp; Indian Railways IRIS'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {/* Section Track Polylines */}
          {sections.map((sec) => {
            const fromStn = stationMap[sec.from_station_id];
            const toStn = stationMap[sec.to_station_id];
            if (!fromStn || !toStn) return null;

            const positions: [number, number][] = [
              [fromStn.lat, fromStn.lng],
              [toStn.lat, toStn.lng]
            ];
            const strokeColor = STATUS_COLORS[sec.status] || '#15803d';
            const isSelected = selectedSection?.id === sec.id;

            return (
              <Polyline
                key={sec.id}
                positions={positions}
                pathOptions={{
                  color: strokeColor,
                  weight: isSelected ? 7 : 4.5,
                  opacity: isSelected ? 1.0 : 0.85,
                  dashArray: sec.status === 'Planned Maintenance' ? '8, 6' : undefined
                }}
                eventHandlers={{
                  click: () => setSelectedSection(sec)
                }}
              />
            );
          })}

          {/* Station Markers */}
          {stations.map((stn) => (
            <CircleMarker
              key={stn.id}
              center={[stn.lat, stn.lng]}
              radius={6}
              pathOptions={{
                fillColor: '#9C7B4F',
                fillOpacity: 1,
                color: '#ffffff',
                weight: 2.5
              }}
            >
              <Popup>
                <div className="text-stone-900 text-xs font-sans p-1">
                  <p className="font-bold text-[#82653D] font-mono text-sm">{stn.code}</p>
                  <p className="font-semibold text-stone-900">{stn.name}</p>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Zone: {stn.zone} | Division: {stn.division}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Floating Status Color Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 border border-[#E7E0D2] p-3.5 rounded-2xl shadow-warm-lg backdrop-blur-md text-xs space-y-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 font-bold text-stone-800 text-[11px] mb-1">
            <Layers className="w-3.5 h-3.5 text-[#9C7B4F]" />
            <span>Track Corridor Status</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-emerald-600" />
              <span className="text-stone-700 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-amber-600" />
              <span className="text-stone-700 font-medium">Planned Block</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-orange-600" />
              <span className="text-stone-700 font-medium">Active Possession</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-red-600" />
              <span className="text-stone-700 font-medium">Critical / Conflict</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Telemetry Details Drawer */}
      <div className="w-full md:w-80 lg:w-96 bg-white/95 border-l border-[#E7E0D2] p-5 overflow-y-auto flex flex-col justify-between shrink-0 shadow-warm-sm">
        <div>
          <div className="flex items-center justify-between pb-3.5 border-b border-[#EFE9DC] mb-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#9C7B4F]" />
              <h3 className="text-sm font-bold text-stone-900">Section Telemetry Inspector</h3>
            </div>
            <span className="text-[10px] font-mono text-stone-500 bg-[#FAF5E4] px-1.5 py-0.5 rounded border border-[#E7E0D2]">CLICK TRACK</span>
          </div>

          {selectedSection ? (
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold font-mono text-[#82653D]">
                    {selectedSection.code}
                  </span>
                  <StatusBadge status={selectedSection.status} />
                </div>
                <p className="text-stone-800 font-semibold mt-1">
                  {selectedSection.from_station_name} &rarr; {selectedSection.to_station_name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 bg-[#FAF6EE] p-3.5 rounded-xl border border-[#E7E0D2] text-[11px] shadow-warm-xs">
                <div>
                  <span className="text-stone-500 block">Length:</span>
                  <span className="font-mono font-bold text-stone-800">{selectedSection.length_km} km</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Track Count:</span>
                  <span className="font-mono font-bold text-stone-800">{selectedSection.tracks} Tracks</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Traction:</span>
                  <span className="font-mono font-semibold text-emerald-700">
                    {selectedSection.electrified ? '25kV AC Electrified' : 'Non-Electrified'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Section Speed:</span>
                  <span className="font-mono font-bold text-stone-800">{selectedSection.max_speed} km/h</span>
                </div>
              </div>

              {/* Pending Maintenance Count */}
              <div className="p-3.5 rounded-xl bg-[#FAF6EE] border border-[#E7E0D2] flex items-center justify-between shadow-warm-xs">
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <div>
                    <span className="text-stone-500 block text-[10px]">Pending Maintenance</span>
                    <span className="font-bold text-stone-900 font-mono text-sm">
                      {selectedSection.pending_tasks_count || 0} tasks
                    </span>
                  </div>
                </div>
                {onNavigateToMaintenance && (
                  <button
                    onClick={() => onNavigateToMaintenance(selectedSection.id)}
                    className="text-[#9C7B4F] hover:text-[#82653D] flex items-center text-[11px] font-bold cursor-pointer hover:underline"
                  >
                    <span>View Tasks</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Next Approaching Train */}
              <div className="p-3.5 rounded-xl bg-[#FAF6EE] border border-[#E7E0D2] shadow-warm-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-stone-500 text-[10px]">Next Impending Train</span>
                </div>
                <p className="font-mono text-stone-800 text-xs font-semibold">
                  {selectedSection.next_train || 'No impending passenger traffic'}
                </p>
              </div>

              {/* Operational Risk Assessment */}
              <div className="p-3.5 rounded-xl bg-[#FAF6EE] border border-[#E7E0D2] shadow-warm-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-stone-500 text-[10px]">Operational Risk Index</span>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedSection.risk_level === 'High' || selectedSection.risk_level === 'Critical'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {selectedSection.risk_level.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Calculated from asset health index, train throughput density and overdue maintenance backlog.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-stone-400 space-y-2">
              <MapPin className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-xs font-semibold text-stone-700">No Section Selected</p>
              <p className="text-[11px] text-stone-500 max-w-[200px] mx-auto">
                Click on any colored track segment on the map to inspect its real-time operational telemetry.
              </p>
            </div>
          )}
        </div>

        <div className="text-[10px] text-stone-400 border-t border-[#EFE9DC] pt-3 text-center">
          Geospatial Map Data &bull; Northern Railway &amp; East Coast Railway Telemetry Feed
        </div>
      </div>
    </div>
  );
};

export default NetworkMap;
