import type { PlatformSeoConfig } from "@/domain/models/PlatformSeo";
import { buildAbsolutePublicUrl } from "@/domain/config/publicRoutes";

export class SeoService {
    private readonly defaultTitle = "Appquilar | Marketplace de alquiler en España";
    private readonly defaultDescription =
        "Appquilar es el marketplace para alquilar herramientas, equipamiento y productos cerca de ti en España.";
    private readonly defaultKeywords = [
        "alquiler",
        "marketplace de alquiler",
        "alquilar herramientas",
        "alquilar productos",
        "Appquilar",
        "España",
    ];
    private readonly defaultOgImage = buildAbsolutePublicUrl("/appquilar-combined-orange.png");

    getSeo(config: PlatformSeoConfig): PlatformSeoConfig {
        return {
            ...config,
            title: config.title || this.defaultTitle,
            description: config.description || this.defaultDescription,
            canonicalUrl: config.canonicalUrl || buildAbsolutePublicUrl("/"),
            robots: config.robots ?? "index,follow",
            keywords: config.keywords && config.keywords.length > 0 ? config.keywords : this.defaultKeywords,
            ogTitle: config.ogTitle || config.title || this.defaultTitle,
            ogDescription: config.ogDescription || config.description || this.defaultDescription,
            ogImage: config.ogImage || this.defaultOgImage,
            ogUrl: config.ogUrl || config.canonicalUrl || buildAbsolutePublicUrl("/"),
            ogType: config.ogType || "website",
            twitterCard: config.twitterCard || "summary_large_image",
            twitterTitle: config.twitterTitle || config.ogTitle || config.title || this.defaultTitle,
            twitterDescription:
                config.twitterDescription || config.ogDescription || config.description || this.defaultDescription,
            twitterImage: config.twitterImage || config.ogImage || this.defaultOgImage,
            jsonLd: config.jsonLd ?? [],
        };
    }
}
