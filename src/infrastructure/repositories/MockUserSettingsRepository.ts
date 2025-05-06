
import { IUserSettingsRepository } from "@/domain/repositories/UserSettingsRepository";
import { UserSettings } from "@/domain/models/UserSettings";
import { v4 as uuidv4 } from "uuid";

/**
 * Mock implementation of the user settings repository
 */
export class MockUserSettingsRepository implements IUserSettingsRepository {
  private userSettings: UserSettings[] = [
    {
      id: "settings-1",
      userId: "user-1",
      displayName: "Juan Pérez",
      email: "juan@example.com",
      notificationsEnabled: true,
      language: "es",
      theme: "light"
    },
    {
      id: "settings-2",
      userId: "user-2",
      displayName: "María García",
      email: "maria@example.com",
      notificationsEnabled: false,
      language: "es",
      theme: "dark"
    }
  ];

  /**
   * Get user settings by user ID
   * @param userId The ID of the user
   */
  async getUserSettingsByUserId(userId: string): Promise<UserSettings | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const settings = this.userSettings.find(settings => settings.userId === userId);
    return settings || null;
  }

  /**
   * Update user settings
   * @param updatedSettings The user settings to update
   */
  async updateUserSettings(updatedSettings: Partial<UserSettings>): Promise<UserSettings> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!updatedSettings.id) {
      throw new Error("Settings ID is required for update");
    }
    
    const index = this.userSettings.findIndex(settings => settings.id === updatedSettings.id);
    
    if (index === -1) {
      throw new Error(`User settings with id ${updatedSettings.id} not found`);
    }
    
    // Update settings
    const currentSettings = this.userSettings[index];
    const newSettings = { ...currentSettings, ...updatedSettings };
    
    this.userSettings[index] = newSettings;
    
    return newSettings;
  }

  /**
   * Create initial user settings for a user
   * @param userId The ID of the user
   */
  async createUserSettings(userId: string): Promise<UserSettings> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if settings already exist
    const existingSettings = await this.getUserSettingsByUserId(userId);
    
    if (existingSettings) {
      return existingSettings;
    }
    
    // Create new settings
    const newSettings: UserSettings = {
      id: uuidv4(),
      userId,
      notificationsEnabled: true,
      language: "es",
      theme: "system",
      email: "" // This would typically be set from the user account data
    };
    
    this.userSettings.push(newSettings);
    
    return newSettings;
  }
}
