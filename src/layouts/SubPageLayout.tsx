import { Outlet, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Footer from './Footer';

export default function SubPageLayout() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4">
          <button 
            onClick={() => navigate(-1)} // This programmatically goes to the previous page
            className="font-semibold text-slate-600 hover:text-blue-600 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <FiArrowLeft />
            Back
          </button>
        </div>
      </header>
      <main>
        {/* The child page (e.g., ProjectsPage) will be rendered here */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}