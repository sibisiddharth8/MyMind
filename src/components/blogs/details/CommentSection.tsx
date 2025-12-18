import { useState, useRef, useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiMessageSquare, FiSend, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

import { getPublicBlogComments, postPublicComment, deletePublicComment } from '../../../services/publicBlogService';
import { usePublicAuth } from '../../../context/PublicAuthContext';
import Button from '../../ui/Button';
import Spinner from '../../ui/Spinner';
import CommentItem from './CommentItem';

interface CommentSectionProps {
    postId: string;
    commentCount: number;
    openAuthModal: () => void;
}

export default function CommentSection({ postId, commentCount, openAuthModal }: CommentSectionProps) {
    const { user, isAuthenticated } = usePublicAuth();
    const [commentText, setCommentText] = useState('');
    const [isInputFocused, setIsInputFocused] = useState(false);
    const queryClient = useQueryClient();

    // Infinite Query
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ['publicBlogComments', postId],
        queryFn: ({ pageParam = 1 }) => getPublicBlogComments(postId, pageParam),
        getNextPageParam: (lastPage: any) => {
            const { page, totalPages } = lastPage.pagination;
            const pageNum = Number(page);
            return pageNum < totalPages ? pageNum + 1 : undefined;
        },
        initialPageParam: 1
    });

    // Observer
    const observer = useRef<IntersectionObserver>();
    const lastCommentRef = useCallback((node: HTMLDivElement) => {
        if (isFetchingNextPage) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
        });
        if (node) observer.current.observe(node);
    }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

    // Mutations
    const postMutation = useMutation({
        mutationFn: ({ content, parentId }: { content: string, parentId?: string }) => postPublicComment(postId, content, parentId),
        onSuccess: () => {
            toast.success("Comment posted!");
            setCommentText('');
            setIsInputFocused(false);
            queryClient.invalidateQueries({ queryKey: ['publicBlogComments', postId] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed.")
    });

    const deleteMutation = useMutation({
        mutationFn: deletePublicComment,
        onSuccess: () => {
            toast.success("Deleted.");
            queryClient.invalidateQueries({ queryKey: ['publicBlogComments', postId] });
        }
    });

    const allComments = data?.pages.flatMap(page => page.data) || [];

    return (
        <section className="mt-12 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <h3 className="text-xl font-bold text-slate-900">{commentCount} Comments</h3>
            </div>

            {/* Input Area (YouTube Style) */}
            <div className="mb-10 flex gap-4">
                {isAuthenticated ? (
                    <>
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {user?.name?.[0]}
                        </div>
                        <div className="flex-grow">
                            <input 
                                type="text"
                                placeholder="Add a comment..."
                                className="w-full border-b border-slate-300 py-2 outline-none focus:border-slate-800 transition-colors bg-transparent"
                                value={commentText}
                                onFocus={() => setIsInputFocused(true)}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            {/* Buttons appear only on focus or typing */}
                            {(isInputFocused || commentText) && (
                                <div className="flex justify-end gap-2 mt-3 animate-in fade-in slide-in-from-top-1">
                                    <button 
                                        onClick={() => {
                                            setCommentText('');
                                            setIsInputFocused(false);
                                        }}
                                        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => postMutation.mutate({ content: commentText })} 
                                        disabled={!commentText.trim() || postMutation.isPending}
                                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
                                    >
                                        {postMutation.isPending ? 'Posting...' : 'Comment'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                        <span className="text-slate-600 text-sm">Log in to comment and join the discussion.</span>
                        <Button size="sm" onClick={openAuthModal}>Login</Button>
                    </div>
                )}
            </div>

            {/* Comment List */}
            <div className="space-y-0">
                {allComments.map((comment: any, index: number) => {
                    const isLast = allComments.length === index + 1;
                    return (
                        <div ref={isLast ? lastCommentRef : null} key={comment.id}>
                            <CommentItem 
                                comment={comment} 
                                user={user} 
                                onDelete={(id: string) => deleteMutation.mutate(id)}
                                onReply={(id: string, content: string) => postMutation.mutate({ content, parentId: id })}
                            />
                        </div>
                    );
                })}
            </div>

            {isFetchingNextPage && <div className="py-8 flex justify-center"><Spinner text="Loading..." /></div>}
        </section>
    );
}