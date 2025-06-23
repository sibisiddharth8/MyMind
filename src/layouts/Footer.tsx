import { Link } from 'react-router-dom';
import { FiBox } from 'react-icons/fi';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { usePortfolioData } from '../hooks/usePortfolioData';

// This helper function handles the smooth scrolling for anchor links
const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

export default function Footer() {
  const { links } = usePortfolioData();
  const currentYear = new Date().getFullYear();

  // Navigation links matching the sections on the homepage
  const navLinks = [
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'journey', label: 'Journey' },
    { id: 'projects', label: 'Projects' },
  ];

  return (
    <footer className="bg-slate-50 text-slate-600 border-t border-slate-200">
      <div className="container mx-auto px-6 pt-16 pb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Column 1: Branding */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <FiBox className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-800">MyMind</span>
            </Link>
            <p className="mt-4 text-sm text-slate-500 max-w-sm">
              A personal portfolio and content hub by Sibi Siddharth. Designed to showcase projects, skills, and professional experience.
            </p>
          </div>

          {/* Column 2: Sitemap */}
          <div>
            <h3 className="font-semibold text-slate-900 tracking-wider">Navigate</h3>
            <ul className="mt-4 space-y-2">
              {navLinks.map(link => (
                <li key={link.id}>
                    <a href={`#${link.id}`} onClick={(e) => { e.preventDefault(); scrollToSection(link.id); }} className="text-slate-500 hover:text-blue-600 transition-colors">
                        {link.label}
                    </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Column 3: Connect */}
          <div>
            <h3 className="font-semibold text-slate-900 tracking-wider">Connect</h3>
            <div className="mt-4 flex items-center gap-5">
                {links?.github && <a href={links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-slate-500 hover:text-slate-900 transition-colors"><FaGithub size={22}/></a>}
                {links?.linkedin && <a href={links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-slate-500 hover:text-blue-700 transition-colors"><FaLinkedin size={22}/></a>}
                {links?.instagram && <a href={links.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-500 hover:text-pink-600 transition-colors"><FaInstagram size={22}/></a>}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-slate-50">
          <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center text-sm">
              <p className="text-slate-500">&copy; {currentYear} Sibi Siddharth S. All Rights Reserved.</p>
              <Link to="/terms" className="text-slate-500 hover:text-blue-600 hover:underline mt-2 sm:mt-0">
                Terms & Conditions
              </Link>
          </div>
      </div>
    </footer>
  );
}