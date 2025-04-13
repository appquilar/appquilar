
import { useState, useEffect } from 'react';
import { Conversation } from '@/core/domain/Message';
import { RepositoryFactory } from '@/infrastructure/repositories/RepositoryFactory';
import { useAuth } from '@/context/AuthContext';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Get repository from factory
  const conversationRepository = RepositoryFactory.getConversationRepository();

  const loadConversations = async () => {
    if (!user) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const userId = user.id;
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

  useEffect(() => {
    loadConversations();
  }, [user, conversationRepository]);

  return {
    conversations,
    isLoading,
    error,
    reloadConversations: loadConversations
  };
};
