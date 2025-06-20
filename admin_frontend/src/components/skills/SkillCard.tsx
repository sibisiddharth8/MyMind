import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

// Local Type Definition
interface Skill {
    id: string;
    name: string;
    image: string;
}

interface SkillCardProps {
    skill: Skill;
    onEdit: () => void;
    onDelete: () => void;
}

export default function SkillCard({ skill, onEdit, onDelete }: SkillCardProps) {
    const assetBaseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

    // Animation variant for framer-motion
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={itemVariants}
            className="group relative aspect-square flex flex-col justify-center items-center bg-white p-2 rounded-2xl border-2 border-transparent shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:border-blue-500/50 hover:-translate-y-2"
        >
            {/* Action Buttons - appear on hover in the top corner */}
            <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <button 
                    onClick={onEdit} 
                    className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer" 
                    title="Edit Skill"
                >
                    <FiEdit2 size={14}/>
                </button>
                <button 
                    onClick={onDelete} 
                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer" 
                    title="Delete Skill"
                >
                    <FiTrash2 size={14}/>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center justify-center text-center">
                {/* Skill Icon with hover scale effect */}
                <div className="w-16 h-16 mb-4 transition-transform duration-300 group-hover:scale-110">
                    <img 
                        src={`${assetBaseUrl}/${skill.image}`} 
                        alt={skill.name} 
                        className="w-full h-full object-contain"
                    />
                </div>
                
                {/* Skill Name */}
                <h3 className="font-bold text-slate-800 w-[10ch] sm:w-[14ch] truncate ellipse" title={skill.name}>
                    {skill.name}
                </h3>
            </div>
        </motion.div>
    );
}