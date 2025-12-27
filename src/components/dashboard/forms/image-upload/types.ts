// src/components/dashboard/forms/image-upload/types.ts

import type { Control } from "react-hook-form";

export interface ImageFile {
    /** ✅ Este es el ID REAL del BE (UUID), no un "temp id" */
    id: string;

    /** Preview local (ObjectURL) mientras se sube o recién subida */
    previewUrl?: string;

    /** Estado UI */
    isUploading?: boolean;
    error?: string | null;
}

/**
 * ✅ Tipos de props reusables (genéricos para no acoplar a un schema que puede no existir)
 */
export interface ProductImagesFieldProps {
    control: Control<any>;
}

export interface ImageDropZoneProps {
    isDragging: boolean;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ImageGalleryProps {
    images: ImageFile[];
    onRemoveImage: (id: string) => void;
    onSetPrimaryImage: (id: string) => void;
}

export interface ImagePreviewProps {
    image: ImageFile;
    onRemove: (id: string) => void;
    onSetPrimary: (id: string) => void;
}
