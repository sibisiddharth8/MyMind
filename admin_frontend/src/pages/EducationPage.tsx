import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import EducationFormModal from '../components/modals/EducationFormModal';
import { getEducations, deleteEducation } from '../services/educationService';

// Local type definition to avoid import issues
interface Education {
  id: string;
  institutionName: string;
  courseName: string;
  logo: string;
  startDate: string;
  endDate: string;
  description: string;
  grade: string;
  institutionLink?: string | null;
}

export default function EducationPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedEducation, setSelectedEducation] = useState<Education | null>(null);

    const { data: educationResponse, isLoading } = useQuery({
        queryKey: ['educations'],
        queryFn: getEducations
    });
    const educations = educationResponse?.data || [];
    const assetBaseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

    const deleteMutation = useMutation({
        mutationFn: deleteEducation,
        onSuccess: () => {
            toast.success("Education entry deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ['educations'] });
        },
        onError: () => toast.error("Failed to delete education entry."),
    });

    const handleOpenModal = (education: Education | null = null) => {
        setSelectedEducation(education);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (education: Education) => {
        setSelectedEducation(education);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (selectedEducation) {
            deleteMutation.mutate(selectedEducation.id);
        }
        setDeleteModalOpen(false);
    };

    return (
        <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <PageHeader title="Education History">
                    <Button onClick={() => handleOpenModal()}>
                        <FiPlus className="mr-2" />
                        Add Education
                    </Button>
                </PageHeader>
            </motion.div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64"><Spinner /></div>
            ) : (
                <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {educations.length > 0 ? educations.map((edu: Education) => (
                        <div key={edu.id} className="bg-white p-5 rounded-xl shadow-md flex items-start gap-5">
                            <img src={`${assetBaseUrl}/${edu.logo}`} alt={`${edu.institutionName} logo`} className="w-14 h-14 object-contain rounded-md border border-slate-100 p-1"/>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-slate-800">{edu.courseName}</h3>
                                <p className="text-md font-medium text-slate-600">{edu.institutionName}</p>
                                <p className="text-sm text-slate-400 mt-1">
                                    {new Date(edu.startDate).getFullYear()} - {new Date(edu.endDate).getFullYear()} | <span className="font-semibold">{edu.grade}</span>
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button variant="secondary" onClick={() => handleOpenModal(edu)} className="!p-2"><FiEdit/></Button>
                                <Button variant="danger" onClick={() => handleDeleteClick(edu)} className="!p-2"><FiTrash2/></Button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-16 px-2">
                            <h3 className="text-xl font-semibold text-slate-700">No Education Added Yet</h3>
                            <p className="text-slate-500 mt-2">Click the button above to add your first education entry.</p>
                        </div>
                    )}
                </motion.div>
            )}

            <EducationFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                educationToEdit={selectedEducation}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Education Entry"
                message={`Are you sure you want to delete the entry for "${selectedEducation?.courseName}"? This action cannot be undone.`}
            />
        </>
    );
}