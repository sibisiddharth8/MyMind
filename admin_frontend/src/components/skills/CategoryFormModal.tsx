import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiX, FiSave } from 'react-icons/fi';
import { createSkillCategory, updateSkillCategory } from '../../services/skillsService';
import Button from '../ui/Button';

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
        if(categoryToEdit) {
            reset({ name: categoryToEdit.name });
        } else {
            reset({ name: '' });
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
                 <div className="fixed inset-0 bg-black/40" />
                 <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 flex justify-between items-center">
                                {categoryToEdit ? 'Edit Category' : 'Add New Category'}
                                <button onClick={onClose}><FiX /></button>
                            </Dialog.Title>
                            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Category Name</label>
                                    <Controller name="name" control={control} rules={{ required: true }} render={({ field }) => <input {...field} placeholder="e.g., Frontend" className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>} />
                                </div>
                                <div className="flex justify-end gap-4 pt-4 border-t">
                                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                                    <Button type="submit" isLoading={mutation.isPending} disabled={!isDirty}>
                                        <FiSave className="mr-2"/>
                                        {categoryToEdit ? 'Save Changes' : 'Create Category'}
                                    </Button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </div>
                 </div>
            </Dialog>
        </Transition>
    );
}