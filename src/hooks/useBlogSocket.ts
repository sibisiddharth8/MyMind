import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from '../sockets/socket';
import toast from 'react-hot-toast';

/**
 * BLOG SOCKET HOOK
 * Manages real-time updates for comments, replies, pins, and likes on blog posts
 */

interface BlogSocketConfig {
  postId: string;
  sortBy?: 'newest' | 'oldest' | 'popular';
  onCommentAdded?: (comment: any) => void;
  onCommentDeleted?: (commentId: string) => void;
  onCommentUpdated?: (comment: any) => void;
  onReplyAdded?: (parentId: string, reply: any) => void;
  onReplyDeleted?: (parentId: string, replyId: string) => void;
  onReplyUpdated?: (parentId: string, reply: any) => void;
  onCommentPinned?: (comment: any) => void;
  onCommentUnpinned?: (commentId: string) => void;
  onLikeAdded?: (likeCount: number) => void;
  onLikeRemoved?: (likeCount: number) => void;
}

export const useBlogSocket = ({
  postId,
  sortBy = 'newest',
  onCommentAdded,
  onCommentDeleted,
  onCommentUpdated,
  onReplyAdded,
  onReplyDeleted,
  onReplyUpdated,
  onCommentPinned,
  onCommentUnpinned,
  onLikeAdded,
  onLikeRemoved,
}: BlogSocketConfig) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!postId) return;

    // Join the blog room
    socket.emit('joinBlog', postId);
    console.log(`✅ Joined blog room: blog:${postId}`);

    // ============================================
    // COMMENT HANDLERS
    // ============================================

    const handleCommentAdded = (data: any) => {
      console.log('📝 Comment added:', data.comment);
      
      // Update React Query cache
      queryClient.setQueryData(
        ['publicBlogComments', postId, sortBy],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any, index: number) => {
              if (index === 0) {
                // Add to first page
                return {
                  ...page,
                  data: [data.comment, ...page.data],
                  pagination: {
                    ...page.pagination,
                    total: page.pagination.total + 1,
                  },
                };
              }
              return page;
            }),
          };
        }
      );

      onCommentAdded?.(data.comment);
    };

    const handleCommentDeleted = (data: any) => {
      console.log('🗑️ Comment deleted:', data.commentId);

      // Update React Query cache
      queryClient.setQueryData(
        ['publicBlogComments', postId, sortBy],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.filter((comment: any) => comment.id !== data.commentId),
              pagination: {
                ...page.pagination,
                total: Math.max(0, page.pagination.total - 1),
              },
            })),
          };
        }
      );

      onCommentDeleted?.(data.commentId);
    };

    const handleCommentUpdated = (data: any) => {
      console.log('✏️ Comment updated:', data.comment);

      // Update React Query cache
      queryClient.setQueryData(
        ['publicBlogComments', postId, sortBy],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((comment: any) =>
                comment.id === data.comment.id ? data.comment : comment
              ),
            })),
          };
        }
      );

      onCommentUpdated?.(data.comment);
    };

    // ============================================
    // REPLY HANDLERS
    // ============================================

    const handleReplyAdded = (data: any) => {
      console.log('📝 Reply added:', data.reply, 'to parent:', data.parentCommentId);

      // Update React Query cache for replies
      queryClient.setQueryData(
        ['commentReplies', data.parentCommentId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any, index: number) => {
              if (index === 0) {
                return {
                  ...page,
                  data: [data.reply, ...page.data],
                  pagination: {
                    ...page.pagination,
                    total: page.pagination.total + 1,
                  },
                };
              }
              return page;
            }),
          };
        }
      );

      // Also update the parent comment's reply count
      queryClient.setQueryData(
        ['publicBlogComments', postId, sortBy],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((comment: any) =>
                comment.id === data.parentCommentId
                  ? {
                      ...comment,
                      _count: {
                        ...comment._count,
                        replies: (comment._count?.replies || 0) + 1,
                      },
                    }
                  : comment
              ),
            })),
          };
        }
      );

      onReplyAdded?.(data.parentCommentId, data.reply);
    };

    const handleReplyDeleted = (data: any) => {
      console.log('🗑️ Reply deleted:', data.replyId);

      // Update replies cache
      queryClient.setQueryData(
        ['commentReplies', data.parentCommentId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.filter((reply: any) => reply.id !== data.replyId),
              pagination: {
                ...page.pagination,
                total: Math.max(0, page.pagination.total - 1),
              },
            })),
          };
        }
      );

      // Update parent comment's reply count
      queryClient.setQueryData(
        ['publicBlogComments', postId, sortBy],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((comment: any) =>
                comment.id === data.parentCommentId
                  ? {
                      ...comment,
                      _count: {
                        ...comment._count,
                        replies: Math.max(0, (comment._count?.replies || 1) - 1),
                      },
                    }
                  : comment
              ),
            })),
          };
        }
      );

      onReplyDeleted?.(data.parentCommentId, data.replyId);
    };

    const handleReplyUpdated = (data: any) => {
      console.log('✏️ Reply updated:', data.reply);

      // Update replies cache
      queryClient.setQueryData(
        ['commentReplies', data.parentCommentId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((reply: any) =>
                reply.id === data.reply.id ? data.reply : reply
              ),
            })),
          };
        }
      );

      onReplyUpdated?.(data.parentCommentId, data.reply);
    };

    // ============================================
    // PINNED COMMENT HANDLERS
    // ============================================

    const handleCommentPinned = (data: any) => {
      console.log('📌 Comment pinned:', data.comment);

      queryClient.setQueryData(
        ['publicBlogComments', postId, sortBy],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any, index: number) => {
              if (index === 0) {
                // Move this comment to the top as pinned
                const filtered = page.data.filter((c: any) => c.id !== data.comment.id);
                return {
                  ...page,
                  data: [
                    { ...data.comment, isPinned: true },
                    ...filtered,
                  ],
                };
              }
              return page;
            }),
          };
        }
      );

      onCommentPinned?.(data.comment);
      toast.success('Comment pinned!');
    };

    const handleCommentUnpinned = (data: any) => {
      console.log('📍 Comment unpinned:', data.commentId);

      queryClient.setQueryData(
        ['publicBlogComments', postId, sortBy],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((comment: any) =>
                comment.id === data.commentId
                  ? { ...comment, isPinned: false }
                  : comment
              ),
            })),
          };
        }
      );

      onCommentUnpinned?.(data.commentId);
      toast.success('Comment unpinned!');
    };

    // ============================================
    // LIKE HANDLERS
    // ============================================

    const handleLikeAdded = (data: any) => {
      console.log('❤️ Like added. Count:', data.likeCount);

      // Update blog post data with new like count
      queryClient.setQueryData(
        ['publicBlog', postId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            _count: {
              ...oldData._count,
              likes: data.likeCount,
            },
            isLikedByCurrentUser: true, // Current user just liked
          };
        }
      );

      onLikeAdded?.(data.likeCount);
    };

    const handleLikeRemoved = (data: any) => {
      console.log('🤍 Like removed. Count:', data.likeCount);

      // Update blog post data with new like count
      queryClient.setQueryData(
        ['publicBlog', postId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            _count: {
              ...oldData._count,
              likes: data.likeCount,
            },
            isLikedByCurrentUser: false, // Current user just unliked
          };
        }
      );

      onLikeRemoved?.(data.likeCount);
    };

    // ============================================
    // REGISTER LISTENERS
    // ============================================

    socket.on('commentAdded', handleCommentAdded);
    socket.on('commentDeleted', handleCommentDeleted);
    socket.on('commentUpdated', handleCommentUpdated);
    socket.on('replyAdded', handleReplyAdded);
    socket.on('replyDeleted', handleReplyDeleted);
    socket.on('replyUpdated', handleReplyUpdated);
    socket.on('commentPinned', handleCommentPinned);
    socket.on('commentUnpinned', handleCommentUnpinned);
    socket.on('likeAdded', handleLikeAdded);
    socket.on('likeRemoved', handleLikeRemoved);

    // ============================================
    // CLEANUP
    // ============================================

    return () => {
      socket.emit('leaveBlog', postId);
      socket.off('commentAdded', handleCommentAdded);
      socket.off('commentDeleted', handleCommentDeleted);
      socket.off('commentUpdated', handleCommentUpdated);
      socket.off('replyAdded', handleReplyAdded);
      socket.off('replyDeleted', handleReplyDeleted);
      socket.off('replyUpdated', handleReplyUpdated);
      socket.off('commentPinned', handleCommentPinned);
      socket.off('commentUnpinned', handleCommentUnpinned);
      socket.off('likeAdded', handleLikeAdded);
      socket.off('likeRemoved', handleLikeRemoved);
      console.log(`❌ Left blog room: blog:${postId}`);
    };
  }, [postId, sortBy, queryClient, onCommentAdded, onCommentDeleted, onCommentUpdated, onReplyAdded, onReplyDeleted, onReplyUpdated, onCommentPinned, onCommentUnpinned, onLikeAdded, onLikeRemoved]);
};
