import {
    BlogCategory,
    BlogPost,
    BlogPostListResult,
    BlogPostStatus,
    CreateBlogCategoryData,
    CreateBlogPostData,
    UpdateBlogPostData,
} from '@/domain/models/BlogPost';

export interface BlogPostListParams {
    page?: number;
    perPage?: number;
    text?: string;
}

export interface AdminBlogPostListParams extends BlogPostListParams {
    status?: BlogPostStatus;
}

export interface BlogRepository {
    listPublicPosts(params?: BlogPostListParams): Promise<BlogPostListResult>;
    getPublicPostBySlug(slug: string): Promise<BlogPost | null>;

    listAdminPosts(params?: AdminBlogPostListParams): Promise<BlogPostListResult>;
    getAdminPostById(postId: string): Promise<BlogPost | null>;

    createPost(data: CreateBlogPostData): Promise<void>;
    updatePost(postId: string, data: UpdateBlogPostData): Promise<void>;
    deletePost(postId: string): Promise<void>;

    publishPost(postId: string): Promise<void>;
    draftPost(postId: string): Promise<void>;
    schedulePost(postId: string, scheduledFor: string): Promise<void>;

    listCategories(): Promise<BlogCategory[]>;
    createCategory(data: CreateBlogCategoryData): Promise<void>;
    deleteCategory(categoryId: string): Promise<void>;
}
