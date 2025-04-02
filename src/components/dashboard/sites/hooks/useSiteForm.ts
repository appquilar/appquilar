
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SiteFormData } from '@/domain/models/Site';
import { MOCK_SITES } from '../data/mockSites';
import { SITE_CONFIG } from '@/domain/config/siteConfig';

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
          // Enforce the limits when loading existing sites
          const menuCategoryIds = site.menuCategoryIds.slice(0, SITE_CONFIG.MAX_MENU_CATEGORIES);
          const featuredCategoryIds = site.featuredCategoryIds.slice(0, SITE_CONFIG.MAX_FEATURED_CATEGORIES);

          form.reset({
            name: site.name,
            domain: site.domain,
            logo: site.logo,
            title: site.title,
            description: site.description,
            categoryIds: site.categoryIds,
            menuCategoryIds,
            featuredCategoryIds,
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
