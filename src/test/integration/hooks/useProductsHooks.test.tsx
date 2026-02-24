import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  useActiveProductsCount,
  useCalculateRentalCost,
  useCreateProduct,
  useDashboardProducts,
  useDeleteProduct,
  useOwnedProductsCount,
  useProduct,
  useProductBySlug,
  useProducts,
  usePublishProduct,
  useUpdateProduct,
} from "@/application/hooks/useProducts";
import { createTestQueryClient } from "@/test/utils/renderWithProviders";
import type { Product, ProductFormData } from "@/domain/models/Product";

const {
  listByOwnerPaginatedMock,
  getProductByIdMock,
  getBySlugMock,
  createProductMock,
  updateProductMock,
  deleteProductMock,
  publishProductMock,
  calculateRentalCostMock,
  listByOwnerMock,
  getAllProductsMock,
  toastSuccessMock,
  toastErrorMock,
} = vi.hoisted(() => ({
  listByOwnerPaginatedMock: vi.fn(),
  getProductByIdMock: vi.fn(),
  getBySlugMock: vi.fn(),
  createProductMock: vi.fn(),
  updateProductMock: vi.fn(),
  deleteProductMock: vi.fn(),
  publishProductMock: vi.fn(),
  calculateRentalCostMock: vi.fn(),
  listByOwnerMock: vi.fn(),
  getAllProductsMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock("@/compositionRoot", () => ({
  productService: {
    listByOwnerPaginated: listByOwnerPaginatedMock,
    getProductById: getProductByIdMock,
    getBySlug: getBySlugMock,
    createProduct: createProductMock,
    updateProduct: updateProductMock,
    deleteProduct: deleteProductMock,
    publishProduct: publishProductMock,
    calculateRentalCost: calculateRentalCostMock,
    listByOwner: listByOwnerMock,
    getAllProducts: getAllProductsMock,
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

const sampleProduct = (id = "p1"): Product =>
  ({
    id,
    internalId: `int-${id}`,
    name: `Product ${id}`,
    slug: `product-${id}`,
    description: "desc",
    imageUrl: "/image.png",
    thumbnailUrl: "/thumb.png",
    publicationStatus: "published",
    price: { deposit: 100 },
    category: { id: "cat-1", name: "Tools", slug: "tools" },
    rating: 0,
    reviewCount: 0,
    ownerData: {
      ownerId: "owner-1",
      type: "user",
      name: "Victor",
    },
  }) as Product;

const sampleFormData = (): ProductFormData =>
  ({
    name: "Taladro",
    slug: "taladro",
    description: "Taladro profesional",
    imageUrl: "/image.png",
    thumbnailUrl: "/thumb.png",
    publicationStatus: "draft",
    price: { daily: 1500 },
    isRentable: true,
    isForSale: false,
    companyId: "company-1",
    categoryId: "cat-1",
    currentTab: "basic",
    images: [],
  }) as ProductFormData;

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { wrapper, invalidateQueriesSpy };
};

describe("useProducts hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads dashboard products with owner and filters", async () => {
    listByOwnerPaginatedMock.mockResolvedValueOnce({
      data: [{ id: "p1", name: "Taladro" }],
      total: 1,
      page: 2,
      perPage: 10,
    });

    const { result } = renderHook(
      () =>
        useDashboardProducts({
          ownerId: "owner-1",
          ownerType: "company",
          page: 2,
          perPage: 10,
          filters: { publicationStatus: "published" },
        }),
      {
        wrapper: createWrapper().wrapper,
      }
    );

    await waitFor(() => {
      expect(result.current.data?.total).toBe(1);
    });

    expect(listByOwnerPaginatedMock).toHaveBeenCalledWith(
      "owner-1",
      "company",
      2,
      10,
      { publicationStatus: "published" }
    );
  });

  it("gets owned products count using total and fallback to data length", async () => {
    listByOwnerPaginatedMock
      .mockResolvedValueOnce({
        data: [{ id: "p1" }],
        total: 23,
        page: 1,
        perPage: 1,
      })
      .mockResolvedValueOnce({
        data: [{ id: "p1" }, { id: "p2" }],
        page: 1,
        perPage: 1,
      });

    const wrapperA = createWrapper().wrapper;
    const { result: resultA } = renderHook(
      () => useOwnedProductsCount({ ownerId: "owner-1", ownerType: "user" }),
      { wrapper: wrapperA }
    );

    await waitFor(() => {
      expect(resultA.current.data).toBe(23);
    });

    const wrapperB = createWrapper().wrapper;
    const { result: resultB } = renderHook(
      () => useOwnedProductsCount({ ownerId: "owner-1", ownerType: "user" }),
      { wrapper: wrapperB }
    );

    await waitFor(() => {
      expect(resultB.current.data).toBe(2);
    });
  });

  it("gets active products count filtering publicationStatus=published", async () => {
    listByOwnerPaginatedMock.mockResolvedValueOnce({
      data: [],
      total: 5,
      page: 1,
      perPage: 1,
    });

    const { result } = renderHook(
      () => useActiveProductsCount({ ownerId: "owner-1", ownerType: "company" }),
      {
        wrapper: createWrapper().wrapper,
      }
    );

    await waitFor(() => {
      expect(result.current.data).toBe(5);
    });

    expect(listByOwnerPaginatedMock).toHaveBeenCalledWith("owner-1", "company", 1, 1, {
      publicationStatus: "published",
    });
  });

  it("gets product by id and by slug", async () => {
    getProductByIdMock.mockResolvedValueOnce(sampleProduct("p-by-id"));
    getBySlugMock.mockResolvedValueOnce(sampleProduct("p-by-slug"));

    const { result: byIdResult } = renderHook(() => useProduct("p-by-id"), {
      wrapper: createWrapper().wrapper,
    });

    await waitFor(() => {
      expect(byIdResult.current.data?.id).toBe("p-by-id");
    });

    const { result: bySlugResult } = renderHook(
      () => useProductBySlug("slug-product"),
      {
        wrapper: createWrapper().wrapper,
      }
    );

    await waitFor(() => {
      expect(bySlugResult.current.data?.id).toBe("p-by-slug");
    });

    expect(getProductByIdMock).toHaveBeenCalledWith("p-by-id");
    expect(getBySlugMock).toHaveBeenCalledWith("slug-product");
  });

  it("creates a product and invalidates products query", async () => {
    const data = sampleFormData();
    createProductMock.mockResolvedValueOnce(sampleProduct("created"));
    const { wrapper, invalidateQueriesSpy } = createWrapper();

    const { result } = renderHook(() => useCreateProduct(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(data);
    });

    expect(createProductMock).toHaveBeenCalledWith(data);
    expect(toastSuccessMock).toHaveBeenCalledWith("Producto creado correctamente");
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["products"] });
  });

  it("updates a product and invalidates products + product detail queries", async () => {
    const data = sampleFormData();
    updateProductMock.mockResolvedValueOnce(sampleProduct("updated"));
    const { wrapper, invalidateQueriesSpy } = createWrapper();

    const { result } = renderHook(() => useUpdateProduct(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: "updated", data });
    });

    expect(updateProductMock).toHaveBeenCalledWith("updated", data);
    expect(toastSuccessMock).toHaveBeenCalledWith("Producto actualizado correctamente");
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["products"] });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["product", "updated"] });
  });

  it("deletes a product and invalidates products query", async () => {
    deleteProductMock.mockResolvedValueOnce(undefined);
    const { wrapper, invalidateQueriesSpy } = createWrapper();

    const { result } = renderHook(() => useDeleteProduct(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync("product-1");
    });

    expect(deleteProductMock).toHaveBeenCalledWith("product-1");
    expect(toastSuccessMock).toHaveBeenCalledWith("Producto archivado correctamente");
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["products"] });
  });

  it("publishes product with success and non-success flows", async () => {
    publishProductMock.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const { wrapper, invalidateQueriesSpy } = createWrapper();

    const { result } = renderHook(() => usePublishProduct(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync("product-ok");
      await result.current.mutateAsync("product-ko");
    });

    expect(toastSuccessMock).toHaveBeenCalledWith("Producto publicado correctamente");
    expect(toastErrorMock).toHaveBeenCalledWith("No se pudo publicar el producto");
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["products"] });
  });

  it("shows errors for failing mutations and rental cost calculation", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const error = new Error("boom");
    createProductMock.mockRejectedValueOnce(error);
    updateProductMock.mockRejectedValueOnce(error);
    deleteProductMock.mockRejectedValueOnce(error);
    publishProductMock.mockRejectedValueOnce(error);
    calculateRentalCostMock.mockRejectedValueOnce(error);
    const { wrapper } = createWrapper();

    const { result: createResult } = renderHook(() => useCreateProduct(), { wrapper });
    const { result: updateResult } = renderHook(() => useUpdateProduct(), { wrapper });
    const { result: deleteResult } = renderHook(() => useDeleteProduct(), { wrapper });
    const { result: publishResult } = renderHook(() => usePublishProduct(), { wrapper });
    const { result: rentalCostResult } = renderHook(() => useCalculateRentalCost(), { wrapper });

    await expect(createResult.current.mutateAsync(sampleFormData())).rejects.toThrow("boom");
    await expect(
      updateResult.current.mutateAsync({ id: "p-1", data: sampleFormData() })
    ).rejects.toThrow("boom");
    await expect(deleteResult.current.mutateAsync("p-1")).rejects.toThrow("boom");
    await expect(publishResult.current.mutateAsync("p-1")).rejects.toThrow("boom");
    await expect(
      rentalCostResult.current.mutateAsync({
        productId: "p-1",
        startDate: "2026-02-24",
        endDate: "2026-02-26",
      })
    ).rejects.toThrow("boom");

    expect(toastErrorMock).toHaveBeenCalledWith("Error al crear el producto");
    expect(toastErrorMock).toHaveBeenCalledWith("Error al actualizar el producto");
    expect(toastErrorMock).toHaveBeenCalledWith("Error al archivar el producto");
    expect(toastErrorMock).toHaveBeenCalledWith("Error al publicar el producto");
    expect(toastErrorMock).toHaveBeenCalledWith("No se pudo calcular el coste del alquiler");
    consoleErrorSpy.mockRestore();
  });

  it("loads products through legacy useProducts hook for owner and for all products", async () => {
    listByOwnerMock.mockResolvedValueOnce([sampleProduct("owner-1-product")]);
    getAllProductsMock.mockResolvedValueOnce([sampleProduct("all-products-item")]);

    const ownerHook = renderHook(() => useProducts("owner-1"), {
      wrapper: createWrapper().wrapper,
    });
    await waitFor(() => {
      expect(ownerHook.result.current.isLoading).toBe(false);
    });
    expect(ownerHook.result.current.products).toHaveLength(1);
    expect(listByOwnerMock).toHaveBeenCalledWith("owner-1");

    const allHook = renderHook(() => useProducts(), {
      wrapper: createWrapper().wrapper,
    });
    await waitFor(() => {
      expect(allHook.result.current.isLoading).toBe(false);
    });
    expect(allHook.result.current.products).toHaveLength(1);
    expect(getAllProductsMock).toHaveBeenCalledTimes(1);
  });

  it("sets legacy useProducts error when product loading fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    listByOwnerMock.mockRejectedValueOnce(new Error("load failed"));

    const { result } = renderHook(() => useProducts("owner-1"), {
      wrapper: createWrapper().wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("Error loading products");
    });

    errorSpy.mockRestore();
  });
});
