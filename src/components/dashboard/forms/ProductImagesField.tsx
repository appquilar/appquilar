import React, { useEffect, useRef, useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ProductImagesFieldProps, ImageFile } from "./image-upload/types";
import ImageDropZone from "./image-upload/ImageDropZone";
import ImageGallery from "./image-upload/ImageGallery";
import { validateAndProcessFiles } from "./image-upload/imageUtils";
import { ControllerRenderProps } from "react-hook-form";
import { toast } from "sonner";
import { useMediaActions } from "@/application/hooks/useMediaActions";
import type { ProductFormValues } from "./productFormSchema";

const ProductImagesContent = ({
    field
                              }: {
    field: ControllerRenderProps<ProductFormValues, "images">
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const { deleteImage, uploadImage } = useMediaActions();

    const images: ImageFile[] = Array.isArray(field.value)
        ? field.value.filter(
            (image): image is ImageFile =>
                typeof image?.id === "string" && typeof image?.url === "string"
        )
        : [];
    const initialImageIdsRef = useRef(new Set(images.map((image) => image.id)));
    const currentImagesRef = useRef(images);
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    useEffect(() => {
        currentImagesRef.current = images;
    }, [images]);

    const commitImages = (nextImages: ImageFile[]) => {
        currentImagesRef.current = nextImages;
        field.onChange(nextImages);
    };

    const handleFiles = async (files: File[]) => {
        const newImages = validateAndProcessFiles(files, currentImagesRef.current);

        if (newImages.length === 0) return;

        commitImages([...currentImagesRef.current, ...newImages]);

        for (const img of newImages) {
            try {
                toast.info(`Subiendo ${img.file.name}...`);
                const uploadedImageId = await uploadImage(img.file);
                commitImages(
                    currentImagesRef.current.map((image) =>
                        image.id === img.id
                            ? {
                                id: uploadedImageId,
                                url: `${baseUrl}/api/media/images/${uploadedImageId}/MEDIUM`,
                            }
                            : image
                    )
                );
                if (img.url.startsWith("blob:")) {
                    URL.revokeObjectURL(img.url);
                }
                toast.success(`Imagen subida: ${img.file.name}`);
            } catch (error) {
                console.error("Upload error:", error);
                toast.error(`Error al subir ${img.file.name}`);

                commitImages(currentImagesRef.current.filter((image) => image.id !== img.id));
                URL.revokeObjectURL(img.url);
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
        const currentImages = currentImagesRef.current;
        const imageToRemove = currentImages.find(img => img.id === id);
        if (!imageToRemove) return;

        const filteredImages = currentImages.filter((image) => image.id !== id);
        commitImages(filteredImages);

        if (imageToRemove.url.startsWith('blob:')) {
            URL.revokeObjectURL(imageToRemove.url);
        }

        if (initialImageIdsRef.current.has(id)) {
            toast.success("Imagen quitada del formulario");
            return;
        }

        try {
            await deleteImage(id);
            toast.success("Imagen eliminada");
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("La imagen se quitó del formulario, pero no se pudo limpiar en el servidor");
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
                <ProductImagesContent field={field} />
            )}
        />
    );
};

export default ProductImagesField;
