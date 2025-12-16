import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Route, LatLng } from '../types';

// Custom icon SVGs
const startIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#16a34a" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`;
const endIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#dc2626" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`;
const restStopIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#0ea5e9" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l2 2"/></svg>`;

const createIcon = (svg: string) => {
  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const startIcon = createIcon(startIconSvg);
const endIcon = createIcon(endIconSvg);
const restStopIcon = createIcon(restStopIconSvg);

const routeColors = ['#0891b2', '#6366f1']; // Cyan, Indigo

interface MapDisplayProps {
  routes: Route[] | null;
}

const ChangeView: React.FC<{ bounds: L.LatLngBounds | null }> = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};

const MapDisplay: React.FC<MapDisplayProps> = ({ routes }) => {
  const hongKongCenter: LatLng = { lat: 22.3193, lng: 114.1694 };

  const getBounds = (): L.LatLngBounds | null => {
    if (!routes || routes.length === 0) return null;
    const allPoints = routes.flatMap(r => r.path);
    if (allPoints.length === 0) return null;
    
    const latLngs = allPoints.map(p => L.latLng(p.lat, p.lng));
    return L.latLngBounds(latLngs);
  };
  
  const bounds = getBounds();

  return (
    <MapContainer center={[hongKongCenter.lat, hongKongCenter.lng]} zoom={11} scrollWheelZoom={true} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {routes && routes.map((route, routeIndex) => (
        <React.Fragment key={route.routeName + routeIndex}>
          <Polyline pathOptions={{ color: routeColors[routeIndex % routeColors.length], weight: 6, opacity: 0.8 }} positions={route.path.map(p => [p.lat, p.lng])} />
          
          {route.path.length > 0 && (
            <Marker position={[route.path[0].lat, route.path[0].lng]} icon={startIcon}>
              <Popup><b>起點</b></Popup>
            </Marker>
          )}

          {route.path.length > 1 && (
             <Marker position={[route.path[route.path.length - 1].lat, route.path[route.path.length - 1].lng]} icon={endIcon}>
               <Popup><b>終點</b><br />{route.routeName}</Popup>
             </Marker>
          )}

          {route.restStops.map((stop, stopIndex) => (
            <Marker key={`${route.routeName}-stop-${stopIndex}`} position={[stop.location.lat, stop.location.lng]} icon={restStopIcon}>
              <Popup>
                <b>休息點: {stop.name}</b><br />
                距離上個點: {stop.distanceFromPreviousKm.toFixed(2)} 公里
              </Popup>
            </Marker>
          ))}
        </React.Fragment>
      ))}
      <ChangeView bounds={bounds} />
    </MapContainer>
  );
};

export default MapDisplay;