import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiX, FiSave } from 'react-icons/fi';
import { createMember, updateMember } from '../../services/memberService';
import Button from '../ui/Button';
import FileUpload from '../ui/FileUpload';

// Local Type Definitions
interface Member {
  id: string;
  name: string;
  profileImage?: string | null;
  linkedinLink?: string | null;
  githubLink?: string | null;
}
type MemberFormData = Omit<Member, 'id' | 'profileImage'> & {
    profileImage?: File | null | 'remove';
};
interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
}

export default function MemberFormModal({ isOpen, onClose, memberToEdit }: MemberFormModalProps) {
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<MemberFormData>();

  useEffect(() => {
    if (isOpen) {
        if (memberToEdit) {
            reset(memberToEdit);
        } else {
            reset({ name: '', linkedinLink: '', githubLink: '' });
        }
    }
  }, [memberToEdit, isOpen, reset]);

  const mutation = useMutation({
    mutationFn: (data: { formData: FormData, id?: string }) => 
        data.id ? updateMember({ id: data.id, formData: data.formData }) : createMember(data.formData),
    onSuccess: (response) => {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ['members'] });
        onClose();
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "An error occurred."),
  });

  const onSubmit: SubmitHandler<MemberFormData> = (data) => {
    const formData = new FormData();
    // Append all fields to FormData
    (Object.keys(data) as Array<keyof MemberFormData>).forEach(key => {
        const value = data[key];
        if (key === 'profileImage' && value instanceof File) {
            formData.append(key, value);
        } else if (key === 'profileImage' && value === 'remove') {
            formData.append('removeProfileImage', 'true'); // Backend signal
        } else if (value !== null && value !== undefined) {
            formData.append(key, value as string);
        }
    });
    mutation.mutate({ formData, id: memberToEdit?.id });
  };
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/40" />
        <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 flex justify-between items-center">
                        {memberToEdit ? 'Edit Member' : 'Add New Member'}
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><FiX /></button>
                    </Dialog.Title>
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-600">Full Name</label>
                            <Controller name="name" control={control} rules={{ required: true }} render={({ field }) => <input {...field} placeholder="e.g., Jane Doe" className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>}/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller name="linkedinLink" control={control} render={({ field }) => <input {...field} value={field.value || ''} placeholder="LinkedIn URL" className="w-full p-2 border border-slate-300 rounded-lg"/>}/>
                            <Controller name="githubLink" control={control} render={({ field }) => <input {...field} value={field.value || ''} placeholder="GitHub URL" className="w-full p-2 border border-slate-300 rounded-lg"/>}/>
                        </div>
                        <Controller name="profileImage" control={control} render={({ field: { onChange } }) => (
                            <FileUpload
                                label="Profile Image"
                                accept="image/*"
                                fileType="image"
                                existingFileUrl={typeof memberToEdit?.profileImage === 'string' ? memberToEdit.profileImage : null}
                                onFileChange={onChange}
                                onRemove={() => onChange('remove')}
                            />
                        )}/>
                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button type="submit" isLoading={mutation.isPending} disabled={!isDirty && !control._formValues.profileImage}>
                                <FiSave className="mr-2"/>
                                {memberToEdit ? 'Save Changes' : 'Create Member'}
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