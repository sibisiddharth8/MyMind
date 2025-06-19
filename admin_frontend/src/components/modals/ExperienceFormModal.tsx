import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiX, FiSave, FiLink } from 'react-icons/fi';
import { createExperience, updateExperience } from '../../services/experienceService';
import Button from '../ui/Button';
import FileUpload from '../ui/FileUpload';

// Local type definition to avoid import issues
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

type ExperienceFormData = Omit<Experience, 'id' | 'logo' | 'skills'> & {
    logo?: File | null | 'remove';
    skills: string; // Handle skills as a comma-separated string in the form
};

interface ExperienceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  experienceToEdit?: Experience | null;
}

// Helper function to format date strings for <input type="date">
const formatDateForInput = (dateString?: string | null): string => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toISOString().split('T')[0];
    } catch (error) {
        return ''; // Return empty string if date is invalid
    }
};

export default function ExperienceFormModal({ isOpen, onClose, experienceToEdit }: ExperienceFormModalProps) {
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset, watch, setValue, formState: { isDirty } } = useForm<ExperienceFormData>();
  const assetBaseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

  const endDateValue = watch('endDate');
  const isCurrentJob = endDateValue === 'present' || endDateValue === null;

  useEffect(() => {
    if (isOpen) {
        if (experienceToEdit) {
            reset({
                ...experienceToEdit,
                startDate: formatDateForInput(experienceToEdit.startDate),
                endDate: experienceToEdit.endDate ? formatDateForInput(experienceToEdit.endDate) : 'present',
                skills: experienceToEdit.skills.join(', '),
            });
        } else {
            reset({ role: '', companyName: '', companyLink: '', startDate: '', endDate: 'present', description: '', skills: '' });
        }
    }
  }, [experienceToEdit, isOpen, reset]);

  const mutation = useMutation({
    mutationFn: (data: { formData: FormData, id?: string }) => 
        data.id ? updateExperience({ id: data.id, formData: data.formData }) : createExperience(data.formData),
    onSuccess: (response) => {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ['experiences'] });
        onClose();
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "An error occurred."),
  });

  const onSubmit: SubmitHandler<ExperienceFormData> = (data) => {
    const formData = new FormData();
    (Object.keys(data) as Array<keyof ExperienceFormData>).forEach(key => {
        const value = data[key];
        if (key === 'logo' && value instanceof File) {
            formData.append(key, value);
        } else if (key === 'logo' && value === 'remove') {
            formData.append('removeLogo', 'true');
        } else if (value !== null && value !== undefined) {
            formData.append(key, value as string);
        }
    });
    mutation.mutate({ formData, id: experienceToEdit?.id });
  };
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 flex justify-between items-center">
                        {experienceToEdit ? 'Edit Experience' : 'Add New Experience'}
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><FiX /></button>
                    </Dialog.Title>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-600">Role</label>
                                <Controller name="role" control={control} render={({ field }) => <input {...field} placeholder="e.g., Software Engineer" className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>}/>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Company Name</label>
                                <Controller name="companyName" control={control} render={({ field }) => <input {...field} placeholder="e.g., Google" className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>}/>
                            </div>
                        </div>

                        {/* --- THIS IS THE NEWLY ADDED FIELD --- */}
                        <div className="relative">
                           <label htmlFor="companyLink" className="text-sm font-medium text-slate-600">Company Website/Link (Optional)</label>
                           <FiLink className="absolute top-9 left-3 text-slate-400" />
                           <Controller name="companyLink" control={control} render={({ field }) => <input {...field} value={field.value || ''} id="companyLink" placeholder="https://example.com" className="w-full p-2 pl-10 border border-slate-300 rounded-lg mt-1"/>}/>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="text-sm font-medium text-slate-600">Start Date</label>
                                <Controller name="startDate" control={control} render={({ field }) => <input {...field} type="date" className="mt-1 w-full p-2 border border-slate-300 rounded-lg text-slate-500"/>}/>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-slate-600">End Date</label>
                                {!isCurrentJob && (
                                    <Controller name="endDate" control={control} render={({ field }) => <input {...field} type="date" className="mt-1 w-full p-2 border border-slate-300 rounded-lg text-slate-500"/>}/>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <input 
                                id="currentJob"
                                type="checkbox"
                                checked={isCurrentJob}
                                onChange={(e) => {
                                    setValue('endDate', e.target.checked ? 'present' : formatDateForInput(new Date().toISOString()), { shouldDirty: true });
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="currentJob" className="text-sm text-slate-700">I currently work here</label>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-slate-600">Description</label>
                            <Controller name="description" control={control} render={({ field }) => <textarea {...field} rows={4} placeholder="Description of your role and achievements..." className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>}/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600">Skills Used (comma-separated)</label>
                            <Controller name="skills" control={control} render={({ field }) => <input {...field} placeholder="e.g., React, Node.js, Python" className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>}/>
                        </div>
                        
                        <Controller name="logo" control={control} render={({ field: { onChange } }) => (
                            <FileUpload
                                label="Company Logo"
                                accept="image/*"
                                fileType="image"
                                existingFileUrl={typeof experienceToEdit?.logo === 'string' ? `${assetBaseUrl}/${experienceToEdit.logo}` : null}
                                onFileChange={onChange}
                                onRemove={() => onChange('remove')}
                            />
                        )}/>

                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button type="submit" isLoading={mutation.isPending} disabled={!isDirty}>
                                <FiSave className="mr-2"/>
                                {experienceToEdit ? 'Save Changes' : 'Create Experience'}
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