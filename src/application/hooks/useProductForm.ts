import { useState } from 'react';
import { DefaultValues, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Product } from '@/domain/models/Product';
import { mediaService } from '@/compositionRoot';
import { Uuid } from '@/domain/valueObject/uuidv4';
import {
    ProductFormValues,
    ProductFormSubmitValues,
    productFormSchema,
    mapProductToFormValues,
    mapFormValuesToProduct,
    createEmptyPriceTier,
} from '@/components/dashboard/forms/productFormSchema';

type ProductSavePayload = Partial<Product> & {
    images?: Array<{ id: string }>;
};

interface UseProductFormProps {
    product: Product;
    onSave: (product: Partial<Product>) => Promise<void> | void;
    onCancel: () => void;
}

export const useProductForm = ({ product, onSave, onCancel }: UseProductFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formValues = mapProductToFormValues(product);
    const isNewDraftProduct =
        !product.createdAt &&
        !product.updatedAt &&
        !product.internalId &&
        !product.name &&
        !product.slug &&
        !product.description;

    const defaultValues: DefaultValues<ProductFormValues> = {
        ...formValues,
        productType: 'rental',
        currentTab: 'basic',
        price: {
            ...formValues.price,
            deposit: isNewDraftProduct ? '' : formValues.price.deposit,
            tiers: formValues.price.tiers.length > 0 ? formValues.price.tiers : [createEmptyPriceTier()],
        },
    };

    const form = useForm<ProductFormValues, undefined, ProductFormSubmitValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues,
        mode: 'onChange',
    });

    const onSubmit = async (values: ProductFormSubmitValues) => {
        setIsSubmitting(true);
        form.clearErrors("root");
        try {
            values.isRentable = values.isRentalEnabled;
            values.isForSale = false;
            values.productType = 'rental';

            const processedImages: { id: string }[] = [];

            if (values.images && values.images.length > 0) {
                for (const img of values.images) {
                    if (img.id) {
                        processedImages.push({ id: img.id });
                    } else if (img.file instanceof File) {
                        try {
                            const newImageId = Uuid.generate().toString();
                            await mediaService.uploadImage(img.file, newImageId);
                            processedImages.push({ id: newImageId });
                        } catch (err) {
                            console.error("Failed to upload image fallback", img.file?.name, err);
                        }
                    }
                }
            }

            const updatedProduct: ProductSavePayload = mapFormValuesToProduct(values, product);
            updatedProduct.images = processedImages;

            if (processedImages.length > 0) {
                const firstId = processedImages[0].id;
                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
                updatedProduct.imageUrl = `${baseUrl}/api/media/images/${firstId}/MEDIUM`;
                updatedProduct.thumbnailUrl = `${baseUrl}/api/media/images/${firstId}/THUMBNAIL`;
            }

            await onSave(updatedProduct);
        } catch (error) {
            console.error('Error updating product:', error);
            form.setError("root.server", {
                type: "server",
                message: "No se pudo guardar el producto. Revisa los datos e inténtalo de nuevo.",
            });
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
