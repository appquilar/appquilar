
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
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <FormHeader
        title={isAddMode ? 'Crear Sitio' : 'Editar Sitio'}
        backUrl="/dashboard/sites"
      />
      
      {error && (
        <Alert variant="destructive" className="mb-4 sm:mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <SiteForm 
          form={form} 
          isAddMode={isAddMode} 
          siteId={siteId}
        />
      </div>
    </div>
  );
};

export default SiteFormPage;
