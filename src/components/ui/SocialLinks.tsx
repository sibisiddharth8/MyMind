import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { FiGlobe } from 'react-icons/fi';

interface Links {
  github?: string;
  linkedin?: string;
  instagram?: string;
  portal?: string;
}

interface SocialLinksProps {
  links?: Links | null;
}

export default function SocialLinks({ links }: SocialLinksProps) {
  const linkStyle = "text-slate-400 hover:text-gray-700 transition-colors duration-300";
  
  return (
    <div className="flex items-center gap-6">
      {links?.github && <a href={links.github} target="_blank" rel="noopener noreferrer" className={linkStyle}><FaGithub size={24} /></a>}
      {links?.linkedin && <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className={linkStyle}><FaLinkedin size={24} /></a>}
      {links?.instagram && <a href={links.instagram} target="_blank" rel="noopener noreferrer" className={linkStyle}><FaInstagram size={24} /></a>}
      {links?.portal && <a href={links.portal} target="_blank" rel="noopener noreferrer" className={linkStyle}><FiGlobe size={24} /></a>}
    </div>
  );
}