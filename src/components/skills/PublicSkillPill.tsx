import { motion } from 'framer-motion';

// Local Type Definition
interface Skill {
  id: string;
  name: string;
  image: string | null;
}

export default function PublicSkillPill({ skill }: { skill: Skill }) {
  const pillVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={pillVariants}
      className="bg-white rounded-full border border-slate-200 px-4 py-2 flex items-center gap-3 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:border-slate-300"
    >
      {skill.image && (
        <img src={skill.image} alt={skill.name} className="w-6 h-6 object-contain" />
      )}
      <p className="font-semibold text-slate-700">{skill.name}</p>
    </motion.div>
  );
}