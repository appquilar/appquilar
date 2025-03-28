
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Product } from '@/components/products/ProductCard';
import { testSupabaseConnection } from '@/integrations/supabase/client';

export function useProductOperations(initialProducts: Product[]) {
  const [products, setProducts] = useState(initialProducts);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean;
    message?: string;
  } | null>(null);
  
  useEffect(() => {
    const checkConnection = async () => {
      setIsCheckingConnection(true);
      try {
        const result = await testSupabaseConnection();
        setConnectionStatus(result);
        
        if (!result.success) {
          console.warn(`Database connection issue: ${result.message}`);
          // Don't show toast for connection error since we're using mock data anyway
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      } finally {
        setIsCheckingConnection(false);
      }
    };
    
    checkConnection();
  }, []);
  
  const handleDeleteProduct = (productId: string) => {
    // Eliminar el producto del estado
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    toast.success(`Producto eliminado correctamente`);
  };

  return {
    products,
    handleDeleteProduct,
    isCheckingConnection,
    connectionStatus
  };
}
