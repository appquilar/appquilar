import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/domain/models/Product';
import ProductEditForm from '@/components/dashboard/ProductEditForm';
import { toast } from 'sonner';
import { productService } from '@/compositionRoot';
import { Uuid } from '@/domain/valueObject/uuidv4';

const ProductFormPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isAddMode = !productId || productId === 'new';

    useEffect(() => {
        const loadProduct = async () => {
            setIsLoading(true);
            try {
                if (isAddMode) {
                    // Create new product with a valid UUIDv4 from the start
                    const newProduct: Product = {
                        id: Uuid.generate().toString(),
                        internalId: '',
                        name: '',
                        slug: '',
                        description: '',
                        imageUrl: '',
                        thumbnailUrl: '',
                        price: {
                            daily: 0
                        },
                        isRentable: true,
                        isForSale: false,
                        company: {
                            id: '',
                            name: '',
                            slug: ''
                        },
                        category: {
                            id: '',
                            name: '',
                            slug: ''
                        },
                        rating: 0,
                        reviewCount: 0,
                        productType: 'rental'
                    };
                    setProduct(newProduct);
                } else {
                    const foundProduct = await productService.getProductById(productId);
                    if (foundProduct) {
                        setProduct({
                            ...foundProduct,
                            productType: 'rental' // Force rental type for the UI
                        });
                    }
                }
            } catch (error) {
                console.error("Error loading product:", error);
                toast.error("Error al cargar el producto");
            } finally {
                setIsLoading(false);
            }
        };

        loadProduct();
    }, [productId, isAddMode]);

    const handleSaveProduct = async (updatedProduct: Partial<Product>) => {
        try {
            if (isAddMode) {
                await productService.createProduct(updatedProduct as any);
                toast.success('Producto añadido correctamente');
            } else {
                await productService.updateProduct(productId as string, updatedProduct as any);
                toast.success('Producto actualizado correctamente');
            }

            navigate('/dashboard/products');
        } catch (error) {
            console.error("Error saving product:", error);
            // Detailed error is usually logged by repo/client, toast generic here
            toast.error(isAddMode ? 'Error al añadir el producto' : 'Error al actualizar el producto');
        }
    };

    const handleCancel = () => {
        navigate('/dashboard/products');
    };

    if (isLoading) {
        return (
            <div className="p-6 flex justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product && !isAddMode) {
        return (
            <div className="p-6">
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <h2 className="text-2xl font-bold mb-2">Producto no encontrado</h2>
                    <Button onClick={() => navigate('/dashboard/products')}>Volver</Button>
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