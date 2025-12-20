import { createHashRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import SubPageLayout from '../layouts/SubPageLayout';
import HomePage from '../pages/HomePage';
import ProjectsPage from '../pages/ProjectsPage';
import CertificatesPage from '../pages/CertificatesPage';
import CertificateDetailPage from '../pages/CertificateDetailPage';
import ProjectDetailPage from '../pages/ProjectDetailPage';
import TermsPage from '../pages/TermsPage';
import NotFoundPage from '../pages/NotFoundPage';
import Nyra from '../pages/Nyra';

import PublicBlogListPage from '../pages/PublicBlogListPage';
import PublicBlogDetailsPage from '../pages/PublicBlogDetailsPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';

import { protectedRoutes } from './protectedRoutes';

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
            path: 'certificates',
            element: <CertificatesPage />,
        },
        {
            path: 'certificates/:id',
            element: <CertificateDetailPage />,
        },
        {
            path: 'terms',
            element: <TermsPage />,
        },
        {
            path: 'blogs',
            element: <PublicBlogListPage />,
        },
        {
            path: 'blogs/:slug', 
            element: <PublicBlogDetailsPage />,
        },
        {
            path: 'nyra',
            element: <Nyra />,
        },
        {
            path: 'privacy-policy',
            element: <PrivacyPolicyPage />,
        },

        ...protectedRoutes,
        {
          path: '*',
          element: <NotFoundPage />,
        },
    ]
  },
]);