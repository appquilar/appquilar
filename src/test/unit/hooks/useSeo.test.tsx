import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSeo } from "@/hooks/useSeo";
import type { PlatformSeoConfig } from "@/domain/models/PlatformSeo";

const SeoHarness = ({ config }: { config: PlatformSeoConfig }) => {
  useSeo(config);
  return null;
};

describe("useSeo", () => {
  it("writes public seo metadata into the document head", () => {
    render(
      <SeoHarness
        config={{
          title: "Categorías de alquiler | Appquilar",
          description: "Explora categorías de alquiler en España.",
          canonicalUrl: "https://appquilar.com/categorias",
          robots: "index,follow",
          keywords: ["alquiler", "categorías"],
          ogType: "website",
          jsonLd: [{ "@context": "https://schema.org", "@type": "CollectionPage" }],
        }}
      />
    );

    expect(document.title).toBe("Categorías de alquiler | Appquilar");
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
      "Explora categorías de alquiler en España."
    );
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("index,follow");
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://appquilar.com/categorias"
    );
    expect(document.querySelectorAll('script[data-appquilar-seo-jsonld="true"]')).toHaveLength(1);
  });

  it("replaces stale JSON-LD scripts on rerender and cleans them up on unmount", () => {
    const { rerender, unmount } = render(
      <SeoHarness
        config={{
          title: "Producto | Appquilar",
          description: "Producto publicado",
          canonicalUrl: "https://appquilar.com/producto/taladro",
          jsonLd: [
            { "@context": "https://schema.org", "@type": "Product" },
            { "@context": "https://schema.org", "@type": "BreadcrumbList" },
          ],
        }}
      />
    );

    expect(document.querySelectorAll('script[data-appquilar-seo-jsonld="true"]')).toHaveLength(2);

    rerender(
      <SeoHarness
        config={{
          title: "Buscar | Appquilar",
          description: "Buscar productos",
          canonicalUrl: "https://appquilar.com/buscar?q=taladro",
          robots: "noindex,follow",
          jsonLd: [{ "@context": "https://schema.org", "@type": "SearchResultsPage" }],
        }}
      />
    );

    const jsonLdScripts = document.querySelectorAll('script[data-appquilar-seo-jsonld="true"]');
    expect(jsonLdScripts).toHaveLength(1);
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("noindex,follow");

    unmount();

    expect(document.querySelectorAll('script[data-appquilar-seo-jsonld="true"]')).toHaveLength(0);
  });
});
