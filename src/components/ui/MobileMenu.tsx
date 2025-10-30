import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail } from 'react-icons/fi';
import SocialLinks from './SocialLinks';
import MyMind from '../../../public/android-chrome-512x512.png.png';
import { Link } from 'react-router-dom';
// info icon import 
import { FiInfo } from 'react-icons/fi';

// Local Type Definition
interface LinksData { github?: string; linkedin?: string; instagram?: string; portal?: string; }

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  scrollToSection: (id: string) => void;
  links: LinksData | null | undefined;
}

export default function MobileMenu({ isOpen, onClose, scrollToSection, links }: MobileMenuProps) {
  const navLinks = [
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'journey', label: 'Journey' },
  ];

  const menuVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
  };
  
  const linkVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={onClose}
          />
          <motion.div
            key="mobile-menu"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={menuVariants}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed top-0 right-0 w-full max-w-sm h-full bg-white shadow-xl z-50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <img src={MyMind} alt="MyMind Logo" className="h-9 w-9" />
                <div>
                  <h2 className="font-bold text-lg text-slate-800">MyMind</h2>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm text-slate-500 flex">
                      powered by Nyra.ai
                    </p>
                    <Link to="/nyra">
                      <FiInfo className="text-slate-700 hover:text-slate-900 h-3.5 w-3.5" title="Learn more about Nyra.ai"/>
                    </Link>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-900">
                <FiX size={24} />
              </button>
            </div>
            
            <nav className="flex-grow p-6 flex flex-col gap-6 text-xl overflow-y-auto">
              {navLinks.map((link, i) => (
                <motion.button 
                  key={link.id}
                  custom={i}
                  variants={linkVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 + i * 0.05 }}
                  onClick={() => { scrollToSection(link.id); onClose(); }} 
                  className="text-left font-semibold text-slate-800 hover:text-blue-600 transition-colors"
                >
                  {link.label}
                </motion.button>
              ))}
            </nav>

            <div className="flex-shrink-0 p-6 border-t border-slate-200 space-y-6">
                <button onClick={() => { scrollToSection('contact'); onClose(); }} className="w-full bg-blue-600 text-white text-center font-semibold px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <FiMail /> Contact Me
                </button>
                <div className="flex justify-center">
                    <SocialLinks links={links}/>
                </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}