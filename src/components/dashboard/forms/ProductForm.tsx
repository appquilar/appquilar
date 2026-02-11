import React, { useEffect } from 'react';
import { Form } from '@/components/ui/form';
import { Product } from '@/domain/models/Product';
import ProductBasicInfoFields from './ProductBasicInfoFields';
import ProductPriceFields from './ProductPriceFields';
import ProductImagesField from './ProductImagesField';
import ProductFormActions from './ProductFormActions';
import { useProductForm } from './hooks/useProductForm';
import { Separator } from '@/components/ui/separator';

interface ProductFormProps {
    product: Product;
    onSave: (product: Partial<Product>) => Promise<void> | void;
    onCancel: () => void;
    disableSubmit?: boolean;
}

const ProductForm = ({ product, onSave, onCancel, disableSubmit = false }: ProductFormProps) => {
    const { form, isSubmitting, onSubmit } = useProductForm({
        product,
        onSave,
        onCancel
    });

    // Force product type to rental on mount
    useEffect(() => {
        form.setValue('productType', 'rental');
        form.setValue('isRentable', true);
        form.setValue('isForSale', false);
    }, [form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Basic Information Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Información Básica</h3>
                    <ProductBasicInfoFields control={form.control} />
                </div>

                <Separator />

                {/* Images Section */}
                <div className="space-y-4">
                    <ProductImagesField control={form.control} />
                </div>

                <Separator />

                {/* Pricing Section - Always visible as we are rental-only now */}
                <div className="space-y-4">
                    <ProductPriceFields control={form.control} />
                </div>

                <ProductFormActions
                    isSubmitting={isSubmitting}
                    isSubmitDisabled={disableSubmit}
                    onCancel={onCancel}
                />
            </form>
        </Form>
    );
};

export default ProductForm;
