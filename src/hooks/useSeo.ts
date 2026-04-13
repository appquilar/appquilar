import { useEffect } from "react";
import type { PlatformSeoConfig } from "@/domain/models/PlatformSeo";
import { seoService } from "@/compositionRoot";

function setMeta(name: string, content: string) {
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
    if (!meta) {
        meta = document.createElement("meta");
        meta.name = name;
        document.head.appendChild(meta);
    }
    meta.content = content;
}

function setProperty(property: string, content: string) {
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
    if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
    }
    meta.content = content;
}

const JSON_LD_SELECTOR = 'script[data-appquilar-seo-jsonld="true"]';

const setJsonLd = (nodes: Record<string, unknown>[]) => {
    document.querySelectorAll(JSON_LD_SELECTOR).forEach((node) => node.remove());

    for (const node of nodes) {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.dataset.appquilarSeoJsonld = "true";
        script.text = JSON.stringify(node);
        document.head.appendChild(script);
    }
};

export const useSeo = (config: PlatformSeoConfig) => {
    useEffect(() => {
        if (!config) return;

        const seo = seoService.getSeo(config);

        document.title = seo.title;

        if (seo.description) setMeta("description", seo.description);
        if (seo.keywords && seo.keywords.length > 0) setMeta("keywords", seo.keywords.join(", "));
        if (seo.robots) setMeta("robots", seo.robots);

        if (seo.ogTitle) setProperty("og:title", seo.ogTitle);
        if (seo.ogDescription) setProperty("og:description", seo.ogDescription);
        if (seo.ogImage) setProperty("og:image", seo.ogImage);
        if (seo.ogUrl) setProperty("og:url", seo.ogUrl);
        if (seo.ogType) setProperty("og:type", seo.ogType);

        if (seo.twitterCard) setMeta("twitter:card", seo.twitterCard);
        if (seo.twitterTitle) setMeta("twitter:title", seo.twitterTitle);
        if (seo.twitterDescription) setMeta("twitter:description", seo.twitterDescription);
        if (seo.twitterImage) setMeta("twitter:image", seo.twitterImage);

        if (seo.canonicalUrl) {
            let link = document.querySelector(
                'link[rel="canonical"]'
            ) as HTMLLinkElement | null;

            if (!link) {
                link = document.createElement("link");
                link.rel = "canonical";
                document.head.appendChild(link);
            }

            link.href = seo.canonicalUrl;
        }

        setJsonLd(seo.jsonLd ?? []);

        return () => {
            document.querySelectorAll(JSON_LD_SELECTOR).forEach((node) => node.remove());
        };
    }, [config]);
};
