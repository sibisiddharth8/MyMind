import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiMessageSquare, FiArrowRight, FiHeart } from 'react-icons/fi';

interface BlogCardProps {
    post: any; // Using 'any' for brevity, ideally use BlogPost interface
}

export default function PublicBlogCard({ post }: BlogCardProps) {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div variants={itemVariants} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 h-full">
            {/* Image Cover */}
            <Link to={`/blogs/${post.slug}`} className="relative aspect-video overflow-hidden bg-slate-100">
                {post.coverImage ? (
                    <img 
                        src={post.coverImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <span className="text-4xl">✍️</span>
                    </div>
                )}
                
                {/* Date Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1">
                    <FiCalendar className="text-blue-500" />
                    {new Date(post.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
            </Link>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                            #{tag}
                        </span>
                    ))}
                </div>

                <Link to={`/blogs/${post.slug}`} className="block mb-2">
                    <h3 className="text-xl font-bold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {post.title}
                    </h3>
                </Link>

                <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-grow">
                    {post.excerpt || "Click to read more about this topic..."}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
                    <div className='flex gap-2'>
                    <div className="flex items-center gap-1">
                        <FiMessageSquare />
                        <span>{post._count?.comments || 0} Comments</span>
                    </div>
                    {/* likes */}
                    <div className="flex items-center gap-1">
                        <FiHeart />
                        <span>{post._count?.likes || 0} Likes</span>
                    </div>
                    </div>
                    <Link to={`/blogs/${post.slug}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                        Read Article <FiArrowRight />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}