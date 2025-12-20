import { Navigate, Outlet } from 'react-router-dom';
import { usePublicAuth } from '../../context/PublicAuthContext';
import Loader from '../ui/Loader';

export default function ProtectedRoute() {
    const { isAuthenticated, isLoading } = usePublicAuth();

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center"><Loader /></div>;
    }

    // If not logged in, redirect to Home (since login is a modal)
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}