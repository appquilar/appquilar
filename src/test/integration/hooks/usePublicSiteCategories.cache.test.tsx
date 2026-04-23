import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

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
import { createTestQueryClient } from "@/test/utils/renderWithProviders";

const CACHE_KEY = "appquilar:publicSiteCategories:v2";

const createWrapper = () => {
  const queryClient = createTestQueryClient();

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("usePublicSiteCategories cache behavior", () => {
  it("boots from session cache without a loading flash and revalidates in the background", async () => {
    vi.stubEnv("VITE_APPQUILAR_SITE_ID", "site-1");
    invalidatePublicSiteCategoriesCache();

    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        siteId: "site-1",
        fetchedAt: Date.now(),
        site: {
          id: "site-1",
          name: "Cached Site",
          title: "Cached Site",
          url: "https://cached.appquilar.test",
          description: null,
          logoId: null,
          faviconId: null,
          primaryColor: "#F19D70",
          categoryIds: ["cat-1"],
          menuCategoryIds: ["cat-1"],
          featuredCategoryIds: [],
        },
        categories: [{ id: "cat-1", name: "Cached", slug: "cached" }],
      })
    );

    getByIdMock.mockResolvedValueOnce({
      id: "site-1",
      name: "Fresh Site",
      title: "Fresh Site",
      url: "https://fresh.appquilar.test",
      description: null,
      logoId: null,
      faviconId: null,
      primaryColor: "#F19D70",
      categoryIds: ["cat-2"],
      menuCategoryIds: [],
      featuredCategoryIds: ["cat-2"],
    });
    getAllCategoriesMock.mockResolvedValueOnce({
      categories: [{ id: "cat-2", name: "Fresh", slug: "fresh" }],
      total: 1,
      page: 1,
      perPage: 50,
    });

    const { result } = renderHook(() => usePublicSiteCategories(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.site?.name).toBe("Cached Site");
    expect(result.current.allCategories.map((category) => category.id)).toEqual(["cat-1"]);

    await waitFor(() => {
      expect(result.current.site?.name).toBe("Fresh Site");
    });

    expect(result.current.featuredCategories.map((category) => category.id)).toEqual(["cat-2"]);
    expect(getByIdMock).toHaveBeenCalledTimes(1);
    expect(getAllCategoriesMock).toHaveBeenCalledTimes(1);
  });

  it("fetches all category pages until the backend total is reached", async () => {
    vi.stubEnv("VITE_APPQUILAR_SITE_ID", "site-1");
    invalidatePublicSiteCategoriesCache();

    getByIdMock.mockResolvedValueOnce({
      id: "site-1",
      name: "Site",
      title: "Site",
      url: "https://appquilar.test",
      description: null,
      logoId: null,
      faviconId: null,
      primaryColor: "#F19D70",
      categoryIds: ["cat-1", "cat-55"],
      menuCategoryIds: ["cat-1"],
      featuredCategoryIds: ["cat-55"],
    });
    getAllCategoriesMock
      .mockResolvedValueOnce({
        categories: Array.from({ length: 50 }, (_, index) => ({
          id: `cat-${index + 1}`,
          name: `Category ${index + 1}`,
          slug: `category-${index + 1}`,
        })),
        total: 55,
        page: 1,
        perPage: 50,
      })
      .mockResolvedValueOnce({
        categories: Array.from({ length: 5 }, (_, index) => ({
          id: `cat-${index + 51}`,
          name: `Category ${index + 51}`,
          slug: `category-${index + 51}`,
        })),
        total: 55,
        page: 2,
        perPage: 50,
      });

    const { result } = renderHook(() => usePublicSiteCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.allCategories).toHaveLength(55);
    });

    expect(getAllCategoriesMock).toHaveBeenNthCalledWith(1, {
      page: 1,
      perPage: 50,
    });
    expect(getAllCategoriesMock).toHaveBeenNthCalledWith(2, {
      page: 2,
      perPage: 50,
    });
    expect(result.current.menuCategories.map((category) => category.id)).toEqual(["cat-1"]);
    expect(result.current.featuredCategories.map((category) => category.id)).toEqual(["cat-55"]);
  });
});
