import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { accessToken, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!accessToken) return <Navigate to="/login" replace />;

  return <>{children}</>;
}