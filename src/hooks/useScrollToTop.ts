
import { useEffect } from 'react';

/**
 * Hook personalizado para desplazar la página a la parte superior
 * Útil para usarse en la navegación entre páginas
 */
export const useScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};
