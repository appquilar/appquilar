
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import FormHeader from '../common/FormHeader';
import LoadingSpinner from '../common/LoadingSpinner';
import { CategoryService } from '@/application/services/CategoryService';
import { CategoryFormData } from '@/domain/models/Category';
import CategoryForm from './form/CategoryForm';

const CategoryFormPage = () => {
  const { id: categoryId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAddMode = !categoryId || categoryId === 'new';
  const categoryService = CategoryService.getInstance();

  const [defaultValues, setDefaultValues] = useState<CategoryFormData>({
    name: '',
    slug: '',
    parentId: null,
    iconUrl: null,
    headerImageUrl: null,
    featuredImageUrl: null
  });

  useEffect(() => {
    loadCategoryData();
  }, [categoryId]);

  const loadCategoryData = async () => {
    setIsLoading(true);
    
    try {
      if (!isAddMode) {
        const category = await categoryService.getCategoryById(categoryId);
        if (category) {
          setDefaultValues({
            name: category.name,
            slug: category.slug,
            parentId: category.parentId,
            iconUrl: category.iconUrl,
            headerImageUrl: category.headerImageUrl,
            featuredImageUrl: category.featuredImageUrl
          });
        } else {
          toast.error("Categoría no encontrada");
          navigate('/dashboard/categories');
        }
      }
    } catch (error) {
      console.error("Error loading category:", error);
      toast.error("Error al cargar la categoría");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would save the category via API call
      console.log('Saving category:', data);
      
      toast.success(isAddMode 
        ? 'Categoría creada correctamente' 
        : 'Categoría actualizada correctamente'
      );
      
      navigate('/dashboard/categories');
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(isAddMode
        ? 'Error al crear la categoría'
        : 'Error al actualizar la categoría'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <FormHeader
        title={isAddMode ? 'Crear Categoría' : 'Editar Categoría'}
        backUrl="/dashboard/categories"
      />
      
      <CategoryForm
        defaultValues={defaultValues}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/dashboard/categories')}
      />
    </div>
  );
};

export default CategoryFormPage;
