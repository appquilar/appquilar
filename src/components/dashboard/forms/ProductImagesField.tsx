// src/components/dashboard/forms/ProductImagesField.tsx
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";

import ImageDropZone from "./image-upload/ImageDropZone";
import ImageGallery from "./image-upload/ImageGallery";
import type { ImageFile } from "./image-upload/types";
import { validateAndProcessFiles } from "./image-upload/imageUtils";
import type { ProductFormData } from "@/domain/models/Product";
import { compositionRoot } from "@/compositionRoot";
import { toast } from "sonner";

interface Props {
    form: UseFormReturn<ProductFormData>;
}

const MAX = 5;

const ProductImagesField = ({ form }: Props) => {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [drag, setDrag] = useState(false);

    /**
     * ✅ 1) Inicializar desde defaultValues (edit):
     * - si el form trae images como string[] (ideal)
     * - o si te llega como objetos, lo toleramos.
     */
    useEffect(() => {
        const raw = (form.getValues("images") ?? []) as any[];

        // Si ya tenemos state, no pisamos
        if (images.length > 0) return;

        const ids: string[] = raw
            .map((x) => (typeof x === "string" ? x : x?.id))
            .filter(Boolean);

        if (ids.length) {
            setImages(ids.map((id) => ({ id })));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form]);

    /**
     * ✅ 2) El form SOLO guarda IDs
     */
    useEffect(() => {
        form.setValue(
            "images",
            images.map((i) => i.id) as any,
            { shouldDirty: true }
        );
    }, [images, form]);

    const addFiles = async (files: File[]) => {
        const toAdd = validateAndProcessFiles(files, images, { maxImages: MAX });
        if (!toAdd.length) return;

        // Insertamos en UI en modo "uploading"
        setImages((prev) => [
            ...prev,
            ...toAdd.map(({ imageId, previewUrl }) => ({
                id: imageId,
                previewUrl,
                isUploading: true,
                error: null,
            })),
        ]);

        // Subimos uno a uno (simple, estable, sin carreras raras)
        for (const item of toAdd) {
            try {
                await compositionRoot.mediaService.uploadImage(item.file, item.imageId);

                setImages((prev) =>
                    prev.map((img) =>
                        img.id === item.imageId
                            ? { ...img, isUploading: false, error: null }
                            : img
                    )
                );
            } catch (e) {
                setImages((prev) =>
                    prev.map((img) =>
                        img.id === item.imageId
                            ? { ...img, isUploading: false, error: "Error subiendo imagen" }
                            : img
                    )
                );
                toast.error("No se pudo subir una imagen.");
            }
        }
    };

    /**
     * ✅ 3) Borrar = DELETE al BE + quitar de UI
     */
    const removeImage = async (imageId: string) => {
        const current = images.find((i) => i.id === imageId);
        if (!current) return;

        // Optimista (pero seguro): quitamos primero de UI, y si falla lo reinsertamos
        setImages((prev) => prev.filter((i) => i.id !== imageId));

        try {
            await compositionRoot.mediaService.deleteImage(imageId);
        } catch (e) {
            toast.error("No se pudo eliminar la imagen.");
            setImages((prev) => [...prev, current]); // reinsert
        } finally {
            // Revocar previewUrl si existía
            if (current.previewUrl) {
                URL.revokeObjectURL(current.previewUrl);
            }
        }
    };

    return (
        <FormField
            control={form.control}
            name="images"
            render={() => (
                <FormItem>
                    <FormLabel>Imágenes (máx {MAX})</FormLabel>

                    <FormControl>
                        <div className="space-y-4">
                            <ImageDropZone
                                isDragging={drag}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDrag(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    setDrag(false);
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDrag(false);
                                    void addFiles(Array.from(e.dataTransfer.files));
                                }}
                                onFileChange={(e) => void addFiles(Array.from(e.target.files ?? []))}
                            />

                            <ImageGallery
                                images={images}
                                onRemoveImage={(id) => void removeImage(id)}
                                onSetPrimaryImage={() => {
                                    /* noop */
                                }}
                            />
                        </div>
                    </FormControl>
                </FormItem>
            )}
        />
    );
};

export default ProductImagesField;
