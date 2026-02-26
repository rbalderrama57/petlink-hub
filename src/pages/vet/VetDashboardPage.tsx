import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, PawPrint, Pill, Ticket, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface KPIs {
  totalClients: number;
  totalPets: number;
  totalPrescriptions: number;
  pendingTickets: number;
}

interface RecentActivity {
  id: string;
  type: 'consultation' | 'prescription' | 'vaccine';
  description: string;
  date: string;
  petName?: string;
}

export function VetDashboardPage() {
  const { profile } = useAuth();
  const [kpis, setKpis] = useState<KPIs>({ totalClients: 0, totalPets: 0, totalPrescriptions: 0, pendingTickets: 0 });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    loadData();
  }, [profile]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profilesRes, petsRes, prescriptionsRes, ticketsRes, consultationsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'tutor'),
        supabase.from('pets').select('id', { count: 'exact' }),
        supabase.from('prescriptions').select('id', { count: 'exact' }),
        supabase.from('golden_tickets').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('consultations').select('id, chief_complaint, consultation_date, pets(name)').order('consultation_date', { ascending: false }).limit(10),
      ]);

      setKpis({
        totalClients: profilesRes.count || 0,
        totalPets: petsRes.count || 0,
        totalPrescriptions: prescriptionsRes.count || 0,
        pendingTickets: ticketsRes.count || 0,
      });

      const recent: RecentActivity[] = (consultationsRes.data || []).map((c: any) => ({
        id: c.id,
        type: 'consultation' as const,
        description: c.chief_complaint,
        date: c.consultation_date,
        petName: c.pets?.name,
      }));
      setActivities(recent);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    { label: 'Clientes', value: kpis.totalClients, icon: Users, color: 'from-primary/20 to-primary/5 text-primary' },
    { label: 'Pets Cadastrados', value: kpis.totalPets, icon: PawPrint, color: 'from-accent/20 to-accent/5 text-accent' },
    { label: 'Receitas Emitidas', value: kpis.totalPrescriptions, icon: Pill, color: 'from-info/20 to-info/5 text-info' },
    { label: 'Golden Tickets', value: kpis.pendingTickets, icon: Ticket, color: 'from-warning/20 to-warning/5 text-warning' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">
          Olá, Dr(a). {profile?.full_name?.split(' ')[0] || 'Veterinário'} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {profile?.clinic_name ? `${profile.clinic_name} · ` : ''}Painel de controle
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-3`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{kpi.label}</p>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Golden Tickets Alert */}
      {!loading && kpis.pendingTickets > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-5 border-warning/30 bg-warning/5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {kpis.pendingTickets} Golden Ticket{kpis.pendingTickets > 1 ? 's' : ''} disponíve{kpis.pendingTickets > 1 ? 'is' : 'l'}
              </p>
              <p className="text-sm text-muted-foreground">Convites aguardando resgate pelos tutores</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">Atividade Recente</h2>
        </div>
        <div className="glass-card rounded-2xl divide-y divide-border">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))
          ) : activities.length === 0 ? (
            <div className="p-8 text-center">
              <TrendingUp className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma atividade recente</p>
            </div>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Pill className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{act.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {act.petName && <span className="font-medium">{act.petName} · </span>}
                    {format(new Date(act.date), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">Consulta</Badge>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
