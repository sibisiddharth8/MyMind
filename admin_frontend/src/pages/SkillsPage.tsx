import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import CategoryFormModal from '../components/skills/CategoryFormModal';
import SkillFormModal from '../components/skills/SkillFormModal';
import SkillCard from '../components/skills/SkillCard';
import { getSkillCategories, deleteSkillCategory, deleteSkill } from '../services/skillsService';

// Local type definitions to avoid import issues
interface Skill { id: string; name: string; image: string; categoryId: string; }
interface SkillCategory { id: string; name: string; skills: Skill[]; }

export default function SkillsPage() {
    const queryClient = useQueryClient();
    
    // State for modals
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [isSkillModalOpen, setSkillModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    // State to hold the item being edited or the category for a new skill
    const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [categoryForNewSkill, setCategoryForNewSkill] = useState('');
    const [itemToDelete, setItemToDelete] = useState<{ type: 'category' | 'skill', id: string, name: string } | null>(null);

    const { data: categoriesResponse, isLoading } = useQuery({
        queryKey: ['skillCategories'],
        queryFn: getSkillCategories
    });
    const categories = categoriesResponse?.data || [];

    // --- Mutations ---
    const categoryDeleteMutation = useMutation({
        mutationFn: deleteSkillCategory,
        onSuccess: () => {
            toast.success("Category deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ['skillCategories'] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete category."),
    });

    const skillDeleteMutation = useMutation({
        mutationFn: deleteSkill,
        onSuccess: () => {
            toast.success("Skill deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ['skillCategories'] });
        },
        onError: () => toast.error("Failed to delete skill."),
    });

    // --- Modal Handlers ---
    const handleAddCategory = () => { setEditingCategory(null); setCategoryModalOpen(true); };
    const handleEditCategory = (category: SkillCategory) => { setEditingCategory(category); setCategoryModalOpen(true); };

    const handleAddSkill = (categoryId: string) => { setEditingSkill(null); setCategoryForNewSkill(categoryId); setSkillModalOpen(true); };
    const handleEditSkill = (skill: Skill) => { setEditingSkill(skill); setSkillModalOpen(true); };

    const handleDelete = (item: { type: 'category' | 'skill', id: string, name: string }) => { setItemToDelete(item); setDeleteModalOpen(true); };
    
    const confirmDelete = () => {
        if (!itemToDelete) return;
        if (itemToDelete.type === 'category') {
            categoryDeleteMutation.mutate(itemToDelete.id);
        } else {
            skillDeleteMutation.mutate(itemToDelete.id);
        }
        setDeleteModalOpen(false);
    };

    if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;

    return (
        <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <PageHeader title="Skills">
                    <Button onClick={handleAddCategory}><FiPlus className="mr-2" />Add Category</Button>
                </PageHeader>
            </motion.div>

            <div className="space-y-8">
                {categories.length > 0 ? categories.map((category: SkillCategory) => (
                    <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
                                <h2 className="text-xl font-bold text-slate-800">{category.name}</h2>
                                <div className="flex gap-2">
                                    <Button onClick={() => handleAddSkill(category.id)} variant="secondary" className="!py-1 !px-3 !text-xs">
                                        <FiPlus className="mr-1" /> Add Skill
                                    </Button>
                                    <Button onClick={() => handleEditCategory(category)} variant="secondary" className="!p-2"><FiEdit2 size={12}/></Button>
                                    <Button onClick={() => handleDelete({ type: 'category', id: category.id, name: category.name })} variant="danger" className="!p-2"><FiTrash2 size={12}/></Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {category.skills.map((skill: Skill) => (
                                    <SkillCard 
                                        key={skill.id} 
                                        skill={skill} 
                                        onEdit={() => handleEditSkill(skill)}
                                        onDelete={() => handleDelete({ type: 'skill', id: skill.id, name: skill.name })}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="text-center py-16 px-2">
                        <h3 className="text-xl font-semibold text-slate-700">No Skill Categories Added Yet</h3>
                        <p className="text-slate-500 mt-2">Click "Add Category" to get started.</p>
                    </div>
                )}
            </div>

            {isCategoryModalOpen && <CategoryFormModal isOpen={isCategoryModalOpen} onClose={() => setCategoryModalOpen(false)} categoryToEdit={editingCategory} />}
            {isSkillModalOpen && <SkillFormModal isOpen={isSkillModalOpen} onClose={() => setSkillModalOpen(false)} skillToEdit={editingSkill} categoryId={editingSkill?.categoryId || categoryForNewSkill}/>}
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title={`Delete ${itemToDelete?.type}`} message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}/>
        </>
    );
}