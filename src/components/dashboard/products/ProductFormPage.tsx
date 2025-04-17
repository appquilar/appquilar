
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/domain/models/Product';
import ProductEditForm from '@/components/dashboard/ProductEditForm';
import { toast } from 'sonner';
import { ProductService } from '@/application/services/ProductService';

const ProductFormPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAddMode = !productId || productId === 'new';
  const productService = ProductService.getInstance();

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      try {
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
            isAlwaysAvailable: true,
            productType: 'rental' as const // Specify the type literal
          };
          setProduct(newProduct);
        } else {
          // Find existing product
          const foundProduct = await productService.getProductById(productId);
          if (foundProduct) {
            // Determine the product type based on isRentable and isForSale flags
            const productType = foundProduct.isForSale ? 'sale' : 'rental';
            
            // Add productType to match our UI with the correct type
            const enhancedProduct = {
              ...foundProduct,
              productType: productType as 'rental' | 'sale'
            };
            setProduct(enhancedProduct);
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
  }, [productId, isAddMode, productService]);

  const handleSaveProduct = async (updatedProduct: Partial<Product>) => {
    try {
      if (isAddMode) {
        // Create new product
        await productService.createProduct(updatedProduct as any);
        toast.success('Producto añadido correctamente');
      } else {
        // Update existing product
        await productService.updateProduct(productId as string, updatedProduct as any);
        toast.success('Producto actualizado correctamente');
      }
      
      // Navigate back to the products list
      navigate('/dashboard/products');
    } catch (error) {
      console.error("Error saving product:", error);
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

  // When in add mode, always show the form even if product is null
  if (!product && !isAddMode) {
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
