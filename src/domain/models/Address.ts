export interface Address {
    street: string | null;
    street2: string | null;
    city: string | null;
    postalCode: string | null;
    state: string | null;
    country: string | null;
}

/**
 * Helper to know if an address is considered "complete enough" for business rules.
 * You can tweak the conditions as your product evolves.
 */
export function hasMinimalAddress(address: Address | null | undefined): boolean {
    if (!address) return false;

    const { city, country } = address;

    return Boolean(city && country);
}
