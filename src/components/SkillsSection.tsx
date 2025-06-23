import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getSkillCategories } from '../services/skillsService';
import PublicSkillPill from './skills/PublicSkillPill';
import { FiAlertTriangle, FiCpu } from 'react-icons/fi';
import Loader from './ui/Loader'; // Corrected import path
import SectionHeader from './ui/SectionHeader';

// Local Type Definitions
interface Skill {
  id: string;
  name: string;
  image: string | null;
}
interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}

export default function SkillsSection() {
  const [hasBeenInView, setHasBeenInView] = useState(false);

  const { data: categoriesResponse, isLoading, isError } = useQuery({
    queryKey: ['skillCategories'],
    queryFn: getSkillCategories,
    enabled: hasBeenInView,
    staleTime: 1000 * 60 * 10,
  });

  const categories = categoriesResponse?.data || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // This will make categories animate in one by one
      },
    },
  };

  const skillWallVariants = {
    hidden: { opacity: 1 }, // Keep the container visible
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // This will make each pill animate in one by one
      },
    },
  };

  return (
    <motion.section 
      id="skills" 
      className="py-20 md:py-28 border-y bg-slate-50 border-slate-200"
      onViewportEnter={() => setHasBeenInView(true)}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <SectionHeader title="Technologies & Skills" description="From logic to launch—this is how I build the future." />
        </motion.div>
        
        <div className="mt-16 min-h-[20rem]">
            {hasBeenInView && isLoading && <div className="flex justify-center"><Loader /></div>}
            
            {hasBeenInView && isError && (
              <div className="text-center p-8 rounded-lg bg-red-50 text-red-700">
                <FiAlertTriangle className="mx-auto h-8 w-8" />
                <p className="mt-2 font-semibold">Could not load skills.</p>
              </div>
            )}
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate={hasBeenInView && !isLoading && !isError ? 'visible' : 'hidden'}
              className="space-y-12"
            >
              {Array.isArray(categories) && categories.map((category: SkillCategory) => (
                <motion.div key={category.id} variants={containerVariants}>
                  <h3 className="text-xl font-bold text-slate-800 text-center mb-6">{category.name}</h3>
                  
                  {/* THIS IS THE FIX: A flex-wrap container for the pills */}
                  <motion.div 
                    variants={skillWallVariants}
                    className="flex flex-wrap justify-center gap-4"
                  >
                    {category.skills.map((skill) => (
                      <PublicSkillPill key={skill.id} skill={skill} />
                    ))}
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
        </div>
      </div>
    </motion.section>
  );
}