
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';

import TableHeader from '../common/TableHeader';
import DataTable from '../common/DataTable';
import { Site } from '@/domain/models/Site';
import { MOCK_SITES } from './data/mockSites';

const SiteManagement = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>(MOCK_SITES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSites, setFilteredSites] = useState<Site[]>(sites);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterSites();
  };

  const filterSites = () => {
    if (!searchQuery.trim()) {
      setFilteredSites(sites);
      return;
    }

    const filtered = sites.filter(site => 
      site.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSites(filtered);
  };

  const handleAddSite = () => {
    navigate('/dashboard/sites/new');
  };

  const handleEditSite = (siteId: string) => {
    navigate(`/dashboard/sites/edit/${siteId}`);
  };

  const handleDeleteSite = (siteId: string) => {
    // In a real app, this would delete the site via API call
    const updatedSites = sites.filter(site => site.id !== siteId);
    setSites(updatedSites);
    setFilteredSites(updatedSites.filter(site => 
      site.name.toLowerCase().includes(searchQuery.toLowerCase())
    ));
    toast.success('Sitio eliminado correctamente');
  };

  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'domain', header: 'Dominio' },
    { 
      key: 'logo', 
      header: 'Logo',
      cell: (site: Site) => site.logo ? (
        <img 
          src={site.logo} 
          alt={`Logo de ${site.name}`} 
          className="w-8 h-8 object-cover rounded-md"
        />
      ) : 'Sin logo'
    },
    { key: 'title', header: 'Título' },
    { 
      key: 'primaryColor', 
      header: 'Color Primario',
      cell: (site: Site) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: site.primaryColor }}
          />
          {site.primaryColor}
        </div>
      )
    }
  ];

  const actions = [
    {
      label: 'Editar',
      icon: <Edit size={16} />,
      onClick: (site: Site) => handleEditSite(site.id)
    },
    {
      label: 'Eliminar',
      icon: <Trash size={16} />,
      onClick: (site: Site) => handleDeleteSite(site.id)
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <TableHeader
        title="Gestión de Sitios"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddNew={handleAddSite}
        onSearch={handleSearch}
      />
      
      <DataTable
        data={filteredSites}
        columns={columns}
        actions={actions}
        emptyMessage="No se encontraron sitios"
      />
    </div>
  );
};

export default SiteManagement;
