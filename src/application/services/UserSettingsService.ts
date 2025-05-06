
import { UserSettings } from '@/domain/models/UserSettings';
import { IUserSettingsRepository } from '@/domain/repositories/UserSettingsRepository';
import { RepositoryFactory } from '@/infrastructure/repositories/RepositoryFactory';

export class UserSettingsService {
  private static instance: UserSettingsService;
  private repository: IUserSettingsRepository;

  private constructor(repository: IUserSettingsRepository) {
    this.repository = repository;
  }

  public static getInstance(): UserSettingsService {
    if (!UserSettingsService.instance) {
      const repository = RepositoryFactory.getUserSettingsRepository();
      UserSettingsService.instance = new UserSettingsService(repository);
    }
    return UserSettingsService.instance;
  }

  /**
   * Get user settings by user ID
   * @param userId The ID of the user
   */
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    return this.repository.getUserSettingsByUserId(userId);
  }

  /**
   * Update user settings
   * @param settingsData The settings data to update
   */
  async updateUserSettings(settingsData: Partial<UserSettings>): Promise<UserSettings> {
    if (!settingsData.id) {
      throw new Error("Settings ID is required for update");
    }
    return this.repository.updateUserSettings(settingsData);
  }

  /**
   * Ensure user has settings, creating them if they don't exist
   * @param userId The ID of the user
   */
  async ensureUserSettings(userId: string): Promise<UserSettings> {
    const settings = await this.repository.getUserSettingsByUserId(userId);
    if (settings) {
      return settings;
    }
    return this.repository.createUserSettings(userId);
  }

  /**
   * Update user theme preference
   * @param settingsId The settings ID
   * @param theme The new theme value
   */
  async updateTheme(settingsId: string, theme: 'light' | 'dark' | 'system'): Promise<UserSettings> {
    return this.repository.updateUserSettings({
      id: settingsId,
      theme
    });
  }

  /**
   * Update user language preference
   * @param settingsId The settings ID
   * @param language The new language value
   */
  async updateLanguage(settingsId: string, language: 'es' | 'en'): Promise<UserSettings> {
    return this.repository.updateUserSettings({
      id: settingsId,
      language
    });
  }

  /**
   * Update notifications settings
   * @param settingsId The settings ID
   * @param enabled Whether notifications are enabled
   */
  async updateNotifications(settingsId: string, enabled: boolean): Promise<UserSettings> {
    return this.repository.updateUserSettings({
      id: settingsId,
      notificationsEnabled: enabled
    });
  }
}
