/**
 * Slugify con soporte Unicode (cualquier idioma).
 * - Normaliza y elimina diacríticos cuando aplica
 * - Mantiene letras y números Unicode (\p{L}\p{N})
 * - Reemplaza separadores por '-'
 */
export function slugify(input: string): string {
    const normalized = input
        .normalize("NFKD")
        // elimina diacríticos combinados
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

    // Mantener letras y números (Unicode), convertir el resto a '-'
    return normalized
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}
