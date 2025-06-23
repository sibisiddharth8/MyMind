import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  // 'children' can be used to pass extra elements like buttons if needed
  children?: ReactNode; 
}

export default function SectionHeader({ title, description, children }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
      
      {description && (
        <p className="mt-4 max-w-4xl mx-auto text-lg text-slate-600">
          {description}
        </p>
      )}

      {children && <div className="mt-8">{children}</div>}
    </motion.div>
  );
}