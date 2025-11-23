
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SiteFormData } from '@/domain/models/Site';
import { SITE_CONFIG } from '@/domain/config/siteConfig';
import { SiteService } from '@/application/services/SiteService';

interface UseSiteFormProps {
  siteId?: string;
}

export const useSiteForm = ({ siteId }: UseSiteFormProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAddMode = !siteId || siteId === 'new';
  const siteService = SiteService.getInstance();

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
      primaryColor: '#4F46E5',
      heroAnimatedTexts: []
    }
  });

  useEffect(() => {
    const loadSite = async () => {
      setError(null);
      setIsLoading(true);
      
      try {
        if (!isAddMode) {
          const site = await siteService.getSiteById(siteId);
          
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
              primaryColor: site.primaryColor,
              heroAnimatedTexts: site.heroAnimatedTexts || []
            });
          }
        }
      } catch (err) {
        console.error('Error loading site:', err);
        setError('Error al cargar el sitio. Por favor, inténtelo de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSite();
  }, [siteId, form, isAddMode]);

  return {
    form,
    isLoading,
    isAddMode,
    error
  };
};
