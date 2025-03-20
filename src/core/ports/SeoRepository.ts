
/**
 * @fileoverview Puerto para el repositorio de información SEO
 * @module ports/SeoRepository
 */

import { SeoInfo } from "../domain/SeoInfo";

/**
 * Puerto de repositorio para obtener información SEO
 */
export interface SeoRepository {
  /**
   * Obtiene la información SEO para una página específica
   * @param page Identificador de la página
   */
  getSeoInfo(page: string): Promise<SeoInfo>;
}
