
import { Conversation } from '@/core/domain/Message';

/**
 * Repository interface for accessing and managing Conversation data
 */
export interface ConversationRepository {
  /**
   * Get all conversations for a user
   */
  getConversationsForUser(userId: string): Promise<Conversation[]>;
  
  /**
   * Get a conversation by ID
   */
  getConversationById(id: string): Promise<Conversation | null>;
  
  /**
   * Create a new conversation
   */
  createConversation(data: Partial<Conversation>): Promise<Conversation>;
  
  /**
   * Update a conversation
   */
  updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation>;
  
  /**
   * Delete a conversation
   */
  deleteConversation(id: string): Promise<boolean>;
}
