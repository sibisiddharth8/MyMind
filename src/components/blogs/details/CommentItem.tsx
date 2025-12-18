import { useState, useEffect } from 'react';
import { FiTrash2, FiChevronDown, FiChevronUp, FiLoader } from 'react-icons/fi';
import { TbPinFilled } from 'react-icons/tb';
import toast from 'react-hot-toast';
import { getCommentReplies } from '../../../services/publicBlogService';
import UserAvatar from '../../ui/UserAvatar';
import MyMind from '../../../assets/MyMind.png';

interface CommentItemProps {
    comment: any;
    user: any; // The currently logged-in user
    onDelete: (id: string) => void;
    onReply: (id: string, content: string) => void;
    depth?: number;
}

export default function CommentItem({ comment, user, onDelete, onReply, depth = 0 }: CommentItemProps) {
    const isOwner = user && user.id === comment.publicUserId;
    
    // --- STATE ---
    
    // 1. Local Replies State
    const [replies, setReplies] = useState<any[]>(comment.replies || []);
    const [areRepliesLoaded, setAreRepliesLoaded] = useState((comment.replies?.length ?? 0) > 0);
    const [showReplies, setShowReplies] = useState(false);
    
    // 2. Reply Form State
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    
    // 3. Pagination State for Replies
    const [repliesPage, setRepliesPage] = useState(1);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);

    // 4. Robust Total Calculation (Server count vs Local array length)
    const [repliesTotal, setRepliesTotal] = useState(() => {
        const countFromMeta = comment._count?.replies ?? 0;
        const countFromArray = comment.replies?.length ?? 0;
        return Math.max(countFromMeta, countFromArray);
    });

    // --- EFFECTS ---

    // Sync total count if parent updates prop
    useEffect(() => {
        const serverCount = comment._count?.replies ?? 0;
        if (serverCount > 0 && repliesTotal === 0) {
            setRepliesTotal(serverCount);
        }
    }, [comment, repliesTotal]);

    // Sync replies array if parent updates prop (e.g. after a mutation)
    useEffect(() => {
        if (comment.replies && comment.replies.length > 0) {
            setReplies(comment.replies);
            setAreRepliesLoaded(true);
            const serverCount = comment._count?.replies ?? comment.replies.length;
            setRepliesTotal(serverCount);
        }
    }, [comment.replies, comment._count?.replies]);

    // --- HANDLERS ---

    const handleReplySubmit = () => {
        if (!replyContent.trim()) return;
        
        // Call parent handler
        onReply(comment.id, replyContent);
        
        // Reset local state
        setIsReplying(false);
        setReplyContent('');
        
        // Optimistic UI update: Open replies and increment count
        setShowReplies(true);
        // Note: Actual data update happens when parent invalidates query, 
        // but we increment total locally for immediate feedback
        setRepliesTotal(prev => prev + 1);
    };

    const handleLoadReplies = async () => {
        // Case A: Replies already loaded, just toggle visibility
        if (areRepliesLoaded && repliesPage === -1) {
            setShowReplies(!showReplies); 
            return;
        }

        // Case B: Replies loaded but hidden, just show them
        if (areRepliesLoaded && !showReplies) {
            setShowReplies(true);
            return;
        }

        // Case C: Fetch from API
        setIsLoadingReplies(true);
        try {
            const res = await getCommentReplies(comment.id, repliesPage);
            
            // Filter duplicates
            const newReplies = res.data.filter((newR: any) => !replies.some(r => r.id === newR.id));
            
            setReplies(prev => [...prev, ...newReplies]);
            setAreRepliesLoaded(true);
            setShowReplies(true);
            
            // Handle Pagination
            if (res.pagination.currentPage < res.pagination.totalPages) {
                setRepliesPage(prev => prev + 1);
            } else {
                setRepliesPage(-1); // -1 means "End of list"
            }
        } catch (error) {
            toast.error("Failed to load replies");
        } finally {
            setIsLoadingReplies(false);
        }
    };

    return (
        <div className={`group flex gap-3 md:gap-4 ${depth > 0 ? 'mt-4' : 'mt-6'}`}>
            
            {/* 1. Left: Avatar */}
            <div className="flex-shrink-0">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${comment.admin ? 'text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {comment.admin ? (
                         <img src={MyMind} alt="Author" className="p-0.5 border border-slate-200 bg-white w-full h-full rounded-full object-cover" />
                    ) : (
                        <UserAvatar 
                            src={comment.publicUser?.profileImage} 
                            alt={comment.publicUser?.name || 'Anonymous'} 
                            size={depth > 0 ? "sm" : "md"} // Smaller avatar for nested items
                        />
                    )}
                </div>
            </div>

            {/* 2. Right: Content & Actions */}
            <div className="flex-grow min-w-0">
                
                {/* 📌 PINNED BADGE */}
                {comment.isPinned && (
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-500 mb-1">
                        <TbPinFilled className="text-slate-500" />
                        <span>Pinned by Author</span>
                    </div>
                )}

                {/* Header: Name & Date */}
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs md:text-sm font-semibold ${comment.admin ? 'text-blue-600 bg-blue-50 px-1.5 rounded' : 'text-slate-900'}`}>
                        {comment.admin ? 'Author' : comment.publicUser?.name || 'Anonymous'}
                    </span>
                    <span className="text-[11px] md:text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>

                {/* Comment Body */}
                <div className={`text-sm text-slate-800 leading-relaxed break-words ${comment.isDeleted ? 'italic text-slate-400' : ''}`}>
                    {comment.isDeleted ? 'Comment deleted' : comment.content}
                </div>

                {/* Action Bar */}
                <div className="flex items-center gap-4 mt-2">
                    {user && !comment.isDeleted && (
                        <button 
                            onClick={() => setIsReplying(!isReplying)}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-800 uppercase tracking-wide flex items-center gap-1 transition-colors"
                        >
                            Reply
                        </button>
                    )}
                    
                    {isOwner && !comment.isDeleted && (
                        <button 
                            onClick={() => onDelete(comment.id)} 
                            className="text-xs font-semibold text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                            <FiTrash2 size={12} /> Delete
                        </button>
                    )}
                </div>

                {/* Reply Input Form */}
                {isReplying && (
                    <div className="mt-3 flex gap-2 items-start animate-in fade-in slide-in-from-top-1">
                        {/* Current User Tiny Avatar */}
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0 mt-1 flex items-center justify-center text-[10px] font-bold text-slate-500">
                             {user?.profileImage ? (
                                <img src={user.profileImage} className="w-full h-full rounded-full object-cover" alt="Me" />
                             ) : (
                                user?.name?.[0]
                             )}
                        </div>
                        <div className="flex-grow">
                            <input 
                                type="text" 
                                autoFocus
                                placeholder="Add a reply..."
                                className="w-full text-sm border-b border-slate-300 px-0 py-1 outline-none focus:border-blue-500 bg-transparent transition-all"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit()}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => setIsReplying(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-full hover:bg-slate-100">Cancel</button>
                                <button 
                                    onClick={handleReplySubmit}
                                    disabled={!replyContent.trim()}
                                    className="text-xs font-semibold text-white bg-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Reply
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- VIEW REPLIES BUTTON --- */}
                {(repliesTotal > 0 || replies.length > 0) && (
                    <div className="mt-2">
                        <button 
                            onClick={handleLoadReplies}
                            className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded-full flex items-center gap-2 transition-colors"
                        >
                            {isLoadingReplies ? (
                                <FiLoader className="animate-spin" />
                            ) : (
                                showReplies ? <FiChevronUp /> : <FiChevronDown />
                            )}
                            
                            {areRepliesLoaded && repliesPage === -1 
                                ? (showReplies ? "Hide replies" : `Show ${repliesTotal} replies`)
                                : (showReplies && areRepliesLoaded ? "Show more replies" : `View ${repliesTotal} reply${repliesTotal > 1 ? 's' : ''}`)
                            }
                        </button>
                    </div>
                )}

                {/* Nested Replies List */}
                {showReplies && replies.length > 0 && (
                    <div className="flex flex-col">
                        {replies.map((reply: any) => (
                            <CommentItem 
                                key={reply.id} 
                                comment={reply} 
                                user={user} 
                                onDelete={onDelete} 
                                onReply={onReply}
                                depth={depth + 1} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}