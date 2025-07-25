import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SocialLinks from './ui/SocialLinks';
import { FiDownload, FiMail } from 'react-icons/fi';
import ActionButton from './ui/ActionButton'; // <-- Use our new component

// --- Local Type Definitions ---
interface AboutData { name: string; roles: string[]; description: string; image?: string; cv?: string; }
interface LinksData { github?: string; linkedin?: string; instagram?: string; portal?: string; }
interface AboutSectionProps { about?: AboutData | null; links?: LinksData | null; }

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const headerOffset = 90; 
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  }
};

export default function AboutSection({ about, links }: AboutSectionProps) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [currentRole, setCurrentRole] = useState('');

  // Effect for the typing animation
  useEffect(() => {
    if (!about?.roles || about.roles.length === 0) return;
    
    let currentText = '';
    let isDeleting = false;
    let i = 0;
    let localRoleIndex = roleIndex;

    const type = () => {
      const fullText = about.roles[localRoleIndex];
      if (isDeleting) {
        currentText = fullText.substring(0, currentText.length - 1);
      } else {
        currentText = fullText.substring(0, currentText.length + 1);
      }

      setCurrentRole(currentText);

      let typeSpeed = isDeleting ? 100 : 150;

      if (!isDeleting && currentText === fullText) {
        isDeleting = true;
        typeSpeed = 2000; // Pause at end of word
      } else if (isDeleting && currentText === '') {
        isDeleting = false;
        localRoleIndex = (localRoleIndex + 1) % about.roles.length;
        typeSpeed = 500;
      }
      
      setTimeout(type, typeSpeed);
    };

    const timer = setTimeout(type, 500);
    return () => clearTimeout(timer);
  }, [about?.roles]);

  if (!about) {
    console.error("[AboutSection] 'about' prop is missing or falsy. Rendering nothing.");
    return null;
  }


  return (
    <section id="about" className="min-h-screen flex items-center pb-16 md:pb-24 lg:px-16 bg-slate-100/70">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Text Content Column - order-2 on mobile */}
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }} className="order-2 md:order-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
              {about.name}
            </h1>

            {/* Animated Roles Section */}
            <p className="mt-2 text-xl md:text-2xl font-semibold text-blue-600 h-8">
              {currentRole}
              <span className="animate-ping">|</span>
            </p>
            
            <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl whitespace-pre-wrap">
              {about.description}
            </p>

            <div className="mt-8">
              <SocialLinks links={links} />
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <ActionButton href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}><FiMail className="mr-2"/> Get In Touch</ActionButton>
              {about.cv && <ActionButton href={about.cv} variant="outline" isExternal={true}><FiDownload className="mr-2"/> Resume</ActionButton>}
            </div>
          </motion.div>

          {/* Image Column - order-1 on mobile */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0, 0.71, 0.2, 1.01] }} className="w-full max-w-sm mx-auto order-1 md:order-2">
            <div className="relative p-2 rounded-full border-2 border-slate-200">
              {about.image ? (
                <img src={about.image} alt={about.name} className="w-full rounded-full aspect-square object-cover" />
              ) : (
                <div className="bg-slate-200 rounded-full aspect-square"></div>
              )}
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}