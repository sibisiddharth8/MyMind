import AboutSection from '../components/AboutSection';
import SkillsSection from '../components/SkillsSection';
// import ExperienceSection from '../components/ExperienceSection';
// import EducationSection from '../components/EducationSection';
import JourneySection from '../components/JourneySection';
import FeaturedProjectsSection from '../components/FeaturedProjectsSection';
import ContactSection from '../components/ContactSection';
import Loader from '../components/ui/Loader';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { FiAlertTriangle } from 'react-icons/fi';

// Local Type Definitions
interface AboutData { name: string; roles: string[]; description: string; image?: string; cv?: string; }
interface LinksData { github?: string; linkedin?: string; instagram?: string; portal?: string; }

export default function HomePage() {
  const { aboutQuery, linksQuery } = usePortfolioData();

  // Handle the initial loading state for the page's critical data
  if (aboutQuery.isLoading) {
    return <Loader />;
  }

  // Handle the error or empty state if the main 'About' data can't be fetched
  if (aboutQuery.isError || !aboutQuery.data?.data) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
          <FiAlertTriangle className="mx-auto h-12 w-12 text-amber-400" />
          <h2 className="mt-4 text-2xl font-bold text-slate-800">Content Not Found</h2>
          <p className="mt-2 text-slate-500">
              The main content for this page could not be loaded.
              <br />
              Please make sure you have created the **'About' section** in your admin portal.
          </p>
      </div>
    );
  }

  // If we get here, we know the data is loaded and valid
  const about = aboutQuery.data.data as AboutData;
  const links = linksQuery.data?.data as LinksData | null;

  return (
    // The HomePage now only returns the sections it's responsible for.
    // The Header and Footer are handled by MainLayout.tsx.
    <>
      <AboutSection about={about} links={links} />
      
      <SkillsSection />
      <FeaturedProjectsSection />
      <JourneySection />
      <ContactSection />
    </>
  );
}