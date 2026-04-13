import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

type GoogleMapsLibraryName = Parameters<typeof importLibrary>[0];

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined;
const FALLBACK_MAP_ID = "DEMO_MAP_ID";

let isConfigured = false;

function ensureGoogleMapsConfigured(): void {
    if (isConfigured) {
        return;
    }

    if (!API_KEY) {
        throw new Error("VITE_GOOGLE_MAPS_API_KEY no está definido en el .env");
    }

    setOptions({
        key: API_KEY,
        v: "beta",
        ...(MAP_ID ? { mapIds: [MAP_ID] } : {}),
    });

    isConfigured = true;
}

export function getGoogleMapsMapId(): string {
    return MAP_ID ?? FALLBACK_MAP_ID;
}

/**
 * Carga Google Maps una sola vez usando el loader oficial y permite
 * pedir librerías bajo demanda sin duplicar scripts.
 */
export async function loadGoogleMaps(
    libraries: GoogleMapsLibraryName[] = [],
): Promise<typeof google> {
    ensureGoogleMapsConfigured();

    await Promise.all(libraries.map((library) => importLibrary(library)));

    if (!window.google?.maps) {
        throw new Error("Google Maps no se inicializó correctamente");
    }

    return window.google;
}
