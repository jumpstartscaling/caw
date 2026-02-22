import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '@/components/ui/button';

// Fix for default marker icons in React Leaflet
const iconUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface GeoMapProps {
    locations: any[];
    clusters: any[];
    onLocationSelect?: (location: any) => void;
}

// Component to handle map bounds updates
function MapUpdater({ locations }: { locations: any[] }) {
    const map = useMap();

    useEffect(() => {
        if (locations.length > 0) {
            const bounds = L.latLngBounds(locations.map(l => [l.lat || 37.0902, l.lng || -95.7129]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [locations, map]);

    return null;
}

export default function GeoMap({ locations, clusters }: GeoMapProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-[400px] w-full bg-zinc-900 animate-pulse rounded-lg" />;

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-zinc-800 relative z-0">
            <MapContainer
                center={[37.0902, -95.7129]}
                zoom={4}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {locations.map((loc) => (
                    (loc.lat && loc.lng) && (
                        <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                            <Popup className="text-zinc-900">
                                <div className="p-1">
                                    <strong className="block text-sm font-bold">{loc.city}</strong>
                                    <span className="text-xs text-zinc-500">{loc.state}</span>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}

                <MapUpdater locations={locations} />
            </MapContainer>
        </div>
    );
}
