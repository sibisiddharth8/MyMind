import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiX, FiSave, FiLink, FiAward, FiBookOpen } from 'react-icons/fi';
import { createEducation, updateEducation } from '../../services/educationService';
import Button from '../ui/Button';
import FileUpload from '../ui/FileUpload';

// Local type definition to avoid import/export issues
interface Education {
  id: string;
  institutionName: string;
  courseName: string;
  logo: string | null; // <-- ADD '| null' HERE
  startDate: string;
  endDate?: string | null;
  description: string;
  grade: string;
  institutionLink?: string | null;
}

type EducationFormData = Omit<Education, 'id' | 'logo'> & {
    logo?: File | null | 'remove';
};

interface EducationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  educationToEdit?: Education | null;
}

// Helper function to format date strings for <input type="date">
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
  const assetBaseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

  // Watch the value of endDate to determine if the checkbox should be checked
  const endDateValue = watch('endDate');
  const isCurrent = endDateValue === 'present' || endDateValue === null;

  // This effect now correctly formats dates and handles the 'present' state
  useEffect(() => {
    if (isOpen) {
        if (educationToEdit) {
            reset({
                ...educationToEdit,
                startDate: formatDateForInput(educationToEdit.startDate),
                endDate: educationToEdit.endDate ? formatDateForInput(educationToEdit.endDate) : 'present',
            });
        } else {
            // Default to 'present' for new entries
            reset({ institutionName: '', courseName: '', startDate: '', endDate: 'present', description: '', grade: '', institutionLink: '' });
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
    // Append all fields to FormData
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
            <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 flex justify-between items-center">
                        {educationToEdit ? 'Edit Education' : 'Add New Education'}
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><FiX /></button>
                    </Dialog.Title>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-600">Institution Name</label>
                                <Controller name="institutionName" control={control} render={({ field }) => <input {...field} placeholder="e.g., University of Technology" className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>}/>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Course Name</label>
                                <Controller name="courseName" control={control} render={({ field }) => <input {...field} placeholder="e.g., B.S. in Computer Science" className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>}/>
                            </div>
                        </div>

                        <div className="relative">
                           <label htmlFor="institutionLink" className="text-sm font-medium text-slate-600">Institution Website (Optional)</label>
                           <FiLink className="absolute top-9 left-3 text-slate-400" />
                           <Controller name="institutionLink" control={control} render={({ field }) => <input {...field} value={field.value || ''} id="institutionLink" placeholder="https://university.edu" className="w-full p-2 pl-10 border border-slate-300 rounded-lg mt-1"/>}/>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="text-sm font-medium text-slate-600">Start Date</label>
                                <Controller name="startDate" control={control} render={({ field }) => <input {...field} type="date" className="mt-1 w-full p-2 border border-slate-300 rounded-lg text-slate-500"/>}/>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-slate-600">End Date</label>
                                {!isCurrent && (
                                    <Controller name="endDate" control={control} render={({ field }) => <input {...field} type="date" className="mt-1 w-full p-2 border border-slate-300 rounded-lg text-slate-500"/>}/>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <input 
                                id="currentStudy"
                                type="checkbox"
                                checked={isCurrent}
                                onChange={(e) => {
                                    setValue('endDate', e.target.checked ? 'present' : formatDateForInput(new Date().toISOString()), { shouldDirty: true });
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="currentStudy" className="text-sm text-slate-700">I am currently studying here</label>
                        </div>
                        
                         <div className="relative">
                            <label className="text-sm font-medium text-slate-600">Grade / CGPA</label>
                            <FiAward className="absolute top-9 left-3 text-slate-400" />
                            <Controller name="grade" control={control} render={({ field }) => <input {...field} placeholder="e.g., CGPA: 3.8/4.0" className="mt-1 w-full p-2 pl-10 border border-slate-300 rounded-lg"/>}/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600">Description</label>
                            <Controller name="description" control={control} render={({ field }) => <textarea {...field} rows={3} placeholder="Description of your studies and key courses..." className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>}/>
                        </div>
                        
                        <Controller name="logo" control={control} render={({ field: { onChange } }) => (
                            <FileUpload
                                label="Institution Logo"
                                accept="image/*"
                                fileType="image"
                                existingFileUrl={typeof educationToEdit?.logo === 'string' ? `${assetBaseUrl}/${educationToEdit.logo}` : null}
                                onFileChange={onChange}
                                onRemove={() => onChange('remove')}
                            />
                        )}/>

                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button type="submit" isLoading={mutation.isPending} disabled={!isDirty}>
                                <FiSave className="mr-2"/>
                                {educationToEdit ? 'Save Changes' : 'Create Education'}
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