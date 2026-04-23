import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from '@/components/ui/form';
import { Product } from '@/domain/models/Product';
import ProductBasicInfoFields from './ProductBasicInfoFields';
import ProductPriceFields from './ProductPriceFields';
import ProductImagesField from './ProductImagesField';
import ProductFormActions from './ProductFormActions';
import ProductInventoryFields from './ProductInventoryFields';
import ProductDynamicPropertiesFields from './ProductDynamicPropertiesFields';
import { useProductForm } from './hooks/useProductForm';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ProductFormTab = 'general' | 'inventory';

const COMPANY_UPGRADE_TAB_VALUE = 'inventory-upgrade';

interface ProductFormProps {
    product: Product;
    onSave: (product: Partial<Product>) => Promise<void> | void;
    onCancel: () => void;
    disableSubmit?: boolean;
    inventoryOwnerType: 'company' | 'user';
    enableInventoryQuery?: boolean;
}

const ProductForm = ({
    product,
    onSave,
    onCancel,
    disableSubmit = false,
    inventoryOwnerType,
    enableInventoryQuery = true,
}: ProductFormProps) => {
    const navigate = useNavigate();
    const canManageInventory = inventoryOwnerType === 'company';
    const {
        form,
        isSubmitting,
        dynamicPropertyDefinitions,
        isDynamicPropertiesLoading,
        areDynamicPropertiesEnabled,
        onSubmit,
    } = useProductForm({
        product,
        onSave,
        onCancel
    });
    const [activeTab, setActiveTab] = useState<ProductFormTab>(
        canManageInventory && form.getValues('currentTab') === 'inventory' ? 'inventory' : 'general'
    );

    // Force product type to rental on mount
    useEffect(() => {
        form.setValue('productType', 'rental');
        form.setValue('isRentalEnabled', true);
        form.setValue('isRentable', true);
        form.setValue('isForSale', false);
    }, [form]);

    useEffect(() => {
        if (canManageInventory) {
            return;
        }

        if (activeTab !== 'general') {
            setActiveTab('general');
        }

        form.setValue('currentTab', 'general', { shouldDirty: false });
    }, [activeTab, canManageInventory, form]);

    const handleTabChange = (value: string) => {
        if (!canManageInventory && value === COMPANY_UPGRADE_TAB_VALUE) {
            navigate('/dashboard/upgrade');
            return;
        }

        if (!canManageInventory && value === 'inventory') {
            return;
        }

        const nextTab: ProductFormTab = value === 'inventory' ? 'inventory' : 'general';
        setActiveTab(nextTab);
        form.setValue('currentTab', nextTab, { shouldDirty: false });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {form.formState.errors.root?.server?.message && (
                    <Alert variant="destructive">
                        <AlertDescription>{form.formState.errors.root.server.message}</AlertDescription>
                    </Alert>
                )}

                <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                    <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl border border-border bg-muted/40 p-2 sm:w-fit">
                        <TabsTrigger value="general" className="rounded-xl px-4 py-2">
                            General
                        </TabsTrigger>
                        {canManageInventory ? (
                            <TabsTrigger value="inventory" className="rounded-xl px-4 py-2">
                                Inventario
                            </TabsTrigger>
                        ) : (
                            <TabsTrigger
                                value={COMPANY_UPGRADE_TAB_VALUE}
                                aria-label="Inventario"
                                className="h-auto rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-left text-orange-700 hover:bg-orange-100 hover:text-orange-800 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800 data-[state=active]:shadow-sm"
                            >
                                <span className="flex flex-col items-start gap-0.5">
                                    <span>Inventario</span>
                                    <span className="text-xs font-normal leading-tight text-orange-600">
                                        Inventario sólo disponible en plan de Empresa
                                    </span>
                                </span>
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="general" className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Información Básica</h3>
                            <ProductBasicInfoFields control={form.control} />
                        </div>

                        {(areDynamicPropertiesEnabled || isDynamicPropertiesLoading) && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Propiedades de la categoría</h3>
                                    <ProductDynamicPropertiesFields
                                        control={form.control}
                                        definitions={dynamicPropertyDefinitions}
                                        isLoading={isDynamicPropertiesLoading}
                                        enabled={areDynamicPropertiesEnabled}
                                    />
                                </div>
                            </>
                        )}

                        <Separator />
                        <div className="space-y-4">
                            <ProductImagesField control={form.control} />
                        </div>

                        <Separator />
                        <div className="space-y-4">
                            <ProductPriceFields control={form.control} />
                        </div>
                    </TabsContent>

                    {canManageInventory && (
                        <TabsContent value="inventory" className="space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-lg font-medium">Inventario</h3>
                                <p className="text-sm text-muted-foreground">
                                    Esta pestaña carga la capacidad, las unidades y la agenda solo cuando la abres.
                                </p>
                            </div>

                            <ProductInventoryFields
                                control={form.control}
                                productId={product.id}
                                ownerType={inventoryOwnerType}
                                enableInventoryQuery={enableInventoryQuery && activeTab === 'inventory'}
                            />
                        </TabsContent>
                    )}
                </Tabs>

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
