import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ActionButtonProps {
  href?: string;
  variant?: 'primary' | 'outline';
  children: ReactNode;
  isExternal?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function ActionButton({ 
  href, 
  variant = 'primary', 
  children, 
  isExternal = false, 
  onClick, 
  className = '' 
}: ActionButtonProps) {
  const baseClasses = "cursor-pointer font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-base shadow-lg";
  
  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/40',
    outline: 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-slate-200/50'
  };

  const fullClassName = `${baseClasses} ${styles[variant]} ${className}`;

  // If an href is provided, render a link
  if (href) {
    return (
      <motion.a
        href={href}
        target={isExternal ? '_blank' : '_self'}
        rel={isExternal ? 'noopener noreferrer' : ''}
        className={fullClassName}
        whileHover={{ scale: 1.001 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
      >
        {children}
      </motion.a>
    );
  }

  // Otherwise, render a button
  return (
    <motion.button
      onClick={onClick}
      className={fullClassName}
      whileHover={{ scale: 1.001 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}