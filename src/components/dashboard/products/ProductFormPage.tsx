import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Product } from '@/domain/models/Product';
import ProductEditForm from '@/components/dashboard/ProductEditForm';
import { toast } from 'sonner';
import { productService } from '@/compositionRoot';
import { Uuid } from '@/domain/valueObject/uuidv4';
import { useCreateProduct, useUpdateProduct } from '@/application/hooks/useProducts';
import { useAuth } from '@/context/AuthContext';
import { hasMinimalAddress } from '@/domain/models/Address';

const ProductFormPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isAddMode = !productId || productId === 'new';
    const { currentUser } = useAuth();
    const canCreateProduct = hasMinimalAddress(currentUser?.address);

    // Usamos los hooks de mutación que gestionan la invalidación de caché
    const { mutateAsync: createProduct } = useCreateProduct();
    const { mutateAsync: updateProduct } = useUpdateProduct();

    useEffect(() => {
        const loadProduct = async () => {
            setIsLoading(true);
            try {
                if (isAddMode) {
                    // Create a new empty product template
                    const newProduct: Product = {
                        id: Uuid.generate().toString(),
                        internalId: '',
                        name: '',
                        slug: '',
                        description: '',
                        imageUrl: '',
                        thumbnailUrl: '',
                        publicationStatus: 'draft',
                        price: {
                            daily: 0,
                            deposit: 0,
                            tiers: []
                        },
                        isRentable: true,
                        isForSale: false,
                        company: { id: '', name: '', slug: '' },
                        category: { id: '', name: '', slug: '' },
                        rating: 0,
                        reviewCount: 0,
                        productType: 'rental'
                    };
                    setProduct(newProduct);
                } else {
                    // Find existing product
                    // Nota: Aquí usamos el servicio directamente para cargar los datos iniciales del formulario,
                    // lo cual es correcto. La invalidación importa al GUARDAR.
                    const foundProduct = await productService.getProductById(productId!);
                    if (foundProduct) {
                        const safeProduct: Product = {
                            ...foundProduct,
                            category: foundProduct.category || { id: '', name: '', slug: '' },
                            price: {
                                daily: foundProduct.price?.daily || 0,
                                deposit: foundProduct.price?.deposit || 0,
                                tiers: foundProduct.price?.tiers || []
                            },
                            productType: 'rental',
                            publicationStatus: foundProduct.publicationStatus || 'draft'
                        };
                        setProduct(safeProduct);
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
            if (isAddMode && !canCreateProduct) {
                toast.error('Debes añadir una dirección en tu perfil antes de crear productos.');
                return;
            }

            if (isAddMode) {
                // Al usar mutateAsync, se ejecutará el onSuccess del hook que hace invalidateQueries(['products'])
                await createProduct(updatedProduct as any);
                // El hook ya muestra el toast de éxito
            } else {
                await updateProduct({
                    id: productId as string,
                    data: updatedProduct as any
                });
                // El hook ya muestra el toast de éxito
            }

            navigate('/dashboard/products');
        } catch (error) {
            console.error("Error saving product:", error);
            // El hook ya muestra el toast de error, pero si fallara algo antes de la llamada:
            // toast.error(...)
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

            {isAddMode && !canCreateProduct && (
                <Alert variant="warning" className="mb-6">
                    <MapPin className="h-4 w-4" />
                    <AlertTitle>Necesitas una dirección para publicar productos</AlertTitle>
                    <AlertDescription>
                        Antes de crear un producto, debes completar tu dirección en el perfil.{' '}
                        <Link to="/dashboard/config?tab=address" className="underline font-medium">
                            Ir a Configuración de dirección
                        </Link>
                        .
                    </AlertDescription>
                </Alert>
            )}

            {product && (
                <ProductEditForm
                    product={product}
                    onSave={handleSaveProduct}
                    onCancel={handleCancel}
                    disableSubmit={isAddMode && !canCreateProduct}
                />
            )}
        </div>
    );
};

export default ProductFormPage;
