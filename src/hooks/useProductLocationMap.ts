import { RefObject, useEffect, useRef } from "react";

import { getGoogleMapsMapId, loadGoogleMaps } from "@/infrastructure/google/GoogleMapsLoader";

type ProductLocationPolygonPoint = {
    latitude: number;
    longitude: number;
};

type UseProductLocationMapOptions = {
    containerRef: RefObject<HTMLDivElement | null>;
    city: string;
    state: string;
    coordinates: [number, number];
    polygon?: ProductLocationPolygonPoint[];
};

type GoogleMapOverlay = google.maps.Polygon | google.maps.marker.AdvancedMarkerElement;

const clearOverlay = (overlay: GoogleMapOverlay | null) => {
    if (!overlay) {
        return;
    }

    if ("setMap" in overlay) {
        overlay.setMap(null);
        return;
    }

    overlay.map = null;
};

export const useProductLocationMap = ({
    containerRef,
    city,
    state,
    coordinates,
    polygon,
}: UseProductLocationMapOptions) => {
    const mapRef = useRef<google.maps.Map | null>(null);
    const overlayRef = useRef<GoogleMapOverlay | null>(null);

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        let cancelled = false;

        const initMap = async () => {
            try {
                const googleMaps = await loadGoogleMaps(["maps", "marker"]);
                if (cancelled || !containerRef.current) {
                    return;
                }

                const center = { lat: coordinates[1], lng: coordinates[0] };

                if (!mapRef.current) {
                    const { Map } = await googleMaps.maps.importLibrary("maps") as google.maps.MapsLibrary;

                    if (cancelled || !containerRef.current) {
                        return;
                    }

                    mapRef.current = new Map(containerRef.current, {
                        center,
                        zoom: 13,
                        mapId: getGoogleMapsMapId(),
                        disableDefaultUI: false,
                        streetViewControl: false,
                        mapTypeControl: false,
                    });
                } else {
                    mapRef.current.setCenter(center);
                    mapRef.current.setZoom(13);
                }

                clearOverlay(overlayRef.current);
                overlayRef.current = null;

                if (polygon && polygon.length > 0) {
                    const polygonPath = polygon.map((point) => ({
                        lat: point.latitude,
                        lng: point.longitude,
                    }));

                    const polygonOverlay = new googleMaps.maps.Polygon({
                        paths: polygonPath,
                        strokeColor: "#FF5A1F",
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: "#FF5A1F",
                        fillOpacity: 0.35,
                        map: mapRef.current,
                    });

                    overlayRef.current = polygonOverlay;

                    const bounds = new googleMaps.maps.LatLngBounds();
                    polygonPath.forEach((point) => bounds.extend(point));
                    mapRef.current.fitBounds(bounds);
                    return;
                }

                const { AdvancedMarkerElement, PinElement } =
                    await googleMaps.maps.importLibrary("marker") as google.maps.MarkerLibrary;

                if (cancelled || !mapRef.current) {
                    return;
                }

                const marker = new AdvancedMarkerElement({
                    position: center,
                    map: mapRef.current,
                    title: `${city}, ${state}`,
                });

                marker.append(
                    new PinElement({
                        background: "#F19D70",
                        borderColor: "#F19D70",
                        scale: 1.1,
                    })
                );

                overlayRef.current = marker;
            } catch (error) {
                console.error("Error initializing Google Maps:", error);
            }
        };

        void initMap();

        return () => {
            cancelled = true;
            clearOverlay(overlayRef.current);
            overlayRef.current = null;
        };
    }, [city, containerRef, coordinates, polygon, state]);
};
