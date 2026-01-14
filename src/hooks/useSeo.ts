import { useEffect } from "react";
import { SeoContext } from "@/core/application/SeoService";
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

export const useSeo = (context: SeoContext, options?: { noIndex?: boolean }) => {
    useEffect(() => {
        // Guard against missing context
        if (!context) return;

        // Use the service to get/merge SEO info
        const seo = seoService.getSeo(context);

        // Guard against service returning null/undefined
        if (!seo) return;

        document.title = seo.title;

        if (seo.description) setMeta("description", seo.description);
        if (seo.keywords && seo.keywords.length > 0) setMeta("keywords", seo.keywords.join(", "));

        if (seo.ogTitle) setProperty("og:title", seo.ogTitle);
        if (seo.ogDescription) setProperty("og:description", seo.ogDescription);
        if (seo.ogImage) setProperty("og:image", seo.ogImage);

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

        if (options?.noIndex) {
            setMeta("robots", "noindex,nofollow");
        }
    }, [context, options]);
};