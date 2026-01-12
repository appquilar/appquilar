// src/components/dashboard/forms/hooks/useProductForm.ts
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
    onSave: (product: any) => void;
    onCancel: () => void;
}

export const useProductForm = ({ product, onSave, onCancel }: UseProductFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formValues = mapProductToFormValues(product);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            ...formValues,
            productType: product.productType || (product.isRentable ? 'rental' : 'sale'),
            currentTab: 'basic',
            images: []
        },
        mode: 'onChange',
    });

    const onSubmit = async (values: ProductFormValues) => {
        setIsSubmitting(true);
        try {
            values.isRentable = values.productType === 'rental';
            values.isForSale = values.productType === 'sale';

            if (values.isForSale && (!values.secondHand || !values.secondHand.price)) {
                form.setError('secondHand.price', {
                    type: 'manual',
                    message: 'El precio de venta es obligatorio'
                });
                setIsSubmitting(false);
                return;
            }

            if (values.isRentable && !values.price.daily) {
                form.setError('price.daily', {
                    type: 'manual',
                    message: 'El precio diario es obligatorio'
                });
                setIsSubmitting(false);
                return;
            }

            const updatedProduct = mapFormValuesToProduct(values, product);

            // Prepare the data structure required by ProductService/Repository
            const productToSave = {
                ...updatedProduct,
                companyId: product.company?.id,
                categoryId: values.category.id,
                images: values.images,
                internalId: values.internalId
            };

            await onSave(productToSave);
            toast.success('Producto guardado correctamente');
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error('Error al guardar el producto');
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