import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Pagination from '../components/ui/Pagination';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectFormModal from '../components/projects/ProjectFormModal';
import CategoryManagerModal from '../components/projects/CategoryManagerModal';
import { getProjects, getProjectCategories, deleteProject } from '../services/projectService';

// Local Type Definitions
interface Project { id: string; name: string; projectImage: string; startDate: string; endDate?: string | null; githubLink?: string | null; liveLink?: string | null; tags: string[]; category: {id: string; name: string}; members: { memberId: string; role: string; member: { id: string, name: string, profileImage?: string | null } }[]; description: string; categoryId: string;}
interface Category { id: string; name: string; }

export default function ProjectsPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [isCategoryManagerOpen, setCategoryManagerOpen] = useState(false);

    // Debouncing for search input
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    // Data fetching hooks
    const { data: categoriesResponse } = useQuery({ queryKey: ['projectCategories'], queryFn: getProjectCategories });
    const { data: projectsResponse, isLoading } = useQuery({
        queryKey: ['projects', page, selectedCategoryId, debouncedSearchTerm],
        queryFn: () => getProjects({ page, limit: 6, categoryId: selectedCategoryId || undefined, name: debouncedSearchTerm }),
        keepPreviousData: true,
    });
    const projects = projectsResponse?.data || [];
    const pagination = projectsResponse?.pagination;
    
    // Mutation and handler logic
    const deleteMutation = useMutation({
        mutationFn: deleteProject,
        onSuccess: () => { toast.success("Project deleted."); queryClient.invalidateQueries({ queryKey: ['projects'] }); },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete."),
    });

    const handleOpenCreateModal = () => { setProjectToEdit(null); setIsModalOpen(true); };
    const handleOpenEditModal = (project: Project) => { setProjectToEdit(project); setIsModalOpen(true); };
    const handleDeleteClick = (project: Project) => { setProjectToDelete(project); setDeleteModalOpen(true); };
    const confirmDelete = () => { if (projectToDelete) deleteMutation.mutate(projectToDelete.id); setDeleteModalOpen(false); };

    return (
        <>
            <div className="flex flex-col h-full">
                {/* Section 1: The Sticky Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0 sticky top-0 bg-slate-50 z-10 py-1 px-6 border-b border-slate-200">
                    <PageHeader title="Projects">
                        <div className="flex items-center gap-2">
                            <select onChange={(e) => { setSelectedCategoryId(e.target.value); setPage(1); }} className="p-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">All Categories</option>
                                {categoriesResponse?.data?.map((cat: Category) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                            <div className="relative">
                                <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 w-40 sm:w-64 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            <Button variant="secondary" onClick={() => setCategoryManagerOpen(true)}>Manage Categories</Button>
                            <Button onClick={handleOpenCreateModal}><FiPlus className="mr-2"/>Add Project</Button>
                        </div>
                    </PageHeader>
                </motion.div>

                {/* Section 2: The Scrollable Content */}
                <div className="flex-grow overflow-y-auto mb-12">
                    <motion.div variants={{ visible: { transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="visible" className="p-6">
                        {isLoading ? (
                            <Spinner overlay={true} text="Loading Project Details..." />
                        ) : projects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {projects.map((proj: Project) => (
                                    <ProjectCard key={proj.id} project={proj} onEdit={() => handleOpenEditModal(proj)} onDelete={() => handleDeleteClick(proj)} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-2">
                                <h3 className="text-xl font-semibold text-slate-700">No Projects Found</h3>
                                <p className="text-slate-500 mt-2">No projects match your filters, or you haven't added any yet.</p>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Section 3: The Sticky Pagination Footer */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm p-1.75">
                        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={(page) => setPage(page)} />
                    </div>
                )}
            </div>

            <ProjectFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} projectToEdit={projectToEdit} />
            <CategoryManagerModal isOpen={isCategoryManagerOpen} onClose={() => setCategoryManagerOpen(false)} />
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete Project" message={`Are you sure you want to delete the project "${projectToDelete?.name}"? This action cannot be undone.`} />
        </>
    );
}