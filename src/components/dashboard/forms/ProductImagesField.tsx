import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ProductImagesFieldProps, ImageFile } from "./image-upload/types";
import ImageDropZone from "./image-upload/ImageDropZone";
import ImageGallery from "./image-upload/ImageGallery";
import { validateAndProcessFiles } from "./image-upload/imageUtils";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import { mediaService } from "@/compositionRoot";
import { toast } from "sonner";

const ProductImagesContent = ({
                                  field
                              }: {
    field: ControllerRenderProps<FieldValues, "images">
}) => {
    const [isDragging, setIsDragging] = useState(false);

    const images: ImageFile[] = Array.isArray(field.value) ? field.value : [];

    const handleFiles = async (files: File[]) => {
        // 1. Validate and create local objects with IDs
        const newImages = validateAndProcessFiles(files, images);

        if (newImages.length === 0) return;

        // 2. Optimistically update UI
        const updatedImages = [...images, ...newImages];
        field.onChange(updatedImages);

        // 3. Upload to Backend
        for (const img of newImages) {
            try {
                toast.info(`Subiendo ${img.file.name}...`);
                await mediaService.uploadImage(img.file, img.id);
                toast.success(`Imagen subida: ${img.file.name}`);
            } catch (error) {
                console.error("Upload error:", error);
                toast.error(`Error al subir ${img.file.name}`);

                // Revert this specific image on failure
                const current = field.value as ImageFile[] || [];
                field.onChange(current.filter(i => i.id !== img.id));
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            handleFiles(Array.from(files));
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const removeImage = async (id: string) => {
        const imageToRemove = images.find(img => img.id === id);
        if (!imageToRemove) return;

        // 1. Optimistically remove from UI
        const filteredImages = images.filter((image) => image.id !== id);
        field.onChange(filteredImages);

        // Revoke object URL
        if (imageToRemove.url.startsWith('blob:')) {
            URL.revokeObjectURL(imageToRemove.url);
        }

        // 2. Delete from Backend
        try {
            await mediaService.deleteImage(id);
            toast.success("Imagen eliminada");
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Error al eliminar la imagen del servidor");
            // Optionally re-add the image if delete fails?
            // Usually better to let it desync than show a deleted image.
        }
    };

    return (
        <FormItem className="space-y-3">
            <FormLabel>Imágenes del Producto</FormLabel>
            <p className="text-sm text-muted-foreground mb-2">
                Arrastra imágenes o haz clic para seleccionarlas. La primera imagen será la imagen principal.
            </p>
            <FormControl>
                <div className="space-y-4">
                    <ImageDropZone
                        isDragging={isDragging}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onFileChange={handleFileChange}
                    />
                    <ImageGallery
                        images={images}
                        onRemoveImage={removeImage}
                    />
                </div>
            </FormControl>
            <FormMessage />
        </FormItem>
    );
};

const ProductImagesField = ({ control }: ProductImagesFieldProps) => {
    return (
        <FormField
            control={control}
            name="images"
            render={({ field }) => (
                <ProductImagesContent field={field as any} />
            )}
        />
    );
};

export default ProductImagesField;