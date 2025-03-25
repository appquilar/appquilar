
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Product } from '@/components/products/ProductCard';
import { supabase, testSupabaseConnection } from '@/integrations/supabase/client';

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
      const result = await testSupabaseConnection();
      setConnectionStatus(result);
      
      if (!result.success) {
        toast.error(`Error connecting to database: ${result.message}`);
      } else {
        toast.success('Connected to database successfully');
      }
      
      setIsCheckingConnection(false);
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
