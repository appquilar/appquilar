import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

const { getByIdMock, getAllCategoriesMock } = vi.hoisted(() => ({
  getByIdMock: vi.fn(),
  getAllCategoriesMock: vi.fn(),
}));

vi.mock("@/compositionRoot", () => ({
  compositionRoot: {
    siteService: {
      getById: getByIdMock,
    },
    categoryService: {
      getAllCategories: getAllCategoriesMock,
    },
  },
}));

import {
  invalidatePublicSiteCategoriesCache,
  usePublicSiteCategories,
} from "@/application/hooks/usePublicSiteCategories";

describe("usePublicSiteCategories", () => {
  it("loads site + categories and maps menu/featured/rotating groups", async () => {
    vi.stubEnv("VITE_APPQUILAR_SITE_ID", "site-1");

    getByIdMock.mockResolvedValueOnce({
      id: "site-1",
      name: "Site",
      title: "Site",
      url: "https://appquilar.com",
      description: null,
      logoId: null,
      faviconId: null,
      primaryColor: "#F19D70",
      categoryIds: ["cat-1", "cat-2"],
      menuCategoryIds: ["cat-2"],
      featuredCategoryIds: ["cat-1"],
    });

    getAllCategoriesMock.mockResolvedValueOnce({
      categories: [
        { id: "cat-1", name: "Herramientas", slug: "herramientas" },
        { id: "cat-2", name: "Eventos", slug: "eventos" },
      ],
      total: 2,
      page: 1,
      perPage: 50,
    });

    const { result } = renderHook(() => usePublicSiteCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.site?.id).toBe("site-1");
    });

    expect(result.current.rotatingCategories.map((item) => item.id)).toEqual(["cat-1", "cat-2"]);
    expect(result.current.menuCategories.map((item) => item.id)).toEqual(["cat-2"]);
    expect(result.current.featuredCategories.map((item) => item.id)).toEqual(["cat-1"]);
  });

  it("supports explicit refresh and cache invalidation", async () => {
    vi.stubEnv("VITE_APPQUILAR_SITE_ID", "site-1");

    getByIdMock.mockResolvedValue({
      id: "site-1",
      name: "Site",
      title: "Site",
      url: "https://appquilar.com",
      description: null,
      logoId: null,
      faviconId: null,
      primaryColor: "#F19D70",
      categoryIds: ["cat-1"],
      menuCategoryIds: ["cat-1"],
      featuredCategoryIds: ["cat-1"],
    });

    getAllCategoriesMock.mockResolvedValue({
      categories: [{ id: "cat-1", name: "Herramientas", slug: "herramientas" }],
      total: 1,
      page: 1,
      perPage: 50,
    });

    invalidatePublicSiteCategoriesCache();

    const { result } = renderHook(() => usePublicSiteCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(getByIdMock).toHaveBeenCalledTimes(2);
    expect(getAllCategoriesMock).toHaveBeenCalledTimes(2);
  });

  it("returns explicit error when site env is missing", async () => {
    vi.stubEnv("VITE_APPQUILAR_SITE_ID", "");

    const { result } = renderHook(() => usePublicSiteCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("Falta VITE_APPQUILAR_SITE_ID en el .env");
    });
  });
});
