import type { ProductImageItem } from "./types";

export const MAX_PRODUCT_IMAGES = 5;
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];

export function validateProductImagesFiles(files: File[], current: ProductImageItem[]) {
    const remaining = MAX_PRODUCT_IMAGES - current.length;

    if (remaining <= 0) {
        return { validFiles: [], error: `Solo puedes subir ${MAX_PRODUCT_IMAGES} imágenes.` };
    }

    const sliced = files.slice(0, remaining);

    const valid: File[] = [];
    for (const f of sliced) {
        if (!ALLOWED_FILE_TYPES.includes(f.type)) {
            return { validFiles: [], error: `El archivo ${f.name} no es una imagen válida (JPEG/PNG).` };
        }
        if (f.size > MAX_FILE_SIZE) {
            return { validFiles: [], error: `El archivo ${f.name} excede el tamaño máximo de 2MB.` };
        }
        valid.push(f);
    }

    return { validFiles: valid, error: null as string | null };
}
