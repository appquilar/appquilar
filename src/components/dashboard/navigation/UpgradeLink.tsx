
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Componente para el enlace de actualización a cuenta de empresa
 */
const UpgradeLink = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/dashboard/upgrade');
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-between w-full px-3 py-3 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
    >
      <span className="text-sm font-medium">Actualizar a Empresa</span>
      <ChevronRight size={16} />
    </button>
  );
};

export default UpgradeLink;
