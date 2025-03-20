
/**
 * @fileoverview Representa la entidad de información SEO en el dominio de la aplicación
 * @module domain/SeoInfo
 */

/**
 * Entidad de dominio que representa la información SEO para una página
 */
export interface SeoInfo {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
}

/**
 * Validador de entidad SeoInfo
 */
export function validateSeoInfo(seoInfo: SeoInfo): boolean {
  return Boolean(seoInfo.title && seoInfo.description && seoInfo.keywords?.length);
}
