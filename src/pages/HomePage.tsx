import AboutSection from '../components/AboutSection';
import SkillsSection from '../components/SkillsSection';
import JourneySection from '../components/JourneySection';
import FeaturedProjectsSection from '../components/FeaturedProjectsSection';
import ContactSection from '../components/ContactSection';
import Loader from '../components/ui/Loader';
// import { usePortfolioData } from '../hooks/usePortfolioData';
// Changed the icon from FiAlertTriangle to FiTool for a maintenance theme
import MaintenanceSection from '../components/maintenance/maintenanceSection';
import { m } from 'framer-motion';

interface AboutData {
  name: string;
  roles: string[];
  description: string;
  image?: string;
  cv?: string;
}
interface LinksData {
  github?: string;
  linkedin?: string;
  instagram?: string;
  portal?: string;
}

export default function HomePage() {
  // const { aboutQuery, linksQuery } = usePortfolioData();

  // if (aboutQuery.isLoading) {
  //   return <Loader />;
  // }

  // if (aboutQuery.isError || !aboutQuery.data?.data) {
  //   return (
  //     <MaintenanceSection/>
  //   );
  // }

  // const about = aboutQuery.data.data as AboutData;
  // const links = linksQuery.data?.data as LinksData | null;

  return (
    <>
      <AboutSection />
      <SkillsSection />
      <FeaturedProjectsSection />
      <JourneySection />
      <ContactSection />
    </>
  );
}