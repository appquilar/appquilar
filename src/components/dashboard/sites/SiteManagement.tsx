
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';

import TableHeader from '../common/TableHeader';
import DataTable from '../common/DataTable';
import { Site } from '@/domain/models/Site';
import { SiteService } from '@/application/services/SiteService';
import LoadingSpinner from '../common/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const SiteManagement = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const siteService = SiteService.getInstance();

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allSites = await siteService.getAllSites();
      setSites(allSites);
      filterSites(allSites, searchQuery);
    } catch (err) {
      console.error('Error loading sites:', err);
      setError('Error al cargar los sitios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterSites(sites, searchQuery);
  };

  const filterSites = (sitesToFilter: Site[], query: string) => {
    if (!query.trim()) {
      setFilteredSites(sitesToFilter);
      return;
    }

    const filtered = sitesToFilter.filter(site => 
      site.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSites(filtered);
  };

  const handleAddSite = () => {
    navigate('/dashboard/sites/new');
  };

  const handleEditSite = (siteId: string) => {
    navigate(`/dashboard/sites/edit/${siteId}`);
  };

  const handleDeleteSite = async (siteId: string) => {
    try {
      const success = await siteService.deleteSite(siteId);
      if (success) {
        const updatedSites = sites.filter(site => site.id !== siteId);
        setSites(updatedSites);
        filterSites(updatedSites, searchQuery);
        toast.success('Sitio eliminado correctamente');
      } else {
        toast.error('No se pudo eliminar el sitio');
      }
    } catch (err) {
      console.error('Error deleting site:', err);
      toast.error('Error al eliminar el sitio');
    }
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 p-6">
      <TableHeader
        title="Gestión de Sitios"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddNew={handleAddSite}
        onSearch={handleSearch}
      />
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
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
