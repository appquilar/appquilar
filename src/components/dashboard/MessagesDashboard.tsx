
/**
 * @fileoverview Panel de mensajes para el dashboard
 * @module components/dashboard/MessagesDashboard
 */

import { useEffect } from 'react';
import { SeoService } from '@/infrastructure/services/SeoService';
import ChatInbox from '../chat/ChatInbox';

/**
 * Panel de gestión de mensajes en el dashboard
 */
const MessagesDashboard = () => {
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
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Mensajes</h1>
      
      <div className="mb-6">
        <p className="text-muted-foreground">
          Gestiona tus conversaciones con usuarios y empresas sobre productos.
        </p>
      </div>
      
      {/* Contenedor del chat con altura fija */}
      <div className="h-[calc(100vh-240px)]">
        <ChatInbox />
      </div>
    </div>
  );
};

export default MessagesDashboard;
