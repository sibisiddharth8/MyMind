import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiTag, FiUsers, FiExternalLink, FiCalendar, FiUser, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { getProjectById } from '../services/projectService';
import Loader from '../components/ui/Loader';
import { motion } from 'framer-motion';
import ScrollToTop from '../components/ui/ScrollToTop';
import { useState } from 'react';

// --- Local Type Definitions ---
interface Member { id: string; name: string; profileImage?: string | null; githubLink?: string; linkedinLink?: string; }
interface ProjectMember { id: string; role: string; member: Member; }
interface Project { id: string; name: string; description: string; projectImage: string | null; tags: string[]; startDate: string; endDate?: string | null; githubLink?: string; liveLink?: string; members: ProjectMember[]; category: { name: string }; }

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const { data: projectResponse, isLoading, isError } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectById(id!),
    enabled: !!id,
  });

  const project: Project | null = projectResponse?.data || null;

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !project) {
    return (
        <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center text-center p-6">
            <h2 className="text-2xl font-bold text-slate-800">Project Not Found</h2>
            <p className="mt-2 text-slate-500">The project you are looking for does not exist or could not be loaded.</p>
        </div>
    );
  }
  
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const isDescriptionLong = project.description.length > 300;

  return (
    <div className="bg-white">
      <ScrollToTop />
      <main className="sm:px-4 lg:px-6 py-6">
        <div className="container mx-auto px-6">
            <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.5}}>
                <div className="text-center">
                    <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">{project.category.name}</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-2">{project.name}</h1>
                    <p className="text-slate-500 mt-3 flex items-center justify-center gap-2">
                        <FiCalendar/>
                        <span>{formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'Present'}</span>
                    </p>
                </div>
            </motion.div>

            <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.5, delay: 0.2}} className="flex items-center justify-center m-auto my-12 p-2 sm:p-4 bg-slate-100 rounded-xl border border-slate-200 max-w-3xl">
                {project.projectImage && (
                    <img src={project.projectImage} alt={project.name} className="rounded-lg object-contain" />
                )}
            </motion.div>

            <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.5, delay: 0.4}} className="grid lg:grid-cols-3 gap-x-12 gap-y-8">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-2xl font-bold text-slate-800">About this Project</h2>
                    
                    <div
                      className={`project-description prose prose-lg max-w-none text-slate-600 leading-relaxed ${!isDescriptionExpanded && isDescriptionLong ? 'line-clamp-6' : ''}`}
                      dangerouslySetInnerHTML={{ __html: project.description }}
                    />
                    
                    {isDescriptionLong && (
                        <button 
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            className="font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                        >
                            {isDescriptionExpanded ? 'Show Less' : 'Read More'}
                            {isDescriptionExpanded ? <FiChevronUp/> : <FiChevronDown/>}
                        </button>
                    )}
                </div>

                {/* --- ALL SIDEBAR CONTENT IS RESTORED HERE --- */}
                <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FiUsers/> Team</h3>
                        <div className="mt-3 space-y-3">
                            {project.members.map(({member, role}) => (
                                <div key={member.id} className="flex items-center gap-3">
                                    {member.profileImage ? (
                                        <img src={member.profileImage} alt={member.name} className="w-10 h-10 rounded-full object-cover"/>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center"><FiUser className="text-slate-400"/></div>
                                    )}
                                    <div className='flex-1'>
                                        <p className="font-semibold text-slate-700">{member.name}</p>
                                        <p className="text-sm text-slate-500">{role}</p>
                                    </div>
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        {member.githubLink && <a href={member.githubLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-800"><FaGithub className='w-5 h-5'/></a>}
                                        {member.linkedinLink && <a href={member.linkedinLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600"><FaLinkedin className='w-5 h-5'/></a>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FiTag/> Technologies</h3>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {project.tags.map(tag => <span key={tag} className="bg-slate-200 text-slate-700 text-sm font-medium px-3 py-1 rounded-full">{tag}</span>)}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t">
                        {project.githubLink && <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-semibold text-slate-600 hover:text-blue-600"><FaGithub/> Code</a>}
                        {project.liveLink && <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-semibold text-slate-600 hover:text-blue-600"><FiExternalLink/> Live Demo</a>}
                    </div>
                </div>
            </motion.div>
        </div>
      </main>

      {/* This style block ensures lists and other rich text elements render correctly */}
      <style>{`
        .project-description ul {
          list-style-type: disc !important;
          margin-left: 1.5rem !important;
          padding-left: 1rem !important;
        }
        .project-description ol {
          list-style-type: decimal !important;
          margin-left: 1.5rem !important;
          padding-left: 1rem !important;
        }
        .project-description li {
          margin-bottom: 0.5rem !important;
        }
        .project-description blockquote {
            border-left: 3px solid #cbd5e1 !important;
            padding-left: 1rem !important;
            font-style: italic !important;
            color: #64748b !important;
        }
        .project-description a {
          color: #2563eb !important;
          text-decoration: underline !important;
        }
        .project-description a:hover {
          color: #1d4ed8 !important;
        }
      `}</style>
    </div>
  );
}