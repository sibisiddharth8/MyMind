import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getTerms } from '../services/termsService';
import Loader from '../components/ui/Loader';
import { FiAlertTriangle } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import SectionHeader from '../components/ui/SectionHeader';
import { Link } from 'react-router-dom';
import ScrollToTop from '../components/ui/ScrollToTop';

// Local Type Definition
interface TermAndCondition {
  id: string;
  title: string;
  content: string;
  imagePath?: string | null;
  order: number;
}

export default function TermsPage() {
  const [activeId, setActiveId] = useState('');
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['terms'],
    queryFn: getTerms,
    staleTime: 1000 * 60 * 5,
  });

  const terms = response?.data || [];
  
  // This effect tracks which section is currently visible to highlight the side navigation
  useEffect(() => {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveId(entry.target.id);
                }
            });
        },
        { rootMargin: "-30% 0px -70% 0px" }
    );

    const elements = terms.map(term => document.getElementById(term.id)).filter(el => el);
    if (elements.length > 0) {
        elements.forEach(el => observer.observe(el!));
    }

    return () => elements.forEach(el => el && observer.unobserve(el));
  }, [terms]);


  const handleScrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader /></div>;
  if (isError) return <div className="text-center p-8 text-red-500">Failed to load terms.</div>;

  return (
    
    <div className="container mx-auto px-6 py-8 md:pb-24">
      <ScrollToTop />

      {/* Header Section */}
      <div className="text-center mb-16">
        <SectionHeader 
          title="Terms & Conditions"
          description="Please read these terms and conditions carefully before using our website."
        />
      </div>

      {/* FIX: The grid layout is now simpler and more robust */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-16">
        
        {/* Left Side - Sticky Navigation */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="font-semibold text-slate-900 mb-4">On this page</h3>
            <ul className="space-y-1">
              {terms.map((term: TermAndCondition) => (
                <li key={term.id}>
                  <button
                    onClick={() => handleScrollTo(term.id)}
                    // Improved styling for the active link
                    className={`block w-full text-left py-1.5 text-sm font-medium transition-all duration-200 border-l-2 ${activeId === term.id ? 'text-blue-600 border-blue-600 pl-4' : 'text-slate-500 border-transparent hover:text-slate-900 hover:border-slate-300 pl-4'}`}
                  >
                    {term.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Right Side - Main Content */}
        {/* FIX: This column now correctly spans 3 columns on large screens */}
        <div className="lg:col-span-3">
          <div className="space-y-12">
            {terms.map((term: TermAndCondition) => (
              <motion.section 
                key={term.id} 
                id={term.id}
                onViewportEnter={() => setActiveId(term.id)}
                viewport={{ margin: "-40% 0px -60% 0px" }}
              >
                <h2 className="text-3xl font-bold text-slate-900 border-b border-slate-200 pb-3 mb-6">{term.title}</h2>
                
                {term.imagePath && (
                    <div className='flex justify-start'>
                        <div className="my-6 p-2 bg-slate-100 rounded-lg border border-slate-200">
                            <img src={term.imagePath} alt={term.title} className="rounded-md w-full max-h-80 object-contain" />
                        </div>
                    </div>
                )}

                {/* The 'prose' classes from Tailwind Typography provide beautiful default styling for your text */}
                <div className="prose prose-lg prose-slate max-w-none leading-relaxed">
                  <ReactMarkdown>{term.content}</ReactMarkdown>
                </div>
              </motion.section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}