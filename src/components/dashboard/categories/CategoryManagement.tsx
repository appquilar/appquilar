
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';

import TableHeader from '../common/TableHeader';
import DataTable from '../common/DataTable';
import { Category } from '@/domain/models/Category';
import { CategoryService } from '@/application/services/CategoryService';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const CategoryManagement = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [parentCategoryFilter, setParentCategoryFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const categoryService = CategoryService.getInstance();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [searchQuery, parentCategoryFilter, categories]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const fetchedCategories = await categoryService.getAllCategories();
      setCategories(fetchedCategories);
      setFilteredCategories(fetchedCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Error al cargar las categorías");
    } finally {
      setIsLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = categories;
    
    // Filter by search query if present
    if (searchQuery.trim()) {
      filtered = filtered.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by parent category if selected
    if (parentCategoryFilter) {
      filtered = filtered.filter(category => 
        category.parentId === parentCategoryFilter
      );
    }
    
    setFilteredCategories(filtered);
  };

  const handleAddCategory = () => {
    navigate('/dashboard/categories/new');
  };

  const handleEditCategory = (categoryId: string) => {
    navigate(`/dashboard/categories/${categoryId}`);
  };

  const handleParentFilterChange = (value: string) => {
    setParentCategoryFilter(value === 'all' ? null : value);
  };

  const getParentCategoryName = (parentId: string | null) => {
    if (!parentId) return 'N/A';
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.name : 'Desconocido';
  };

  const parentCategories = categories.filter(cat => !cat.parentId);

  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'slug', header: 'Slug' },
    { 
      key: 'parentId', 
      header: 'Categoría Padre',
      cell: (category: Category) => getParentCategoryName(category.parentId)
    },
    { 
      key: 'iconUrl', 
      header: 'Icono',
      cell: (category: Category) => category.iconUrl ? (
        <img 
          src={category.iconUrl} 
          alt={`Icono de ${category.name}`} 
          className="w-8 h-8 object-cover rounded-md"
        />
      ) : 'Sin icono'
    }
  ];

  const actions = [
    {
      label: 'Editar',
      icon: <Edit size={16} />,
      onClick: (category: Category) => handleEditCategory(category.id)
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
    <div className="space-y-6 p-6">
      <TableHeader
        title="Gestión de Categorías"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddNew={handleAddCategory}
        onSearch={(e) => {
          e.preventDefault();
          filterCategories();
        }}
      />
      
      <div className="flex items-center gap-4 mb-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="parent-category-filter">Filtrar por categoría padre</Label>
          <Select 
            value={parentCategoryFilter || 'all'}
            onValueChange={handleParentFilterChange}
          >
            <SelectTrigger id="parent-category-filter" className="w-full">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {parentCategories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <DataTable
        data={filteredCategories}
        columns={columns}
        actions={actions}
        emptyMessage="No se encontraron categorías"
      />
    </div>
  );
};

export default CategoryManagement;
