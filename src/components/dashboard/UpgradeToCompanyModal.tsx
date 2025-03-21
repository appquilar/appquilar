
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

/**
 * Props para el componente de modal de actualización a empresa
 */
interface UpgradeToCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal para actualizar una cuenta de usuario a cuenta de empresa
 */
const UpgradeToCompanyModal = ({ open, onOpenChange }: UpgradeToCompanyModalProps) => {
  const [companyName, setCompanyName] = useState('');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { upgradeToCompany } = useAuth();

  /**
   * Maneja el proceso de actualización a cuenta de empresa
   */
  const handleUpgradeAccount = async () => {
    if (!companyName.trim()) {
      toast.error('Por favor, introduce un nombre de empresa');
      return;
    }
    
    setIsUpgrading(true);
    
    try {
      await upgradeToCompany(companyName);
      toast.success('Cuenta actualizada a empresa correctamente');
      onOpenChange(false);
    } catch (error) {
      console.error('Error de actualización:', error);
      toast.error('No se pudo actualizar la cuenta. Por favor, inténtalo de nuevo.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleUpgradeAccount} disabled={isUpgrading}>
            {isUpgrading ? 'Actualizando...' : 'Actualizar Cuenta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeToCompanyModal;
