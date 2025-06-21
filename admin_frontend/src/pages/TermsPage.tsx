import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSave, FiEdit, FiTrash2, FiMenu } from 'react-icons/fi';
import toast from 'react-hot-toast';
// --- THIS IS THE FIX ---
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core'; // Import the type separately
// ----------------------
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import TermFormModal from '../components/terms/TermFormModal';
import { getTerms, deleteTerm, updateTermOrder } from '../services/termsService';

// --- Local Type Definition ---
interface TermAndCondition { id: string; title: string; content: string; imagePath?: string | null; order: number; }

// --- Draggable Item Sub-Component ---
function SortableTermItem({ term, onEdit, onDelete }: { term: TermAndCondition, onEdit: () => void, onDelete: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: term.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
            <button {...attributes} {...listeners} className="cursor-grab p-2 text-slate-400 hover:bg-slate-100 rounded-md"><FiMenu/></button>
            <div className="flex-grow min-w-0">
                <p className="font-bold text-slate-800 truncate">{term.title}</p>
                <p className="text-sm text-slate-500 line-clamp-1">{term.content}</p>
            </div>
            <div className="flex gap-2">
                <Button variant="secondary" onClick={onEdit} className="!p-2"><FiEdit size={16}/></Button>
                <Button variant="danger" onClick={onDelete} className="!p-2"><FiTrash2 size={16}/></Button>
            </div>
        </div>
    );
}

// --- Main Page Component ---
export default function TermsPage() {
    const queryClient = useQueryClient();
    const [terms, setTerms] = useState<TermAndCondition[]>([]);
    const [isOrderDirty, setIsOrderDirty] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState<TermAndCondition | null>(null);

    const { data: termsResponse, isLoading } = useQuery({
        queryKey: ['terms'],
        queryFn: getTerms
    });

    useEffect(() => {
        if (termsResponse?.data) {
            setTerms(termsResponse.data);
        }
    }, [termsResponse]);

    const deleteMutation = useMutation({
        mutationFn: deleteTerm,
        onSuccess: () => {
            toast.success("Term deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ['terms'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete term.");
        },
    });

    const orderMutation = useMutation({
        mutationFn: updateTermOrder,
        onSuccess: (res) => { toast.success(res.message); setIsOrderDirty(false); queryClient.invalidateQueries({queryKey: ['terms']}); },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to save order."),
    });

    const handleOpenModal = (term: TermAndCondition | null = null) => { setSelectedTerm(term); setIsModalOpen(true); };
    const handleDeleteClick = (term: TermAndCondition) => { setSelectedTerm(term); setDeleteModalOpen(true); };
    const confirmDelete = () => { if (selectedTerm) { deleteMutation.mutate(selectedTerm.id); } setDeleteModalOpen(false); };

    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setTerms((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                const newArray = arrayMove(items, oldIndex, newIndex);
                // Update the 'order' property for each item based on its new array index
                return newArray.map((item, index) => ({ ...item, order: index + 1 }));
            });
            setIsOrderDirty(true);
        }
    };
    
    const handleSaveOrder = () => {
        const termOrders = terms.map(({ id, order }) => ({ id, order }));
        orderMutation.mutate(termOrders);
    };

    return (
        <>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className='flex-shrink-0 sticky top-0 bg-slate-50 z-10 py-2 px-6 border-b border-slate-200' >
                <PageHeader title="Terms & Conditions">
                    <div className="flex items-center gap-4">
                        {isOrderDirty && (
                            <Button onClick={handleSaveOrder} isLoading={orderMutation.isPending}><FiSave className="mr-2"/>Save Order</Button>
                        )}
                        <Button onClick={() => handleOpenModal()}><FiPlus className="mr-2"/>Add Term</Button>
                    </div>
                </PageHeader>
            </motion.div>

            {isLoading ? <Spinner overlay={true} text="Loading Terms & Conditions ..." /> : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={terms} strategy={verticalListSortingStrategy}>
                        <div className="space-y-4 mt-8">
                            {terms.map(term => (
                                <SortableTermItem 
                                    key={term.id} 
                                    term={term}
                                    onEdit={() => handleOpenModal(term)}
                                    onDelete={() => handleDeleteClick(term)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <TermFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} termToEdit={selectedTerm} />
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete Term" message={`Are you sure you want to delete the term "${selectedTerm?.title}"? This cannot be undone.`} />
        </>
    );
}