import AboutSection from '../components/AboutSection';
import SkillsSection from '../components/SkillsSection';
import JourneySection from '../components/JourneySection';
import FeaturedProjectsSection from '../components/FeaturedProjectsSection';
import ContactSection from '../components/ContactSection';
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