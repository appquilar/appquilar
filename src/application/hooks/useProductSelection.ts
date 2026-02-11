import { useMemo, useState } from 'react';
import { Product } from '@/domain/models/Product';
import { UseFormReturn } from 'react-hook-form';
import { RentalFormValues } from '@/domain/models/RentalForm';
import { useCurrentUser } from './useCurrentUser';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/compositionRoot';

export const useProductSelection = (form: UseFormReturn<RentalFormValues>) => {
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user } = useCurrentUser();

  const ownerId = user?.companyId ?? user?.id ?? null;
  const ownerType: 'company' | 'user' = user?.companyId ? 'company' : 'user';

  const ownerProductsQuery = useQuery({
    queryKey: ['owner-products-selector', ownerId, ownerType],
    queryFn: async () => {
      if (!ownerId) {
        return [];
      }

      const response = await productService.listByOwnerPaginated(ownerId, ownerType, 1, 100, {
        publicationStatus: 'published',
      });

      return response.data;
    },
    enabled: Boolean(ownerId),
    placeholderData: (previousData) => previousData,
  });

  const filteredProducts = useMemo(() => {
    const products = ownerProductsQuery.data ?? [];
    const query = productSearch.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      const name = (product.name ?? '').toLowerCase();
      const id = (product.id ?? '').toLowerCase();
      const internalId = (product.internalId ?? '').toLowerCase();

      return name.includes(query) || id.includes(query) || internalId.includes(query);
    });
  }, [ownerProductsQuery.data, productSearch]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    form.setValue('productId', product.id, { shouldValidate: true, shouldDirty: true });
    setProductSearch('');
  };

  return {
    productSearch,
    setProductSearch,
    selectedProduct,
    filteredProducts,
    isLoading: ownerProductsQuery.isLoading,
    handleProductSelect
  };
};
