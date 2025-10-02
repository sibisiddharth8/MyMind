import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBox, FiMenu, FiX } from 'react-icons/fi';
import MobileMenu from '../components/ui/MobileMenu';
import { usePortfolioData } from '../hooks/usePortfolioData';

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const headerOffset = 90;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  }
};

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('about');
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const { links } = usePortfolioData();
  const observer = useRef<IntersectionObserver | null>(null);

  const navLinks = [
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'journey', label: 'Journey' },
    { id: 'contact', label: 'Contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const elements = navLinks.map(link => document.getElementById(link.id)).filter(Boolean) as HTMLElement[];
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { rootMargin: '-40% 0px -60% 0px' });

    elements.forEach(el => observer.current?.observe(el));
    return () => observer.current?.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMenuOpen]);
  
  const islandVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: 0.2 + i * 0.1,
      },
    }),
  };

  const highlightTarget = hoveredLink || activeSection;

  return (
    <div className=''>
      <header className="hidden md:block">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={islandVariants}
          className={`fixed top-4 left-4 z-40 transition-shadow duration-300 rounded-full ${isScrolled ? 'shadow-lg' : 'shadow'}`}
        >
          <div className="bg-slate-100/70 backdrop-blur-xl border border-white/20 rounded-full p-3">
            <Link to="/" aria-label="Homepage" className="flex items-center gap-2">
              <FiBox className="w-8 h-8 text-blue-600" />
              {/* <h1 className="hidden md:block text-xl font-bold">MyMind</h1> */}
            </Link>
          </div>
        </motion.div>

        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={islandVariants}
          className={`fixed top-4 right-4 z-40 transition-shadow duration-300 rounded-full ${isScrolled ? 'shadow-lg' : 'shadow'}`}
        >
          <div
            className="flex items-center bg-slate-50 backdrop-blur-xl border border-white/20 rounded-full p-2"
            onMouseLeave={() => setHoveredLink(null)}
          >
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                onMouseEnter={() => setHoveredLink(link.id)}
                className="relative px-4 py-2 text-sm font-medium rounded-full cursor-pointer"
              >
                <span className={`relative z-10 transition-colors ${highlightTarget === link.id ? 'text-white' : 'text-slate-600'}`}>
                  {link.label}
                </span>
                {highlightTarget === link.id && (
                  <motion.div
                    layoutId="highlight-pill"
                    className="absolute inset-0 bg-blue-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </header>

      <div className="md:hidden fixed top-4 left-4 right-4 z-40">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-lg rounded-full shadow-md px-4 py-3">
          <Link to="/" className="flex items-center gap-2" aria-label="Homepage">
            <FiBox className="w-8 h-8 text-blue-600" />
          </Link>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-800 z-10" aria-label="Toggle menu">
            {isMenuOpen ? <FiX size={28}/> : <FiMenu size={28}/>}
          </button>
        </div>
      </div>
      
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} scrollToSection={scrollToSection} links={links} />
    </div>
  );
}