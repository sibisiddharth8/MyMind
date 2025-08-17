import { createHashRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import SubPageLayout from '../layouts/SubPageLayout';
import HomePage from '../pages/HomePage';
import ProjectsPage from '../pages/ProjectsPage';
import ProjectDetailPage from '../pages/ProjectDetailPage';
import TermsPage from '../pages/TermsPage';
import NotFoundPage from '../pages/NotFoundPage';


export const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
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
        {
          path: '*',
          element: <NotFoundPage />,
        },
    ]
  },
]);