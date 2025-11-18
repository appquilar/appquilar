
/**
 * @fileoverview Modelo de dominio para la configuración del usuario
 */

export type ThemeType = 'light' | 'dark' | 'system';
export type LanguageType = 'es' | 'en';

export interface Address {
  street: string;
  street2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export interface UserSettings {
  id: string;
  userId: string;
  displayName?: string;
  email: string;
  profileImage?: string;
  notificationsEnabled: boolean;
  language: LanguageType;
  theme: ThemeType;
  address?: Address;
}
