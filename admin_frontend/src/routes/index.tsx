import { createBrowserRouter } from 'react-router-dom';

// Layouts & Pages
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';

import AboutPage from '../pages/AboutPage';
import LinksPage from '../pages/LinksPage';
import ExperiencePage from '../pages/ExperiencePage';
import EducationPage from '../pages/EducationPage';
import SkillsPage from '../pages/SkillsPage';
import MembersPage from '../pages/MembersPage';
import ProjectsPage from '../pages/ProjectsPage';
import ContactPage from '../pages/ContactPage';
import TermsPage from '../pages/TermsPage';

// Placeholder for feature pages
const PlaceholderPage = ({ title }: { title: string }) => <h1 className="text-4xl font-bold">{title}</h1>;

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />, // This is the gatekeeper
    children: [
      // All protected routes are nested here and will render inside MainLayout's <Outlet>
      { index: true, element: <DashboardPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'links', element:  <LinksPage /> },
      { path: 'experience', element:  <ExperiencePage /> },
      { path: 'education', element:  <EducationPage /> },
      { path: 'skills', element:  <SkillsPage /> },
      { path: 'projects', element:   <ProjectsPage /> },
      { path: 'members', element:  <MembersPage /> },
      { path: 'contact', element:  <ContactPage /> },
      { path: 'terms', element: <TermsPage /> },
    ],
  },
]);