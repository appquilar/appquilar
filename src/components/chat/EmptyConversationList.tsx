
/**
 * @fileoverview Componente para mostrar cuando no hay conversaciones
 * @module components/chat/EmptyConversationList
 */

import { MessageCircle } from 'lucide-react';

/**
 * Mensaje que se muestra cuando no hay conversaciones disponibles
 */
const EmptyConversationList = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No hay conversaciones</h3>
      <p className="text-muted-foreground mt-2">
        Cuando contactes con empresas sobre productos, tus conversaciones aparecerán aquí.
      </p>
    </div>
  );
};

export default EmptyConversationList;
