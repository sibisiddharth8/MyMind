import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FiX, FiGithub, FiExternalLink, FiTag, FiUsers, FiCalendar } from 'react-icons/fi';
import { FaGithub } from 'react-icons/fa';

// Local Type Definitions
interface Member { id: string; name: string; profileImage?: string | null; }
interface ProjectMember { id: string; role: string; member: Member; }
interface Project { id: string; name: string; description: string; projectImage: string | null; tags: string[]; startDate: string; endDate?: string | null; githubLink?: string; liveLink?: string; members: ProjectMember[]; category: { name: string }; }
interface ProjectDetailModalProps { isOpen: boolean; onClose: () => void; project: Project | null; }

export default function ProjectDetailModal({ isOpen, onClose, project }: ProjectDetailModalProps) {
  if (!project) return null;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-4xl transform rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
              <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm z-10 text-white hover:text-white/80"><FiX /></button>
              
              {project.projectImage && <img src={project.projectImage} alt={project.name} className="w-full h-72 object-cover rounded-t-2xl"/>}
              
              <div className="p-8">
                <span className="text-sm font-bold text-blue-600 uppercase">{project.category.name}</span>
                <Dialog.Title as="h3" className="text-3xl font-bold text-slate-900 mt-1">{project.name}</Dialog.Title>
                
                <div className="grid md:grid-cols-3 gap-8 mt-6">
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="font-semibold text-slate-800">About this project</h4>
                    <p className="text-slate-600 leading-relaxed">{project.description}</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2"><FiUsers/> Team</h4>
                      <div className="mt-2 space-y-2">
                        {project.members.map(({member, role}) => (
                          <div key={member.id} className="flex items-center gap-2 text-sm">
                            <img src={member.profileImage!} alt={member.name} className="w-8 h-8 rounded-full object-cover"/>
                            <div>
                                <p className="font-semibold text-slate-700">{member.name}</p>
                                <p className="text-xs text-slate-500">{role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2"><FiTag/> Technologies</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.tags.map(tag => <span key={tag} className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-1 rounded">{tag}</span>)}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2"><FiCalendar/> Timeline</h4>
                      <p className="text-sm text-slate-600 mt-2">{formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'Present'}</p>
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t">
                      {project.githubLink && <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-semibold text-slate-600 hover:text-blue-600"><FaGithub/> Code</a>}
                      {project.liveLink && <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-semibold text-slate-600 hover:text-blue-600"><FiExternalLink/> Live Demo</a>}
                    </div>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}