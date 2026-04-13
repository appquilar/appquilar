import { useRef } from 'react';
import { MapPin } from 'lucide-react';
import { useProductLocationMap } from '@/hooks/useProductLocationMap';

interface ProductLocationMapProps {
    city: string;
    state: string;
    coordinates?: [number, number];
    polygon?: { latitude: number; longitude: number }[];
}

const ProductLocationMap = ({ city, state, coordinates = [-2.4637, 36.8381], polygon }: ProductLocationMapProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    useProductLocationMap({
        containerRef: mapContainer,
        city,
        state,
        coordinates,
        polygon,
    });

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={18} className="text-primary" />
                <span className="font-medium">{city + ', ' + state}</span>
            </div>
            <div
                ref={mapContainer}
                className="w-full h-64 rounded-lg border border-border overflow-hidden bg-muted"
                style={{ minHeight: '256px' }}
            />
        </div>
    );
};

export default ProductLocationMap;
