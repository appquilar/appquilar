import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { blogService } from '@/compositionRoot';
import {
    BlogPostStatus,
    CreateBlogCategoryData,
    CreateBlogPostData,
    UpdateBlogPostData,
} from '@/domain/models/BlogPost';
import {
    AdminBlogPostListParams,
    BlogPostListParams,
} from '@/domain/repositories/BlogRepository';
import { ApiError } from '@/infrastructure/http/ApiClient';

const BLOG_QUERY_KEYS = {
    publicList: (params: BlogPostListParams) => ['blog', 'public', params] as const,
    publicPost: (slug?: string) => ['blog', 'public', 'post', slug] as const,
    adminList: (params: AdminBlogPostListParams) => ['blog', 'admin', params] as const,
    adminPost: (postId?: string) => ['blog', 'admin', 'post', postId] as const,
    categories: () => ['blog', 'admin', 'categories'] as const,
};

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof ApiError) {
        const firstError = error.payload?.errors && Object.values(error.payload.errors)[0]?.[0];
        if (firstError) {
            return firstError;
        }

        if (Array.isArray(error.payload?.error) && typeof error.payload.error[0] === 'string') {
            return error.payload.error[0];
        }

        if (typeof error.payload?.error === 'string') {
            return error.payload.error;
        }

        return fallback;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return fallback;
};

export const usePublicBlogPosts = (params: BlogPostListParams = {}) => {
    const safeParams: BlogPostListParams = {
        page: params.page ?? 1,
        perPage: params.perPage ?? 10,
        text: params.text,
    };

    return useQuery({
        queryKey: BLOG_QUERY_KEYS.publicList(safeParams),
        queryFn: () => blogService.listPublicPosts(safeParams),
        placeholderData: (previousData) => previousData,
    });
};

export const usePublicBlogPost = (slug?: string) => {
    return useQuery({
        queryKey: BLOG_QUERY_KEYS.publicPost(slug),
        queryFn: () => {
            if (!slug) return null;
            return blogService.getPublicPostBySlug(slug);
        },
        enabled: Boolean(slug),
    });
};

export const useAdminBlogPosts = (params: AdminBlogPostListParams = {}, enabled = true) => {
    const safeParams: AdminBlogPostListParams = {
        page: params.page ?? 1,
        perPage: params.perPage ?? 20,
        text: params.text,
        status: params.status,
    };

    return useQuery({
        queryKey: BLOG_QUERY_KEYS.adminList(safeParams),
        queryFn: () => blogService.listAdminPosts(safeParams),
        enabled,
        placeholderData: (previousData) => previousData,
    });
};

export const useAdminBlogPost = (postId?: string, enabled = true) => {
    return useQuery({
        queryKey: BLOG_QUERY_KEYS.adminPost(postId),
        queryFn: () => {
            if (!postId) return null;
            return blogService.getAdminPostById(postId);
        },
        enabled: enabled && Boolean(postId),
    });
};

const invalidateBlogQueries = async (queryClient: ReturnType<typeof useQueryClient>, postId?: string) => {
    await queryClient.invalidateQueries({ queryKey: ['blog', 'public'] });
    await queryClient.invalidateQueries({ queryKey: ['blog', 'admin'] });
    if (postId) {
        await queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.adminPost(postId) });
    }
};

export const useAdminBlogCategories = (enabled = true) => {
    return useQuery({
        queryKey: BLOG_QUERY_KEYS.categories(),
        queryFn: () => blogService.listCategories(),
        enabled,
    });
};

export const useCreateBlogPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateBlogPostData) => blogService.createPost(payload),
        onSuccess: async () => {
            toast.success('Post creado correctamente.');
            await invalidateBlogQueries(queryClient);
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'No se pudo crear el post.'));
        },
    });
};

export const useUpdateBlogPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, payload }: { postId: string; payload: UpdateBlogPostData }) =>
            blogService.updatePost(postId, payload),
        onSuccess: async (_, variables) => {
            toast.success('Post actualizado correctamente.');
            await invalidateBlogQueries(queryClient, variables.postId);
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'No se pudo actualizar el post.'));
        },
    });
};

export const useDeleteBlogPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => blogService.deletePost(postId),
        onSuccess: async () => {
            toast.success('Post eliminado.');
            await invalidateBlogQueries(queryClient);
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'No se pudo eliminar el post.'));
        },
    });
};

export const usePublishBlogPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => blogService.publishPost(postId),
        onSuccess: async (_, postId) => {
            toast.success('Post publicado.');
            await invalidateBlogQueries(queryClient, postId);
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'No se pudo publicar el post.'));
        },
    });
};

export const useDraftBlogPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => blogService.draftPost(postId),
        onSuccess: async (_, postId) => {
            toast.success('Post movido a borrador.');
            await invalidateBlogQueries(queryClient, postId);
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'No se pudo mover el post a borrador.'));
        },
    });
};

export const useScheduleBlogPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, scheduledFor }: { postId: string; scheduledFor: string }) =>
            blogService.schedulePost(postId, scheduledFor),
        onSuccess: async (_, variables) => {
            toast.success('Post programado.');
            await invalidateBlogQueries(queryClient, variables.postId);
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'No se pudo programar el post.'));
        },
    });
};

export const useCreateBlogCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateBlogCategoryData) => blogService.createCategory(payload),
        onSuccess: async () => {
            toast.success('Categoría creada.');
            await queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.categories() });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'No se pudo crear la categoría.'));
        },
    });
};

export const useDeleteBlogCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (categoryId: string) => blogService.deleteCategory(categoryId),
        onSuccess: async () => {
            toast.success('Categoría eliminada.');
            await queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.categories() });
            await invalidateBlogQueries(queryClient);
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'No se pudo eliminar la categoría.'));
        },
    });
};

export const BLOG_STATUSES: { value: BlogPostStatus; label: string }[] = [
    { value: 'draft', label: 'Borrador' },
    { value: 'scheduled', label: 'Programado' },
    { value: 'published', label: 'Publicado' },
];
