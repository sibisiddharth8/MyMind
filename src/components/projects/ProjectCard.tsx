import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub } from 'react-icons/fa';
import { FiExternalLink, FiUser, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import React, { useState } from 'react';

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
  description?: string;
  isMaintained?: boolean;
}
interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [showMaintenanceTooltip, setShowMaintenanceTooltip] = useState(false);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const isCompleted = !!project.endDate;
  const statusText = isCompleted ? 'Completed' : 'In Progress';
  const statusColor = isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';

  const tooltipVariants = {
    hidden: { opacity: 0, y: 5, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 5, scale: 0.95 }
  };

  return (
    <motion.div variants={itemVariants} className="group relative h-full">
      <div className="bg-white rounded-xl shadow-sm flex flex-col h-full border border-transparent transition-all duration-300 group-hover:shadow-lg group-hover:border-blue-500/50">

        <motion.div
          className="absolute top-3 right-3 z-20"
          onMouseEnter={() => setShowMaintenanceTooltip(true)}
          onMouseLeave={() => setShowMaintenanceTooltip(false)}
          onFocus={() => setShowMaintenanceTooltip(true)}
          onBlur={() => setShowMaintenanceTooltip(false)}
        >
          <button
            className={`flex items-center justify-center p-1 rounded-full text-slate-500 hover:text-slate-600 transition-colors duration-200 shadow-md ring-1 ring-slate-100 ${project.isMaintained ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-amber-800'}`}
            aria-label={project.isMaintained ? "Actively Maintained" : "Not Actively Maintained"}
            aria-describedby={`maintenance-tooltip-${project.id}`}
          >
            <FiInfo className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showMaintenanceTooltip && (
              <motion.div
                key="maintenance-tooltip"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tooltipVariants}
                transition={{ duration: 0.2 }}
                id={`maintenance-tooltip-${project.id}`}
                role="tooltip"
                className="absolute top-full right-0 mt-2 min-w-[150px] w-max rounded-lg bg-white p-2 text-xs text-slate-700 shadow-lg ring-1 ring-slate-200 origin-top-right text-right z-40"
              >
                <div className="flex items-center justify-end">
                  {project.isMaintained ? (
                    <div className="flex items-center gap-1">
                      <FiCheckCircle className="w-3 h-3 text-emerald-500" />
                      <span>Actively Maintained</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <FiInfo className="w-3 h-3 text-amber-500" />
                      <span>Not Actively Maintained</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

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
            
            <div className="relative z-20 flex items-center gap-2">
              {project.githubLink && <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-slate-900 transition-colors" title="GitHub"><FaGithub size={18}/></a>}
              {project.liveLink && <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-blue-600 transition-colors" title="Live Demo"><FiExternalLink size={18}/></a>}
            </div>
          </div>
        </div>
      </div>

      <Link 
        to={`/projects/${project.id}`} 
        className="absolute inset-0 z-10 rounded-xl"
        aria-label={`View details for ${project.name}`}
      />
    </motion.div>
  );
}