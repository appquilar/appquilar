
import { useEffect, useState } from 'react';
import { Category } from '@/domain/models/Category';
import { CategoryService } from '@/application/services/CategoryService';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const categoryService = CategoryService.getInstance();

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const allCategories = await categoryService.getAllCategories();
        setCategories(allCategories);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Error al cargar categorías');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  return {
    categories,
    isLoading,
    error
  };
};
