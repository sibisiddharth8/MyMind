import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiMessageSquare, FiMenu } from 'react-icons/fi'; // Import FiMenu for sort icon

import { getPublicBlogBySlug, getPublicBlogComments, postPublicComment, deletePublicComment } from '../services/publicBlogService';
import { usePublicAuth } from '../context/PublicAuthContext';
import { useBlogSocket } from '../hooks/useBlogSocket';
import PublicAuthModal from '../components/contact/PublicAuthModal';
import Spinner from '../components/ui/Spinner';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import ScrollToTop from '../components/ui/ScrollToTop';

import BlogHero from '../components/blogs/details/BlogHero';
import BlogContent from '../components/blogs/details/BlogContent';
import CommentItem from '../components/blogs/details/CommentItem';
import UserAvatar from '../components/ui/UserAvatar'; // Import UserAvatar

export default function PublicBlogDetailsPage() {
    const { slug } = useParams();
    const { user, isAuthenticated } = usePublicAuth();
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [commentText, setCommentText] = useState('');
    
    // 👇 NEW: State for sorting
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
    
    const queryClient = useQueryClient();

    // 1. Fetch Post Data
    const { data: post, isLoading: isPostLoading } = useQuery({
        queryKey: ['publicBlog', slug],
        queryFn: () => getPublicBlogBySlug(slug!),
        enabled: !!slug
    });

    // 2. Refresh Data on Login
    useEffect(() => {
        if (isAuthenticated) {
            queryClient.invalidateQueries({ queryKey: ['publicBlog', slug] });
            if (post?.id) {
                queryClient.invalidateQueries({ queryKey: ['publicBlogComments', post.id] });
            }
        }
    }, [isAuthenticated, slug, post?.id, queryClient]);

    // 2.5. Initialize Socket.io for real-time updates
    useBlogSocket({
        postId: post?.id || '',
        sortBy,
    });

    // 3. Fetch Comments (Infinite Scroll)
    const {
        data: commentsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isCommentsLoading
    } = useInfiniteQuery({
        // 👇 UPDATE: Add 'sortBy' to queryKey so it refetches when sort changes
        queryKey: ['publicBlogComments', post?.id, sortBy], 
        // 👇 UPDATE: Pass 'sortBy' to the fetch function
        queryFn: ({ pageParam = 1 }) => getPublicBlogComments(post.id, pageParam, sortBy),
        enabled: !!post?.id,
        getNextPageParam: (lastPage: any) => {
            const { page, totalPages } = lastPage.pagination;
            const pageNum = Number(page);
            return pageNum < totalPages ? pageNum + 1 : undefined;
        },
        initialPageParam: 1
    });

    // 4. Observer ... (Keep as is)
    const observer = useRef<IntersectionObserver>();
    const lastCommentRef = useCallback((node: HTMLDivElement) => {
        if (isFetchingNextPage) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
        });
        if (node) observer.current.observe(node);
    }, [isFetchingNextPage, hasNextPage, fetchNextPage]);
    // 5. Mutations ... (Keep as is)
    const postCommentMutation = useMutation({
        mutationFn: ({ content, parentId }: { content: string, parentId?: string }) => 
            postPublicComment(post.id, content, parentId),
        onSuccess: () => {
            toast.success("Comment posted!");
            setCommentText('');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to post comment.")
    });

    const deleteCommentMutation = useMutation({
        mutationFn: deletePublicComment,
        onMutate: (commentId: string) => {
            // Optimistic update: remove comment from all pages
            queryClient.setQueryData(
                ['publicBlogComments', post.id, sortBy],
                (data: any) => {
                    if (!data) return data;
                    return {
                        ...data,
                        pages: data.pages.map((page: any) => ({
                            ...page,
                            data: page.data.filter((c: any) => c.id !== commentId)
                        }))
                    };
                }
            );
        },
        onSuccess: () => {
            toast.success("Comment deleted.");
            queryClient.invalidateQueries({ queryKey: ['publicBlogComments', post.id, sortBy] });
        }
    });

    const allComments = commentsData?.pages.flatMap(page => page.data) || [];
    const totalComments = post?._count?.comments || 0; 
    const readTime = post ? Math.ceil(post.content.split(' ').length / 200) : 0;

    const handleMainCommentSubmit = () => {
        if (!commentText.trim()) return;
        postCommentMutation.mutate({ content: commentText });
    };

    if (isPostLoading) return <div className='min-h-screen flex justify-center items-center' ><Loader/></div>
    // better design to show article not found
    if (!post) return <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Article Not Found</h2>
        <p className="text-slate-500">The article you are looking for does not exist.</p>
    </div>;

    return (
        <div className="bg-white min-h-screen">
            <ScrollToTop />
            
            <main className="container mx-auto px-4 py-10 max-w-4xl">
                <article>
                    <BlogHero post={post} readTime={readTime} openAuthModal={() => setAuthModalOpen(true)} />
                    <BlogContent content={post.content} />
                </article>

                {/* 3. Comments Section */}
                {post.isCommentsEnabled ? (
                    <div className="mt-16 pt-10 border-t border-slate-200">
                        
                        {/* Header Row: Title & Sort Button */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><FiMessageSquare /></div>
                                Discussion <span className="text-slate-400 text-lg font-normal">({totalComments})</span>
                            </h3>

                            {/* 👇 NEW: Sort Dropdown (YouTube Style) */}
                            {totalComments > 0 && (
                                <div className="flex items-center gap-2">
                                    <FiMenu className="text-slate-500" />
                                    <span className="text-sm font-medium text-slate-500 mr-2">Sort by:</span>
                                    <select 
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer hover:text-blue-600 transition-colors"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="popular">Top Comments</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Add Comment Box */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-10 shadow-inner">
                            {isAuthenticated ? (
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="shrink-0">
                                            {/* 👇 Use UserAvatar here */}
                                            <UserAvatar src={user?.profileImage} alt={user?.name} size="md" />
                                        </div>
                                        <span className="font-semibold text-slate-700">{user?.name}</span>
                                    </div>
                                    <textarea 
                                        className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none bg-white transition-all text-slate-700"
                                        rows={3}
                                        placeholder="Share your thoughts..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                    />
                                    <div className="flex justify-end mt-3">
                                        <Button 
                                            onClick={handleMainCommentSubmit} 
                                            isLoading={postCommentMutation.isPending}
                                            disabled={!commentText.trim()}
                                            className="!px-6"
                                        >
                                            Post Comment
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <p className="text-slate-600 mb-4 font-medium">Join the discussion</p>
                                    <Button onClick={() => setAuthModalOpen(true)}>Login to Comment</Button>
                                </div>
                            )}
                        </div>

                        {/* Comments List */}
                        <div className="space-y-2">
                            {isCommentsLoading && sortBy !== 'newest' ? (
                                <div className="py-10 flex justify-center"><Spinner/></div>
                            ) : (
                                allComments.map((comment: any, index: number) => {
                                    if (allComments.length === index + 1) {
                                        return (
                                            <div ref={lastCommentRef} key={comment.id}>
                                                <CommentItem 
                                                    comment={comment} 
                                                    user={user} 
                                                    onDelete={(id: string) => deleteCommentMutation.mutate(id)}
                                                    onReply={(parentId: string, content: string) => postCommentMutation.mutate({ content, parentId })}
                                                />
                                            </div>
                                        );
                                    }
                                    return (
                                        <CommentItem 
                                            key={comment.id} 
                                            comment={comment} 
                                            user={user} 
                                            onDelete={(id: string) => deleteCommentMutation.mutate(id)}
                                            onReply={(parentId: string, content: string) => postCommentMutation.mutate({ content, parentId })}
                                        />
                                    );
                                })
                            )}
                        </div>

                        {isFetchingNextPage && (
                            <div className="py-6 flex justify-center">
                                <Spinner />
                            </div>
                        )}

                        {!hasNextPage && allComments.length > 0 && (
                            <div className="py-12 text-center">
                                <span className="bg-slate-100 text-slate-400 px-4 py-1 rounded-full text-xs font-medium">End of discussion</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="mt-16 p-8 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                        <p className="text-slate-500 font-medium">🔒 Comments are disabled for this article.</p>
                    </div>
                )}
            </main>

            <PublicAuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
        </div>
    );
}