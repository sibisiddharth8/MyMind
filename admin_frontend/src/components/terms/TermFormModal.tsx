import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiX, FiSave } from 'react-icons/fi';
import { createTerm, updateTerm } from '../../services/termsService';
import Button from '../ui/Button';
import FileUpload from '../ui/FileUpload';

// Local Type Definitions
interface TermAndCondition { id: string; title: string; content: string; imagePath?: string | null; order: number; }
type TermFormData = Omit<TermAndCondition, 'id' | 'order' | 'imagePath'> & {
    image?: File | null | 'remove';
};

interface TermFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  termToEdit?: TermAndCondition | null;
}

export default function TermFormModal({ isOpen, onClose, termToEdit }: TermFormModalProps) {
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<TermFormData>();
  const assetBaseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

  useEffect(() => {
    if (termToEdit) {
        reset({ title: termToEdit.title, content: termToEdit.content });
    } else {
        reset({ title: '', content: '' });
    }
  }, [termToEdit, isOpen, reset]);

  const mutation = useMutation({
    mutationFn: (data: { formData: FormData, id?: string }) => 
        data.id ? updateTerm({ id: data.id, formData: data.formData }) : createTerm(data.formData),
    onSuccess: (response) => {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ['terms'] });
        onClose();
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "An error occurred."),
  });

  const onSubmit: SubmitHandler<TermFormData> = (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.image instanceof File) formData.append('image', data.image);
    if (data.image === 'remove') formData.append('removeImage', 'true');
    
    mutation.mutate({ formData, id: termToEdit?.id });
  };
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black bg-opacity-40" />
        <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 flex justify-between items-center">
                    {termToEdit ? 'Edit Term' : 'Add New Term'}
                    <button onClick={onClose}><FiX /></button>
                </Dialog.Title>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-600">Title</label>
                        <Controller name="title" control={control} rules={{ required: true }} render={({ field }) => <input {...field} placeholder="e.g., 1. User Agreement" className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600">Content</label>
                        <Controller name="content" control={control} rules={{ required: true }} render={({ field }) => <textarea {...field} rows={10} placeholder="Enter the full text for this term..." className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>}/>
                    </div>
                    <Controller name="image" control={control} render={({ field: { onChange } }) => (
                        <FileUpload
                            label="Optional Image"
                            accept="image/*"
                            fileType="image"
                            existingFileUrl={termToEdit?.imagePath ? `${assetBaseUrl}/${termToEdit.imagePath}` : null}
                            onFileChange={onChange}
                            onRemove={() => onChange('remove')}
                        />
                    )}/>
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={mutation.isPending} disabled={!isDirty && !control._formValues.image}>
                            <FiSave className="mr-2"/>
                            {termToEdit ? 'Save Changes' : 'Create Term'}
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