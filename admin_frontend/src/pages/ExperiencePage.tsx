import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import ExperienceFormModal from '../components/modals/ExperienceFormModal';
// THE FIX: 'Experience' type removed from import
import { getExperiences, deleteExperience } from '../services/experienceService';

// THE FIX: The 'Experience' type is now defined directly here
interface Experience {
  id: string;
  logo: string;
  role: string;
  companyName: string;
  companyLink?: string | null;
  startDate: string;
  endDate?: string | null;
  description: string;
  skills: string[];
}

// The rest of the component code is the same...
export default function ExperiencePage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] =useState(false);
    const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);

    const { data: experienceResponse, isLoading } = useQuery({
        queryKey: ['experiences'],
        queryFn: getExperiences
    });
    const experiences = experienceResponse?.data || [];
    const assetBaseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

    const deleteMutation = useMutation({
        mutationFn: deleteExperience,
        onSuccess: () => {
            toast.success("Experience deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ['experiences'] });
        },
        onError: () => toast.error("Failed to delete experience."),
    });

    const handleOpenModal = (experience: Experience | null = null) => {
        setSelectedExperience(experience);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (experience: Experience) => {
        setSelectedExperience(experience);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (selectedExperience) {
            deleteMutation.mutate(selectedExperience.id);
        }
        setDeleteModalOpen(false);
    };

    return (
        <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <PageHeader title="Work Experience">
                    <Button onClick={() => handleOpenModal()}>
                        <div className='flex items-center gap-2'>
                            <FiPlus className="" />
                            <span className="">Add Experience</span>
                        </div>
                        
                    </Button>
                </PageHeader>
            </motion.div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64"><Spinner /></div>
            ) : (
                <motion.div 
                    className="space-y-6 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {experiences.length > 0 ? experiences.map((exp: Experience) => (
                        <div key={exp.id} className="bg-white p-5 rounded-xl shadow-md flex items-start gap-5">
                            <img src={`${assetBaseUrl}/${exp.logo}`} alt={`${exp.companyName} logo`} className="w-14 h-14 object-contain rounded-md border border-slate-100 p-1"/>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-slate-800">{exp.role}</h3>
                                <p className="text-md font-medium text-slate-600">{exp.companyName}</p>
                                <p className="text-sm text-slate-400 mt-1">
                                    {new Date(exp.startDate).toLocaleDateString('en-US', {month: 'short', year: 'numeric'})} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : 'Present'}
                                </p>
                                
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {exp.skills.map((skill: string) => <span key={skill} className="text-xs bg-blue-100 text-blue-800 font-medium px-2 py-1 rounded-full">{skill}</span>)}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button variant="secondary" onClick={() => handleOpenModal(exp)} className="!p-2"><FiEdit/></Button>
                                <Button variant="danger" onClick={() => handleDeleteClick(exp)} className="!p-2"><FiTrash2/></Button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-16 px-2">
                            <h3 className="text-xl font-semibold text-slate-700">No Experience Added Yet</h3>
                            <p className="text-slate-500 mt-2">Click the button above to add your first work experience.</p>
                        </div>
                    )}
                </motion.div>
            )}

            <ExperienceFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                experienceToEdit={selectedExperience}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Experience"
                message={`Are you sure you want to delete the entry for "${selectedExperience?.role} at ${selectedExperience?.companyName}"? This action cannot be undone.`}
            />
        </>
    );
}