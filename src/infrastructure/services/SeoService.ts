
/**
 * @fileoverview Servicio para gestionar la información SEO
 * @module services/SeoService
 */

import { SeoInfo } from "../../core/domain/SeoInfo";
import { SeoRepository } from "../../core/ports/SeoRepository";
import { MockSeoRepository } from "../adapters/MockSeoRepository";

/**
 * Servicio para la gestión de SEO en la aplicación
 */
export class SeoService {
  private seoRepository: SeoRepository;
  private static instance: SeoService;

  /**
   * Constructor privado para implementar patrón Singleton
   */
  private constructor() {
    // En producción, esto sería inyectado o configurado según el entorno
    this.seoRepository = new MockSeoRepository();
  }

  /**
   * Obtiene la instancia singleton del servicio
   */
  public static getInstance(): SeoService {
    if (!SeoService.instance) {
      SeoService.instance = new SeoService();
    }
    return SeoService.instance;
  }

  /**
   * Obtiene información SEO para una página
   * @param page Identificador de la página
   * @returns Información SEO
   */
  async getSeoInfo(page: string): Promise<SeoInfo> {
    return this.seoRepository.getSeoInfo(page);
  }

  /**
   * Obtiene información SEO para la página de producto con variables
   * @param productSlug Slug del producto
   * @param productName Nombre del producto
   * @param companyName Nombre de la empresa
   * @param productCategory Categoría del producto
   * @param lowestPrice Precio más bajo
   * @returns Información SEO para el producto
   */
  async getProductSeoInfo(
    productSlug: string,
    productName: string,
    companyName: string,
    productCategory: string,
    lowestPrice: number
  ): Promise<SeoInfo> {
    const baseSeoInfo = await this.seoRepository.getSeoInfo('product');
    
    // Aplicar interpolación de variables
    return (this.seoRepository as MockSeoRepository).interpolateSeoVariables(
      baseSeoInfo,
      {
        productSlug,
        productName,
        companyName,
        productCategory,
        lowestPrice: lowestPrice.toString()
      }
    );
  }

  /**
   * Obtiene información SEO para la página de categoría con variables
   * @param categorySlug Slug de la categoría
   * @param categoryName Nombre de la categoría
   * @returns Información SEO para la categoría
   */
  async getCategorySeoInfo(
    categorySlug: string,
    categoryName: string
  ): Promise<SeoInfo> {
    const baseSeoInfo = await this.seoRepository.getSeoInfo('category');
    
    // Aplicar interpolación de variables
    return (this.seoRepository as MockSeoRepository).interpolateSeoVariables(
      baseSeoInfo,
      {
        categorySlug,
        categoryName
      }
    );
  }
}
