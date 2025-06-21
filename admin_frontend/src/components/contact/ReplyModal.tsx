import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiX, FiSend } from 'react-icons/fi';
import { replyToMessage } from '../../services/contactService';
import Button from '../ui/Button';

// Local Type Definitions to avoid import errors
interface ContactMessage { 
  id: string; 
  subject: string; 
  name: string;
  email: string;
  message: string;
}
type ReplyFormData = { replyText: string; };

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageToReplyTo: ContactMessage | null;
}

export default function ReplyModal({ isOpen, onClose, messageToReplyTo }: ReplyModalProps) {
    const queryClient = useQueryClient();
    const { control, handleSubmit, reset, formState: { isDirty } } = useForm<ReplyFormData>();

    useEffect(() => {
      if (isOpen) {
        reset({ replyText: '' });
      }
    }, [isOpen, reset]);

    const mutation = useMutation({
        mutationFn: replyToMessage,
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            onClose();
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to send reply."),
    });

    const onSubmit: SubmitHandler<ReplyFormData> = (data) => {
        if (!messageToReplyTo) return;
        mutation.mutate({ id: messageToReplyTo.id, replyText: data.replyText });
    };

    if (!messageToReplyTo) return null;

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
                                Replying to: "{messageToReplyTo.subject}"
                                <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer"><FiX /></button>
                            </Dialog.Title>
                            
                            <form id="reply-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 overflow-y-auto flex-grow space-y-4">
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="text-xs font-semibold text-slate-500">Original Message from {messageToReplyTo.name}:</p>
                                    <p className="mt-1 text-sm text-slate-600 line-clamp-3">
                                        {messageToReplyTo.message}
                                    </p>
                                </div>
                                <div>
                                    <label htmlFor="replyText" className="text-sm font-medium text-slate-600">Your Reply</label>
                                    <Controller 
                                        name="replyText" 
                                        control={control} 
                                        rules={{ required: true }} 
                                        render={({ field }) => (
                                            <textarea 
                                                {...field} 
                                                id="replyText" 
                                                rows={8} 
                                                className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Type your message here..."
                                            />
                                        )} 
                                    />
                                </div>
                            </form>
                            
                            <div className="flex-shrink-0 p-4 flex justify-end gap-4 border-t border-slate-300 bg-slate-50 rounded-b-2xl">
                                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                                <Button form="reply-form" type="submit" isLoading={mutation.isPending} disabled={!isDirty}>
                                    <FiSend className="mr-2"/>
                                    Send Reply
                                </Button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}