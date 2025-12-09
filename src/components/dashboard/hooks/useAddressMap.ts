// src/components/dashboard/hooks/useAddressMap.ts

import { useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { AddressFormValues } from "@/domain/schemas/userConfigSchema";

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
export function useAddressMap(addressForm: UseFormReturn<AddressFormValues>) {
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);

    const [isMapsLoading, setIsMapsLoading] = useState(false);

    useEffect(() => {
        let autocomplete: google.maps.places.Autocomplete | null = null;
        let marker: google.maps.Marker | null = null;
        let map: google.maps.Map | null = null;
        let isMounted = true;

        if (!mapContainerRef.current) return;

        const init = async () => {
            try {
                setIsMapsLoading(true);

                const latFromForm = addressForm.getValues("latitude");
                const lngFromForm = addressForm.getValues("longitude");

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
                addressForm.setValue("latitude", initialPosition.lat);
                addressForm.setValue("longitude", initialPosition.lng);

                // Cuando se suelta el marker -> coords + reverse geocode
                marker.addListener("dragend", async () => {
                    if (!marker) return;
                    const pos = marker.getPosition();
                    if (!pos) return;

                    const coords: LatLngLiteral = {
                        lat: pos.lat(),
                        lng: pos.lng(),
                    };

                    addressForm.setValue("latitude", coords.lat, { shouldValidate: true });
                    addressForm.setValue("longitude", coords.lng, { shouldValidate: true });

                    const addr = await reverseGeocode(coords);

                    if (addr.street) {
                        addressForm.setValue("street", addr.street, { shouldValidate: true });
                    }
                    if (addr.city) {
                        addressForm.setValue("city", addr.city, { shouldValidate: true });
                    }
                    if (addr.state) {
                        addressForm.setValue("state", addr.state, { shouldValidate: true });
                    }
                    if (addr.country) {
                        addressForm.setValue("country", addr.country, { shouldValidate: true });
                    }
                    if (addr.postalCode) {
                        addressForm.setValue("postalCode", addr.postalCode, {
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

                            addressForm.setValue("street", fullStreet, {
                                shouldValidate: true,
                            });
                            addressForm.setValue("city", city, { shouldValidate: true });
                            addressForm.setValue("state", state, { shouldValidate: true });
                            addressForm.setValue("country", country, { shouldValidate: true });
                            addressForm.setValue("postalCode", postalCode, {
                                shouldValidate: true,
                            });

                            if (place.geometry?.location && map && marker) {
                                const coords: LatLngLiteral = {
                                    lat: place.geometry.location.lat(),
                                    lng: place.geometry.location.lng(),
                                };

                                addressForm.setValue("latitude", coords.lat, {
                                    shouldValidate: true,
                                });
                                addressForm.setValue("longitude", coords.lng, {
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
    }, [addressForm]);

    return {
        searchInputRef,
        mapContainerRef,
        isMapsLoading,
    };
}
