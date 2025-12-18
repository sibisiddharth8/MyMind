import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiShare2, FiHeart } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

import { togglePublicBlogLike } from '../../../services/publicBlogService';
import { usePublicAuth } from '../../../context/PublicAuthContext';

interface BlogHeroProps {
    post: any;
    readTime: number;
    openAuthModal: () => void; // <--- Received from parent
}

export default function BlogHero({ post, readTime, openAuthModal }: BlogHeroProps) {
    const { isAuthenticated } = usePublicAuth();
    
    // Local state for optimistic updates
    const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
    const [isLiked, setIsLiked] = useState(false); // Note: Backend needs to send 'isLiked' boolean if you want initial state accurate for logged-in users

    // Sync state if post data updates
    useEffect(() => {
        setLikeCount(post._count?.likes || 0);
        if (post.isLikedByCurrentUser !== undefined) {
            setIsLiked(post.isLikedByCurrentUser);
        }
    }, [post]);

    const likeMutation = useMutation({
        mutationFn: () => togglePublicBlogLike(post.id),
        onError: () => {
            // Revert on error
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
            setIsLiked(prev => !prev);
            toast.error("Failed to update like.");
        }
    });

    const handleLike = () => {
        if (!isAuthenticated) {
            openAuthModal();
            return;
        }

        // Optimistic Update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

        // Trigger API
        likeMutation.mutate();
    };

    const handleShare = () => {
        navigator.share({ title: post.title, url: window.location.href })
            .catch(() => toast.success('Link copied to clipboard'));
    };

    return (
        <header className="mb-12">
            {/* Title & Meta */}
            <div className="max-w-4xl mx-auto px-4 mb-8 text-center">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 mb-6 font-medium"
                >
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                        <FiCalendar className="text-blue-500"/> 
                        {new Date(post.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                        <FiClock className="text-blue-500"/> 
                        {readTime} min read
                    </span>
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6"
                >
                    {post.title}
                </motion.h1>

                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center gap-2"
                >
                    {post.tags.map((tag: string) => (
                        <span key={tag} className="text-blue-600 bg-blue-50 px-3 py-1 rounded-md text-sm font-semibold hover:bg-blue-100 transition-colors cursor-default">
                            #{tag}
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* Smart Image Display */}
            {post.coverImage && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full relative h-[400px] md:h-[500px] overflow-hidden bg-slate-900 rounded-3xl shadow-2xl group"
                >
                    {/* Blurred Background Layer */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-50 blur-xl scale-110"
                        style={{ backgroundImage: `url(${post.coverImage})` }}
                    />
                    
                    {/* Actual Image Layer */}
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <img 
                            src={post.coverImage} 
                            alt={post.title} 
                            className="max-w-full max-h-full object-contain shadow-lg rounded-3xl"
                        />
                    </div>

                    {/* Floating Action Pill (Like & Share) */}
                    <div className="absolute bottom-6 right-6 flex items-center gap-3 z-10">
                        {/* Like Button */}
                        <button 
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                                isLiked 
                                    ? 'bg-rose-500 text-white' 
                                    : 'bg-white/90 text-slate-700 hover:bg-white'
                            }`}
                        >
                            <FiHeart className={`${isLiked ? 'fill-current' : ''}`} size={20} />
                            <span className="font-bold text-sm">{likeCount}</span>
                        </button>

                        {/* Share Button */}
                        <button 
                            onClick={handleShare}
                            className="bg-white/90 backdrop-blur-md p-2.5 rounded-full text-slate-700 shadow-lg hover:bg-white hover:text-blue-600 transition-all hover:scale-110"
                            title="Share Article"
                        >
                            <FiShare2 size={20} />
                        </button>
                    </div>
                </motion.div>
            )}
        </header>
    );
}