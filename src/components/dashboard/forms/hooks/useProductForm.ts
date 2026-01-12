import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Product } from '@/domain/models/Product';
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
            productType: 'rental', // Force default
            currentTab: 'basic',
            images: []
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

            // Basic validation for rental price presence
            // Note: Tiers are the main pricing model, but if price.daily is 0 and no tiers, warning?
            // For now, relying on Schema validation.

            // Prepare Final DTO
            const updatedProduct = mapFormValuesToProduct(values, product);

            // Map images to the format expected by the backend
            const processedImages = values.images?.map((img: any) => ({ id: img.id })) || [];

            // Update DTO with image list
            (updatedProduct as any).images = processedImages;

            // UI Update for main image
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