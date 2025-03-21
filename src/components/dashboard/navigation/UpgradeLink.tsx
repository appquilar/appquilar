
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Componente para el enlace de actualización a cuenta de empresa
 */
const UpgradeLink = () => {
  return (
    <li className="mt-6">
      <Link
        to="/dashboard/upgrade"
        className="flex items-center justify-between px-3 py-3 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
      >
        <span className="text-sm font-medium">Actualizar a Empresa</span>
        <ChevronRight size={16} />
      </Link>
    </li>
  );
};

export default UpgradeLink;
