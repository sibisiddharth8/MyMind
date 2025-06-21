import { motion } from 'framer-motion';
import { FiEdit, FiTrash2, FiUser, FiLinkedin, FiGithub } from 'react-icons/fi';

// Local Type Definition
interface Member {
  id: string;
  name: string;
  profileImage?: string | null;
  linkedinLink?: string | null;
  githubLink?: string | null;
}

interface MemberCardProps {
  member: Member;
  onEdit: () => void;
  onDelete: () => void;
}

export default function MemberCard({ member, onEdit, onDelete }: MemberCardProps) {
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={itemVariants}
            className="group relative rounded-xl border border-slate-200 bg-white p-6 text-center transition-all duration-300 ease-in-out hover:border-blue-400 hover:shadow-xl hover:-translate-y-2"
        >
            {/* Action buttons appear on hover */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <button onClick={onEdit} title="Edit" className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    <FiEdit size={14}/>
                </button>
                <button onClick={onDelete} title="Delete" className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                    <FiTrash2 size={14}/>
                </button>
            </div>

            {/* Avatar */}
            <div className="mb-4">
                {member.profileImage ? (
                    <img 
                        src={member.profileImage} 
                        alt={member.name} 
                        className="w-24 h-24 rounded-full object-cover mx-auto shadow-md"
                    />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center mx-auto shadow-md">
                        <FiUser className="w-12 h-12 text-slate-400" />
                    </div>
                )}
            </div>
            
            {/* Name */}
            <h3 className="font-bold text-lg text-slate-900 truncate" title={member.name}>
                {member.name}
            </h3>
            
            {/* Social Links */}
            <div className="mt-4 flex justify-center gap-5 border-t border-slate-100 pt-4">
                {member.githubLink ? (
                    <a href={member.githubLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-800 transition-colors" title="GitHub">
                        <FiGithub size={20} />
                    </a>
                ) : <div className="w-[20px] h-[20px]"></div>}

                {member.linkedinLink ? (
                    <a href={member.linkedinLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors" title="LinkedIn">
                        <FiLinkedin size={20} />
                    </a>
                ) : <div className="w-[20px] h-[20px]"></div>}
            </div>
        </motion.div>
    );
}