import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Product } from '@/domain/models/Product';
import { mediaService } from '@/compositionRoot';
import { Uuid } from '@/domain/valueObject/uuidv4';
import {
    ProductFormValues,
    productFormSchema,
    mapProductToFormValues,
    mapFormValuesToProduct
} from '../productFormSchema';

interface UseProductFormProps {
    product: Product;
    onSave: (product: Partial<Product>) => Promise<void> | void;
    onCancel: () => void;
}

export const useProductForm = ({ product, onSave, onCancel }: UseProductFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formValues = mapProductToFormValues(product);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            ...formValues,
            // IMPORTANTE: No sobreescribir 'images' aquí con [], usar el valor de formValues
            productType: 'rental',
            currentTab: 'basic',
        },
        mode: 'onChange',
    });

    const onSubmit = async (values: ProductFormValues) => {
        setIsSubmitting(true);
        try {
            // Force Rental logic
            values.isRentable = true;
            values.isForSale = false;
            values.productType = 'rental';

            // 1. Handle Image Uploads with FE-generated UUIDs
            const processedImages: { id: string }[] = [];

            if (values.images && values.images.length > 0) {
                for (const img of values.images) {
                    // Si tiene propiedad 'file', es nueva y necesita subirse (aunque ya se suben en el componente, esto es un fallback/check)
                    // El componente ProductImagesField ya gestiona la subida inmediata, así que aquí
                    // principalmente necesitamos recopilar los IDs.

                    if (img.id) {
                        // Si ya tiene ID (sea existente o recién subida por el componente), la incluimos
                        processedImages.push({ id: img.id });
                    } else if (img.file instanceof File) {
                        // Fallback por si la subida automática falló o no se usó
                        try {
                            const newImageId = Uuid.generate().toString();
                            await mediaService.uploadImage(img.file, newImageId);
                            processedImages.push({ id: newImageId });
                        } catch (err) {
                            console.error("Failed to upload image fallback", img.file?.name, err);
                            // Podríamos lanzar error, pero mejor intentar guardar el resto
                        }
                    }
                }
            }

            // 2. Prepare Final DTO
            const updatedProduct = mapFormValuesToProduct(values, product);

            // Asignar los IDs de imágenes procesadas al DTO
            (updatedProduct as any).images = processedImages;

            // Actualizar URLs de vista previa para feedback inmediato
            if (processedImages.length > 0) {
                const firstId = processedImages[0].id;
                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
                updatedProduct.imageUrl = `${baseUrl}/api/media/images/${firstId}/MEDIUM`;
                updatedProduct.thumbnailUrl = `${baseUrl}/api/media/images/${firstId}/THUMBNAIL`;
            }

            await onSave(updatedProduct);

        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('Error al actualizar el producto');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        form,
        isSubmitting,
        onSubmit,
        onCancel
    };
};