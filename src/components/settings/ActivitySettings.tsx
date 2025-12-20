import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiHeart, FiClock, FiExternalLink, FiArrowRight } from 'react-icons/fi';
import { getUserActivity } from '../../services/publicUserService';
import Spinner from '../ui/Spinner';
import { Link } from 'react-router-dom';

export default function ActivitySettings() {
  const { data, isLoading } = useQuery({
    queryKey: ['userActivity'],
    queryFn: () => getUserActivity(undefined, 1, 10), // No type filter for overview, get defaults
  });

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner />
      </div>
    );
  }

  const comments = data?.comments?.data || [];
  const commentTotal = data?.comments?.total || 0;
  const likes = data?.likes?.data || [];
  const likesTotal = data?.likes?.total || 0;

  // Show only recent 4 for overview
  const recentComments = comments.slice(0, 4);
  const recentLikes = likes.slice(0, 4);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="border-b border-slate-200 pb-5 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">My Activity</h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          View your comments and liked articles
        </p>
      </div>

      <div className="space-y-8">
        {/* Activity Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Total Comments</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{commentTotal}</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <FiMessageSquare className="text-blue-700 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-gradient-to-br from-red-50 to-pink-100 rounded-xl border border-pink-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Liked Articles</p>
                <p className="text-3xl font-bold text-red-900 mt-1">{likesTotal}</p>
              </div>
              <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center">
                <FiHeart className="text-red-700 text-xl" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Comments */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <FiMessageSquare className="text-blue-600 text-xl" />
              <h3 className="text-lg font-bold text-slate-800">Recent Comments</h3>
            </div>
            {commentTotal > 4 && (
              <Link
                to="/my-comments"
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                View all ({commentTotal})
                <FiArrowRight className="text-xs" />
              </Link>
            )}
          </div>

          {recentComments.length === 0 ? (
            <EmptyState
              icon={<FiMessageSquare />}
              title="No comments yet"
              description="Start engaging with articles by leaving your thoughts!"
            />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {recentComments.map((c: any) => (
                <motion.div
                  key={c.id}
                  variants={itemVariants}
                  className="group p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiMessageSquare className="text-blue-600 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 leading-relaxed mb-3 italic">
                        "{c.content}"
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <FiClock className="text-slate-400" />
                          {new Date(c.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>on article:</span>
                        <a
                          href={`/#/blogs/${c.post.slug}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                          {c.post.title}
                          <FiExternalLink className="text-xs" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Liked Posts */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <FiHeart className="text-red-600 text-xl" />
              <h3 className="text-lg font-bold text-slate-800">Liked Articles</h3>
            </div>
            {likesTotal > 4 && (
              <Link
                to="/my-likes"
                className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                View all ({likesTotal})
                <FiArrowRight className="text-xs" />
              </Link>
            )}
          </div>

          {recentLikes.length === 0 ? (
            <EmptyState
              icon={<FiHeart />}
              title="No liked articles yet"
              description="Show some love by liking articles you enjoy!"
            />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {recentLikes.map((l: any) => (
                <motion.a
                  key={l.id}
                  variants={itemVariants}
                  href={`/#/blogs/${l.post.slug}`}
                  className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-red-300 transition-all duration-200"
                >
                  <div className="relative h-40 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                    {l.post.coverImage ? (
                      <img
                        src={l.post.coverImage}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        alt={l.post.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiHeart className="text-slate-400 text-4xl" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <FiHeart className="text-red-500 fill-red-500 text-sm" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      {l.post.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FiClock className="text-slate-400" />
                      <span>
                        Liked on{' '}
                        {new Date(l.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Empty State Component
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-12 px-6 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl"
    >
      <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-2xl mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </motion.div>
  );
}
