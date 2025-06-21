import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiX, FiSave, FiBriefcase, FiTag, FiLink, FiCalendar } from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa'; // <-- FIX: Import from the correct icon set
import { createExperience, updateExperience } from '../../services/experienceService';
import Button from '../ui/Button';
import FileUpload from '../ui/FileUpload';

// Local type definition to avoid import issues
interface Experience {
  id: string;
  logo: string | null;
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
    skills: string;
};

interface ExperienceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  experienceToEdit?: Experience | null;
}

const formatDateForInput = (dateString?: string | null): string => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toISOString().split('T')[0];
    } catch (error) {
        return '';
    }
};

export default function ExperienceFormModal({ isOpen, onClose, experienceToEdit }: ExperienceFormModalProps) {
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset, watch, setValue, formState: { isDirty } } = useForm<ExperienceFormData>();

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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-2xl transform rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col max-h-[90vh]">
                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 flex justify-between items-center p-5 border-b border-slate-300 flex-shrink-0">
                        {experienceToEdit ? 'Edit Experience' : 'Add New Experience'}
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer"><FiX /></button>
                    </Dialog.Title>
                    
                    <form id="experience-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 overflow-y-auto flex-grow">
                        <div className="space-y-6">
                            <fieldset className="space-y-4">
                                <legend className="text-base font-semibold text-slate-700">Role & Company</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Controller name="role" control={control} render={({ field }) => <div className="relative"><FiBriefcase className="absolute top-3 left-3 text-slate-400" /><input {...field} placeholder="Role" className="w-full p-2 pl-10 border rounded-lg"/></div>}/>
                                    {/* FIX: Using FaBuilding icon now */}
                                    <Controller name="companyName" control={control} render={({ field }) => <div className="relative"><FaBuilding className="absolute top-3 left-3 text-slate-400" /><input {...field} placeholder="Company Name" className="w-full p-2 pl-10 border rounded-lg"/></div>}/>
                                </div>
                                <Controller name="companyLink" control={control} render={({ field }) => <div className="relative"><FiLink className="absolute top-3 left-3 text-slate-400" /><input {...field} value={field.value || ''} placeholder="Company Website (Optional)" className="w-full p-2 pl-10 border rounded-lg"/></div>}/>
                            </fieldset>

                            <fieldset className="space-y-4 pt-4 border-t">
                                <legend className="text-base font-semibold text-slate-700 pr-2">Duration</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Controller name="startDate" control={control} render={({ field }) => <div className="relative"><FiCalendar className="absolute top-3 left-3 text-slate-400" /><input {...field} type="date" className="w-full p-2 pl-10 border rounded-lg text-slate-500"/></div>}/>
                                    <div className={`${isCurrentJob && 'opacity-40'}`}><Controller name="endDate" control={control} render={({ field }) => <div className="relative"><FiCalendar className="absolute top-3 left-3 text-slate-400" /><input {...field} type="date" disabled={isCurrentJob} className="w-full p-2 pl-10 border rounded-lg text-slate-500"/></div>}/></div>
                                </div>
                                <div className="flex items-center gap-2"><input id="currentJob" type="checkbox" checked={isCurrentJob} onChange={(e) => setValue('endDate', e.target.checked ? 'present' : formatDateForInput(new Date().toISOString()), { shouldDirty: true })} className="h-4 w-4 rounded"/><label htmlFor="currentJob">I currently work here</label></div>
                            </fieldset>

                            <fieldset className="space-y-4 pt-4 border-t">
                                <legend className="text-base font-semibold text-slate-700 pr-2">Details</legend>
                                <Controller name="description" control={control} render={({ field }) => <div><label className="text-sm font-medium text-slate-600">Description</label><textarea {...field} rows={4} placeholder="Your role and achievements..." className="mt-1 w-full p-2 border rounded-lg"/></div>}/>
                                <Controller name="skills" control={control} render={({ field }) => <div><label className="text-sm font-medium text-slate-600">Skills Used (comma-separated)</label><div className="relative mt-1"><FiTag className="absolute top-3 left-3 text-slate-400" /><input {...field} placeholder="e.g., React, Node.js, Python" className="w-full p-2 pl-10 border rounded-lg"/></div></div>}/>
                                <Controller name="logo" control={control} render={({ field: { onChange } }) => (
                                    <FileUpload label="Company Logo" accept="image/*" fileType="image" existingFileUrl={typeof experienceToEdit?.logo === 'string' ? experienceToEdit.logo : null} onFileChange={onChange} onRemove={() => onChange('remove')} />
                                )}/>
                            </fieldset>
                        </div>
                    </form>
                    
                    <div className="flex-shrink-0 p-4 flex justify-end gap-4 border-t border-slate-300 bg-slate-50 rounded-b-2xl">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button form="experience-form" type="submit" isLoading={mutation.isPending} disabled={!isDirty}>
                            <FiSave className="mr-2"/>
                            {experienceToEdit ? 'Save Changes' : 'Create Experience'}
                        </Button>
                    </div>
                </Dialog.Panel>
            </div>
        </div>
      </Dialog>
    </Transition>
  );
}