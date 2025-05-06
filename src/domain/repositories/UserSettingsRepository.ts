
import { UserSettings } from "@/domain/models/UserSettings";

/**
 * Interface for user settings repository
 */
export interface IUserSettingsRepository {
  /**
   * Get user settings by user ID
   * @param userId The ID of the user
   */
  getUserSettingsByUserId(userId: string): Promise<UserSettings | null>;
  
  /**
   * Update user settings
   * @param userSettings The user settings to update
   */
  updateUserSettings(userSettings: Partial<UserSettings>): Promise<UserSettings>;
  
  /**
   * Create initial user settings for a user
   * @param userId The ID of the user
   */
  createUserSettings(userId: string): Promise<UserSettings>;
}
