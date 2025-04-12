
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Form } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { CompanyFormData } from '@/domain/models/Company';
import { Category } from '@/domain/models/Category';

import CompanyBasicInfoFields from './CompanyBasicInfoFields';
import CompanyContactFields from './CompanyContactFields';
import CompanyCategoryField from './CompanyCategoryField';
import FormActions from '../../common/FormActions';

interface CompanyFormProps {
  form: UseFormReturn<CompanyFormData>;
  isAddMode: boolean;
  categories: Category[];
}

const CompanyForm = ({ form, isAddMode, categories }: CompanyFormProps) => {
  const navigate = useNavigate();

  const onSubmit = (data: CompanyFormData) => {
    // In a real app, this would save the company via API call
    console.log('Saving company:', data);
    
    toast.success(isAddMode 
      ? 'Empresa creada correctamente' 
      : 'Empresa actualizada correctamente'
    );
    
    navigate('/dashboard/companies');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <CompanyBasicInfoFields form={form} />
          </div>
          <div className="space-y-6">
            <CompanyContactFields form={form} />
          </div>
        </div>
        
        <CompanyCategoryField form={form} categories={categories} />
        
        <FormActions isSubmitting={form.formState.isSubmitting} onCancel={() => navigate('/dashboard/companies')} />
      </form>
    </Form>
  );
};

export default CompanyForm;
