import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiHeart, FiClock, FiArrowLeft } from 'react-icons/fi';
import { getUserActivity } from '../services/publicUserService';
import Spinner from '../components/ui/Spinner';
import { Link } from 'react-router-dom';

export default function MyLikesPage() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 12;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['userLikes'],
    queryFn: ({ pageParam = 1 }) =>
      getUserActivity('likes', pageParam, ITEMS_PER_PAGE),
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

  const allLikes = data?.pages.flatMap((page) => page.data) || [];
  const totalLikes = data?.pages[0]?.pagination.total || 0;

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-10"
        >

          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <FiHeart className="text-white text-2xl sm:text-3xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-900">Liked Articles</h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Articles you've liked
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-gradient-to-br from-red-50 to-pink-100 rounded-xl border border-pink-200 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Total Liked Articles</p>
              <p className="text-3xl font-bold text-red-900 mt-2">{totalLikes}</p>
            </div>
            <div className="w-14 h-14 bg-pink-200 rounded-full flex items-center justify-center">
              <FiHeart className="text-red-700 text-2xl" />
            </div>
          </div>
        </motion.div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner />
          </div>
        ) : allLikes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 px-6 text-center bg-white border border-slate-200 rounded-xl"
          >
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-2xl mb-4">
              <FiHeart />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No liked articles yet</h3>
            <p className="text-sm text-slate-500">Show some love by liking articles you enjoy!</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {allLikes.map((like: any) => (
                <motion.a
                  key={like.id}
                  variants={itemVariants}
                  href={`/#/blogs/${like.post.slug}`}
                  className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-red-300 transition-all duration-200"
                >
                  {/* Cover Image */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                    {like.post.coverImage ? (
                      <img
                        src={like.post.coverImage}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        alt={like.post.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <FiHeart className="text-slate-400 text-5xl" />
                      </div>
                    )}

                    {/* Like Badge */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="absolute top-3 right-3 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                    >
                      <FiHeart className="text-red-500 fill-red-500 text-lg" />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-3 text-lg leading-tight">
                      {like.post.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FiClock className="text-slate-400 flex-shrink-0" />
                      <span>
                        Liked on{' '}
                        {new Date(like.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-xl"
                  />
                </motion.a>
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
                  <span className="text-slate-600 font-medium">Loading more articles...</span>
                </motion.div>
              )}
              {!hasNextPage && allLikes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-slate-500"
                >
                  <p className="text-sm">You've reached the end</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Showing all {totalLikes} articles
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
