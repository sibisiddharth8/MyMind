import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiSearch, FiFilter } from 'react-icons/fi';

import Pagination from '../components/ui/Pagination';
import ProjectCard from '../components/projects/ProjectCard';
import { getProjects, getProjectCategories } from '../services/projectService';
import Loader from '../components/ui/Loader';
import ScrollToTop from '../components/ui/ScrollToTop';
import SectionHeader from '../components/ui/SectionHeader';

interface Project {
    id: string;
    name: string;
    projectImage: string | null;
    startDate: string;
    endDate?: string | null;
    githubLink?: string | null;
    liveLink?: string | null;
    tags: string[];
    category: { name: string };
    members: any[];
    description: string;
}

interface Category { id: string; name: string; }

export default function ProjectsPage() {
    const [page, setPage] = useState(1);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(t);
    }, [searchTerm]);

    const { data: categoriesResponse } = useQuery({
        queryKey: ['projectCategories'],
        queryFn: getProjectCategories
    });

    const { data: projectsResponse, isLoading, isError } = useQuery({
        queryKey: ['projects', page, selectedCategoryId, debouncedSearchTerm],
        queryFn: () => getProjects({
            page,
            limit: 6,
            categoryId: selectedCategoryId || undefined,
            name: debouncedSearchTerm
        }),
        keepPreviousData: true
    });

    const projects = projectsResponse?.data || [];
    const pagination = projectsResponse?.pagination;
    const categories = categoriesResponse?.data || [];

    return (
        <div className="bg-slate-50 min-h-screen md:px-16">
            <ScrollToTop />

            <main className="container mx-auto px-6 py-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center mt-8"
                >
                    <SectionHeader
                        title="All Projects"
                        description="Explore all the projects I've worked on. Filter or search to find something specific."
                    />
                </motion.div>

                <div className="my-10 space-y-6">
                    <div className="flex flex-row gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">

                        <div className="relative w-full flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="text-slate-400" size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 sm:text-sm"
                            />
                        </div>

                        <div className="relative w-18 sm:w-44 flex-shrink-0 mr-2 sm:mr-0">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiFilter className="text-slate-400" size={18} />
                            </div>

                            <select
                                value={selectedCategoryId}
                                onChange={(e) => {
                                    setSelectedCategoryId(e.target.value);
                                    setPage(1);
                                }}
                                className="block w-full pl-10 pr-10 py-2.5 text-base border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-xl bg-slate-50 text-slate-700 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                            >
                                <option value="">All</option>
                                {categories.map((cat: Category) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>

                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading && <div className="h-96 flex justify-center items-center"><Loader /></div>}
                {isError && <div className="text-center py-16 text-red-500">Failed to load projects.</div>}

                {!isLoading && !isError && (
                    <motion.div
                        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                    >
                        {projects.length > 0 ? (
                            projects.map((project: Project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                                <FiPackage size={48} className="mx-auto text-slate-300" />
                                <h3 className="mt-4 text-xl font-semibold text-slate-700">No Projects Found</h3>
                                <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {pagination && pagination.totalPages > 1 && (
                    <div className="mt-16">
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={(newPage) => setPage(newPage)}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
