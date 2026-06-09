import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLoader from './PageLoader';

// ProtectedRoute: Blocks guests from viewing the Dashboard
export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicOnlyRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
};