export interface Location {
    latitude: number;
    longitude: number;
}

/**
 * Helper to check if a location is valid.
 * You can extend this with more precise validation if needed.
 */
export function isValidLocation(location: Location | null | undefined): boolean {
    if (!location) return false;

    const { latitude, longitude } = location;

    const isLatitudeValid = latitude >= -90 && latitude <= 90;
    const isLongitudeValid = longitude >= -180 && longitude <= 180;

    return isLatitudeValid && isLongitudeValid;
}
