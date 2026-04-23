import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    useAdminBlogCategories,
    useAdminBlogPost,
    useAdminBlogPosts,
    useCreateBlogCategory,
    useCreateBlogPost,
    useDeleteBlogCategory,
    useDeleteBlogPost,
    useDraftBlogPost,
    usePublicBlogPost,
    usePublicBlogPosts,
    usePublishBlogPost,
    useScheduleBlogPost,
    useUpdateBlogPost,
} from "@/application/hooks/useBlog";
import { createTestQueryClient } from "@/test/utils/renderWithProviders";

const {
    blogServiceMock,
    toastSuccessMock,
    toastErrorMock,
} = vi.hoisted(() => ({
    blogServiceMock: {
        listPublicPosts: vi.fn(),
        getPublicPostBySlug: vi.fn(),
        listAdminPosts: vi.fn(),
        getAdminPostById: vi.fn(),
        listCategories: vi.fn(),
        createPost: vi.fn(),
        updatePost: vi.fn(),
        deletePost: vi.fn(),
        publishPost: vi.fn(),
        draftPost: vi.fn(),
        schedulePost: vi.fn(),
        createCategory: vi.fn(),
        deleteCategory: vi.fn(),
    },
    toastSuccessMock: vi.fn(),
    toastErrorMock: vi.fn(),
}));

vi.mock("@/compositionRoot", () => ({
    blogService: blogServiceMock,
}));

vi.mock("sonner", () => ({
    toast: {
        success: (...args: unknown[]) => toastSuccessMock(...args),
        error: (...args: unknown[]) => toastErrorMock(...args),
    },
}));

const createWrapper = () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    return {
        wrapper,
        invalidateQueriesSpy,
    };
};

describe("application blog hooks coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("loads public and admin blog queries with safe defaults", async () => {
        blogServiceMock.listPublicPosts.mockResolvedValueOnce({
            data: [{ postId: "post-1" }],
            total: 1,
            page: 1,
            perPage: 10,
        });
        blogServiceMock.getPublicPostBySlug.mockResolvedValueOnce({
            postId: "public-post",
            slug: "public-post",
        });
        blogServiceMock.listAdminPosts.mockResolvedValueOnce({
            data: [{ postId: "admin-post" }],
            total: 1,
            page: 2,
            perPage: 20,
        });
        blogServiceMock.getAdminPostById.mockResolvedValueOnce({
            postId: "admin-post",
            slug: "admin-post",
        });
        blogServiceMock.listCategories.mockResolvedValueOnce([
            { categoryId: "category-1", name: "Noticias" },
        ]);

        const publicPosts = renderHook(() => usePublicBlogPosts(), {
            wrapper: createWrapper().wrapper,
        });
        await waitFor(() => {
            expect(publicPosts.result.current.data?.data).toHaveLength(1);
        });
        expect(blogServiceMock.listPublicPosts).toHaveBeenCalledWith({
            page: 1,
            perPage: 10,
            text: undefined,
        });

        const publicPost = renderHook(() => usePublicBlogPost("public-post"), {
            wrapper: createWrapper().wrapper,
        });
        await waitFor(() => {
            expect(publicPost.result.current.data?.postId).toBe("public-post");
        });

        const emptyPublicPost = renderHook(() => usePublicBlogPost(undefined), {
            wrapper: createWrapper().wrapper,
        });
        expect(emptyPublicPost.result.current.fetchStatus).toBe("idle");

        const adminPosts = renderHook(() => useAdminBlogPosts({ page: 2 }, true), {
            wrapper: createWrapper().wrapper,
        });
        await waitFor(() => {
            expect(adminPosts.result.current.data?.page).toBe(2);
        });
        expect(blogServiceMock.listAdminPosts).toHaveBeenCalledWith({
            page: 2,
            perPage: 20,
            text: undefined,
            status: undefined,
        });

        const adminPost = renderHook(() => useAdminBlogPost("admin-post"), {
            wrapper: createWrapper().wrapper,
        });
        await waitFor(() => {
            expect(adminPost.result.current.data?.postId).toBe("admin-post");
        });

        const disabledAdminPost = renderHook(() => useAdminBlogPost("admin-post", false), {
            wrapper: createWrapper().wrapper,
        });
        expect(disabledAdminPost.result.current.fetchStatus).toBe("idle");

        const adminCategories = renderHook(() => useAdminBlogCategories(), {
            wrapper: createWrapper().wrapper,
        });
        await waitFor(() => {
            expect(adminCategories.result.current.data?.[0]?.categoryId).toBe("category-1");
        });
    });

    it("invalidates blog queries on successful mutations and surfaces backend errors", async () => {
        blogServiceMock.createPost.mockResolvedValueOnce(undefined);
        blogServiceMock.updatePost.mockResolvedValueOnce(undefined);
        blogServiceMock.deletePost.mockResolvedValueOnce(undefined);
        blogServiceMock.publishPost.mockResolvedValueOnce(undefined);
        blogServiceMock.draftPost.mockResolvedValueOnce(undefined);
        blogServiceMock.schedulePost.mockResolvedValueOnce(undefined);
        blogServiceMock.createCategory.mockResolvedValueOnce(undefined);
        blogServiceMock.deleteCategory.mockResolvedValueOnce(undefined);

        const createWrapperData = createWrapper();
        const createResult = renderHook(() => useCreateBlogPost(), {
            wrapper: createWrapperData.wrapper,
        });
        await act(async () => {
            await createResult.result.current.mutateAsync({ postId: "post-1" } as never);
        });
        expect(toastSuccessMock).toHaveBeenCalledWith("Post creado correctamente.");
        expect(createWrapperData.invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: ["blog", "public"],
        });
        expect(createWrapperData.invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: ["blog", "admin"],
        });

        const updateWrapperData = createWrapper();
        const updateResult = renderHook(() => useUpdateBlogPost(), {
            wrapper: updateWrapperData.wrapper,
        });
        await act(async () => {
            await updateResult.result.current.mutateAsync({
                postId: "post-1",
                payload: { title: "Nuevo título" } as never,
            });
        });
        expect(toastSuccessMock).toHaveBeenCalledWith("Post actualizado correctamente.");
        expect(updateWrapperData.invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: ["blog", "admin", "post", "post-1"],
        });

        const deleteWrapperData = createWrapper();
        const deleteResult = renderHook(() => useDeleteBlogPost(), {
            wrapper: deleteWrapperData.wrapper,
        });
        await act(async () => {
            await deleteResult.result.current.mutateAsync("post-1");
        });
        expect(toastSuccessMock).toHaveBeenCalledWith("Post eliminado.");

        const publishWrapperData = createWrapper();
        const publishResult = renderHook(() => usePublishBlogPost(), {
            wrapper: publishWrapperData.wrapper,
        });
        await act(async () => {
            await publishResult.result.current.mutateAsync("post-1");
        });
        expect(toastSuccessMock).toHaveBeenCalledWith("Post publicado.");

        const draftWrapperData = createWrapper();
        const draftResult = renderHook(() => useDraftBlogPost(), {
            wrapper: draftWrapperData.wrapper,
        });
        await act(async () => {
            await draftResult.result.current.mutateAsync("post-1");
        });
        expect(toastSuccessMock).toHaveBeenCalledWith("Post movido a borrador.");

        const scheduleWrapperData = createWrapper();
        const scheduleResult = renderHook(() => useScheduleBlogPost(), {
            wrapper: scheduleWrapperData.wrapper,
        });
        await act(async () => {
            await scheduleResult.result.current.mutateAsync({
                postId: "post-1",
                scheduledFor: "2026-04-25T09:00:00Z",
            });
        });
        expect(toastSuccessMock).toHaveBeenCalledWith("Post programado.");

        const createCategoryWrapper = createWrapper();
        const createCategoryResult = renderHook(() => useCreateBlogCategory(), {
            wrapper: createCategoryWrapper.wrapper,
        });
        await act(async () => {
            await createCategoryResult.result.current.mutateAsync({
                categoryId: "category-1",
                name: "Noticias",
            });
        });
        expect(toastSuccessMock).toHaveBeenCalledWith("Categoría creada.");
        expect(createCategoryWrapper.invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: ["blog", "admin", "categories"],
        });

        const deleteCategoryWrapper = createWrapper();
        const deleteCategoryResult = renderHook(() => useDeleteBlogCategory(), {
            wrapper: deleteCategoryWrapper.wrapper,
        });
        await act(async () => {
            await deleteCategoryResult.result.current.mutateAsync("category-1");
        });
        expect(toastSuccessMock).toHaveBeenCalledWith("Categoría eliminada.");
        expect(deleteCategoryWrapper.invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: ["blog", "admin", "categories"],
        });
        expect(deleteCategoryWrapper.invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: ["blog", "public"],
        });

        const error = new Error("boom");
        blogServiceMock.createPost.mockRejectedValueOnce(error);
        blogServiceMock.updatePost.mockRejectedValueOnce(error);
        blogServiceMock.deletePost.mockRejectedValueOnce(error);
        blogServiceMock.publishPost.mockRejectedValueOnce(error);
        blogServiceMock.draftPost.mockRejectedValueOnce(error);
        blogServiceMock.schedulePost.mockRejectedValueOnce(error);
        blogServiceMock.createCategory.mockRejectedValueOnce(error);
        blogServiceMock.deleteCategory.mockRejectedValueOnce(error);

        await expect(
            renderHook(() => useCreateBlogPost(), {
                wrapper: createWrapper().wrapper,
            }).result.current.mutateAsync({ postId: "post-2" } as never)
        ).rejects.toThrow("boom");
        await expect(
            renderHook(() => useUpdateBlogPost(), {
                wrapper: createWrapper().wrapper,
            }).result.current.mutateAsync({
                postId: "post-2",
                payload: { title: "Fallo" } as never,
            })
        ).rejects.toThrow("boom");
        await expect(
            renderHook(() => useDeleteBlogPost(), {
                wrapper: createWrapper().wrapper,
            }).result.current.mutateAsync("post-2")
        ).rejects.toThrow("boom");
        await expect(
            renderHook(() => usePublishBlogPost(), {
                wrapper: createWrapper().wrapper,
            }).result.current.mutateAsync("post-2")
        ).rejects.toThrow("boom");
        await expect(
            renderHook(() => useDraftBlogPost(), {
                wrapper: createWrapper().wrapper,
            }).result.current.mutateAsync("post-2")
        ).rejects.toThrow("boom");
        await expect(
            renderHook(() => useScheduleBlogPost(), {
                wrapper: createWrapper().wrapper,
            }).result.current.mutateAsync({
                postId: "post-2",
                scheduledFor: "2026-04-25T09:00:00Z",
            })
        ).rejects.toThrow("boom");
        await expect(
            renderHook(() => useCreateBlogCategory(), {
                wrapper: createWrapper().wrapper,
            }).result.current.mutateAsync({
                categoryId: "category-2",
                name: "Consejos",
            })
        ).rejects.toThrow("boom");
        await expect(
            renderHook(() => useDeleteBlogCategory(), {
                wrapper: createWrapper().wrapper,
            }).result.current.mutateAsync("category-2")
        ).rejects.toThrow("boom");

        expect(toastErrorMock).toHaveBeenCalledWith("boom");
    });
});
