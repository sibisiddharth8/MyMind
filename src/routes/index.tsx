import { createHashRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import SubPageLayout from '../layouts/SubPageLayout'; // <-- Import the new layout
import HomePage from '../pages/HomePage';
import ProjectsPage from '../pages/ProjectsPage';
import ProjectDetailPage from '../pages/ProjectDetailPage';
import TermsPage from '../pages/TermsPage';

export const router = createHashRouter([
  {
    // Group 1: Pages using the Main Layout (with full navigation)
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
  // Group 2: Pages using the Sub-Page Layout (with a simple "Back" button)
  {
    element: <SubPageLayout />,
    children: [
        {
            path: 'projects',
            element: <ProjectsPage />,
        },
        {
            path: 'projects/:id',
            element: <ProjectDetailPage />,
        },
        {
            path: 'terms',
            element: <TermsPage />,
        },
    ]
  },
]);