
import { useParams } from 'react-router-dom';
import { MOCK_CATEGORIES } from '../categories/data/mockCategories';
import FormHeader from '../common/FormHeader';
import LoadingSpinner from '../common/LoadingSpinner';
import { useCompanyForm } from './hooks/useCompanyForm';
import CompanyForm from './form/CompanyForm';

const CompanyFormPage = () => {
  const { companyId } = useParams();
  const { form, isLoading, isAddMode } = useCompanyForm({ companyId });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <FormHeader
        title={isAddMode ? 'Crear Empresa' : 'Editar Empresa'}
        backUrl="/dashboard/companies"
      />
      
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <CompanyForm 
          form={form} 
          isAddMode={isAddMode} 
          categories={MOCK_CATEGORIES}
        />
      </div>
    </div>
  );
};

export default CompanyFormPage;
