
import { useState } from 'react';
import { toast } from 'sonner';
import { Product } from '@/components/products/ProductCard';

export function useProductOperations(initialProducts: Product[]) {
  const [products, setProducts] = useState(initialProducts);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const handleAddProduct = () => {
    // Create a new empty product template
    const newProduct: Product = {
      id: `new-${Date.now()}`,
      internalId: `PRD${(products.length + 1).toString().padStart(3, '0')}`,
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
    
    setSelectedProduct(newProduct);
    setIsAddDialogOpen(true);
  };
  
  const handleEditProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsEditDialogOpen(true);
    }
  };
  
  const handleSaveProduct = (updatedProduct: Partial<Product>) => {
    if (!selectedProduct) return;
    
    if (selectedProduct.id.startsWith('new-')) {
      // Add new product
      const fullProduct = { ...selectedProduct, ...updatedProduct, id: `${products.length + 1}` };
      setProducts(prevProducts => [...prevProducts, fullProduct as Product]);
      toast.success('Producto añadido correctamente');
    } else {
      // Update existing product
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === selectedProduct.id ? { ...p, ...updatedProduct } : p
        )
      );
      toast.success('Producto actualizado correctamente');
    }
    
    // Close the appropriate dialog
    setIsEditDialogOpen(false);
    setIsAddDialogOpen(false);
    setSelectedProduct(null);
  };
  
  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setIsAddDialogOpen(false);
    setSelectedProduct(null);
  };
  
  const handleDeleteProduct = (productId: string) => {
    // Eliminar el producto del estado
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    toast.success(`Producto eliminado correctamente`);
  };

  return {
    products,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectedProduct,
    handleAddProduct,
    handleEditProduct,
    handleSaveProduct,
    handleCancelEdit,
    handleDeleteProduct
  };
}
