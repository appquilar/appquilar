
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import FormHeader from '../common/FormHeader';
import { Product } from '@/domain/models/Product';
import { User } from '@/domain/models/User.ts';
import { ProductService } from '@/application/services/ProductService';
import { UserService } from '@/application/services/UserService';
import DataTable from '../common/DataTable';
import { Edit, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UserProductsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const productService = ProductService.getInstance();
  const userService = UserService.getInstance();

  useEffect(() => {
    if (!userId) {
      navigate('/dashboard/users');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const userData = await userService.getUserById(userId);
        if (!userData) {
          toast.error('Usuario no encontrado');
          navigate('/dashboard/users');
          return;
        }
        setUser(userData);
        
        // Get all products and filter by user's company
        if (userData.companyId) {
          const userProducts = await productService.getProductsByCompanyId(userData.companyId);
          setProducts(userProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error loading user products:', error);
        toast.error('Error al cargar los productos del usuario');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId, navigate]);

  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      cell: (product: Product) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-muted overflow-hidden">
            <img 
              src={product.thumbnailUrl || product.imageUrl} 
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="font-medium">{product.name}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoría',
      cell: (product: Product) => product.category.name
    },
    {
      key: 'price',
      header: 'Precio por día',
      cell: (product: Product) => `${product.price.daily.toFixed(2)} €`
    },
    {
      key: 'isRentable',
      header: 'Disponible',
      cell: (product: Product) => (
        <span className={`inline-block px-2 py-1 text-xs rounded-full ${product.isRentable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {product.isRentable ? 'Disponible' : 'No disponible'}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'Editar',
      icon: <Edit size={16} />,
      onClick: (product: Product) => navigate(`/dashboard/products/${product.id}`)
    },
    {
      label: 'Eliminar',
      icon: <Trash size={16} />,
      onClick: (product: Product) => {
        if (confirm(`¿Estás seguro que deseas eliminar el producto: ${product.name}?`)) {
          productService.deleteProduct(product.id)
            .then(() => {
              setProducts(prevProducts => prevProducts.filter(p => p.id !== product.id));
              toast.success('Producto eliminado correctamente');
            })
            .catch(() => {
              toast.error('Error al eliminar el producto');
            });
        }
      }
    }
  ];

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <FormHeader
        title={`Productos de ${user?.name || user?.email || 'Usuario'}`}
        backUrl="/dashboard/users"
      />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Lista de productos</h2>
        <Button onClick={() => navigate('/dashboard/products/new')} className="gap-2">
          <Plus size={16} />
          Nuevo Producto
        </Button>
      </div>
      
      <DataTable 
        data={products} 
        columns={columns} 
        actions={actions} 
        emptyMessage="Este usuario no tiene productos registrados"
      />
    </div>
  );
};

export default UserProductsPage;
