
import { useState, useEffect } from 'react';
import { Conversation } from '@/core/domain/Message';
import { ConversationService } from '@/infrastructure/adapters/services/ConversationService';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const conversationService = new ConversationService();

  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Assuming the logged-in user ID would come from auth context in a real app
        const userId = 'current-user';
        const userConversations = await conversationService.getUserConversations(userId);
        setConversations(userConversations);
      } catch (err) {
        console.error('Error loading conversations:', err);
        setError('Error al cargar conversaciones');
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, []);

  return {
    conversations,
    isLoading,
    error
  };
};
