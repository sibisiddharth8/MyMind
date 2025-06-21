import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import toast from 'react-hot-toast';
import { FiX, FiEdit, FiTrash2, FiCheck, FiPlus } from 'react-icons/fi';
import { getProjectCategories, updateProjectCategory, deleteProjectCategory, createProjectCategory } from '../../services/projectService';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

// Local Type Definitions
interface Category { id: string; name: string; }
interface CategoryManagerModalProps { isOpen: boolean; onClose: () => void; }

export default function CategoryManagerModal({ isOpen, onClose }: CategoryManagerModalProps) {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [newCategoryName, setNewCategoryName] = useState("");

    const { data: categoriesResponse, isLoading } = useQuery({
        queryKey: ['projectCategories'],
        queryFn: getProjectCategories,
        enabled: isOpen,
    });
    const categories = categoriesResponse?.data || [];

    const updateMutation = useMutation({
        mutationFn: updateProjectCategory,
        onSuccess: (res) => { toast.success(res.message); queryClient.invalidateQueries({queryKey: ['projectCategories']}); setEditingId(null); },
        onError: (err: any) => toast.error(err.response?.data?.message || "Update failed."),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProjectCategory,
        onSuccess: () => { toast.success("Category deleted."); queryClient.invalidateQueries({queryKey: ['projectCategories']}); },
        onError: (err: any) => toast.error(err.response?.data?.message || "Delete failed. Ensure no projects are using this category."),
    });

    const createMutation = useMutation({
        mutationFn: createProjectCategory,
        onSuccess: (res) => {
            toast.success(res.message);
            queryClient.invalidateQueries({queryKey: ['projectCategories']});
            setNewCategoryName('');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create."),
    });

    const handleEditStart = (category: Category) => {
        setEditingId(category.id);
        setEditingName(category.name);
    };

    const handleSaveEdit = () => {
        if (!editingId || !editingName.trim()) return;
        updateMutation.mutate({ id: editingId, name: editingName.trim() });
    };

    const handleCreateCategory = () => {
        if (newCategoryName.trim()) {
            createMutation.mutate(newCategoryName.trim());
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col max-h-[90vh]">
                            <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 flex justify-between items-center p-5 border-b border-slate-300 flex-shrink-0">
                                Manage Project Categories
                                <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer"><FiX /></button>
                            </Dialog.Title>
                            
                            <div className="flex-grow p-6 overflow-y-auto space-y-6">
                                {/* List of Existing Categories */}
                                <div>
                                    <h4 className="font-semibold text-slate-800 mb-2">Existing Categories</h4>
                                    <div className="max-h-50 overflow-y-auto space-y-2 pr-2 border border-slate-300 rounded-lg p-2 bg-slate-50">
                                        {isLoading ? <div className="flex justify-center p-4"><Spinner/></div> : categories.map((cat: Category) => (
                                            <div key={cat.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100">
                                                {editingId === cat.id ? (
                                                    <input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="flex-grow p-1 border rounded-md"/>
                                                ) : (
                                                    <p className="flex-grow font-medium text-slate-700">{cat.name}</p>
                                                )}
                                                <div className="flex gap-1">
                                                    {editingId === cat.id ? (
                                                        <Button onClick={handleSaveEdit} isLoading={updateMutation.isPending && updateMutation.variables?.id === cat.id} className="!p-2"><FiCheck className="text-green-600"/></Button>
                                                    ) : (
                                                        <Button variant="secondary" onClick={() => handleEditStart(cat)} className="!p-2"><FiEdit size={14}/></Button>
                                                    )}
                                                    <Button variant="danger" onClick={() => deleteMutation.mutate(cat.id)} isLoading={deleteMutation.isPending && deleteMutation.variables === cat.id} className="!p-2"><FiTrash2 size={14}/></Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Form to Create New Category */}
                                <div className="">
                                    <h4 className="font-semibold text-slate-800">Add New Category</h4>
                                    <div className="flex items-center gap-2 mt-2">
                                        <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New category name..." className="w-full p-2 border border-slate-300 rounded-lg"/>
                                        <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim() || createMutation.isPending} isLoading={createMutation.isPending}>
                                            <FiPlus className="mr-2"/> Add
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Fixed Footer */}
                            <div className="flex-shrink-0 p-4 flex justify-end gap-4 border-t border-slate-300 bg-slate-50 rounded-b-2xl">
                                <Button variant="primary" onClick={onClose}>Done</Button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}