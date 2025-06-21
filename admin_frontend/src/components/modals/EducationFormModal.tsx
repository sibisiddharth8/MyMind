import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiX, FiSave, FiTag, FiLink, FiCalendar, FiAward, FiBookOpen } from 'react-icons/fi';
import { FaUniversity } from 'react-icons/fa'; // A better icon for Institution
import { createEducation, updateEducation } from '../../services/educationService';
import Button from '../ui/Button';
import FileUpload from '../ui/FileUpload';

// Local type definition
interface Education {
  id: string;
  logo: string | null;
  institutionName: string;
  courseName: string;
  institutionLink?: string | null;
  startDate: string;
  endDate?: string | null;
  description: string;
  grade: string;
}

type EducationFormData = Omit<Education, 'id' | 'logo'> & {
    logo?: File | null | 'remove';
};

interface EducationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  educationToEdit?: Education | null;
}

const formatDateForInput = (dateString?: string | null): string => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toISOString().split('T')[0];
    } catch (error) {
        return '';
    }
};

export default function EducationFormModal({ isOpen, onClose, educationToEdit }: EducationFormModalProps) {
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset, watch, setValue, formState: { isDirty } } = useForm<EducationFormData>();

  const endDateValue = watch('endDate');
  const isCurrent = endDateValue === 'present' || endDateValue === null;

  useEffect(() => {
    if (isOpen) {
        if (educationToEdit) {
            reset({
                ...educationToEdit,
                startDate: formatDateForInput(educationToEdit.startDate),
                endDate: educationToEdit.endDate ? formatDateForInput(educationToEdit.endDate) : 'present',
            });
        } else {
            reset({ institutionName: '', courseName: '', institutionLink: '', startDate: '', endDate: 'present', description: '', grade: '' });
        }
    }
  }, [educationToEdit, isOpen, reset]);

  const mutation = useMutation({
    mutationFn: (data: { formData: FormData, id?: string }) => 
        data.id ? updateEducation({ id: data.id, formData: data.formData }) : createEducation(data.formData),
    onSuccess: (response) => {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ['educations'] });
        onClose();
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "An error occurred."),
  });

  const onSubmit: SubmitHandler<EducationFormData> = (data) => {
    const formData = new FormData();
    (Object.keys(data) as Array<keyof EducationFormData>).forEach(key => {
        const value = data[key];
        if (key === 'logo' && value instanceof File) {
            formData.append(key, value);
        } else if (key === 'logo' && value === 'remove') {
            formData.append('removeLogo', 'true');
        } else if (value !== null && value !== undefined) {
            formData.append(key, value as string);
        }
    });
    mutation.mutate({ formData, id: educationToEdit?.id });
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
                        {educationToEdit ? 'Edit Education' : 'Add New Education'}
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer"><FiX /></button>
                    </Dialog.Title>
                    
                    <form id="education-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 overflow-y-auto flex-grow">
                        <div className="space-y-6">
                            <fieldset className="space-y-4">
                                <legend className="text-base font-semibold text-slate-700">Institution & Course</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Controller name="institutionName" control={control} render={({ field }) => <div className="relative"><FaUniversity className="absolute top-3 left-3 text-slate-400" /><input {...field} placeholder="Institution Name" className="w-full p-2 pl-10 border rounded-lg"/></div>}/>
                                    <Controller name="courseName" control={control} render={({ field }) => <div className="relative"><FiBookOpen className="absolute top-3 left-3 text-slate-400" /><input {...field} placeholder="Course Name" className="w-full p-2 pl-10 border rounded-lg"/></div>}/>
                                </div>
                                <Controller name="institutionLink" control={control} render={({ field }) => <div className="relative"><FiLink className="absolute top-3 left-3 text-slate-400" /><input {...field} value={field.value || ''} placeholder="Institution Website (Optional)" className="w-full p-2 pl-10 border rounded-lg"/></div>}/>
                            </fieldset>

                            <fieldset className="space-y-4 pt-4 border-t text-slate-400">
                                <legend className="text-base font-semibold text-slate-700 pr-2">Duration</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Controller name="startDate" control={control} render={({ field }) => <div className="relative"><FiCalendar className="absolute top-3 left-3 text-slate-400" /><input {...field} type="date" className="w-full p-2 pl-10 border rounded-lg text-slate-500"/></div>}/>
                                    <div className={`${isCurrent && 'opacity-40'}`}><Controller name="endDate" control={control} render={({ field }) => <div className="relative"><FiCalendar className="absolute top-3 left-3 text-slate-400" /><input {...field} type="date" disabled={isCurrent} className="w-full p-2 pl-10 border rounded-lg text-slate-500"/></div>}/></div>
                                </div>
                                <div className="flex items-center gap-2"><input id="currentStudy" type="checkbox" checked={isCurrent} onChange={(e) => setValue('endDate', e.target.checked ? 'present' : formatDateForInput(new Date().toISOString()), { shouldDirty: true })} className="h-4 w-4 rounded"/><label htmlFor="currentStudy">I am currently studying here</label></div>
                            </fieldset>

                            <fieldset className="space-y-4 pt-4 border-t text-slate-400">
                                <legend className="text-base font-semibold text-slate-700 pr-2">Details</legend>
                                <Controller name="grade" control={control} render={({ field }) => <div className="relative"><FiAward className="absolute top-3 left-3 text-slate-400" /><input {...field} placeholder="e.g., CGPA: 3.8/4.0" className="w-full p-2 pl-10 border rounded-lg"/></div>}/>
                                <Controller name="description" control={control} render={({ field }) => <textarea {...field} rows={3} placeholder="Description of your studies..." className="w-full p-2 border rounded-lg"/>}/>
                                <Controller name="logo" control={control} render={({ field: { onChange } }) => (
                                    <FileUpload label="Institution Logo" accept="image/*" fileType="image" existingFileUrl={typeof educationToEdit?.logo === 'string' ? educationToEdit.logo : null} onFileChange={onChange} onRemove={() => onChange('remove')} />
                                )}/>
                            </fieldset>
                        </div>
                    </form>
                    
                    <div className="flex-shrink-0 p-4 flex justify-end gap-4 border-t border-slate-300 bg-slate-50 rounded-b-2xl">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button form="education-form" type="submit" isLoading={mutation.isPending} disabled={!isDirty}>
                            <FiSave className="mr-2"/>
                            {educationToEdit ? 'Save Changes' : 'Create Entry'}
                        </Button>
                    </div>
                </Dialog.Panel>
            </div>
        </div>
      </Dialog>
    </Transition>
  );
}