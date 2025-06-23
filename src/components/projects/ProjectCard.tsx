import { motion } from 'framer-motion';
import { FaGithub } from 'react-icons/fa';
import { FiExternalLink, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';

// --- Local Type Definitions ---
interface Member { id: string; name: string; profileImage?: string | null; }
interface ProjectMember { id: string; member: Member; }
interface ProjectCategory { name: string; }
interface Project {
  id: string;
  name: string;
  projectImage: string | null;
  startDate: string;
  endDate?: string | null;
  githubLink?: string | null;
  liveLink?: string | null;
  tags: string[];
  category: ProjectCategory;
  members: ProjectMember[];
  description?: string; // Adding description for completeness
}
interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const isCompleted = !!project.endDate;
    const statusText = isCompleted ? 'Completed' : 'In Progress';
    const statusColor = isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';

    return (
        <motion.div variants={itemVariants} className="group relative h-full">
            {/* The main card content - NOT a link itself */}
            <div className="bg-white rounded-xl shadow-sm flex flex-col h-full border border-transparent transition-all duration-300 group-hover:shadow-lg group-hover:border-blue-500/50">
                {project.projectImage && (
                    <div className="aspect-video w-full">
                        <img 
                            src={project.projectImage} 
                            alt={project.name} 
                            className="w-full h-full object-cover rounded-t-xl"
                        />
                    </div>
                )}
                
                <div className="p-5 flex flex-col flex-grow">
                    <div>
                        <div className="flex justify-between items-start gap-2">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">{project.category.name}</p>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor}`}>
                                {statusText}
                            </span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mt-1 truncate" title={project.name}>{project.name}</h3>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {project.tags.slice(0, 4).map(tag => (
                            <span key={tag} className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                    </div>
                    
                    <div className="flex-grow"></div> 
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center">
                            {project.members && project.members.length > 0 && (
                                <div className="flex -space-x-2">
                                    {project.members.slice(0, 5).map(({ member }) => (
                                        member.profileImage ? (
                                            <img key={member.id} src={member.profileImage} alt={member.name} title={member.name} className="w-8 h-8 rounded-full object-cover border-2 border-white"/>
                                        ) : (
                                            <div key={member.id} title={member.name} className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white">
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
                        
                        {/* These links are now on a higher layer (z-20) so they are clickable */}
                        <div className="relative z-20 flex items-center gap-2">
                            {project.githubLink && <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-slate-900 transition-colors" title="GitHub"><FaGithub size={18}/></a>}
                            {project.liveLink && <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-blue-600 transition-colors" title="Live Demo"><FiExternalLink size={18}/></a>}
                        </div>
                    </div>
                </div>
            </div>

            {/* This is the invisible, "stretched" link that makes the card clickable */}
            <Link 
                to={`/projects/${project.id}`} 
                className="absolute inset-0 z-10 rounded-xl"
                aria-label={`View details for ${project.name}`}
            />
        </motion.div>
    );
}