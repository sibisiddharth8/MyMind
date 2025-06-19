import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FiX, FiMail, FiUser, FiBookmark } from 'react-icons/fi';
import Button from '../ui/Button';

interface ContactMessage { id: string; email: string; name: string; subject: string; message: string; createdAt: string; }

interface ViewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReply: () => void;
  message: ContactMessage | null;
}

export default function ViewMessageModal({ isOpen, onClose, onReply, message }: ViewMessageModalProps) {
  if (!message) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black bg-opacity-40" />
        <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-2xl transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 flex justify-between items-start">
                        {message.subject}
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><FiX /></button>
                    </Dialog.Title>
                    <div className="mt-4 space-y-4">
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                            <p className="flex items-center gap-2"><FiUser/> <strong>{message.name}</strong></p>
                            <p className="flex items-center gap-2"><FiMail/> <a href={`mailto:${message.email}`} className="hover:underline">{message.email}</a></p>
                        </div>
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-slate-700 whitespace-pre-wrap">{message.message}</p>
                        </div>
                        <p className="text-xs text-slate-400 text-right">Received on {new Date(message.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <Button variant="secondary" onClick={onClose}>Close</Button>
                        <Button onClick={onReply}>Reply</Button>
                    </div>
                </Dialog.Panel>
            </div>
        </div>
      </Dialog>
    </Transition>
  );
}