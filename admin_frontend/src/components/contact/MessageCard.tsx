import { motion } from 'framer-motion';
import { FiMail, FiTrash2 } from 'react-icons/fi';

// Local Type Definition
enum MessageStatus { UNREAD = 'UNREAD', READ = 'READ', RESPONDED = 'RESPONDED' }
interface ContactMessage {
  id: string;
  email: string;
  name: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
}

interface MessageCardProps {
  message: ContactMessage;
  onView: () => void;
  onDelete: () => void;
  onReply: () => void;
}

export default function MessageCard({ message, onView, onDelete, onReply }: MessageCardProps) {
    const isUnread = message.status === 'UNREAD';
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    // Define styles for each status for a cleaner look
    const statusStyles = {
        UNREAD: { dot: 'bg-blue-500', text: 'text-blue-700' },
        READ: { dot: 'bg-slate-400', text: 'text-slate-600' },
        RESPONDED: { dot: 'bg-emerald-500', text: 'text-emerald-700' }
    };

    return (
        <motion.div 
            variants={itemVariants} 
            className="group bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-full transition-all duration-300 ease-in-out hover:shadow-md hover:border-slate-300"
        >
            {/* Main clickable area */}
            <div className="p-5 flex-grow cursor-pointer" onClick={onView}>
                {/* Header: Name and Date */}
                <div className="flex justify-between items-start">
                    <p className={`font-semibold truncate pr-4 ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                        {message.name}
                    </p>
                    <p className="text-xs text-slate-400 flex-shrink-0">
                        {new Date(message.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                </div>
                
                {/* Subject */}
                <h4 className="mt-1 text-slate-600 truncate">
                    {message.subject}
                </h4>
            </div>

            {/* Footer: Status and Hover Actions */}
            <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${statusStyles[message.status].dot}`}></span>
                    <span className={`text-xs font-medium ${statusStyles[message.status].text}`}>
                        {message.status}
                    </span>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={(e) => { e.stopPropagation(); onReply(); }} className="p-2 text-slate-500 hover:text-blue-600 rounded-full" title="Reply">
                        <FiMail size={16}/>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-slate-500 hover:text-red-600 rounded-full" title="Delete">
                        <FiTrash2 size={16}/>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}