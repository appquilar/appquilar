let mapsApiPromise: Promise<typeof google> | null = null;

export type LatLngLiteral = google.maps.LatLngLiteral;

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const APPQUILAR_ORANGE = "#F19D70";
const MARKER_LOGO_PATH = "/appquilar-marker-logo-white.png";

async function ensurePlacesLibrary(g: typeof google): Promise<void> {
    if (g.maps.places) {
        return;
    }

    const mapsAny = g.maps as unknown as {
        importLibrary?: (name: string) => Promise<unknown>;
        places?: unknown;
    };

    if (typeof mapsAny.importLibrary === "function") {
        try {
            await mapsAny.importLibrary("places");
        } catch (error) {
            console.warn("No se pudo cargar la librería places con importLibrary", error);
        }
    }
}

async function loadGoogleMaps(): Promise<typeof google> {
    if (mapsApiPromise) return mapsApiPromise;

    if (!API_KEY) {
        throw new Error("VITE_GOOGLE_MAPS_API_KEY no está definido en el .env");
    }

    mapsApiPromise = new Promise((resolve, reject) => {
        // Ya cargado
        if ((window as any).google?.maps) {
            const googleLoaded = (window as any).google as typeof google;
            void ensurePlacesLibrary(googleLoaded).finally(() => resolve(googleLoaded));
            return;
        }

        const existing = document.querySelector<HTMLScriptElement>(
            'script[data-appquilar-google-maps="true"]',
        );
        if (existing) {
            existing.addEventListener("load", () =>
                resolve((window as any).google),
            );
            existing.addEventListener("error", () =>
                reject(new Error("Error recargando Google Maps")),
            );
            return;
        }

        const script = document.createElement("script");
        // Loader clásico, sin importLibrary ni loading=async
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        script.dataset.appquilarGoogleMaps = "true";

        script.onload = () => resolve((window as any).google);
        script.onerror = () =>
            reject(new Error("No se pudo cargar Google Maps JavaScript API"));

        document.head.appendChild(script);
    });

    return mapsApiPromise;
}

/**
 * Genera un icono custom combinando:
 * - Pin naranja Appquilar
 * - Logo blanco centrado
 * Devolvemos un google.maps.Icon que se puede usar en Marker.icon.
 */
let markerIconPromise: Promise<google.maps.Icon | null> | null = null;

async function getAppquilarMarkerIcon(
    g: typeof google,
): Promise<google.maps.Icon | null> {
    if (markerIconPromise) return markerIconPromise;

    markerIconPromise = new Promise((resolve) => {
        // Renderizamos en alta resolución y luego escalamos a un tamaño visual
        // más natural para que no se vea "forzado" en el mapa.
        const size = 128;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            resolve(null);
            return;
        }

        ctx.clearRect(0, 0, size, size);

        const centerX = size / 2;
        const circleRadius = size * 0.245;
        const circleCenterY = size * 0.295;
        const tipY = size * 0.85;

        // === SOMBRA (suave, circular) ===
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(centerX, tipY - 3, circleRadius * 0.78, circleRadius * 0.28, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fill();
        ctx.restore();

        // === PIN ===
        ctx.fillStyle = APPQUILAR_ORANGE;

        // 1. Círculo superior perfecto
        ctx.beginPath();
        ctx.arc(centerX, circleCenterY, circleRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Punta inferior bien unida (triángulo proporcionado)
        ctx.beginPath();
        ctx.moveTo(centerX - circleRadius * 0.60, circleCenterY + circleRadius * 0.56);
        ctx.lineTo(centerX + circleRadius * 0.60, circleCenterY + circleRadius * 0.56);
        ctx.lineTo(centerX, tipY);
        ctx.closePath();
        ctx.fill();

        // === CÍRCULO INTERIOR BLANCO (para logo) ===
        const innerRadius = circleRadius * 0.84;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, circleCenterY, innerRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = APPQUILAR_ORANGE;
        ctx.fill();
        ctx.clip();

        // === LOGO BLANCO ===
        const img = new Image();
        img.onload = () => {
            const logoSize = innerRadius * 2.22;
            ctx.drawImage(
                img,
                centerX - logoSize / 2,
                circleCenterY - logoSize / 2,
                logoSize,
                logoSize,
            );

            ctx.restore();

            const url = canvas.toDataURL("image/png");

            const icon: google.maps.Icon = {
                url,
                // Tamaño final más discreto y proporcionado al mapa.
                scaledSize: new google.maps.Size(38, 54),
                // La punta del marcador queda exactamente en la coordenada.
                anchor: new google.maps.Point(19, 52),
            };

            resolve(icon);
        };

        img.onerror = () => {
            console.warn("Error cargando el logo del marker.");
            resolve(null);
        };

        img.src = MARKER_LOGO_PATH;
    });

    return markerIconPromise;
}

export interface MapAndMarker {
    map: google.maps.Map;
    marker: google.maps.Marker;
}

/**
 * Crea un mapa + marker arrastrable usando las APIs clásicas.
 */
export async function createMapWithDraggableMarker(opts: {
    container: HTMLElement;
    initialPosition: LatLngLiteral;
    draggable?: boolean;
    zoom?: number;
}): Promise<MapAndMarker> {
    const g = await loadGoogleMaps();

    const map = new g.maps.Map(opts.container, {
        center: opts.initialPosition,
        zoom: opts.zoom ?? 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
    });

    let icon: google.maps.Icon | null = null;

    try {
        icon = await getAppquilarMarkerIcon(g);
    } catch (e) {
        console.warn("Fallo generando el icono Appquilar, usamos el pin rojo por defecto", e);
    }

    const marker = new g.maps.Marker({
        position: opts.initialPosition,
        map,
        draggable: opts.draggable ?? true,
        ...(icon ? { icon } : {}),
    });

    return { map, marker };
}

/**
 * Autocomplete clásico para un <input>.
 */
export async function attachAutocomplete(
    input: HTMLInputElement,
): Promise<google.maps.places.Autocomplete | null> {
    const g = await loadGoogleMaps();
    await ensurePlacesLibrary(g);

    if (!g.maps.places) {
        console.warn(
            "google.maps.places no está disponible; revisa 'libraries=places' en la URL.",
        );
        return null;
    }

    const autocomplete = new g.maps.places.Autocomplete(input, {
        fields: ["address_components", "geometry", "formatted_address"],
        types: ["address"],
    });

    return autocomplete;
}

export interface GeocodedAddress {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
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
                components.find((c) => c.types.includes(type))?.long_name;

            const street = get("route");
            const number = get("street_number");

            resolve({
                street: street ? (number ? `${street} ${number}` : street) : undefined,
                city: get("locality"),
                state: get("administrative_area_level_1"),
                country: get("country"),
                postalCode: get("postal_code"),
            });
        });
    });
}
