import { useEffect, useMemo, useState } from 'react';
import { DefaultValues, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Product } from '@/domain/models/Product';
import { mediaService } from '@/compositionRoot';
import { ApiError } from '@/infrastructure/http/ApiClient';
import { useCategoryDynamicProperties } from '@/application/hooks/useCategoryDynamicProperties';
import {
    pruneDynamicProperties,
    sanitizeDynamicProperties,
    validateDynamicProperties,
} from '@/domain/services/DynamicPropertyService';
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
        currentTab: 'general',
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

    const selectedCategoryId = form.watch('category.id') ?? undefined;
    const dynamicPropertiesQuery = useCategoryDynamicProperties(
        selectedCategoryId ? [selectedCategoryId] : []
    );

    const dynamicPropertyDefinitions = useMemo(
        () => dynamicPropertiesQuery.data?.definitions ?? [],
        [dynamicPropertiesQuery.data?.definitions]
    );

    useEffect(() => {
        const currentDynamicProperties = form.getValues('dynamicProperties') ?? {};

        if (!selectedCategoryId) {
            if (Object.keys(currentDynamicProperties).length > 0) {
                form.setValue('dynamicProperties', {}, { shouldDirty: true });
            }
            return;
        }

        if (!dynamicPropertiesQuery.data) {
            return;
        }

        if (!dynamicPropertiesQuery.data.dynamicFiltersEnabled) {
            if (Object.keys(currentDynamicProperties).length > 0) {
                form.setValue('dynamicProperties', {}, { shouldDirty: true });
            }
            return;
        }

        const prunedDynamicProperties = pruneDynamicProperties(currentDynamicProperties, dynamicPropertyDefinitions);
        if (JSON.stringify(prunedDynamicProperties) !== JSON.stringify(currentDynamicProperties)) {
            form.setValue('dynamicProperties', prunedDynamicProperties, { shouldDirty: true });
        }
    }, [dynamicPropertyDefinitions, dynamicPropertiesQuery.data?.dynamicFiltersEnabled, form, selectedCategoryId]);

    const onSubmit = async (values: ProductFormSubmitValues) => {
        setIsSubmitting(true);
        form.clearErrors("root");
        form.clearErrors("dynamicProperties");
        try {
            values.isRentalEnabled = true;
            values.isRentable = true;
            values.isForSale = false;
            values.productType = 'rental';

            const dynamicPropertyErrors = validateDynamicProperties(
                values.dynamicProperties ?? {},
                dynamicPropertyDefinitions
            );

            if (Object.keys(dynamicPropertyErrors).length > 0) {
                Object.entries(dynamicPropertyErrors).forEach(([code, message]) => {
                    form.setError(`dynamicProperties.${code}` as never, {
                        type: 'manual',
                        message,
                    });
                });

                return;
            }

            const processedImages: { id: string }[] = [];

            if (values.images && values.images.length > 0) {
                for (const img of values.images) {
                    if (img.file instanceof File) {
                        try {
                            const newImageId = await mediaService.uploadImage(img.file);
                            processedImages.push({ id: newImageId });
                        } catch (err) {
                            console.error("Failed to upload image fallback", img.file?.name, err);
                        }
                    } else if (img.id) {
                        processedImages.push({ id: img.id });
                    }
                }
            }

            const updatedProduct: ProductSavePayload = mapFormValuesToProduct(values, product);
            updatedProduct.images = processedImages;
            updatedProduct.image_ids = processedImages.map((image) => image.id);
            updatedProduct.dynamicProperties = sanitizeDynamicProperties(
                values.dynamicProperties ?? {},
                dynamicPropertyDefinitions
            );

            if (processedImages.length > 0) {
                const firstId = processedImages[0].id;
                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
                updatedProduct.imageUrl = `${baseUrl}/api/media/images/${firstId}/MEDIUM`;
                updatedProduct.thumbnailUrl = `${baseUrl}/api/media/images/${firstId}/THUMBNAIL`;
            }

            await onSave(updatedProduct);
        } catch (error) {
            console.error('Error updating product:', error);

            if (error instanceof ApiError && error.payload?.errors) {
                let hasFieldErrors = false;

                Object.entries(error.payload.errors).forEach(([fieldPath, messages]) => {
                    const firstMessage = Array.isArray(messages) ? messages[0] : undefined;
                    if (!firstMessage) {
                        return;
                    }

                    const normalizedFieldPath = fieldPath
                        .replace(/\[(.+?)\]/g, '.$1')
                        .replace(/^\./, '');

                    form.setError(normalizedFieldPath as never, {
                        type: 'server',
                        message: firstMessage,
                    });
                    hasFieldErrors = true;
                });

                if (hasFieldErrors) {
                    return;
                }
            }

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
        dynamicPropertyDefinitions,
        isDynamicPropertiesLoading: dynamicPropertiesQuery.isLoading || dynamicPropertiesQuery.isFetching,
        areDynamicPropertiesEnabled: Boolean(dynamicPropertiesQuery.data?.dynamicFiltersEnabled),
        onSubmit,
        onCancel
    };
};
