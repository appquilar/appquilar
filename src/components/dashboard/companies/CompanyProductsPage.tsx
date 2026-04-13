
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, Plus, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import FormHeader from '../common/FormHeader';
import DataTable from '@/components/dashboard/common/DataTable';
import { useCompanyProfile } from '@/application/hooks/useCompanyProfile';
import { useDashboardProducts, useDeleteProduct } from '@/application/hooks/useProducts';
import type { Product } from '@/domain/models/Product';

const CompanyProductsPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const profileQuery = useCompanyProfile(companyId);
  const productsQuery = useDashboardProducts({
    ownerId: companyId,
    ownerType: 'company',
    page: 1,
    perPage: 50,
    enabled: Boolean(companyId),
  });
  const deleteProduct = useDeleteProduct();

  if (!companyId) {
    navigate('/dashboard/companies');
    return null;
  }

  const products = productsQuery.data?.data ?? [];
  const isLoading = profileQuery.isLoading || productsQuery.isLoading;

  const handleEditProduct = (productId: string) => {
    navigate(`/dashboard/products/${productId}/edit`);
  };

  const getDailyPrice = (product: Product): number => {
    const tierPrice = product.price.tiers?.[0]?.pricePerDay;
    return typeof tierPrice === 'number' ? tierPrice : Number(product.price.daily ?? 0);
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProduct.mutateAsync(productId);
  };

  const handleAddProduct = () => {
    navigate('/dashboard/products/new');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FormHeader
        title={`Productos de ${profileQuery.data?.name ?? 'la empresa'}`}
        backUrl="/dashboard/companies"
      />
      
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-lg font-medium">Listado de productos</h2>
        <Button onClick={handleAddProduct} className="gap-2 w-full sm:w-auto">
          <Plus size={16} />
          Añadir Producto
        </Button>
      </div>
      
      <DataTable<Product>
        data={products}
        columns={[
          {
            key: 'name',
            header: 'Nombre',
            cell: (product) => (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-muted overflow-hidden">
                  {(product.thumbnailUrl || product.imageUrl) && (
                    <img
                      src={product.thumbnailUrl || product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{product.internalId || 'Sin referencia'}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'category',
            header: 'Categoría',
            cell: (product) => product.category.name || '—',
          },
          {
            key: 'price',
            header: 'Precio base',
            cell: (product) => `${getDailyPrice(product).toFixed(2)} €/día`,
          },
        ]}
        actions={[
          {
            label: 'Editar',
            icon: <Edit size={16} />,
            onClick: (product) => handleEditProduct(product.id),
          },
          {
            label: 'Archivar',
            icon: <Trash size={16} />,
            onClick: (product) => {
              void handleDeleteProduct(product.id);
            },
          },
        ]}
        emptyMessage="Esta empresa aún no tiene productos registrados"
      />
    </div>
  );
};

export default CompanyProductsPage;
