import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getRecentProjects } from '../services/projectService';
import ProjectCard from './projects/ProjectCard';
import { FiAlertTriangle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import SectionHeader from './ui/SectionHeader';
import Loader from './ui/Loader';

export default function FeaturedProjectsSection() {
  const [inView, setInView] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const { data: projectsResponse, isLoading, isError } = useQuery({
    queryKey: ['recentProjects'],
    queryFn: getRecentProjects,
    enabled: inView, // Lazy loading
    staleTime: 1000 * 60 * 5,
  });
  const projects = projectsResponse?.data || [];

  return (
    <motion.section 
      id="projects" 
      className="py-20 md:py-28 bg-slate-100/70"
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true, amount: 0.1 }}
    >
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <SectionHeader title="Featured Projects" description="From ideas to impact—Click on a project to see a detailed case study." />
        </motion.div>
        
        <div className="mt-12 min-h-[28rem]">
            {inView && isLoading && <Loader />}
            {inView && isError && <div className="text-center text-red-500"><FiAlertTriangle className="mx-auto"/> Could not load projects.</div>}
            
            {inView && !isLoading && !isError && (
                <motion.div 
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {projects.map((project: any) => (
                        <ProjectCard key={project.id} project={project} onEdit={() => {}} onDelete={() => {}} onView={() => setSelectedProject(project)} />
                    ))}
                </motion.div>
            )}
        </div>

        <div className="mt-16 text-center">
            <Link to="/projects" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                View All Projects &rarr;
            </Link>
        </div>
      </div>
    </motion.section>
  );
}