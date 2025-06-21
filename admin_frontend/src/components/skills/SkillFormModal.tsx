import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiX, FiSave, FiAward } from 'react-icons/fi';
import { createSkill, updateSkill } from '../../services/skillsService';
import Button from '../ui/Button';
import FileUpload from '../ui/FileUpload';

// Local Type Definitions to avoid import issues
interface Skill { id: string; name: string; image: string; categoryId: string; }
type SkillFormData = { name: string; image?: File | null | 'remove'; };

interface SkillFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  skillToEdit?: Skill | null;
}

export default function SkillFormModal({ isOpen, onClose, categoryId, skillToEdit }: SkillFormModalProps) {
    const queryClient = useQueryClient();
    const { control, handleSubmit, reset, formState: { isDirty, errors } } = useForm<SkillFormData>();

    useEffect(() => {
        if (isOpen) {
            if (skillToEdit) {
                reset({ name: skillToEdit.name, image: null });
            } else {
                reset({ name: '', image: null });
            }
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
        // Only add categoryId when creating a new skill
        if (!skillToEdit) {
            formData.append('categoryId', categoryId);
        }
        
        if (data.image instanceof File) {
            formData.append('image', data.image);
        } else if (data.image === 'remove') {
            formData.append('removeImage', 'true');
        }
        
        mutation.mutate({ formData, id: skillToEdit?.id });
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col max-h-[90vh]">
                            <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 flex justify-between items-center p-5 border-b border-slate-200 flex-shrink-0">
                                {skillToEdit ? 'Edit Skill' : 'Add New Skill'}
                                <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer"><FiX /></button>
                            </Dialog.Title>
                            
                            <form id="skill-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 overflow-y-auto flex-grow">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="skill-name" className="text-sm font-medium text-slate-600">Skill Name</label>
                                        <div className="relative mt-1">
                                            <FiAward className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                                            <Controller 
                                                name="name" 
                                                control={control} 
                                                rules={{ required: true }} 
                                                render={({ field }) => (
                                                    <input 
                                                        {...field} 
                                                        id="skill-name"
                                                        placeholder="e.g., React" 
                                                        className="w-full p-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                )} 
                                            />
                                        </div>
                                        {errors.name && <p className="text-xs text-red-500 mt-1">Skill name is required.</p>}
                                    </div>
                                    <Controller
                                        name="image"
                                        control={control}
                                        rules={{ required: !skillToEdit }} // Image is required only when creating a new skill
                                        render={({ field: { onChange }, fieldState: { error } }) => (
                                            <div>
                                                <FileUpload
                                                    label="Skill Icon"
                                                    accept="image/*"
                                                    fileType="image"
                                                    existingFileUrl={typeof skillToEdit?.image === 'string' ? skillToEdit.image : null}
                                                    onFileChange={onChange}
                                                    onRemove={() => onChange('remove')}
                                                />
                                                {error && <p className="text-xs text-red-500 mt-1">Skill icon is required.</p>}
                                            </div>
                                        )}
                                    />
                                </div>
                            </form>
                            
                            <div className="flex-shrink-0 p-4 flex justify-end gap-4 border-t border-slate-200 bg-slate-50">
                                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                                <Button form="skill-form" type="submit" isLoading={mutation.isPending} disabled={!isDirty && !control._formValues.image}>
                                    <FiSave className="mr-2"/>
                                    {skillToEdit ? 'Save Changes' : 'Create Skill'}
                                </Button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}