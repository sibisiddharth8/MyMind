import { motion } from 'framer-motion';
import { FaGithub } from 'react-icons/fa';
import { FiExternalLink, FiEdit, FiTrash2, FiUser, FiTag } from 'react-icons/fi';

// Local Type Definition
interface Member {
  id: string;
  name: string;
  profileImage?: string | null;
}
interface ProjectMember {
  id: string; // This is the unique ID of the Project-Member relationship.
  role: string;
  member: Member; // This contains the actual member details.
}
interface ProjectCategory {
  id: string;
  name: string;
}
interface Project {
  id: string;
  name: string;
  projectImage: string;
  startDate: string;
  endDate?: string | null;
  githubLink?: string | null;
  liveLink?: string | null;
  tags: string[];
  category: ProjectCategory;
  members: ProjectMember[];
  description: string;
}

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const isCompleted = !!project.endDate;
    const statusText = isCompleted ? 'Completed' : 'In Progress';
    const statusColor = isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';

    return (
        <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm flex flex-col transition-all duration-300 ease-in-out hover:shadow-lg hover:border-blue-500/50 border border-transparent"
        >
            <div className="flex items-start gap-4 p-4">
                <img 
                    src={project.projectImage} 
                    alt={project.name} 
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0" 
                />
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">{project.category.name}</p>
                            <h3 className="font-bold text-base md:text-lg text-slate-900 -mt-0.5 truncate" title={project.name}>{project.name}</h3>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${statusColor}`}>
                            {statusText}
                        </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {project.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="flex-grow"></div> 
            
            <div className="mt-auto pt-3 pb-4 px-2 border-t border-slate-100 flex sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center">
                    {project.members && project.members.length > 0 && (
                        <div className="flex -space-x-2">
                            {/* --- THIS IS THE CORRECTED LOOP --- */}
                            {project.members.slice(0, 4).map((projectMember) => (
                                projectMember.member.profileImage ? (
                                    <img 
                                        key={projectMember.id} // FIX: Use the unique ID of the ProjectMember entry
                                        src={projectMember.member.profileImage} 
                                        alt={projectMember.member.name} 
                                        title={projectMember.member.name} 
                                        className="w-8 h-8 rounded-full object-cover border-2 border-white"
                                    />
                                ) : (
                                    <div 
                                        key={projectMember.id} // FIX: Use the unique ID of the ProjectMember entry
                                        title={projectMember.member.name} 
                                        className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white"
                                    >
                                        <FiUser className="w-4 h-4 text-slate-400"/>
                                    </div>
                                )
                            ))}
                            {project.members.length > 5 && (
                                <div className="w-8 h-8 rounded-full bg-slate-700 text-white text-xs font-semibold flex items-center justify-center border-2 border-white">
                                    +{project.members.length - 5}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="flex ml-auto items-center self-start sm:self-center">
                    {project.githubLink && <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="sm:p-1 p-2 text-slate-500 hover:text-slate-900 transition-colors" title="GitHub"><FaGithub size={18}/></a>}
                    {project.liveLink && <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="sm:p-1 p-2 text-slate-500 hover:text-blue-600 transition-colors" title="Live Demo"><FiExternalLink size={18}/></a>}
                    <div className="w-px h-5 bg-slate-200 mx-1"></div>
                    <button onClick={onEdit} className="sm:p-1 p-2 text-slate-500 hover:text-blue-600 transition-colors" title="Edit"><FiEdit size={16}/></button>
                    <button onClick={onDelete} className="sm:p-1 p-2 text-slate-500 hover:text-red-600 transition-colors" title="Delete"><FiTrash2 size={16}/></button>
                </div>
            </div>
        </motion.div>
    );
}