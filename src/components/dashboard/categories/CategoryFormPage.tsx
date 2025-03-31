
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import FormHeader from '../common/FormHeader';
import FormActions from '../common/FormActions';
import { Category, CategoryFormData } from '@/domain/models/Category';
import { MOCK_CATEGORIES } from './data/mockCategories';
import CategorySelector from './CategorySelector';

const CategoryFormPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const isAddMode = !categoryId || categoryId === 'new';

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
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (!isAddMode) {
        const category = MOCK_CATEGORIES.find(c => c.id === categoryId);
        if (category) {
          form.reset({
            name: category.name,
            slug: category.slug,
            parentId: category.parentId,
            iconUrl: category.iconUrl,
            headerImageUrl: category.headerImageUrl,
            featuredImageUrl: category.featuredImageUrl
          });
        }
      }
      setIsLoading(false);
    }, 300);
  }, [categoryId, form, isAddMode]);

  const onSubmit = (data: CategoryFormData) => {
    // In a real app, this would save the category via API call
    console.log('Saving category:', data);
    
    toast.success(isAddMode 
      ? 'Categoría creada correctamente' 
      : 'Categoría actualizada correctamente'
    );
    
    navigate('/dashboard/categories');
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
          {/* Nombre */}
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
          
          {/* Slug */}
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
          
          {/* Categoría Padre */}
          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría Padre</FormLabel>
                <FormControl>
                  <CategorySelector
                    categories={MOCK_CATEGORIES.filter(c => c.id !== categoryId)} // Prevent circular reference
                    selectedCategoryId={field.value}
                    onCategoryChange={field.onChange}
                    placeholder="Seleccionar categoría padre (opcional)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* URL del icono */}
          <FormField
            control={form.control}
            name="iconUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL del icono</FormLabel>
                <FormControl>
                  <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* URL de la imagen de cabecera */}
          <FormField
            control={form.control}
            name="headerImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de la imagen de cabecera</FormLabel>
                <FormControl>
                  <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* URL de la imagen destacada */}
          <FormField
            control={form.control}
            name="featuredImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de la imagen destacada</FormLabel>
                <FormControl>
                  <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} value={field.value || ''} />
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
