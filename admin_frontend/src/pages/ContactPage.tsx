import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';

import PageHeader from '../components/ui/PageHeader';
import Spinner from '../components/ui/Spinner';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Pagination from '../components/ui/Pagination';
import ViewMessageModal from '../components/contact/ViewMessageModal';
import ReplyModal from '../components/contact/ReplyModal';
import MessageCard from '../components/contact/MessageCard';
import { getMessages, deleteMessage, updateMessageStatus } from '../services/contactService';

// Local Type Definitions to avoid import issues
enum MessageStatus {
    UNREAD = 'UNREAD',
    READ = 'READ',
    RESPONDED = 'RESPONDED'
}
interface ContactMessage {
    id: string;
    email: string;
    name: string;
    subject: string;
    message: string;
    status: MessageStatus;
    createdAt: string;
}

export default function ContactPage() {
    const queryClient = useQueryClient();

    // State for filters and pagination
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // State for managing modals
    const [viewingMessage, setViewingMessage] = useState<ContactMessage | null>(null);
    const [replyingToMessage, setReplyingToMessage] = useState<ContactMessage | null>(null);
    const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);

    // Debouncing for search input to prevent API calls on every keystroke
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    // Data fetching with all filters included in the query key
    const { data: messagesResponse, isLoading } = useQuery({
        queryKey: ['contactMessages', page, debouncedSearchTerm, statusFilter, dateFilter],
        queryFn: () => getMessages({ page, limit: 9, search: debouncedSearchTerm, status: statusFilter, dateFilter }),
        keepPreviousData: true,
    });
    const messages = messagesResponse?.data || [];
    const pagination = messagesResponse?.pagination;

    // Mutation for updating a message's status
    const updateStatusMutation = useMutation({
        mutationFn: updateMessageStatus,
        onSuccess: () => {
            // Refetch messages and dashboard stats after status update
            queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        },
        onError: (error: any) => {
            console.error("Failed to update status", error);
        }
    });

    // Mutation for deleting a message
    const deleteMutation = useMutation({
        mutationFn: deleteMessage,
        onSuccess: () => {
            toast.success("Message deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete message."),
    });

    // --- Action Handlers ---
    const handleViewMessage = (message: ContactMessage) => {
        // Automatically mark the message as READ when it's viewed for the first time
        if (message.status === 'UNREAD') {
            updateStatusMutation.mutate({ id: message.id, status: 'READ' });
        }
        setViewingMessage(message);
    };

    const handleReplyClick = (message: ContactMessage) => {
        setViewingMessage(null); // Close the view modal
        setReplyingToMessage(message); // Open the reply modal
    };

    const handleDeleteClick = (message: ContactMessage) => {
        setMessageToDelete(message);
    };

    const confirmDelete = () => {
        if (messageToDelete) {
            deleteMutation.mutate(messageToDelete.id);
        }
        setMessageToDelete(null); // Close the confirmation modal
    };

    return (
        <>
            <div className="flex flex-col h-full">
                {/* Section 1: The Sticky Header with All Filters */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0 sticky top-0 bg-slate-50 z-10 py-2 px-4 border-b border-slate-200">
                    <PageHeader title="Contact Messages">
                        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="p-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">All Statuses</option>
                                <option value="UNREAD">Unread</option>
                                <option value="READ">Read</option>
                                <option value="RESPONDED">Responded</option>
                            </select>
                            <select value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} className="p-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">All Time</option>
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                                <option value="last7days">Last 7 Days</option>
                                <option value="last30days">Last 30 Days</option>
                            </select>
                            <div className="relative">
                                <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 w-48 sm:w-64 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                        </div>
                    </PageHeader>
                </motion.div>

                {/* Section 2: The Scrollable Content */}
                <div className="flex-grow overflow-y-auto mb-12">
                    {isLoading ? (
                        <Spinner overlay={true} text="Loading Messages ..." />
                    ) : (
                        <motion.div variants={{ visible: { transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="visible" className="p-6">
                            {messages.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {messages.map((msg: ContactMessage) => (
                                        <MessageCard
                                            key={msg.id}
                                            message={msg}
                                            onView={() => handleViewMessage(msg)}
                                            onReply={() => handleReplyClick(msg)}
                                            onDelete={() => handleDeleteClick(msg)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-24 px-6">
                                    <FiMail size={48} className="mx-auto text-slate-300"/>
                                    <h3 className="mt-4 text-xl font-semibold text-slate-700">No Messages Found</h3>
                                    <p className="text-slate-500 mt-2">There are no messages that match your current filters.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Section 3: The Sticky Pagination Footer */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="fixed bottom-0 left-0 right-0 p-1.75 border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm">
                        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={(page) => setPage(page)} />
                    </div>
                )}
            </div>

            {/* Modals for viewing, replying, and deleting */}
            <ViewMessageModal isOpen={!!viewingMessage} onClose={() => setViewingMessage(null)} message={viewingMessage} onReply={() => handleReplyClick(viewingMessage!)} />
            <ReplyModal isOpen={!!replyingToMessage} onClose={() => setReplyingToMessage(null)} messageToReplyTo={replyingToMessage} />
            <ConfirmationModal isOpen={!!messageToDelete} onClose={() => setMessageToDelete(null)} onConfirm={confirmDelete} title="Delete Message" message={`Are you sure you want to delete the message from "${messageToDelete?.name}"? This cannot be undone.`}/>
        </>
    );
}