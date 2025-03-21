
/**
 * @fileoverview Panel de mensajes para el dashboard
 * @module components/dashboard/MessagesDashboard
 */

import { useEffect } from 'react';
import { SeoService } from '@/infrastructure/services/SeoService';
import ChatInbox from '../chat/ChatInbox';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Panel de gestión de mensajes en el dashboard
 */
const MessagesDashboard = () => {
  const isMobile = useIsMobile();
  
  // Configurar SEO
  useEffect(() => {
    const setupSeo = async () => {
      const seoService = SeoService.getInstance();
      const seoInfo = await seoService.getSeoInfo('dashboard');
      
      // Actualizar meta tags
      document.title = 'Mensajes | ' + seoInfo.title;
    };
    
    setupSeo();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className={isMobile ? "mb-2" : "mb-4"}>
        <h1 className="text-2xl font-semibold mb-2">Mensajes</h1>
        
        <p className="text-muted-foreground">
          Gestiona tus conversaciones con usuarios y empresas sobre productos.
        </p>
      </div>
      
      {/* Contenedor del chat con altura adaptativa */}
      <div className={`${isMobile ? 'h-[calc(100vh-180px)]' : 'h-[calc(100vh-200px)]'} overflow-hidden`}>
        <ChatInbox />
      </div>
    </div>
  );
};

export default MessagesDashboard;
