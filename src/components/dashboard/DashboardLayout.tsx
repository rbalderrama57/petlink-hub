import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from './Sidebar';

export function DashboardLayout() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = profile?.role || 'tutor';

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar userRole={userRole} />
      <main className="flex-1 min-h-screen overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
