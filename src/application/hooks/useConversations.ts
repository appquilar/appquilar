
import { useState, useEffect } from 'react';
import { Conversation } from '@/core/domain/Message';
import { RepositoryFactory } from '@/infrastructure/repositories/RepositoryFactory';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get repository from factory
  const conversationRepository = RepositoryFactory.getConversationRepository();

  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Assuming the logged-in user ID would come from auth context in a real app
        const userId = 'user-1'; // Using a specific ID that matches our mock data
        const userConversations = await conversationRepository.getConversationsForUser(userId);
        
        // Sort conversations by last message date (newest first)
        const sortedConversations = [...userConversations].sort(
          (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
        );
        
        setConversations(sortedConversations);
      } catch (err) {
        console.error('Error loading conversations:', err);
        setError('Error al cargar conversaciones');
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [conversationRepository]);

  return {
    conversations,
    isLoading,
    error,
    reloadConversations: async () => {
      setIsLoading(true);
      try {
        const userId = 'user-1';
        const userConversations = await conversationRepository.getConversationsForUser(userId);
        const sortedConversations = [...userConversations].sort(
          (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
        );
        setConversations(sortedConversations);
        setError(null);
      } catch (err) {
        console.error('Error reloading conversations:', err);
        setError('Error al recargar conversaciones');
      } finally {
        setIsLoading(false);
      }
    }
  };
};
