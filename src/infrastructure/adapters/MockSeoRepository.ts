
/**
 * @fileoverview Implementación mock del repositorio SEO
 * @module adapters/MockSeoRepository
 */

import { SeoInfo } from "../../core/domain/SeoInfo";
import { SeoRepository } from "../../core/ports/SeoRepository";

/**
 * Implementación mock del repositorio de SEO para desarrollo
 */
export class MockSeoRepository implements SeoRepository {
  private mockData: Record<string, SeoInfo> = {
    'home': {
      title: 'appquilar | Alquiler de herramientas y equipamiento',
      description: 'Encuentra herramientas y equipos para alquilar. Conecta con empresas locales para cubrir tus necesidades de construcción, jardinería y eventos.',
      keywords: ['alquiler', 'herramientas', 'equipamiento', 'construcción', 'eventos', 'jardín'],
      ogTitle: 'appquilar | La plataforma líder de alquiler',
      ogDescription: 'Alquila herramientas y equipos para tus proyectos',
      canonicalUrl: 'https://appquilar.com'
    },
    'product': {
      title: 'Alquiler de ${productName} | appquilar',
      description: 'Alquila ${productName} de ${companyName}. Disponible por hora, día, semana o mes.',
      keywords: ['alquiler', '${productCategory}', '${productName}', 'herramientas'],
      ogTitle: 'Alquila ${productName}',
      ogDescription: 'Alquila ${productName} desde ${lowestPrice}€ al día',
      canonicalUrl: 'https://appquilar.com/producto/${productSlug}'
    },
    'category': {
      title: '${categoryName} | Alquiler en appquilar',
      description: 'Explora nuestra selección de ${categoryName} disponibles para alquilar. Encuentra las mejores opciones.',
      keywords: ['alquiler', '${categoryName}', 'equipamiento', 'herramientas'],
      ogTitle: 'Alquiler de ${categoryName}',
      ogDescription: 'Explora nuestra selección de ${categoryName} disponibles para alquilar',
      canonicalUrl: 'https://appquilar.com/categoria/${categorySlug}'
    },
    'dashboard': {
      title: 'Panel de Control | appquilar',
      description: 'Gestiona tus alquileres, productos y usuarios en tu panel de control de appquilar.',
      keywords: ['panel', 'gestión', 'alquileres', 'appquilar'],
      canonicalUrl: 'https://appquilar.com/panel'
    }
  };

  /**
   * Obtiene información SEO según la página solicitada
   * @param page Identificador de la página
   * @returns Información SEO para la página
   */
  async getSeoInfo(page: string): Promise<SeoInfo> {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return this.mockData[page] || {
      title: 'appquilar',
      description: 'Plataforma de alquiler de herramientas y equipamiento',
      keywords: ['alquiler', 'herramientas', 'equipamiento']
    };
  }
  
  /**
   * Interpola variables en la información SEO
   * @param seoInfo Base de información SEO
   * @param variables Variables a interpolar
   * @returns Información SEO con variables reemplazadas
   */
  interpolateSeoVariables(seoInfo: SeoInfo, variables: Record<string, string>): SeoInfo {
    const result = {...seoInfo};
    
    Object.keys(result).forEach(key => {
      const value = result[key as keyof SeoInfo];
      if (typeof value === 'string') {
        let interpolatedValue = value;
        Object.entries(variables).forEach(([varName, varValue]) => {
          interpolatedValue = interpolatedValue.replace(`\${${varName}}`, varValue);
        });
        (result as any)[key] = interpolatedValue;
      }
    });
    
    if (result.keywords) {
      result.keywords = result.keywords.map(keyword => {
        let interpolatedKeyword = keyword;
        Object.entries(variables).forEach(([varName, varValue]) => {
          interpolatedKeyword = interpolatedKeyword.replace(`\${${varName}}`, varValue);
        });
        return interpolatedKeyword;
      });
    }
    
    return result;
  }
}
