
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import FormHeader from '../common/FormHeader';
import FormActions from '../common/FormActions';
import { Category, CategoryFormData } from '@/domain/models/Category';
import CategorySelector from './CategorySelector';
import IconPicker from './icon-picker/IconPicker';
import CategoryImageUpload from './form/CategoryImageUpload';
import { CategoryService } from '@/application/services/CategoryService';

const CategoryFormPage = () => {
  const { id: categoryId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const isAddMode = !categoryId || categoryId === 'new';
  const categoryService = CategoryService.getInstance();

  const form = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      slug: '',
      parentId: null,
      iconUrl: null,
      headerImageUrl: null,
      featuredImageUrl: null
    }
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
          form.reset({
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

  const onSubmit = async (data: CategoryFormData) => {
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
    }
  };

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
        title={isAddMode ? 'Crear Categoría' : 'Editar Categoría'}
        backUrl="/dashboard/categories"
      />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre de la categoría" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="slug-de-categoria" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría Padre</FormLabel>
                <FormControl>
                  <CategorySelector
                    selectedCategoryId={field.value}
                    onCategoryChange={field.onChange}
                    placeholder="Seleccionar categoría padre (opcional)"
                    excludeCategoryId={categoryId !== 'new' ? categoryId : undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="iconUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icono</FormLabel>
                <FormControl>
                  <IconPicker
                    selectedIcon={field.value}
                    onSelectIcon={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="headerImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagen de cabecera</FormLabel>
                <FormControl>
                  <CategoryImageUpload
                    label="Imagen de cabecera"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="featuredImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagen destacada</FormLabel>
                <FormControl>
                  <CategoryImageUpload
                    label="Imagen destacada"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormActions isSubmitting={form.formState.isSubmitting} onCancel={() => navigate('/dashboard/categories')} />
        </form>
      </Form>
    </div>
  );
};

export default CategoryFormPage;
