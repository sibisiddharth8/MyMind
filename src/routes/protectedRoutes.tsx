import type { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import UserSettingsPage from '../pages/UserSettingsPage';
import MyCommentsPage from '../pages/MyCommentsPage';
import MyLikesPage from '../pages/MyLikesPage';

export const protectedRoutes: RouteObject[] = [
    {
        element: <ProtectedRoute />, // 👈 The Guard
        children: [
            {
                path: 'user-settings',
                element: <UserSettingsPage />
            },
            {
                path: 'my-comments',
                element: <MyCommentsPage />
            },
            {
                path: 'my-likes',
                element: <MyLikesPage />
            },
            // You can add more user-specific pages here later
            // e.g. path: 'orders', element: <OrdersPage />
        ]
    }
];