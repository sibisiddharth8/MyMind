import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { FiBox, FiMenu, FiX } from 'react-icons/fi';
import MobileMenu from '../components/ui/MobileMenu';
import { usePortfolioData } from '../hooks/usePortfolioData';
import ActionButton from '../components/ui/ActionButton';

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
  const controls = useAnimation();
  const { links } = usePortfolioData();
  const lastYPos = useRef(0);

  const handleScroll = useCallback(() => {
      const yPos = window.scrollY;
      const isScrollingUp = yPos < lastYPos.current;
      setIsScrolled(yPos > 10);
      if (window.innerWidth < 768) {
        if(yPos > 100 && !isScrollingUp) {
            controls.start("hidden");
        } else {
            controls.start("visible");
        }
      } else {
        controls.start("visible");
      }
      lastYPos.current = yPos;
  }, [controls]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // --- THIS IS THE FIX ---
  // This effect adds/removes a style to the body to prevent background scrolling when the menu is open.
  useEffect(() => {
    if (isMenuOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
    // Cleanup function to restore scrolling when the component unmounts
    return () => {
        document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]); // This effect runs every time 'isMenuOpen' changes


  const navLinks = [
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'journey', label: 'Journey' },
  ];

  return (
    <>
      <motion.header
          variants={{ visible: { y: 0 }, hidden: { y: "-110%" } }}
          animate={controls}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          className={`fixed top-0 left-0 right-0 z-40 transition-shadow duration-300  ${isScrolled ? 'bg-white/80 shadow-md backdrop-blur-lg' : 'bg-slate-100/70'}`}
      >
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2" aria-label="Homepage">
            <FiBox className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-800">MyMind</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <button key={link.id} onClick={() => scrollToSection(link.id)} className="cursor-pointer font-semibold text-slate-600 hover:text-blue-600 transition-colors">{link.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
                <ActionButton href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>
                    Contact Me
                </ActionButton>
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-800 z-50" aria-label="Toggle menu">
                {isMenuOpen ? <FiX size={28}/> : <FiMenu size={28}/>}
            </button>
          </div>
        </nav>
      </motion.header>
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} scrollToSection={scrollToSection} links={links} />
    </>
  );
}