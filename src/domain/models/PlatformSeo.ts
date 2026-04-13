export type JsonLdNode = Record<string, unknown>;

export type RobotsDirective = "index,follow" | "noindex,follow" | "noindex,nofollow";

export interface PlatformSeoConfig {
    title: string;
    description: string;
    canonicalUrl: string;
    robots?: RobotsDirective;
    keywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogUrl?: string;
    ogType?: string;
    twitterCard?: "summary" | "summary_large_image";
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    jsonLd?: JsonLdNode[];
}

