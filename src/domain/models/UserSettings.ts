
/**
 * @fileoverview Modelo de dominio para la configuración del usuario
 */

export interface UserSettings {
  id: string;
  userId: string;
  displayName?: string;
  email: string;
  profileImage?: string;
  notificationsEnabled: boolean;
  language: 'es' | 'en';
  theme: 'light' | 'dark' | 'system';
}
