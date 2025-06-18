import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading Session...</div>;
  }

  return isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;