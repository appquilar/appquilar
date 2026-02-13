// src/components/dashboard/hooks/useAddressMap.ts

import { useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import {
    attachAutocomplete,
    createMapWithDraggableMarker,
    reverseGeocode,
    type LatLngLiteral,
} from "@/infrastructure/google/GoogleMapsAdapter";

/**
 * Hook que encapsula toda la lógica de:
 * - carga de Google Maps
 * - creación del mapa + marker arrastrable
 * - autocomplete para buscar dirección
 * - sincronización con el formulario RHF
 */
type AddressMapFormValues = {
    street?: string;
    street2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
};

export function useAddressMap<T extends AddressMapFormValues>(
    addressForm: UseFormReturn<T>,
    enabled: boolean = true
) {
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);

    const [isMapsLoading, setIsMapsLoading] = useState(false);

    useEffect(() => {
        let autocomplete: google.maps.places.Autocomplete | null = null;
        let marker: google.maps.Marker | null = null;
        let map: google.maps.Map | null = null;
        let isMounted = true;

        if (!enabled || !mapContainerRef.current) return;

        const init = async () => {
            try {
                setIsMapsLoading(true);

                const latFromForm = addressForm.getValues("latitude" as any) as number | undefined;
                const lngFromForm = addressForm.getValues("longitude" as any) as number | undefined;

                const hasCoords =
                    typeof latFromForm === "number" && typeof lngFromForm === "number";

                const initialPosition: LatLngLiteral = hasCoords
                    ? { lat: latFromForm as number, lng: lngFromForm as number }
                    : { lat: 40.4168, lng: -3.7038 }; // Madrid

                const { map: createdMap, marker: createdMarker } =
                    await createMapWithDraggableMarker({
                        container: mapContainerRef.current as HTMLDivElement,
                        initialPosition,
                        zoom: hasCoords ? 15 : 6,
                        draggable: true,
                    });

                if (!isMounted) return;

                map = createdMap;
                marker = createdMarker;

                // Aseguramos que el form tiene coords iniciales
                addressForm.setValue("latitude" as any, initialPosition.lat as any);
                addressForm.setValue("longitude" as any, initialPosition.lng as any);

                // Cuando se suelta el marker -> coords + reverse geocode
                marker.addListener("dragend", async () => {
                    if (!marker) return;
                    const pos = marker.getPosition();
                    if (!pos) return;

                    const coords: LatLngLiteral = {
                        lat: pos.lat(),
                        lng: pos.lng(),
                    };

                    addressForm.setValue("latitude" as any, coords.lat as any, { shouldValidate: true });
                    addressForm.setValue("longitude" as any, coords.lng as any, { shouldValidate: true });

                    const addr = await reverseGeocode(coords);

                    if (addr.street) {
                        addressForm.setValue("street" as any, addr.street as any, { shouldValidate: true });
                    }
                    if (addr.city) {
                        addressForm.setValue("city" as any, addr.city as any, { shouldValidate: true });
                    }
                    if (addr.state) {
                        addressForm.setValue("state" as any, addr.state as any, { shouldValidate: true });
                    }
                    if (addr.country) {
                        addressForm.setValue("country" as any, addr.country as any, { shouldValidate: true });
                    }
                    if (addr.postalCode) {
                        addressForm.setValue("postalCode" as any, addr.postalCode as any, {
                            shouldValidate: true,
                        });
                    }
                });

                // Autocomplete en el buscador
                if (searchInputRef.current) {
                    autocomplete = await attachAutocomplete(searchInputRef.current);
                    if (autocomplete) {
                        autocomplete.addListener("place_changed", () => {
                            const place = autocomplete!.getPlace();
                            if (!place || !place.address_components) return;

                            let street = "";
                            let streetNumber = "";
                            let city = "";
                            let state = "";
                            let country = "";
                            let postalCode = "";

                            place.address_components.forEach((component) => {
                                const types = component.types;

                                if (types.includes("route")) street = component.long_name;
                                if (types.includes("street_number"))
                                    streetNumber = component.long_name;
                                if (types.includes("locality")) city = component.long_name;
                                if (types.includes("administrative_area_level_1"))
                                    state = component.long_name;
                                if (types.includes("country")) country = component.long_name;
                                if (types.includes("postal_code"))
                                    postalCode = component.long_name;
                            });

                            const fullStreet = streetNumber ? `${street} ${streetNumber}` : street;

                            addressForm.setValue("street" as any, fullStreet as any, {
                                shouldValidate: true,
                            });
                            addressForm.setValue("city" as any, city as any, { shouldValidate: true });
                            addressForm.setValue("state" as any, state as any, { shouldValidate: true });
                            addressForm.setValue("country" as any, country as any, { shouldValidate: true });
                            addressForm.setValue("postalCode" as any, postalCode as any, {
                                shouldValidate: true,
                            });

                            if (place.geometry?.location && map && marker) {
                                const coords: LatLngLiteral = {
                                    lat: place.geometry.location.lat(),
                                    lng: place.geometry.location.lng(),
                                };

                                addressForm.setValue("latitude" as any, coords.lat as any, {
                                    shouldValidate: true,
                                });
                                addressForm.setValue("longitude" as any, coords.lng as any, {
                                    shouldValidate: true,
                                });

                                map.panTo(coords);
                                map.setZoom(17);
                                marker.setPosition(coords);
                            }
                        });
                    }
                }
            } catch (error) {
                console.error("Error inicializando Google Maps:", error);
            } finally {
                if (isMounted) setIsMapsLoading(false);
            }
        };

        void init();

        return () => {
            isMounted = false;
            if (autocomplete && (window as any).google?.maps?.event) {
                (window as any).google.maps.event.clearInstanceListeners(autocomplete);
            }
        };
    }, [addressForm, enabled]);

    return {
        searchInputRef,
        mapContainerRef,
        isMapsLoading,
    };
}
