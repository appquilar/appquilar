
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, Trash, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Company } from '@/domain/models/Company';
import { Product } from '@/components/products/ProductCard';
import { MOCK_COMPANIES } from './data/mockCompanies';
import { MOCK_PRODUCTS } from '../products/hooks/data/mockProducts';
import FormHeader from '../common/FormHeader';

const CompanyProductsPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!companyId) {
      navigate('/dashboard/companies');
      return;
    }

    setIsLoading(true);
    
    // Simulate API calls
    setTimeout(() => {
      const foundCompany = MOCK_COMPANIES.find(c => c.id === companyId);
      if (!foundCompany) {
        navigate('/dashboard/companies');
        return;
      }
      
      setCompany(foundCompany);
      // Filter products that belong to this company
      const companyProducts = MOCK_PRODUCTS.filter(product => product.company.id === companyId);
      setProducts(companyProducts);
      setIsLoading(false);
    }, 300);
  }, [companyId, navigate]);

  const handleEditProduct = (productId: string) => {
    navigate(`/dashboard/products/edit/${productId}`);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(product => product.id !== productId));
    toast.success('Producto eliminado correctamente');
  };

  const handleAddProduct = () => {
    navigate('/dashboard/products/new');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FormHeader
        title={`Productos de ${company?.name}`}
        backUrl="/dashboard/companies"
      />
      
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-lg font-medium">Listado de productos</h2>
        <Button onClick={handleAddProduct} className="gap-2 w-full sm:w-auto">
          <Plus size={16} />
          Añadir Producto
        </Button>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No se encontraron productos</h3>
          <p className="text-muted-foreground mb-6">
            Esta empresa aún no tiene productos registrados.
          </p>
          <Button onClick={handleAddProduct} className="gap-2">
            <Plus size={16} />
            Añadir Nuevo Producto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="border rounded-md overflow-hidden">
              <div className="aspect-[4/3] relative">
                <img 
                  src={product.thumbnailUrl || product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.internalId && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {product.internalId}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-1 truncate">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {product.category.name} • {product.price.daily}€/día
                </p>
                <p className="text-sm line-clamp-2 mb-4">{product.description}</p>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 w-full"
                    onClick={() => handleEditProduct(product.id)}
                  >
                    <Edit size={14} />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash size={14} />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyProductsPage;
