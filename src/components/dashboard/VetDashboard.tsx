import { motion } from 'framer-motion';
import { 
  Users, 
  CalendarCheck, 
  TrendingUp, 
  Clock,
  Stethoscope,
  Search,
  Plus,
  ArrowRight,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const stats = [
  { label: 'Pacientes Ativos', value: '248', change: '+12%', icon: Users, color: 'text-primary' },
  { label: 'Consultas Hoje', value: '18', change: '+5', icon: CalendarCheck, color: 'text-success' },
  { label: 'Taxa de Retorno', value: '89%', change: '+3%', icon: TrendingUp, color: 'text-info' },
  { label: 'Tempo Médio', value: '24min', change: '-2min', icon: Clock, color: 'text-warning' },
];

const recentPatients = [
  { name: 'Thor', species: 'Cão', breed: 'Golden Retriever', tutor: 'Maria Silva', time: '10:30' },
  { name: 'Luna', species: 'Gato', breed: 'Siamês', tutor: 'João Santos', time: '11:15' },
  { name: 'Max', species: 'Cão', breed: 'Labrador', tutor: 'Ana Oliveira', time: '14:00' },
  { name: 'Mia', species: 'Gato', breed: 'Persa', tutor: 'Carlos Lima', time: '15:30' },
];

const quickActions = [
  { label: 'Nova Consulta', icon: Stethoscope, path: '/dashboard/consultation', variant: 'primary' as const },
  { label: 'Buscar ID', icon: Search, path: '/dashboard/search', variant: 'secondary' as const },
  { label: 'Importar CSV', icon: FileSpreadsheet, path: '/dashboard/import', variant: 'secondary' as const },
];

export function VetDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground">
          Olá, Dr. {profile?.full_name?.split(' ')[0] || 'Veterinário'} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Aqui está o resumo da sua clínica hoje
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 mb-8"
      >
        {quickActions.map((action) => (
          <Button
            key={action.label}
            onClick={() => navigate(action.path)}
            className={action.variant === 'primary' ? 'btn-primary-gradient' : ''}
            variant={action.variant === 'primary' ? 'default' : 'outline'}
            size="lg"
          >
            <action.icon className="w-5 h-5 mr-2" />
            {action.label}
          </Button>
        ))}
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="stat-card glass-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  <p className="text-sm text-success mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-xl bg-secondary ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Agenda de Hoje</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/schedule')}>
                Ver tudo
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {recentPatients.map((patient, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl">
                    {patient.species === 'Cão' ? '🐕' : '🐈'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{patient.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {patient.breed} • {patient.tutor}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{patient.time}</p>
                    <p className="text-xs text-muted-foreground">Consulta</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Consultation CTA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="relative overflow-hidden h-full min-h-[300px]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyek0zNiAyNnYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            
            <div className="relative z-10 p-8 flex flex-col h-full justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mb-6">
                  <Stethoscope className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-primary-foreground mb-2">
                  Consulta Rápida
                </h3>
                <p className="text-primary-foreground/80">
                  Registre uma nova consulta em menos de 30 segundos com nosso prontuário otimizado.
                </p>
              </div>
              
              <Button
                onClick={() => navigate('/dashboard/consultation')}
                size="lg"
                className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 mt-6"
              >
                <Plus className="w-5 h-5 mr-2" />
                Iniciar Consulta
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
