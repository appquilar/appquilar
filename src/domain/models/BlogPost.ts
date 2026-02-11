export type BlogPostStatus = 'draft' | 'scheduled' | 'published';

export interface BlogGooglePreview {
    title: string;
    slug: string;
    description: string;
}

export interface BlogCategory {
    categoryId: string;
    name: string;
    slug: string;
}

export interface BlogPost {
    postId: string;
    title: string;
    slug: string;
    body: string | null;
    excerpt: string;
    keywords: string[];
    category: BlogCategory | null;
    headerImageId: string | null;
    heroImageId: string | null;
    status: BlogPostStatus;
    scheduledFor: string | null;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string | null;
    googlePreview: BlogGooglePreview;
}

export interface BlogPostListResult {
    data: BlogPost[];
    total: number;
    page: number;
}

export interface CreateBlogPostData {
    postId: string;
    categoryId: string;
    title: string;
    body: string;
    excerpt: string;
    keywords?: string[];
    headerImageId?: string | null;
    heroImageId?: string | null;
    status?: BlogPostStatus;
    scheduledFor?: string | null;
}

export interface UpdateBlogPostData {
    categoryId?: string;
    title?: string;
    body?: string;
    excerpt?: string;
    keywords?: string[];
    headerImageId?: string | null;
    heroImageId?: string | null;
}

export interface CreateBlogCategoryData {
    categoryId: string;
    name: string;
}
