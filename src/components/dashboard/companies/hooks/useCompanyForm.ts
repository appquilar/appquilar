
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Company, CompanyFormData } from '@/domain/models/Company';
import { MOCK_COMPANIES } from '../data/mockCompanies';

interface UseCompanyFormProps {
  companyId: string | undefined;
}

export const useCompanyForm = ({ companyId }: UseCompanyFormProps) => {
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

  return {
    form,
    isLoading,
    isAddMode
  };
};
