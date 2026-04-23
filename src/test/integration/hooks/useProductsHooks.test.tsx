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
  useOwnerProductSummary,
  useProduct,
  useProductBySlug,
  useProducts,
  usePublishProduct,
  useUpdateProduct,
} from "@/application/hooks/useProducts";
import { createTestQueryClient } from "@/test/utils/renderWithProviders";
import type { Product, ProductFormData } from "@/domain/models/Product";
import { ApiError } from "@/infrastructure/http/ApiClient";

const {
  listByOwnerPaginatedMock,
  getOwnerSummaryMock,
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
  getOwnerSummaryMock: vi.fn(),
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
    getOwnerSummary: getOwnerSummaryMock,
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

  it("loads owner product summary from the dedicated summary endpoint", async () => {
    getOwnerSummaryMock.mockResolvedValueOnce({
      total: 23,
      draft: 5,
      published: 12,
      archived: 6,
      active: 12,
    });

    const { result } = renderHook(
      () => useOwnerProductSummary({ ownerId: "owner-1", ownerType: "user" }),
      { wrapper: createWrapper().wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual({
        total: 23,
        draft: 5,
        published: 12,
        archived: 6,
        active: 12,
      });
    });

    expect(getOwnerSummaryMock).toHaveBeenCalledWith("owner-1", "user");
  });

  it("gets owned products count from summary when filters are summary-friendly and falls back otherwise", async () => {
    getOwnerSummaryMock.mockResolvedValueOnce({
      total: 23,
      draft: 5,
      published: 12,
      archived: 6,
      active: 12,
    });
    listByOwnerPaginatedMock.mockResolvedValueOnce({
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
      () =>
        useOwnedProductsCount({
          ownerId: "owner-1",
          ownerType: "user",
          filters: { name: "Taladro" },
        }),
      { wrapper: wrapperB }
    );

    await waitFor(() => {
      expect(resultB.current.data).toBe(2);
    });

    expect(listByOwnerPaginatedMock).toHaveBeenCalledWith(
      "owner-1",
      "user",
      1,
      1,
      { name: "Taladro" }
    );
  });

  it("gets active products count from the owner summary", async () => {
    getOwnerSummaryMock.mockResolvedValueOnce({
      total: 9,
      draft: 2,
      published: 5,
      archived: 2,
      active: 5,
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

    expect(getOwnerSummaryMock).toHaveBeenCalledWith("owner-1", "company");
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

  it("supports disabled product queries and summary-friendly multi-status counts via manual refetch", async () => {
    getOwnerSummaryMock.mockResolvedValueOnce({
      total: 12,
      draft: 3,
      published: 4,
      archived: 5,
      active: 4,
    });

    const emptyDashboard = renderHook(
      () =>
        useDashboardProducts({
          ownerId: "",
          ownerType: "company",
          page: 3,
          perPage: 7,
        }),
      { wrapper: createWrapper().wrapper }
    );

    const dashboardRefetch = await emptyDashboard.result.current.refetch();
    expect(dashboardRefetch.data).toEqual({
      data: [],
      total: 0,
      page: 3,
      perPage: 7,
    });

    const emptySummary = renderHook(
      () => useOwnerProductSummary({ ownerId: "", ownerType: "company" }),
      { wrapper: createWrapper().wrapper }
    );
    const summaryRefetch = await emptySummary.result.current.refetch();
    expect(summaryRefetch.data).toEqual({
      total: 0,
      draft: 0,
      published: 0,
      archived: 0,
      active: 0,
    });

    const byNewId = renderHook(() => useProduct("new"), {
      wrapper: createWrapper().wrapper,
    });
    await expect(byNewId.result.current.refetch()).resolves.toMatchObject({
      data: null,
    });

    const byEmptySlug = renderHook(() => useProductBySlug(undefined), {
      wrapper: createWrapper().wrapper,
    });
    await expect(byEmptySlug.result.current.refetch()).resolves.toMatchObject({
      data: null,
    });

    const counted = renderHook(
      () =>
        useOwnedProductsCount({
          ownerId: "owner-1",
          ownerType: "company",
          filters: {
            publicationStatus: ["draft", "published", "unknown" as never],
          },
        }),
      { wrapper: createWrapper().wrapper }
    );

    await waitFor(() => {
      expect(counted.result.current.data).toBe(7);
    });
  });

  it("creates a product and invalidates products query", async () => {
    const data = sampleFormData();
    createProductMock.mockResolvedValueOnce(undefined);
    const { wrapper, invalidateQueriesSpy } = createWrapper();

    const { result } = renderHook(() => useCreateProduct(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(data);
    });

    expect(createProductMock).toHaveBeenCalledWith(data);
    expect(toastSuccessMock).toHaveBeenCalledWith("Guardado correcto");
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
    expect(toastSuccessMock).toHaveBeenCalledWith("Guardado correcto");
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["products"] });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["product", "updated"] });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["productInventory", "updated", "units"] });
  });

  it("deletes a product and invalidates products query", async () => {
    deleteProductMock.mockResolvedValueOnce(undefined);
    const { wrapper, invalidateQueriesSpy } = createWrapper();

    const { result } = renderHook(() => useDeleteProduct(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync("product-1");
    });

    expect(deleteProductMock).toHaveBeenCalledWith("product-1");
    expect(toastSuccessMock).toHaveBeenCalledWith("Producto eliminado correctamente");
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["products"] });
  });

  it("shows a specific error when deleting a product with rents", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    deleteProductMock.mockRejectedValueOnce(
      new ApiError("Conflict", 409, { error: ["product.delete.has_rents"] })
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteProduct(), { wrapper });

    await expect(result.current.mutateAsync("product-1")).rejects.toThrow("Conflict");

    expect(toastErrorMock).toHaveBeenCalledWith(
      "No puedes eliminar este producto porque ya tiene alquileres asociados."
    );
    consoleErrorSpy.mockRestore();
  });

  it("publishes product with success", async () => {
    publishProductMock.mockResolvedValueOnce(true);
    const { wrapper, invalidateQueriesSpy } = createWrapper();

    const { result } = renderHook(() => usePublishProduct(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync("product-ok");
    });

    expect(toastSuccessMock).toHaveBeenCalledWith("Producto publicado correctamente");
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["products"] });
  });

  it("shows a descriptive product limit error when creating a product", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    createProductMock.mockRejectedValueOnce(
      new ApiError("Bad Request", 400, { error: ["subscription.user.product_limit_reached"] })
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCreateProduct(), { wrapper });

    await expect(result.current.mutateAsync(sampleFormData())).rejects.toThrow("Bad Request");

    expect(toastErrorMock).toHaveBeenCalledWith(
      "Has alcanzado el limite de productos publicados de tu plan. Puedes seguir guardando borradores, pero para publicar otro producto necesitas liberar uno ya publicado o mejorar tu plan."
    );
    consoleErrorSpy.mockRestore();
  });

  it("shows a descriptive product limit error when publishing a product", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    publishProductMock.mockRejectedValueOnce(
      new ApiError("Bad Request", 400, { error: ["subscription.company.product_limit_reached"] })
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => usePublishProduct(), { wrapper });

    await expect(result.current.mutateAsync("product-1")).rejects.toThrow("Bad Request");

    expect(toastErrorMock).toHaveBeenCalledWith(
      "Tu empresa ha alcanzado el limite de productos publicados del plan actual. Puedes seguir guardando borradores, pero para publicar otro producto necesitas despublicar uno existente o mejorar el plan."
    );
    consoleErrorSpy.mockRestore();
  });

  it("shows a descriptive product limit error when saving a product as published", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    updateProductMock.mockRejectedValueOnce(
      new ApiError("Bad Request", 400, { error: ["subscription.user.product_limit_reached"] })
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useUpdateProduct(), { wrapper });

    await expect(
      result.current.mutateAsync({
        id: "product-1",
        data: {
          ...sampleFormData(),
          publicationStatus: "published",
        },
      })
    ).rejects.toThrow("Bad Request");

    expect(toastErrorMock).toHaveBeenCalledWith(
      "Has alcanzado el limite de productos publicados de tu plan. Los cambios se han guardado, pero el producto sigue en borrador hasta que liberes uno ya publicado o mejores tu plan."
    );
    consoleErrorSpy.mockRestore();
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
        quantity: 1,
      })
    ).rejects.toThrow("boom");

    expect(toastErrorMock).toHaveBeenCalledWith(
      "No se pudo crear el producto. Intentalo de nuevo en unos minutos."
    );
    expect(toastErrorMock).toHaveBeenCalledWith("Error al actualizar el producto");
    expect(toastErrorMock).toHaveBeenCalledWith("boom");
    expect(toastErrorMock).toHaveBeenCalledWith(
      "No se pudo publicar el producto. Revisa tu limite de productos publicados e intentalo de nuevo."
    );
    expect(toastErrorMock).toHaveBeenCalledWith("No se pudo calcular el coste del alquiler");
    consoleErrorSpy.mockRestore();
  });

  it("suppresses toasts for validation ApiErrors and prefers human-readable backend messages when present", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    createProductMock.mockRejectedValueOnce(
      new ApiError("Bad Request", 400, {
        errors: {
          name: ["Nombre obligatorio"],
        },
      })
    );
    updateProductMock.mockRejectedValueOnce(
      new ApiError("Bad Request", 400, {
        errors: {
          slug: ["Slug repetido"],
        },
      })
    );
    publishProductMock.mockRejectedValueOnce(
      new ApiError("Bad Request", 400, {
        message: "No puedes publicar este producto hoy.",
      })
    );
    deleteProductMock.mockRejectedValueOnce(
      new ApiError("Bad Request", 400, {
        message: "Producto bloqueado por revisión.",
      })
    );

    const { wrapper } = createWrapper();

    await expect(
      renderHook(() => useCreateProduct(), { wrapper }).result.current.mutateAsync(sampleFormData())
    ).rejects.toThrow("Bad Request");
    await expect(
      renderHook(() => useUpdateProduct(), { wrapper }).result.current.mutateAsync({
        id: "product-1",
        data: sampleFormData(),
      })
    ).rejects.toThrow("Bad Request");
    await expect(
      renderHook(() => usePublishProduct(), { wrapper }).result.current.mutateAsync("product-1")
    ).rejects.toThrow("Bad Request");
    await expect(
      renderHook(() => useDeleteProduct(), { wrapper }).result.current.mutateAsync("product-1")
    ).rejects.toThrow("Bad Request");

    expect(toastErrorMock).toHaveBeenCalledWith("No puedes publicar este producto hoy.");
    expect(toastErrorMock).toHaveBeenCalledWith("Producto bloqueado por revisión.");
    expect(toastErrorMock).not.toHaveBeenCalledWith("Nombre obligatorio");
    expect(toastErrorMock).not.toHaveBeenCalledWith("Slug repetido");
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

  it("exposes legacy mutations and the bound product lookup helper", async () => {
    listByOwnerMock.mockResolvedValueOnce([sampleProduct("owner-2-product")]);
    createProductMock.mockResolvedValueOnce(undefined);
    updateProductMock.mockResolvedValueOnce(sampleProduct("updated-legacy"));
    deleteProductMock.mockResolvedValueOnce(undefined);
    getProductByIdMock.mockResolvedValueOnce(sampleProduct("lookup-id"));

    const { result } = renderHook(() => useProducts("owner-2"), {
      wrapper: createWrapper().wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.createProduct(sampleFormData());
      await result.current.updateProduct("updated-legacy", sampleFormData());
      await result.current.deleteProduct("updated-legacy");
    });

    await expect(result.current.getProductById("lookup-id")).resolves.toMatchObject({
      id: "lookup-id",
    });

    expect(createProductMock).toHaveBeenCalledTimes(1);
    expect(updateProductMock).toHaveBeenCalledWith("updated-legacy", sampleFormData());
    expect(deleteProductMock).toHaveBeenCalledWith("updated-legacy");
    expect(getProductByIdMock).toHaveBeenCalledWith("lookup-id");
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
