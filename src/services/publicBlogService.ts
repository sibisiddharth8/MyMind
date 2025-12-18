import apiClient from './apiClient';

// --- Types ---
export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    publishedAt: string;
    tags: string[];
    views: number;
    author: { name: string; profileImage?: string };
    _count?: { comments: number; likes: number };
    isCommentsEnabled: boolean;
}

export interface BlogComment {
    id: string;
    content: string;
    createdAt: string;
    isDeleted: boolean;
    publicUser?: { name: string; profileImage?: string };
    admin?: boolean; // If true, it's an admin reply
    replies?: BlogComment[];
}

// --- API Calls ---

export const getPublicBlogs = async ({ page = 1, limit = 9, search, tag }: any) => {
    const { data } = await apiClient.get('/blogs', { params: { page, limit, search, tag } });
    return data;
};

export const getPublicBlogBySlug = async (slug: string) => {
    const { data } = await apiClient.get(`/blogs/${slug}`);
    return data;
};

export const getPublicBlogComments = async (postId: string, page = 1, sort = 'newest') => {
    const { data } = await apiClient.get(`/blogs/${postId}/comments`, { params: { page, sort } });
    return data;
};

export const postPublicComment = async (postId: string, content: string, parentId?: string) => {
    const { data } = await apiClient.post(`/blogs/${postId}/comments`, { content, parentId });
    return data;
};

export const deletePublicComment = async (commentId: string) => {
    const { data } = await apiClient.delete(`/comments/${commentId}`);
    return data;
};

export const togglePublicBlogLike = async (postId: string) => {
    const { data } = await apiClient.post(`/blogs/${postId}/like`);
    return data;
};

export const getCommentReplies = async (commentId: string, page = 1) => {
    const { data } = await apiClient.get(`/comments/${commentId}/replies`, { params: { page, limit: 5 } });
    return data;
};

