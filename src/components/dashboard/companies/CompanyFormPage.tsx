
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

import FormHeader from '../common/FormHeader';
import FormActions from '../common/FormActions';
import { Company, CompanyFormData } from '@/domain/models/Company';
import { MOCK_COMPANIES } from './data/mockCompanies';
import { MOCK_CATEGORIES } from '../categories/data/mockCategories';

const CompanyFormPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const isAddMode = !companyId || companyId === 'new';

  const form = useForm<CompanyFormData>({
    defaultValues: {
      name: '',
      description: '',
      slug: '',
      fiscalId: '',
      address: '',
      contactEmail: '',
      contactPhone: '',
      categoryIds: []
    }
  });

  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (!isAddMode) {
        const company = MOCK_COMPANIES.find(c => c.id === companyId);
        if (company) {
          form.reset({
            name: company.name,
            description: company.description,
            slug: company.slug,
            fiscalId: company.fiscalId,
            address: company.address,
            contactEmail: company.contactEmail,
            contactPhone: company.contactPhone,
            categoryIds: company.categoryIds
          });
        }
      }
      setIsLoading(false);
    }, 300);
  }, [companyId, form, isAddMode]);

  const onSubmit = (data: CompanyFormData) => {
    // In a real app, this would save the company via API call
    console.log('Saving company:', data);
    
    toast.success(isAddMode 
      ? 'Empresa creada correctamente' 
      : 'Empresa actualizada correctamente'
    );
    
    navigate('/dashboard/companies');
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
        title={isAddMode ? 'Crear Empresa' : 'Editar Empresa'}
        backUrl="/dashboard/companies"
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
                  <Input placeholder="Nombre de la empresa" {...field} />
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
                  <Textarea placeholder="Descripción de la empresa" {...field} />
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
                  <Input placeholder="slug-de-empresa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* ID Fiscal */}
          <FormField
            control={form.control}
            name="fiscalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Fiscal</FormLabel>
                <FormControl>
                  <Input placeholder="B12345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Dirección */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input placeholder="Calle, número, ciudad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Email de contacto */}
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email de contacto</FormLabel>
                <FormControl>
                  <Input placeholder="contacto@empresa.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Teléfono de contacto */}
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono de contacto</FormLabel>
                <FormControl>
                  <Input placeholder="+34 911 234 567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Categorías */}
          <FormField
            control={form.control}
            name="categoryIds"
            render={() => (
              <FormItem>
                <FormLabel>Categorías</FormLabel>
                <div className="space-y-2">
                  {MOCK_CATEGORIES.map((category) => (
                    <FormField
                      key={category.id}
                      control={form.control}
                      name="categoryIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={category.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(category.id)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValues, category.id]);
                                  } else {
                                    field.onChange(
                                      currentValues.filter((value) => value !== category.id)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {category.name}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormActions isSubmitting={form.formState.isSubmitting} onCancel={() => navigate('/dashboard/companies')} />
        </form>
      </Form>
    </div>
  );
};

export default CompanyFormPage;
