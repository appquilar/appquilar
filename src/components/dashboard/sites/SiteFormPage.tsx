
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import FormHeader from '../common/FormHeader';
import FormActions from '../common/FormActions';
import { Site, SiteFormData } from '@/domain/models/Site';
import { MOCK_SITES } from './data/mockSites';
import { MOCK_CATEGORIES } from '../categories/data/mockCategories';
import CategoryMultiSelector from '../categories/CategoryMultiSelector';

const SiteFormPage = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const isAddMode = !siteId || siteId === 'new';

  const form = useForm<SiteFormData>({
    defaultValues: {
      name: '',
      domain: '',
      logo: null,
      title: '',
      description: '',
      categoryIds: [],
      primaryColor: '#4F46E5'
    }
  });

  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (!isAddMode) {
        const site = MOCK_SITES.find(s => s.id === siteId);
        if (site) {
          form.reset({
            name: site.name,
            domain: site.domain,
            logo: site.logo,
            title: site.title,
            description: site.description,
            categoryIds: site.categoryIds,
            primaryColor: site.primaryColor
          });
        }
      }
      setIsLoading(false);
    }, 300);
  }, [siteId, form, isAddMode]);

  const onSubmit = (data: SiteFormData) => {
    // In a real app, this would save the site via API call
    console.log('Saving site:', data);
    
    toast.success(isAddMode 
      ? 'Sitio creado correctamente' 
      : 'Sitio actualizado correctamente'
    );
    
    navigate('/dashboard/sites');
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
        title={isAddMode ? 'Crear Sitio' : 'Editar Sitio'}
        backUrl="/dashboard/sites"
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
                  <Input placeholder="Nombre del sitio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Dominio */}
          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dominio</FormLabel>
                <FormControl>
                  <Input placeholder="ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Logo URL */}
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL del Logo</FormLabel>
                <FormControl>
                  <Input placeholder="https://ejemplo.com/logo.png" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Título */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Título del sitio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Descripción */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea placeholder="Descripción del sitio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Color Primario */}
          <FormField
            control={form.control}
            name="primaryColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color Primario</FormLabel>
                <div className="flex gap-2 items-center">
                  <FormControl>
                    <Input type="color" {...field} className="w-12 h-10 p-1" />
                  </FormControl>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Categorías - Using the new multi-selector component */}
          <FormField
            control={form.control}
            name="categoryIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categorías</FormLabel>
                <FormControl>
                  <CategoryMultiSelector
                    categories={MOCK_CATEGORIES}
                    selectedCategoryIds={field.value}
                    onCategoriesChange={field.onChange}
                    placeholder="Seleccionar categorías"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormActions isSubmitting={form.formState.isSubmitting} onCancel={() => navigate('/dashboard/sites')} />
        </form>
      </Form>
    </div>
  );
};

export default SiteFormPage;
