import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiSearch, FiBookOpen } from 'react-icons/fi';

import { getPublicBlogs } from '../services/publicBlogService';
import { useDebounce } from '../hooks/useDebounce';
import PageHeader from '../components/ui/PageHeader';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';
import Loader from '../components/ui/Loader';
import PublicBlogCard from '../components/blogs/PublicBlogCard';
import ScrollToTop from '../components/ui/ScrollToTop';

export default function PublicBlogListPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    
    // Using your existing hook
    const debouncedSearch = useDebounce(search, 500);

    // Reset page on search
    useEffect(() => { setPage(1); }, [debouncedSearch]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['publicBlogs', page, debouncedSearch],
        queryFn: () => getPublicBlogs({ page, limit: 9, search: debouncedSearch }),
        keepPreviousData: true
    });

    const posts = data?.data || [];
    const pagination = data?.pagination;

    return (
        <div className="bg-slate-50 min-h-screen md:px-8">
            <ScrollToTop />
            
            <main className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="mb-10"
                >
                    <PageHeader title="Blog & Articles">
                        <div className="relative mt-4 md:mt-0 w-full md:w-72">
                            <FiSearch className="absolute top-3 left-3 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search articles..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow shadow-sm"
                            />
                        </div>
                    </PageHeader>
                </motion.div>

                {/* Content Grid */}
                {isLoading ? (
                    <Loader space={true} />
                ) : isError ? (
                    <div className="text-center py-20 text-red-500">Failed to load articles.</div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center">
                        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                            <FiBookOpen size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700">No Articles Found</h3>
                        <p className="text-slate-500 mt-2">Try searching for something else.</p>
                    </div>
                ) : (
                    <motion.div 
                        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {posts.map((post: any) => (
                            <PublicBlogCard key={post.id} post={post} />
                        ))}
                    </motion.div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="mt-12">
                        <Pagination 
                            currentPage={pagination.page} 
                            totalPages={pagination.totalPages} 
                            onPageChange={setPage} 
                        />
                    </div>
                )}
            </main>
        </div>
    );
}