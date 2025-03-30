
import { useParams } from 'react-router-dom';
import FormHeader from '../common/FormHeader';
import LoadingSpinner from '../common/LoadingSpinner';
import { useSiteForm } from './hooks/useSiteForm';
import SiteForm from './form/SiteForm';

const SiteFormPage = () => {
  const { siteId } = useParams();
  const { form, isLoading, isAddMode } = useSiteForm({ siteId });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <FormHeader
        title={isAddMode ? 'Crear Sitio' : 'Editar Sitio'}
        backUrl="/dashboard/sites"
      />
      
      <SiteForm 
        form={form} 
        isAddMode={isAddMode} 
      />
    </div>
  );
};

export default SiteFormPage;
