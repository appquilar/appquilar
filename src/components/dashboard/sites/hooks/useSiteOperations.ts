
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SiteFormData } from '@/domain/models/Site';
import { SiteService } from '@/application/services/SiteService';

export const useSiteOperations = (siteId?: string) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const siteService = SiteService.getInstance();
  const isAddMode = !siteId || siteId === 'new';

  const saveSite = async (data: SiteFormData) => {
    setIsSubmitting(true);
    
    try {
      if (isAddMode) {
        await siteService.createSite(data);
        toast.success('Sitio creado correctamente');
      } else {
        await siteService.updateSite(siteId, data);
        toast.success('Sitio actualizado correctamente');
      }
      
      navigate('/dashboard/sites');
    } catch (error) {
      console.error('Error saving site:', error);
      toast.error(isAddMode
        ? 'Error al crear el sitio'
        : 'Error al actualizar el sitio'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteSite = async (id: string) => {
    try {
      await siteService.deleteSite(id);
      toast.success('Sitio eliminado correctamente');
      return true;
    } catch (error) {
      console.error('Error deleting site:', error);
      toast.error('Error al eliminar el sitio');
      return false;
    }
  };

  return {
    saveSite,
    deleteSite,
    isSubmitting
  };
};
