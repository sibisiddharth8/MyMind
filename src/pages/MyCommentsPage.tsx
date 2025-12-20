import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiClock, FiExternalLink, FiArrowLeft } from 'react-icons/fi';
import { getUserActivity } from '../services/publicUserService';
import Spinner from '../components/ui/Spinner';
import { Link } from 'react-router-dom';

export default function MyCommentsPage() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 10;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['userComments'],
    queryFn: ({ pageParam = 1 }) =>
      getUserActivity('comments', pageParam, ITEMS_PER_PAGE),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const allComments = data?.pages.flatMap((page) => page.data) || [];
  const totalComments = data?.pages[0]?.pagination.total || 0;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-10"
        >

          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <FiMessageSquare className="text-white text-2xl sm:text-3xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-900">My Comments</h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                All your comments across articles
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Total Comments</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{totalComments}</p>
            </div>
            <div className="w-14 h-14 bg-blue-200 rounded-full flex items-center justify-center">
              <FiMessageSquare className="text-blue-700 text-2xl" />
            </div>
          </div>
        </motion.div>

        {/* Comments List */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner />
          </div>
        ) : allComments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 px-6 text-center bg-white border border-slate-200 rounded-xl"
          >
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-2xl mb-4">
              <FiMessageSquare />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No comments yet</h3>
            <p className="text-sm text-slate-500">Start engaging with articles by leaving your thoughts!</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="space-y-4"
            >
              {allComments.map((comment: any) => (
                <motion.div
                  key={comment.id}
                  variants={itemVariants}
                  className="group bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiMessageSquare className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 leading-relaxed mb-4 italic truncate">
                        "{comment.content}"
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-3">
                        <span className="flex items-center gap-2">
                          <FiClock className="text-slate-400" />
                          {new Date(comment.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600">
                          {new Date(comment.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-2">Commented on:</p>
                        <a
                          href={`/#/blogs/${comment.post.slug}`}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 hover:text-blue-800 font-medium transition-colors"
                        >
                          {comment.post.title}
                          <FiExternalLink className="text-sm" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Infinite scroll loader */}
            <div ref={loaderRef} className="py-12 flex flex-col items-center gap-3">
              {isFetchingNextPage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3"
                >
                  <Spinner />
                  <span className="text-slate-600 font-medium">Loading more comments...</span>
                </motion.div>
              )}
              {!hasNextPage && allComments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-slate-500"
                >
                  <p className="text-sm">You've reached the end</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Showing all {totalComments} comments
                  </p>
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
