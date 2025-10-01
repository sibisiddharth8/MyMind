import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FiTag, FiUsers, FiExternalLink, FiCalendar, FiUser, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { RiSparklingLine } from 'react-icons/ri';
import { RiInformationLine } from 'react-icons/ri';
import { getProjectById } from '../services/projectService';
import Loader from '../components/ui/Loader';
import { motion } from 'framer-motion';
import ScrollToTop from '../components/ui/ScrollToTop';
import { useState } from 'react';
import { generateAIDescription_Public } from '../services/aiService';
import toast from 'react-hot-toast';

interface Member { id: string; name: string; profileImage?: string | null; githubLink?: string; linkedinLink?: string; }
interface ProjectMember { id: string; role: string; member: Member; }
interface Project { id: string; name: string; description: string; aiDescription: string; projectImage: string | null; tags: string[]; startDate: string; endDate?: string | null; githubLink?: string; liveLink?: string; members: ProjectMember[]; category: { name: string }; }

interface AiSummaryProps {
    projectId: string;
    existingAiDescription: string;
}

const SummarySkeleton = () => (
    <div className="space-y-3">
        <div className="h-4 bg-slate-200/80 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-slate-200/80 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-slate-200/80 rounded w-5/6 animate-pulse"></div>
    </div>
);

function AiSummary({ projectId, existingAiDescription }: AiSummaryProps) {
    const [aiContent, setAiContent] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const mutation = useMutation({
        mutationFn: () => generateAIDescription_Public(projectId),
        onSuccess: (data) => {
            setAiContent(data.aiDescription);
        },
        onError: () => {
            toast.error("Nyra couldn't generate a summary. Please try again later.");
        },
        onSettled: () => {
            setIsGenerating(false);
        }
    });

    const handleGenerate = () => {
        setIsGenerating(true);
        if (existingAiDescription && existingAiDescription.trim() !== '<p></p>' && existingAiDescription.trim() !== '') {
            setTimeout(() => {
                setAiContent(existingAiDescription);
                setIsGenerating(false);
            }, 4500);
        } else {
            mutation.mutate();
        }
    };

    if (isGenerating) {
        return (
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Nyra is summarizing...</h3>
                <SummarySkeleton />
            </div>
        );
    }
    
    if (aiContent) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 relative"
            >
                <div className="absolute top-0 right-0 -mt-4 -mr-2 flex items-center justify-center h-10 w-10 bg-white rounded-full shadow-lg">
                    <RiSparklingLine className="text-blue-500 h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Nyra's Summary</h3>
                <div 
                    className="project-description prose prose-lg max-w-none text-slate-700" 
                    dangerouslySetInnerHTML={{ __html: aiContent }} 
                />
            </motion.div>
        );
    }

    return (
        <div>
        <div className="mt-8 text-center p-6 border-2 border-dashed border-slate-300 rounded-2xl">
             <button
                onClick={handleGenerate}
                disabled={mutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-900 transition-all duration-300 transform hover:scale-102 disabled:opacity-50 disabled:scale-100 cursor-pointer"
            >
                <RiSparklingLine />
                Ask Nyra to summarize?
            </button>
        </div>
        </div>
    );
}

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

                            <AiSummary 
                                projectId={project.id} 
                                existingAiDescription={project.aiDescription} 
                            />

                            <div className='flex items-start gap-1 justify-center'>
                              <RiInformationLine className='mt-0.5'/>
                              <div className='text-slate-500 text-sm text-start'>
                                <span className='font-bold text-slate-700 text-sm'>Nyra </span>is still learning and could make mistakes, so please verify the information provided.
                              </div>
                            </div>
                            
                        </div>

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