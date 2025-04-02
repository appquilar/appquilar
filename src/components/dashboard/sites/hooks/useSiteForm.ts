
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SiteFormData } from '@/domain/models/Site';
import { MOCK_SITES } from '../data/mockSites';

interface UseSiteFormProps {
  siteId?: string;
}

export const useSiteForm = ({ siteId }: UseSiteFormProps) => {
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
      menuCategoryIds: [],
      featuredCategoryIds: [],
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
            menuCategoryIds: site.menuCategoryIds || [],
            featuredCategoryIds: site.featuredCategoryIds || [],
            primaryColor: site.primaryColor
          });
        }
      }
      setIsLoading(false);
    }, 300);
  }, [siteId, form, isAddMode]);

  return {
    form,
    isLoading,
    isAddMode
  };
};
