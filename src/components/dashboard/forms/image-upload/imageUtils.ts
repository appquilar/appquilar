// src/components/dashboard/forms/image-upload/imageUtils.ts
import { toast } from "sonner";
import type { ImageFile } from "./types";
import {Uuid} from "@/domain/valueObject/uuidv4.ts";

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];

type Options = { maxImages?: number };

export const validateAndProcessFiles = (
    files: File[],
    currentImages: ImageFile[],
    options: Options = {}
): Array<{ file: File; imageId: string; previewUrl: string }> => {
    const maxImages = options.maxImages ?? 1;

    if (currentImages.length + files.length > maxImages) {
        toast.error(`Solo puedes subir ${maxImages} imagen${maxImages === 1 ? "" : "es"}`);
        return [];
    }

    const validFiles = files.filter((file) => {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            toast.error(`El archivo ${file.name} no es una imagen válida (JPEG/PNG)`);
            return false;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error(`El archivo ${file.name} excede el tamaño máximo de 2MB`);
            return false;
        }
        return true;
    });

    return validFiles.map((file) => {
        const imageId = Uuid.generate().toString();
        const previewUrl = URL.createObjectURL(file);
        return { file, imageId, previewUrl };
    });
};
