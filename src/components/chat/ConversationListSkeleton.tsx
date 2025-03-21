
/**
 * @fileoverview Componente para mostrar estado de carga de conversaciones
 * @module components/chat/ConversationListSkeleton
 */

/**
 * Esqueleto de carga para la lista de conversaciones
 */
const ConversationListSkeleton = () => {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
};

export default ConversationListSkeleton;
