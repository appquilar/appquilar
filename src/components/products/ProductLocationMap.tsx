import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { loadGoogleMaps } from '@/infrastructure/google/GoogleMapsLoader';

interface ProductLocationMapProps {
    location: string;
    coordinates?: [number, number];
    polygon?: { latitude: number; longitude: number }[];
}

const ProductLocationMap = ({ location, coordinates = [-2.4637, 36.8381], polygon }: ProductLocationMapProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);

    useEffect(() => {
        if (!mapContainer.current) return;

        const initMap = async () => {
            try {
                const google = await loadGoogleMaps(
                    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
                );

                // Convert [lng, lat] to { lat, lng }
                const center = { lat: coordinates[1], lng: coordinates[0] };

                if (!mapInstance.current) {
                    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;

                    mapInstance.current = new Map(mapContainer.current, {
                        center: center,
                        zoom: 13,
                        mapId: 'DEMO_MAP_ID',
                        disableDefaultUI: false,
                        streetViewControl: false,
                        mapTypeControl: false,
                    });
                } else {
                    mapInstance.current.setCenter(center);
                }

                // Simplistic clearing/redrawing logic. In a full implementation, track references to remove.
                if (polygon && polygon.length > 0) {
                    const polygonPath = polygon.map(p => ({ lat: p.latitude, lng: p.longitude }));

                    new google.maps.Polygon({
                        paths: polygonPath,
                        strokeColor: "#FF5A1F",
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: "#FF5A1F",
                        fillOpacity: 0.35,
                        map: mapInstance.current,
                    });

                    const bounds = new google.maps.LatLngBounds();
                    polygonPath.forEach(p => bounds.extend(p));
                    mapInstance.current.fitBounds(bounds);

                } else {
                    const { Marker } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
                    new Marker({
                        position: center,
                        map: mapInstance.current,
                        title: location
                    });
                }

            } catch (error) {
                console.error('Error initializing Google Maps:', error);
            }
        };

        initMap();
    }, [coordinates, polygon, location]);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={18} className="text-primary" />
                <span className="font-medium">{location}</span>
            </div>
            <div
                ref={mapContainer}
                className="w-full h-64 rounded-lg border border-border overflow-hidden bg-muted"
                style={{ minHeight: '256px' }}
            />
            <p className="text-xs text-muted-foreground">
                {polygon ? "Zona aproximada de entrega y devolución" : "Ubicación aproximada del producto"}
            </p>
        </div>
    );
};

export default ProductLocationMap;