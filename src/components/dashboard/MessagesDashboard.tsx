import { useEffect } from 'react';
import { SeoService } from '@/infrastructure/services/SeoService';
import ChatInbox from '../chat/ChatInbox';
import { useIsMobile } from '@/hooks/use-mobile';
import { useConversations } from '@/application/hooks/useConversations';
import { MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Panel de gestión de mensajes en el dashboard
 */
const MessagesDashboard = () => {
  const isMobile = useIsMobile();
  const { isLoading, error, reloadConversations } = useConversations();
  const { toast } = useToast();
  
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
      {/* Header section */}
      <div className={`flex flex-col ${isMobile ? 'mb-2 space-y-2' : 'mb-4 space-y-3'}`}>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <MessageCircle className={`${isMobile ? 'mr-2' : 'mr-3'} text-primary`} size={isMobile ? 22 : 24} />
            Mensajes
          </h1>
        </div>
        
        <p className="text-muted-foreground">
          Gestiona tus conversaciones con usuarios y empresas sobre productos.
        </p>
      </div>
      
      {/* Error state */}
      {error && (
        <div className="p-4 mb-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
          <p className="font-medium">{error}</p>
          <p className="text-sm mt-1">Intenta actualizar o contacta soporte si el problema persiste.</p>
        </div>
      )}
      
      {/* Chat container with adaptive height */}
      <div 
        className={`flex-1 border border-border rounded-lg overflow-hidden ${
          isMobile ? 'h-[calc(100vh-170px)]' : 'h-[calc(100vh-200px)]'
        }`}
      >
        <ChatInbox />
      </div>
    </div>
  );
};

export default MessagesDashboard;
