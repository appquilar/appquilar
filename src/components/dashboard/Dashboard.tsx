
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardNavigation from './DashboardNavigation';
import RentalsManagement from './RentalsManagement';
import ProductsManagement from './ProductsManagement';
import CompanyStats from './CompanyStats';
import UserManagement from './UserManagement';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type DashboardTab = 'overview' | 'rentals' | 'products' | 'users' | 'settings' | 'messages';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { user, upgradeToCompany } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as DashboardTab);
  };

  const handleUpgradeAccount = async () => {
    if (!companyName.trim()) {
      toast.error('Por favor, introduce un nombre de empresa');
      return;
    }
    
    setIsUpgrading(true);
    
    try {
      await upgradeToCompany(companyName);
      toast.success('Cuenta actualizada a empresa correctamente');
      setUpgradeModalOpen(false);
    } catch (error) {
      console.error('Error de actualización:', error);
      toast.error('No se pudo actualizar la cuenta. Por favor, inténtalo de nuevo.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex">
      {/* Dashboard navigation */}
      <DashboardNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* Main content */}
      <main className="flex-1 px-4 py-6 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          {/* User is not a company */}
          {user && user.role === 'user' ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
              <h1 className="text-3xl font-display font-semibold mb-4">Actualizar a Cuenta de Empresa</h1>
              <p className="text-muted-foreground max-w-md mb-8">
                Como empresa, puedes listar tus herramientas para alquilar, gestionar alquileres y hacer crecer tu negocio en nuestra plataforma.
              </p>
              <Button onClick={() => setUpgradeModalOpen(true)}>
                Actualizar Ahora
              </Button>
            </div>
          ) : (
            <>
              {/* Company dashboard content */}
              {activeTab === 'overview' && <CompanyStats />}
              {activeTab === 'rentals' && <RentalsManagement />}
              {activeTab === 'products' && <ProductsManagement />}
              {activeTab === 'users' && <UserManagement />}
              {activeTab === 'messages' && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-display font-semibold">Mensajes</h1>
                  <p>Contenido de mensajes aparecerá aquí.</p>
                </div>
              )}
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
      
      {/* Upgrade to company modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Actualizar a Cuenta de Empresa</DialogTitle>
            <DialogDescription>
              Introduce los datos de tu empresa para crear un perfil de negocio y empezar a alquilar tus herramientas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="company-name" className="text-sm font-medium">
                Nombre de la Empresa
              </label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="ej. Alquiler de Herramientas Pro"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpgradeAccount} disabled={isUpgrading}>
              {isUpgrading ? 'Actualizando...' : 'Actualizar Cuenta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
