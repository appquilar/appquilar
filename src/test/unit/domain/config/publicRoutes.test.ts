import { describe, expect, it } from "vitest";
import {
  LEGACY_PUBLIC_PATHS,
  PUBLIC_PATHS,
  buildAbsolutePublicUrl,
  buildBlogPagePath,
  buildBlogPostPath,
  buildCategoryPath,
  buildProductPath,
  buildSearchPath,
} from "@/domain/config/publicRoutes";

describe("publicRoutes", () => {
  it("exposes Spanish canonical public paths", () => {
    expect(PUBLIC_PATHS.categories).toBe("/categorias");
    expect(PUBLIC_PATHS.search).toBe("/buscar");
    expect(PUBLIC_PATHS.about).toBe("/quienes-somos");
    expect(PUBLIC_PATHS.contact).toBe("/contacto");
    expect(PUBLIC_PATHS.partners).toBe("/colabora-con-nosotros");
  });

  it("keeps English legacy aliases for compatibility redirects", () => {
    expect(LEGACY_PUBLIC_PATHS.categories).toBe("/categories");
    expect(LEGACY_PUBLIC_PATHS.category).toBe("/category/:slug");
    expect(LEGACY_PUBLIC_PATHS.product).toBe("/product/:slug");
    expect(LEGACY_PUBLIC_PATHS.search).toBe("/search");
  });

  it("builds canonical Spanish urls for categories, products, blog and search", () => {
    expect(buildCategoryPath("taladros")).toBe("/categoria/taladros");
    expect(buildProductPath("taladro-bosch")).toBe("/producto/taladro-bosch");
    expect(buildBlogPostPath("guias/taladro-bosch")).toBe("/blog/guias/taladro-bosch");
    expect(buildSearchPath("taladro bosch")).toBe("/buscar?q=taladro%20bosch");
    expect(buildBlogPagePath(1)).toBe("/blog");
    expect(buildBlogPagePath(3)).toBe("/blog?page=3");
  });

  it("uses the browser origin when building absolute public urls", () => {
    expect(buildAbsolutePublicUrl("/categoria/taladros")).toBe(
      `${window.location.origin}/categoria/taladros`
    );
  });
});
