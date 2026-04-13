import {
    getGoogleMapsMapId,
    loadGoogleMaps,
} from "@/infrastructure/google/GoogleMapsLoader";

export type LatLngLiteral = google.maps.LatLngLiteral;

const APPQUILAR_ORANGE = "#F19D70";
const MARKER_LOGO_PATH = "/appquilar-marker-logo-white.png";

export interface GeocodedAddress {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
}

function createBrandPinElement(
    markerLibrary: google.maps.MarkerLibrary,
): google.maps.marker.PinElement {
    const { PinElement } = markerLibrary;
    const glyph = document.createElement("img");
    glyph.src = MARKER_LOGO_PATH;
    glyph.alt = "Appquilar";
    glyph.width = 18;
    glyph.height = 18;

    return new PinElement({
        background: APPQUILAR_ORANGE,
        borderColor: APPQUILAR_ORANGE,
        glyph,
        scale: 1.15,
    });
}

function extractCoordinates(position: google.maps.LatLng | LatLngLiteral | null | undefined) {
    if (!position) {
        return null;
    }

    if (position instanceof google.maps.LatLng) {
        return {
            lat: position.lat(),
            lng: position.lng(),
        };
    }

    return {
        lat: position.lat,
        lng: position.lng,
    };
}

export interface MapAndMarker {
    map: google.maps.Map;
    marker: google.maps.marker.AdvancedMarkerElement;
}

export interface PlaceAutocompleteSelection {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    location?: LatLngLiteral;
}

type AutocompleteSelectEvent = Event & {
    place?: google.maps.places.Place;
    placePrediction?: {
        toPlace: () => google.maps.places.Place;
    };
};

/**
 * Crea un mapa con marcador avanzado arrastrable usando el loader oficial.
 */
export async function createMapWithDraggableMarker(opts: {
    container: HTMLElement;
    initialPosition: LatLngLiteral;
    draggable?: boolean;
    zoom?: number;
}): Promise<MapAndMarker> {
    const g = await loadGoogleMaps(["maps", "marker"]);
    const { Map } = (await g.maps.importLibrary("maps")) as google.maps.MapsLibrary;
    const markerLibrary =
        (await g.maps.importLibrary("marker")) as google.maps.MarkerLibrary;
    const { AdvancedMarkerElement } = markerLibrary;

    const map = new Map(opts.container, {
        center: opts.initialPosition,
        zoom: opts.zoom ?? 15,
        mapId: getGoogleMapsMapId(),
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
    });

    const marker = new AdvancedMarkerElement({
        map,
        position: opts.initialPosition,
        gmpDraggable: opts.draggable ?? true,
        title: "Ubicación",
    });

    marker.append(createBrandPinElement(markerLibrary));

    return { map, marker };
}

/**
 * Crea el nuevo widget Place Autocomplete y lo monta dentro del contenedor dado.
 */
export async function mountAddressAutocomplete(opts: {
    container: HTMLElement;
    onSelect: (selection: PlaceAutocompleteSelection) => void | Promise<void>;
    placeholder?: string;
    disabled?: boolean;
    onError?: (message: string) => void;
}): Promise<() => void> {
    const g = await loadGoogleMaps(["places"]);
    await g.maps.importLibrary("places");

    const autocomplete = new google.maps.places.PlaceAutocompleteElement({
        types: ["address"],
    });

    autocomplete.className = "ui-google-place-autocomplete";
    autocomplete.setAttribute("aria-label", "Buscar dirección");
    autocomplete.name = "address-search";
    autocomplete.setAttribute("placeholder", opts.placeholder ?? "");
    autocomplete.style.width = "100%";

    if (opts.disabled) {
        autocomplete.setAttribute("disabled", "");
    } else {
        autocomplete.removeAttribute("disabled");
    }

    const handleSelect = async (event: Event) => {
        const selectEvent = event as AutocompleteSelectEvent;
        const place =
            selectEvent.place ??
            selectEvent.placePrediction?.toPlace();

        if (!place) {
            return;
        }

        await place.fetchFields({
            fields: ["addressComponents", "location"],
        });

        if (!place.addressComponents) {
            return;
        }

        let street = "";
        let streetNumber = "";
        let city = "";
        let state = "";
        let country = "";
        let postalCode = "";

        for (const component of place.addressComponents) {
            if (component.types.includes("street_number")) {
                streetNumber = component.longText ?? "";
            }
            if (component.types.includes("route")) {
                street = component.shortText ?? component.longText ?? "";
            }
            if (
                component.types.includes("locality") ||
                component.types.includes("postal_town")
            ) {
                city = component.longText ?? "";
            }
            if (component.types.includes("administrative_area_level_1")) {
                state = component.longText ?? "";
            }
            if (component.types.includes("country")) {
                country = component.longText ?? "";
            }
            if (component.types.includes("postal_code")) {
                postalCode = component.longText ?? "";
            }
        }

        await opts.onSelect({
            street: [street, streetNumber].filter(Boolean).join(" ").trim(),
            city,
            state,
            country,
            postalCode,
            location: place.location
                ? {
                    lat: place.location.lat(),
                    lng: place.location.lng(),
                }
                : undefined,
        });
    };

    const handleError = () => {
        opts.onError?.(
            "No se pudieron cargar las sugerencias de direcciones de Google Maps. Revisa que Places API esté habilitada para esta API key.",
        );
    };

    opts.container.replaceChildren(autocomplete);
    autocomplete.addEventListener("gmp-select", handleSelect);
    autocomplete.addEventListener("gmp-placeselect", handleSelect);
    autocomplete.addEventListener("gmp-error", handleError);

    return () => {
        autocomplete.removeEventListener("gmp-select", handleSelect);
        autocomplete.removeEventListener("gmp-placeselect", handleSelect);
        autocomplete.removeEventListener("gmp-error", handleError);
        if (opts.container.contains(autocomplete)) {
            opts.container.removeChild(autocomplete);
        }
    };
}

export function getMarkerCoordinates(
    marker: google.maps.marker.AdvancedMarkerElement,
): LatLngLiteral | null {
    return extractCoordinates(marker.position);
}

/**
 * Reverse geocoding: coords -> dirección.
 */
export async function reverseGeocode(
    coords: LatLngLiteral,
): Promise<GeocodedAddress> {
    const g = await loadGoogleMaps();
    const geocoder = new g.maps.Geocoder();

    return new Promise((resolve) => {
        geocoder.geocode({ location: coords }, (results, status) => {
            if (status !== "OK" || !results || !results.length) {
                resolve({});
                return;
            }

            const result = results[0];
            const components = result.address_components ?? [];

            const get = (type: string) =>
                components.find((component) => component.types.includes(type))?.long_name;

            const street = get("route");
            const number = get("street_number");

            resolve({
                street: street ? [street, number].filter(Boolean).join(" ").trim() : undefined,
                city: get("locality") ?? get("postal_town"),
                state: get("administrative_area_level_1"),
                country: get("country"),
                postalCode: get("postal_code"),
            });
        });
    });
}
