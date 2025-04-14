
import { useState, useEffect } from 'react';
import { Product, ProductFormData } from '@/domain/models/Product';
import { ProductService } from '@/application/services/ProductService';
import { toast } from 'sonner';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const productService = ProductService.getInstance();

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const allProducts = await productService.getAllProducts();
        setProducts(allProducts);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Error al cargar productos');
        toast.error('Error al cargar productos');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const getProductById = async (id: string) => {
    try {
      return await productService.getProductById(id);
    } catch (err) {
      console.error(`Error fetching product with ID ${id}:`, err);
      toast.error(`Error al obtener el producto con ID ${id}`);
      throw err;
    }
  };

  const createProduct = async (productData: ProductFormData) => {
    try {
      const newProduct = await productService.createProduct(productData);
      setProducts(prev => [...prev, newProduct]);
      toast.success('Producto creado exitosamente');
      return newProduct;
    } catch (err) {
      console.error('Error creating product:', err);
      toast.error('Error al crear el producto');
      throw err;
    }
  };

  const updateProduct = async (id: string, productData: ProductFormData) => {
    try {
      const updatedProduct = await productService.updateProduct(id, productData);
      setProducts(prev => prev.map(product => 
        product.id === id ? updatedProduct : product
      ));
      toast.success('Producto actualizado exitosamente');
      return updatedProduct;
    } catch (err) {
      console.error(`Error updating product with ID ${id}:`, err);
      toast.error('Error al actualizar el producto');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const success = await productService.deleteProduct(id);
      if (success) {
        setProducts(prev => prev.filter(product => product.id !== id));
        toast.success('Producto eliminado exitosamente');
      }
      return success;
    } catch (err) {
      console.error(`Error deleting product with ID ${id}:`, err);
      toast.error('Error al eliminar el producto');
      throw err;
    }
  };

  return {
    products,
    isLoading,
    error,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
  };
};
