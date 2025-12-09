// src/infrastructure/google/GoogleMapsLoader.ts

let loadingPromise: Promise<typeof google> | null = null;

/**
 * Carga la librería de Google Maps JS una sola vez.
 * - Usa script async + defer (modo clásico, estable)
 * - Permite pasar las librerías que necesites (places, marker, etc.)
 * - Adjunta el map_id si está configurado en .env
 */
export async function loadGoogleMaps(
    apiKey: string,
    libraries: string[] = []
): Promise<typeof google> {
    if (window.google && window.google.maps) {
        return window.google;
    }

    if (loadingPromise) {
        return loadingPromise;
    }

    loadingPromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector<HTMLScriptElement>(
            "script[data-google-maps-loader='true']"
        );

        // Si ya hay script y google está cargado, resolvemos
        if (existingScript && window.google && window.google.maps) {
            resolve(window.google);
            return;
        }

        const params = new URLSearchParams({
            key: apiKey,
            v: "weekly", // versión moderna, pero en modo "clásico"
        });

        if (libraries.length > 0) {
            params.set("libraries", libraries.join(","));
        }

        const mapId = import.meta.env
            .VITE_GOOGLE_MAPS_MAP_ID as string | undefined;

        if (mapId) {
            // Necesario para Advanced Markers y vector maps
            params.set("map_ids", mapId);
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
        script.async = true;
        script.defer = true;
        script.dataset.googleMapsLoader = "true";

        script.onload = () => {
            if (window.google && window.google.maps) {
                resolve(window.google);
            } else {
                reject(new Error("Google Maps no se inicializó correctamente"));
            }
        };

        script.onerror = () => {
            reject(new Error("No se pudo cargar el script de Google Maps"));
        };

        document.head.appendChild(script);
    });

    return loadingPromise;
}
