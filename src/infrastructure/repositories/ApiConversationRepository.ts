
import { Conversation } from '@/core/domain/Message';
import { IConversationRepository } from '@/domain/repositories/IConversationRepository';

/**
 * API implementation of the conversation repository
 */
export class ApiConversationRepository implements IConversationRepository {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all conversations for a user
   */
  async getConversationsForUser(userId: string): Promise<Conversation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations?userId=${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`);
      }
      const data = await response.json();
      return data.map((conv: any) => ({
        ...conv,
        lastMessageAt: new Date(conv.lastMessageAt)
      }));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  /**
   * Get a conversation by ID
   */
  async getConversationById(id: string): Promise<Conversation | null> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch conversation: ${response.status}`);
      }
      const data = await response.json();
      return {
        ...data,
        lastMessageAt: new Date(data.lastMessageAt)
      };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(data: Partial<Conversation>): Promise<Conversation> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.status}`);
      }
      
      const responseData = await response.json();
      return {
        ...responseData,
        lastMessageAt: new Date(responseData.lastMessageAt)
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Update a conversation
   */
  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update conversation: ${response.status}`);
      }
      
      const responseData = await response.json();
      return {
        ...responseData,
        lastMessageAt: new Date(responseData.lastMessageAt)
      };
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${id}`, {
        method: 'DELETE',
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  /**
   * Get unread message counts for all conversations of a user
   */
  async getUnreadMessageCounts(userId: string): Promise<Array<{conversationId: string, unreadCount: number}>> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/conversation-unread-counts`);
      if (!response.ok) {
        throw new Error(`Failed to fetch unread counts: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching unread counts:', error);
      throw error;
    }
  }
}
