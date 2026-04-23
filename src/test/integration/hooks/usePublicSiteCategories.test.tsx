import { StrictMode } from "react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "@/test/utils/renderWithProviders";

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

const createWrapper = (withStrictMode = false) => {
  const queryClient = createTestQueryClient();

  return ({ children }: { children: ReactNode }) => {
    const content = <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    return withStrictMode ? <StrictMode>{content}</StrictMode> : content;
  };
};

describe("usePublicSiteCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidatePublicSiteCategoriesCache();
    sessionStorage.clear();
  });

  it("deduplicates the initial load while StrictMode replays effects", async () => {
    vi.stubEnv("VITE_APPQUILAR_SITE_ID", "site-1");

    let resolveSite: ((value: {
      id: string;
      name: string;
      title: string;
      url: string;
      description: null;
      logoId: null;
      faviconId: null;
      primaryColor: string;
      categoryIds: string[];
      menuCategoryIds: string[];
      featuredCategoryIds: string[];
    }) => void) | null = null;
    let resolveCategories: ((value: {
      categories: { id: string; name: string; slug: string }[];
      total: number;
      page: number;
      perPage: number;
    }) => void) | null = null;

    getByIdMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSite = resolve;
        })
    );
    getAllCategoriesMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveCategories = resolve;
        })
    );

    const { result } = renderHook(() => usePublicSiteCategories(), {
      wrapper: createWrapper(true),
    });

    await waitFor(() => {
      expect(getByIdMock).toHaveBeenCalledTimes(1);
      expect(getAllCategoriesMock).toHaveBeenCalledTimes(1);
      expect(result.current.isLoading).toBe(true);
    });

    await act(async () => {
      resolveSite?.({
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
      resolveCategories?.({
        categories: [{ id: "cat-1", name: "Herramientas", slug: "herramientas" }],
        total: 1,
        page: 1,
        perPage: 50,
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.site?.id).toBe("site-1");
    });
  });

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

    const { result } = renderHook(() => usePublicSiteCategories(), {
      wrapper: createWrapper(),
    });

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

    const { result } = renderHook(() => usePublicSiteCategories(), {
      wrapper: createWrapper(),
    });

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

    const { result } = renderHook(() => usePublicSiteCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("Falta VITE_APPQUILAR_SITE_ID en el .env");
    });
  });
});
