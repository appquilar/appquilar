
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Users, Package } from 'lucide-react';

import TableHeader from '../common/TableHeader';
import DataTable from '../common/DataTable';
import { Button } from '@/components/ui/button';
import { Company } from '@/domain/models/Company';
import { MOCK_COMPANIES } from './data/mockCompanies';

const CompanyManagement = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>(companies);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterCompanies();
  };

  const filterCompanies = () => {
    if (!searchQuery.trim()) {
      setFilteredCompanies(companies);
      return;
    }

    const filtered = companies.filter(company => 
      company.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCompanies(filtered);
  };

  const handleAddCompany = () => {
    navigate('/dashboard/companies/new');
  };

  const handleEditCompany = (company: Company) => {
    navigate(`/dashboard/companies/${company.id}`);
  };

  const handleManageUsers = (companyId: string) => {
    navigate(`/dashboard/companies/${companyId}/users`);
  };

  const handleManageProducts = (companyId: string) => {
    navigate(`/dashboard/companies/${companyId}/products`);
  };

  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'slug', header: 'Slug' },
    { key: 'fiscalId', header: 'ID Fiscal' },
    { key: 'contactEmail', header: 'Email' },
    { 
      key: 'actions', 
      header: 'Gestionar',
      cell: (company: Company) => (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => handleManageUsers(company.id)}
          >
            <Users size={14} />
            Usuarios
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => handleManageProducts(company.id)}
          >
            <Package size={14} />
            Productos
          </Button>
        </div>
      )
    }
  ];

  const actions = [
    {
      label: 'Editar',
      icon: <Edit size={16} />,
      onClick: (company: Company) => handleEditCompany(company)
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <TableHeader
        title="Gestión de Empresas"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddNew={handleAddCompany}
        onSearch={handleSearch}
      />
      
      <DataTable
        data={filteredCompanies}
        columns={columns}
        actions={actions}
        emptyMessage="No se encontraron empresas"
      />
    </div>
  );
};

export default CompanyManagement;
