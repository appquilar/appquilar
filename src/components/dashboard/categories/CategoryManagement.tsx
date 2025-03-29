
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';

import TableHeader from '../common/TableHeader';
import DataTable from '../common/DataTable';
import { Category } from '@/domain/models/Category';
import { MOCK_CATEGORIES } from './data/mockCategories';

const CategoryManagement = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>(categories);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterCategories();
  };

  const filterCategories = () => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.filter(category => 
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  const handleAddCategory = () => {
    navigate('/dashboard/categories/new');
  };

  const handleEditCategory = (categoryId: string) => {
    navigate(`/dashboard/categories/edit/${categoryId}`);
  };

  const handleDeleteCategory = (categoryId: string) => {
    // In a real app, this would delete the category via API call
    const updatedCategories = categories.filter(category => category.id !== categoryId);
    setCategories(updatedCategories);
    setFilteredCategories(updatedCategories.filter(category => 
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    ));
    toast.success('Categoría eliminada correctamente');
  };

  // Find parent category name for display
  const getParentCategoryName = (parentId: string | null) => {
    if (!parentId) return 'N/A';
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.name : 'Desconocido';
  };

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
    },
    {
      label: 'Eliminar',
      icon: <Trash size={16} />,
      onClick: (category: Category) => handleDeleteCategory(category.id)
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <TableHeader
        title="Gestión de Categorías"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddNew={handleAddCategory}
        onSearch={handleSearch}
      />
      
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
