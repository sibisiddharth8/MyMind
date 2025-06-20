import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiX, FiSave, FiLayers } from 'react-icons/fi';
import { createSkillCategory, updateSkillCategory } from '../../services/skillsService';
import Button from '../ui/Button';

// Local Type Definitions
interface Category { id: string; name: string; }
type CategoryFormData = { name: string };
interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
}

export default function CategoryFormModal({ isOpen, onClose, categoryToEdit }: CategoryFormModalProps) {
    const queryClient = useQueryClient();
    const { control, handleSubmit, reset, formState: { isDirty } } = useForm<CategoryFormData>();

    useEffect(() => {
        if(isOpen) {
            if(categoryToEdit) {
                reset({ name: categoryToEdit.name });
            } else {
                reset({ name: '' });
            }
        }
    }, [categoryToEdit, isOpen, reset]);

    const mutation = useMutation({
        mutationFn: (data: { name: string, id?: string }) => 
            data.id ? updateSkillCategory({ id: data.id, name: data.name }) : createSkillCategory(data.name),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: ['skillCategories'] });
            onClose();
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "An error occurred."),
    });

    const onSubmit: SubmitHandler<CategoryFormData> = (data) => {
        mutation.mutate({ ...data, id: categoryToEdit?.id });
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col">
                            {/* Modal Header */}
                            <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 flex justify-between items-center p-5 border-b border-slate-200 flex-shrink-0">
                                {categoryToEdit ? 'Edit Category' : 'Add New Category'}
                                <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer"><FiX /></button>
                            </Dialog.Title>
                            
                            {/* Form Content (Scrollable) */}
                            <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 overflow-y-auto">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="category-name" className="text-sm font-medium text-slate-600">Category Name</label>
                                        <div className="relative mt-1">
                                            <FiLayers className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                                            <Controller 
                                                name="name" 
                                                control={control} 
                                                rules={{ required: true }} 
                                                render={({ field }) => (
                                                    <input 
                                                        {...field} 
                                                        id="category-name"
                                                        placeholder="e.g., Frontend" 
                                                        className="w-full p-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                )} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                            
                            {/* Fixed Footer with Action Buttons */}
                            <div className="flex-shrink-0 p-4 flex justify-end gap-4 border-t border-slate-200 bg-slate-50">
                                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                                <Button form="category-form" type="submit" isLoading={mutation.isPending} disabled={!isDirty}>
                                    <FiSave className="mr-2"/>
                                    {categoryToEdit ? 'Save Changes' : 'Create Category'}
                                </Button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}