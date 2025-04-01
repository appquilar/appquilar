
import { ChevronRight } from 'lucide-react';

/**
 * Props para el enlace de actualización a cuenta de empresa
 */
interface UpgradeLinkProps {
  onClick?: () => void;
}

/**
 * Componente para el enlace de actualización a cuenta de empresa
 */
const UpgradeLink = ({ onClick }: UpgradeLinkProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-3 py-3 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
    >
      <span className="text-sm font-medium">Actualizar a Empresa</span>
      <ChevronRight size={16} />
    </button>
  );
};

export default UpgradeLink;
