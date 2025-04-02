
import { useParams } from 'react-router-dom';
import FormHeader from '../common/FormHeader';
import LoadingSpinner from '../common/LoadingSpinner';
import { useSiteForm } from './hooks/useSiteForm';
import SiteForm from './form/SiteForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const SiteFormPage = () => {
  const { siteId } = useParams();
  const { form, isLoading, isAddMode, error } = useSiteForm({ siteId });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <FormHeader
        title={isAddMode ? 'Crear Sitio' : 'Editar Sitio'}
        backUrl="/dashboard/sites"
      />
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <SiteForm 
        form={form} 
        isAddMode={isAddMode} 
        siteId={siteId}
      />
    </div>
  );
};

export default SiteFormPage;
