import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiUser, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import MemberFormModal from '../components/modals/MemberFormModal';
import Pagination from '../components/ui/Pagination';
import MemberCard from '../components/members/MemberCard';
import { getMembers, deleteMember } from '../services/memberService';

// Local Type Definition
interface Member {
  id: string;
  name: string;
  profileImage?: string | null;
  linkedinLink?: string | null;
  githubLink?: string | null;
}

export default function MembersPage() {
    const queryClient = useQueryClient();
    
    // --- All State and Data Fetching Logic Remains Correct ---
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    const { data: membersResponse, isLoading } = useQuery({
        queryKey: ['members', page, debouncedSearchTerm],
        queryFn: () => getMembers({ page, limit: 8, name: debouncedSearchTerm }),
        keepPreviousData: true,
    });
    const members = membersResponse?.data || [];
    const pagination = membersResponse?.pagination;
    
    const deleteMutation = useMutation({
        mutationFn: deleteMember,
        onSuccess: () => {
            toast.success("Member deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ['members'] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete member."),
    });

    const handleOpenModal = (member: Member | null = null) => { setSelectedMember(member); setIsModalOpen(true); };
    const handleDeleteClick = (member: Member) => { setSelectedMember(member); setDeleteModalOpen(true); };
    const confirmDelete = () => { if (selectedMember) { deleteMutation.mutate(selectedMember.id); } setDeleteModalOpen(false); };

    return (
        <>
            <div className="flex flex-col h-full">
                {/* Section 1: Page Header (Sticky) */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-10 bg-slate-50 py-4 -mx-6 px-6">
                    <PageHeader title="Team Members">
                        <div className="flex flex-row items-center gap-2">
                            <div className="relative w-full sm:w-auto">
                                <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text"
                                    placeholder="Search members..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full sm:w-64 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <Button onClick={() => handleOpenModal()} className="gap-3">
                                <FiPlus className="m-1" />
                                <span className="hidden sm:inline">Add Member</span>
                            </Button>
                        </div>
                    </PageHeader>
                </motion.div>

                {/* Section 2: Main Content (Scrollable) */}
                <div className="flex-grow overflow-y-auto">
                    {isLoading ? <Spinner overlay={true} text="Loading Member Details..." /> : (
                        <motion.div 
                            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                            initial="hidden"
                            animate="visible"
                            className="p-6" // Padding for content
                        >
                            {members.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4 pb-12">
                                    {members.map((member: Member) => (
                                        <MemberCard 
                                            key={member.id}
                                            member={member}
                                            onEdit={() => handleOpenModal(member)}
                                            onDelete={() => handleDeleteClick(member)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-8 text-center py-16 px-2">
                                    <h3 className="text-xl font-semibold text-slate-700">No Members Found</h3>
                                    <p className="text-slate-500 mt-2">No members match your search, or you haven't added any yet.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Section 3: Pagination Footer (Sticky) */}
                {pagination && pagination.totalPages > 1 && (
                    // THIS IS THE CORRECTED BLOCK
                    <div className="fixed bottom-0 left-0 right-0 z-10 flex-shrink-0 p-2 border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm -mx-6 px-6">
                        <Pagination 
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={(page) => setPage(page)}
                        />
                    </div>
                )}
            </div>

            {/* Modals */}
            <MemberFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} memberToEdit={selectedMember}/>
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete Member" message={`Are you sure you want to delete ${selectedMember?.name}? This cannot be undone.`}/>
        </>
    );
}