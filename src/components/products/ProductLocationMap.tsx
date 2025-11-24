import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';

interface ProductLocationMapProps {
  location: string;
  coordinates?: [number, number]; // [longitude, latitude]
}

const ProductLocationMap = ({ location, coordinates = [-2.4637, 36.8381] }: ProductLocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // TODO: Replace with actual Mapbox token
    // For now, we'll show a placeholder
    mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN_HERE';

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: coordinates,
        zoom: 12,
      });

      // Add marker
      new mapboxgl.Marker({ color: '#FF5A1F' })
        .setLngLat(coordinates)
        .addTo(map.current);

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      map.current?.remove();
    };
  }, [coordinates]);

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
        Ubicación aproximada del producto
      </p>
    </div>
  );
};

export default ProductLocationMap;
