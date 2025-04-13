
import { Conversation } from '@/core/domain/Message';
import { IConversationRepository } from '@/domain/repositories/IConversationRepository';
import { conversationDataService } from '../adapters/mockData/conversationDataService';

/**
 * Mock implementation of the conversation repository
 */
export class MockConversationRepository implements IConversationRepository {
  private dataService = conversationDataService;

  /**
   * Get all conversations for a user
   */
  async getConversationsForUser(userId: string): Promise<Conversation[]> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.dataService.getUserConversations(userId);
  }

  /**
   * Get a conversation by ID
   */
  async getConversationById(id: string): Promise<Conversation | null> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 200));
    const conversations = this.dataService.getConversations();
    return conversations.find(conv => conv.id === id) || null;
  }

  /**
   * Create a new conversation
   */
  async createConversation(data: Partial<Conversation>): Promise<Conversation> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (!data.productId || !data.userId || !data.companyId) {
      throw new Error("Missing required conversation data");
    }
    
    return this.dataService.startConversation(
      data.productId,
      data.userId,
      data.companyId
    );
  }

  /**
   * Update a conversation
   */
  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation> {
    // In a real implementation, this would update the conversation
    // For mock, we'll just return the conversation with updated fields
    const conversation = await this.getConversationById(id);
    if (!conversation) {
      throw new Error(`Conversation with ID ${id} not found`);
    }
    
    // In a real implementation this would persist the changes
    return {
      ...conversation,
      ...data,
    };
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(id: string): Promise<boolean> {
    // Mock implementation doesn't actually delete
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
  }

  /**
   * Get unread message counts for all conversations of a user
   */
  async getUnreadMessageCounts(userId: string): Promise<Array<{conversationId: string, unreadCount: number}>> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.dataService.getUnreadMessageCounts(userId);
  }
}
