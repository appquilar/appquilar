
import { useEffect } from 'react';
import { SeoService } from '@/infrastructure/services/SeoService';
import ChatInbox from '../chat/ChatInbox';
import { useIsMobile } from '@/hooks/use-mobile';
import { useConversations } from '@/application/hooks/useConversations';

/**
 * Panel de gestión de mensajes en el dashboard
 */
const MessagesDashboard = () => {
  const isMobile = useIsMobile();
  const { isLoading, error } = useConversations();
  
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-destructive/10 text-destructive">
        {error}
      </div>
    );
  }

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
