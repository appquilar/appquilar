// Define the context interface locally if not available, or import it
import {SeoRepository} from "@/core/ports/SeoRepository.ts";
import {MockSeoRepository} from "@/infrastructure/adapters/MockSeoRepository.ts";
import {SeoInfo} from "@/core/domain/SeoInfo.ts";

export interface SeoContext {
    title?: string;
    description?: string;
    keywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    // other fields...
}

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
     * Adapta un contexto dinámico a un objeto SeoInfo completo.
     * Método añadido para soportar la llamada desde useSeo hook.
     */
    getSeo(context: any): SeoInfo {
        const defaultSeo: SeoInfo = {
            title: "Appquilar - Alquila lo que necesites",
            description: "Plataforma de alquiler de herramientas y maquinaria.",
            keywords: ["alquiler", "herramientas", "maquinaria"],
            ogTitle: "Appquilar",
            ogDescription: "Plataforma de alquiler.",
            ogImage: "https://appquilar.com/og-image.jpg",
            twitterCard: "summary_large_image",
            twitterTitle: "Appquilar",
            twitterDescription: "Plataforma de alquiler.",
            twitterImage: "https://appquilar.com/twitter-image.jpg",
            canonicalUrl: typeof window !== 'undefined' ? window.location.href : ''
        };

        if (!context) return defaultSeo;

        return {
            ...defaultSeo,
            ...context,
            // Ensure fallbacks
            title: context.title || defaultSeo.title,
            description: context.description || defaultSeo.description,
            ogTitle: context.ogTitle || context.title || defaultSeo.ogTitle,
            ogDescription: context.ogDescription || context.description || defaultSeo.ogDescription,
            ogImage: context.ogImage || defaultSeo.ogImage
        };
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
     */
    async getProductSeoInfo(
        productSlug: string,
        productName: string,
        companyName: string,
        productCategory: string,
        lowestPrice: number
    ): Promise<SeoInfo> {
        const baseSeoInfo = await this.seoRepository.getSeoInfo('product');

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
     */
    async getCategorySeoInfo(
        categorySlug: string,
        categoryName: string
    ): Promise<SeoInfo> {
        const baseSeoInfo = await this.seoRepository.getSeoInfo('category');

        return (this.seoRepository as MockSeoRepository).interpolateSeoVariables(
            baseSeoInfo,
            {
                categorySlug,
                categoryName
            }
        );
    }
}
