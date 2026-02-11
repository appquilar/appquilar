import {
    BlogCategory,
    BlogPost,
    BlogPostListResult,
    BlogPostStatus,
    CreateBlogCategoryData,
    CreateBlogPostData,
    UpdateBlogPostData,
} from '@/domain/models/BlogPost';
import {
    AdminBlogPostListParams,
    BlogPostListParams,
    BlogRepository,
} from '@/domain/repositories/BlogRepository';

export class BlogService {
    constructor(private readonly repository: BlogRepository) {}

    async listPublicPosts(params?: BlogPostListParams): Promise<BlogPostListResult> {
        return this.repository.listPublicPosts(params);
    }

    async getPublicPostBySlug(slug: string): Promise<BlogPost | null> {
        return this.repository.getPublicPostBySlug(slug);
    }

    async listAdminPosts(params?: AdminBlogPostListParams): Promise<BlogPostListResult> {
        return this.repository.listAdminPosts(params);
    }

    async getAdminPostById(postId: string): Promise<BlogPost | null> {
        return this.repository.getAdminPostById(postId);
    }

    async createPost(data: CreateBlogPostData): Promise<void> {
        return this.repository.createPost(data);
    }

    async updatePost(postId: string, data: UpdateBlogPostData): Promise<void> {
        return this.repository.updatePost(postId, data);
    }

    async deletePost(postId: string): Promise<void> {
        return this.repository.deletePost(postId);
    }

    async publishPost(postId: string): Promise<void> {
        return this.repository.publishPost(postId);
    }

    async draftPost(postId: string): Promise<void> {
        return this.repository.draftPost(postId);
    }

    async schedulePost(postId: string, scheduledFor: string): Promise<void> {
        return this.repository.schedulePost(postId, scheduledFor);
    }

    async listCategories(): Promise<BlogCategory[]> {
        return this.repository.listCategories();
    }

    async createCategory(data: CreateBlogCategoryData): Promise<void> {
        return this.repository.createCategory(data);
    }

    async deleteCategory(categoryId: string): Promise<void> {
        return this.repository.deleteCategory(categoryId);
    }

    getStatuses(): BlogPostStatus[] {
        return ['draft', 'scheduled', 'published'];
    }
}
