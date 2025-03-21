
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardNavigation from './DashboardNavigation';
import RentalsManagement from './RentalsManagement';
import ProductsManagement from './ProductsManagement';
import CompanyStats from './CompanyStats';
import UserManagement from './UserManagement';
import UpgradeToCompanyModal from './UpgradeToCompanyModal';
import MessagesDashboard from './MessagesDashboard';

/**
 * Tipos de pestañas disponibles en el panel
 */
type DashboardTab = 'overview' | 'rentals' | 'products' | 'users' | 'settings' | 'messages';

/**
 * Componente principal del panel de control
 * Gestiona la visualización de diferentes secciones según la pestaña activa
 */
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Synchronize active tab with URL on component mount and URL changes
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/dashboard') {
      setActiveTab('overview');
    } else if (path.includes('/dashboard/')) {
      const tab = path.split('/').pop() as DashboardTab;
      if (tab) setActiveTab(tab);
    }
  }, [location.pathname]);

  /**
   * Maneja el cambio de pestaña en el panel
   * @param tab Nombre de la pestaña a activar
   */
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as DashboardTab);
    
    // Update URL to reflect current tab
    if (tab === 'overview') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${tab}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">      
      <div className="flex flex-1">
        {/* Navegación del panel */}
        <DashboardNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        
        {/* Contenido principal */}
        <main className="flex-1 px-4 py-6 animate-fade-in">
          <div className="max-w-6xl mx-auto">
            {/* Usuario no es una empresa */}
            {user && user.role === 'user' ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <h1 className="text-3xl font-display font-semibold mb-4">Actualizar a Cuenta de Empresa</h1>
                <p className="text-muted-foreground max-w-md mb-8">
                  Como empresa, puedes listar tus herramientas para alquilar, gestionar alquileres y hacer crecer tu negocio en nuestra plataforma.
                </p>
                <button 
                  className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
                  onClick={() => setUpgradeModalOpen(true)}
                >
                  Actualizar Ahora
                </button>
              </div>
            ) : (
              <>
                {/* Contenido del panel para empresas */}
                {activeTab === 'overview' && <CompanyStats />}
                {activeTab === 'rentals' && <RentalsManagement />}
                {activeTab === 'products' && <ProductsManagement />}
                {activeTab === 'users' && <UserManagement />}
                {activeTab === 'messages' && <MessagesDashboard />}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <h1 className="text-2xl font-display font-semibold">Configuración de la Cuenta</h1>
                    <p>El contenido de configuración aparecerá aquí.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      
      {/* Modal de actualización a empresa */}
      <UpgradeToCompanyModal 
        open={upgradeModalOpen} 
        onOpenChange={setUpgradeModalOpen} 
      />
    </div>
  );
};

export default Dashboard;
