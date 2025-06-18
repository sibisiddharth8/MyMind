import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiX, FiSave } from 'react-icons/fi';
import { createSkill, updateSkill } from '../../services/skillsService';
import Button from '../ui/Button';
import FileUpload from '../ui/FileUpload';

interface Skill { id: string; name: string; image: string; }
type SkillFormData = { name: string; image?: File | null | 'remove'; };
interface SkillFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string; // Needed when creating a new skill
  skillToEdit?: Skill | null;
}

export default function SkillFormModal({ isOpen, onClose, categoryId, skillToEdit }: SkillFormModalProps) {
    const queryClient = useQueryClient();
    const { control, handleSubmit, reset, formState: { isDirty } } = useForm<SkillFormData>();
    const assetBaseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

    useEffect(() => {
        if (skillToEdit) {
            reset({ name: skillToEdit.name, image: null });
        } else {
            reset({ name: '', image: null });
        }
    }, [skillToEdit, isOpen, reset]);

    const mutation = useMutation({
        mutationFn: (data: { formData: FormData, id?: string }) => 
            data.id ? updateSkill({ id: data.id, formData: data.formData }) : createSkill(data.formData),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: ['skillCategories'] });
            onClose();
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "An error occurred."),
    });

    const onSubmit: SubmitHandler<SkillFormData> = (data) => {
        const formData = new FormData();
        formData.append('name', data.name);
        if(!skillToEdit) formData.append('categoryId', categoryId); // Add categoryId only on create
        
        if (data.image instanceof File) formData.append('image', data.image);
        if (data.image === 'remove') formData.append('removeImage', 'true');
        
        mutation.mutate({ formData, id: skillToEdit?.id });
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* ... (Modal background and panel structure is the same as other modals) ... */}
                <div className="fixed inset-0 bg-black/40" />
                <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                        <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 flex justify-between items-center">
                            {skillToEdit ? 'Edit Skill' : 'Add New Skill'}
                            <button onClick={onClose}><FiX /></button>
                        </Dialog.Title>
                        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-600">Skill Name</label>
                                <Controller name="name" control={control} rules={{ required: true }} render={({ field }) => <input {...field} placeholder="e.g., React" className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>} />
                            </div>
                            <Controller
                                name="image"
                                control={control}
                                render={({ field: { onChange } }) => (
                                    <FileUpload
                                        label="Skill Icon"
                                        accept="image/*"
                                        fileType="image"
                                        existingFileUrl={typeof skillToEdit?.image === 'string' ? `${assetBaseUrl}/${skillToEdit.image}` : null}
                                        onFileChange={onChange}
                                        onRemove={() => onChange('remove')}
                                    />
                                )}
                            />
                            <div className="flex justify-end gap-4 pt-4 border-t">
                                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                                <Button type="submit" isLoading={mutation.isPending} disabled={!isDirty && !control._formValues.image}>
                                    <FiSave className="mr-2"/>
                                    {skillToEdit ? 'Save Changes' : 'Create Skill'}
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