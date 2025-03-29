
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/components/products/ProductCard';
import ProductEditForm from '@/components/dashboard/ProductEditForm';
import { toast } from 'sonner';
import { MOCK_PRODUCTS } from './hooks/data/mockProducts';

const ProductFormPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAddMode = !productId || productId === 'new';

  useEffect(() => {
    // Simulate API call to fetch product data or create new product template
    setIsLoading(true);
    setTimeout(() => {
      if (isAddMode) {
        // Create a new empty product template
        const newProduct: Product = {
          id: `new-${Date.now()}`,
          internalId: `PRD${(MOCK_PRODUCTS.length + 1).toString().padStart(3, '0')}`,
          name: '',
          slug: '',
          description: '',
          imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
          thumbnailUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
          price: {
            daily: 0,
            weekly: 0,
            monthly: 0
          },
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
          reviewCount: 0
        };
        setProduct(newProduct);
      } else {
        // Find existing product
        const foundProduct = MOCK_PRODUCTS.find(p => p.id === productId);
        setProduct(foundProduct || null);
      }
      setIsLoading(false);
    }, 300);
  }, [productId, isAddMode]);

  const handleSaveProduct = (updatedProduct: Partial<Product>) => {
    // In a real app, this would send the updated product to the API
    console.log('Saving product:', updatedProduct);
    
    toast.success(isAddMode 
      ? 'Producto añadido correctamente' 
      : 'Producto actualizado correctamente'
    );
    
    // Navigate back to the products list
    navigate('/dashboard/products');
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
