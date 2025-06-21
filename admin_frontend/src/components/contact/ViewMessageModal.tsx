import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FiX, FiMail, FiUser, FiCalendar } from 'react-icons/fi';
import Button from '../ui/Button';

// Local Type Definition to avoid import issues
interface ContactMessage { 
  id: string; 
  email: string; 
  name: string; 
  subject: string; 
  message: string; 
  createdAt: string; 
}

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
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-2xl transform rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col max-h-[90vh]">
                    
                    {/* Modal Header */}
                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 flex justify-between items-center p-5 border-b border-slate-300 flex-shrink-0">
                        <span className="truncate pr-4">{message.subject}</span>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer"><FiX /></button>
                    </Dialog.Title>
                    
                    {/* Scrollable Content Area */}
                    <div className="px-6 py-4 overflow-y-auto flex-grow">
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                                    <p className="flex items-center gap-2 font-semibold"><FiUser/> <span>{message.name}</span></p>
                                    <p className="flex items-center gap-2"><FiMail/> <a href={`mailto:${message.email}`} className="hover:underline text-blue-600">{message.email}</a></p>
                                    <p className="flex items-center gap-2 text-slate-500"><FiCalendar/> <span>{new Date(message.createdAt).toLocaleString()}</span></p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{message.message}</p>
                            </div>
                        </div>
                    </div>

                    {/* Fixed Footer with Action Buttons */}
                    <div className="flex-shrink-0 p-4 flex justify-end gap-4 border-t border-slate-300 bg-slate-50 rounded-b-2xl">
                        <Button variant="secondary" onClick={onClose}>Close</Button>
                        <Button onClick={onReply}>
                            <FiMail className="mr-2"/>
                            Reply
                        </Button>
                    </div>

                </Dialog.Panel>
            </div>
        </div>
      </Dialog>
    </Transition>
  );
}