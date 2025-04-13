
import { Conversation } from '@/core/domain/Message';

/**
 * Repository interface for accessing and managing Conversation data
 */
export interface IConversationRepository {
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

  /**
   * Get unread message counts for all conversations of a user
   */
  getUnreadMessageCounts(userId: string): Promise<Array<{conversationId: string, unreadCount: number}>>;
  
  /**
   * Get conversations related to a specific product
   */
  getConversationsByProductId(productId: string): Promise<Conversation[]>;
  
  /**
   * Get conversations between a user and a company
   */
  getConversationsBetweenUserAndCompany(userId: string, companyId: string): Promise<Conversation[]>;
}
