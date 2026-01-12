import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/domain/models/Product';
import ProductEditForm from '@/components/dashboard/ProductEditForm';
import { useProduct, useCreateProduct, useUpdateProduct } from '@/application/hooks/useProducts';

const ProductFormPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const isAddMode = !productId || productId === 'new';

    // Use React Query hooks
    const { data: fetchedProduct, isLoading: isLoadingProduct } = useProduct(productId);
    const { mutateAsync: createProduct } = useCreateProduct();
    const { mutateAsync: updateProduct } = useUpdateProduct();

    const [product, setProduct] = useState<Product | null>(null);

    useEffect(() => {
        if (isAddMode) {
            // Create a new empty product template
            const newProduct: Product = {
                id: `new-${Date.now()}`,
                internalId: '',
                name: '',
                slug: '',
                description: '',
                imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
                thumbnailUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
                price: {
                    daily: 0
                },
                isRentable: true,
                isForSale: false,
                company: {
                    id: '1',
                    name: 'Pro Tools Inc.',
                    slug: 'pro-tools-inc'
                },
                category: {
                    id: '1',
                    name: 'Herramientas Eléctricas',
                    slug: 'power-tools'
                },
                rating: 0,
                reviewCount: 0,
                productType: 'rental' as const
            };
            setProduct(newProduct);
        } else if (fetchedProduct) {
            // Logic to normalize fetched product
            const productType = fetchedProduct.isForSale ? 'sale' : 'rental';
            setProduct({
                ...fetchedProduct,
                productType: fetchedProduct.productType || productType
            } as Product);
        }
    }, [isAddMode, fetchedProduct]);

    const handleSaveProduct = async (updatedProduct: Partial<Product>) => {
        try {
            if (isAddMode) {
                await createProduct(updatedProduct as any);
            } else {
                await updateProduct({ id: productId as string, data: updatedProduct as any });
            }
            navigate('/dashboard/products');
        } catch (error) {
            // Toast is handled in the mutation hook
            console.error("Failed to save", error);
        }
    };

    const handleCancel = () => {
        navigate('/dashboard/products');
    };

    if (isLoadingProduct && !isAddMode) {
        return (
            <div className="p-6 flex justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // If editing but product not found
    if (!isAddMode && !isLoadingProduct && !fetchedProduct) {
        return (
            <div className="p-6">
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <h2 className="text-2xl font-bold mb-2">Producto no encontrado</h2>
                    <p className="text-muted-foreground mb-4">
                        El producto que estás buscando no existe o ha sido eliminado.
                    </p>
                    <Button onClick={() => navigate('/dashboard/products')}>
                        Volver a Productos
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate('/dashboard/products')}
                    className="h-9 w-9"
                >
                    <ArrowLeft size={18} />
                </Button>
                <h1 className="text-2xl font-bold">
                    {isAddMode ? 'Añadir Nuevo Producto' : 'Editar Producto'}
                </h1>
            </div>

            {product && (
                <ProductEditForm
                    product={product}
                    onSave={handleSaveProduct}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
};

export default ProductFormPage;