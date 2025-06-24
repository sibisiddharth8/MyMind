import { Link } from 'react-router-dom';
import { FiBox, FiArrowUp } from 'react-icons/fi';
import { usePortfolioData } from '../hooks/usePortfolioData';
import SocialLinks from '../components/ui/SocialLinks';

export default function Footer() {
  const { links } = usePortfolioData();
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-100 border-t border-slate-200">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Left Side: Branding & Copyright */}
          <div className="text-center md:text-left">
            <Link to="/" className="flex items-center justify-center md:justify-start gap-2">
              <FiBox className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-bold text-slate-800">MyMind</span>
            </Link>
            <p className="text-xs text-slate-500 mt-2">
              &copy; {currentYear} Sibi Siddharth S. All Rights Reserved.
            </p>
          </div>

          {/* Right Side: Social and Utility Links */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <SocialLinks links={links} />
            <div className='flex items-center gap-4'>
              <div className="w-px h-6 bg-slate-300 hidden sm:block"></div>
              <Link to="/terms" className="text-sm text-slate-600 hover:text-blue-600 hover:underline py-1">
                Terms & Conditions
              </Link>
              <button onClick={handleScrollToTop} className="cursor-pointer hidden sm:flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 font-semibold transition-colors" title="Back to top">
                <FiArrowUp />
                <span className="hidden sm:block">Back to Top</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}