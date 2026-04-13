import { describe, expect, it } from "vitest";
import { SeoService } from "@/core/application/SeoService";

describe("SeoService", () => {
  it("fills defaults for public platform metadata", () => {
    const service = new SeoService();

    const seo = service.getSeo({
      title: "Inicio | Appquilar",
      description: "Marketplace de alquiler",
      canonicalUrl: "https://appquilar.com/",
    });

    expect(seo.robots).toBe("index,follow");
    expect(seo.ogTitle).toBe("Inicio | Appquilar");
    expect(seo.ogDescription).toBe("Marketplace de alquiler");
    expect(seo.ogImage).toBe(`${window.location.origin}/appquilar-combined-orange.png`);
    expect(seo.twitterCard).toBe("summary_large_image");
    expect(seo.twitterImage).toBe(`${window.location.origin}/appquilar-combined-orange.png`);
    expect(seo.keywords).toContain("España");
  });

  it("keeps explicit overrides for canonical social metadata", () => {
    const service = new SeoService();

    const seo = service.getSeo({
      title: "Taladro Bosch | Appquilar",
      description: "Taladro en alquiler",
      canonicalUrl: "https://appquilar.com/producto/taladro-bosch",
      robots: "noindex,follow",
      ogType: "product",
      ogImage: "https://cdn.appquilar.com/taladro.jpg",
      twitterCard: "summary",
      jsonLd: [{ "@type": "Product" }],
    });

    expect(seo.robots).toBe("noindex,follow");
    expect(seo.ogType).toBe("product");
    expect(seo.ogImage).toBe("https://cdn.appquilar.com/taladro.jpg");
    expect(seo.twitterCard).toBe("summary");
    expect(seo.jsonLd).toEqual([{ "@type": "Product" }]);
  });
});
