import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSave } from '@/contexts/SaveContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { currentSave, loading: saveLoading } = useSave();
  const location = useLocation();

  // Pages that don't require an active save
  const publicPages = ['/careers', '/new-game', '/auth'];
  const isPublicPage = publicPages.some(path => location.pathname.startsWith(path));

  if (authLoading || saveLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is authenticated but no active save and trying to access game pages, redirect to career selection
  if (!currentSave && !isPublicPage) {
    return <Navigate to="/careers" replace />;
  }

  return <>{children}</>;
}
