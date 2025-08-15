import { createHashRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import SubPageLayout from '../layouts/SubPageLayout';
import HomePage from '../pages/HomePage';
import ProjectsPage from '../pages/ProjectsPage';
import ProjectDetailPage from '../pages/ProjectDetailPage';
import TermsPage from '../pages/TermsPage';
import NotFoundPage from '../pages/NotFoundPage';

import PrivacyPolicy from '../temp/PrivacyPolicy';
import CancellationRefundPolicy from '../temp/CancellationRefundPolicy';
import ContactUs from '../temp/ContactUs';
import ShippingPolicy from '../temp/ShippingPolicy';

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
            path: 'privacy',
            element: <PrivacyPolicy />,
        },
        {
            path: 'cancellation',
            element: <CancellationRefundPolicy />,
        },
        {
            path: 'contact',
            element: <ContactUs />,
        },
        {
            path: 'shipping',
            element: <ShippingPolicy />,
        },

        
        {
          path: '*',
          element: <NotFoundPage />,
        },
    ]
  },
]);