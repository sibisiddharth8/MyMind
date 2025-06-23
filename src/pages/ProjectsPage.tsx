import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiSearch, FiHome } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import Pagination from '../components/ui/Pagination';
import ProjectCard from '../components/projects/ProjectCard';
import { getProjects, getProjectCategories } from '../services/projectService';
import Loader from '../components/ui/Loader';
import ScrollToTop from '../components/ui/ScrollToTop';
import SectionHeader from '../components/ui/SectionHeader';

// Local Type Definitions
interface Project { id: string; name: string; projectImage: string | null; startDate: string; endDate?: string | null; githubLink?: string | null; liveLink?: string | null; tags: string[]; category: { name: string }; members: any[]; description: string; }
interface Category { id: string; name: string; description?: string; projectCount?: number; }

export default function ProjectsPage() {
    const [page, setPage] = useState(1);
    const [selectedCategoryId, setSelectedCategoryId] = useState(''); // Empty string for "All"
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    const { data: categoriesResponse } = useQuery({ queryKey: ['projectCategories'], queryFn: getProjectCategories });
    const { data: projectsResponse, isLoading, isError } = useQuery({
        queryKey: ['projects', page, selectedCategoryId, debouncedSearchTerm],
        queryFn: () => getProjects({ page, limit: 6, categoryId: selectedCategoryId || undefined, name: debouncedSearchTerm }),
        keepPreviousData: true,
    });
    
    const projects = projectsResponse?.data || [];
    const pagination = projectsResponse?.pagination;
    const categories = categoriesResponse?.data || [];

    return (
        <div className="bg-slate-50 min-h-screen md:px-16">
            <ScrollToTop />
            <main className="container mx-auto px-6 py-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className='flex flex-col items-center'>
                    <SectionHeader title="All Projects" description="Here's a collection of my work. Feel free to filter by category or search for a specific project." />
                </motion.div>

                {/* --- NEW, IMPROVED FILTER AND SEARCH SECTION --- */}
                <div className="my-10 space-y-6">
                    {/* Category Filter Tabs */}
                    <div className='flex items-center justify-center'>
                        <div className="flex items-center justify-start gap-2 overflow-x-auto pb-2">
                        <button onClick={() => setSelectedCategoryId('')} className={`cursor-pointer px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${selectedCategoryId === '' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
                            All
                        </button>
                        {categories.map((cat: Category) => (
                             <button key={cat.id} onClick={() => setSelectedCategoryId(cat.id)} className={`cursor-pointer px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${selectedCategoryId === cat.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                    </div>
                    {/* Search Bar */}
                    <div className="relative">
                        <FiSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search projects by name, technology, etc..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="pl-12 pr-4 py-3 w-full border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Content Grid */}
                {isLoading && <div className="h-96 flex justify-center items-center"><Loader /></div>}
                {isError && <div className="text-center py-16 text-red-500">Failed to load projects. Please try again later.</div>}
                {!isLoading && !isError && (
                    <motion.div 
                        variants={{ visible: { transition: { staggerChildren: 0.05 } } }} 
                        initial="hidden" 
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {projects.length > 0 ? (
                            projects.map((project: Project) => <ProjectCard key={project.id} project={project} />)
                        ) : (
                            <div className="col-span-full text-center py-16">
                                <FiPackage size={48} className="mx-auto text-slate-300"/>
                                <h3 className="mt-4 text-xl font-semibold text-slate-700">No Projects Found</h3>
                                <p className="text-slate-500 mt-2">There are no projects that match your current filters.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="mt-16">
                        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={(newPage) => setPage(newPage)} />
                    </div>
                )}
            </main>
            </div>
    );
}