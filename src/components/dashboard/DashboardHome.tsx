import { useAuth } from '@/hooks/useAuth';
import { VetDashboard } from './VetDashboard';
import { TutorDashboard } from './TutorDashboard';

export function DashboardHome() {
  const { profile } = useAuth();
  
  if (profile?.role === 'vet') {
    return <VetDashboard />;
  }
  
  return <TutorDashboard />;
}
