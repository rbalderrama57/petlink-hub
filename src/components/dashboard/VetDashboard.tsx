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
  Activity,
  Syringe,
  ClipboardList,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const stats = [
  { label: 'Pacientes Ativos', value: '248', change: '+12%', icon: Users, color: 'bg-primary/10 text-primary' },
  { label: 'Consultas Hoje', value: '18', change: '+5', icon: CalendarCheck, color: 'bg-success/10 text-success' },
  { label: 'Taxa de Retorno', value: '89%', change: '+3%', icon: TrendingUp, color: 'bg-info/10 text-info' },
  { label: 'Tempo Médio', value: '24min', change: '-2min', icon: Clock, color: 'bg-warning/10 text-warning' },
];

const recentPatients = [
  { name: 'Thor', species: 'Cão', breed: 'Golden Retriever', tutor: 'Maria Silva', time: '10:30', status: 'Consulta' },
  { name: 'Luna', species: 'Gato', breed: 'Siamês', tutor: 'João Santos', time: '11:15', status: 'Retorno' },
  { name: 'Max', species: 'Cão', breed: 'Labrador', tutor: 'Ana Oliveira', time: '14:00', status: 'Vacina' },
  { name: 'Mia', species: 'Gato', breed: 'Persa', tutor: 'Carlos Lima', time: '15:30', status: 'Exame' },
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
      {/* Header with Vet Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-primary font-medium">Painel Veterinário</p>
            <h1 className="text-3xl font-bold text-foreground">
              Olá, Dr. {profile?.full_name?.split(' ')[0] || 'Veterinário'} 👋
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground">
          Aqui está o resumo da sua clínica hoje
        </p>
      </motion.div>

      {/* Quick Actions - VET SPECIFIC */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard/consultation')}
          className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
        >
          <Plus className="w-6 h-6 mb-2" />
          <span className="font-semibold">Nova Consulta</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard/search')}
          className="p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors"
        >
          <Search className="w-6 h-6 mb-2 text-primary" />
          <span className="font-semibold text-foreground">Buscar ID</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard/import')}
          className="p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors"
        >
          <FileSpreadsheet className="w-6 h-6 mb-2 text-primary" />
          <span className="font-semibold text-foreground">Importar CSV</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard/patients')}
          className="p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors"
        >
          <Users className="w-6 h-6 mb-2 text-primary" />
          <span className="font-semibold text-foreground">Pacientes</span>
        </motion.button>
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
            <Card className="glass-card p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  <p className="text-sm text-success mt-1 font-medium">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Agenda */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Agenda de Hoje</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/schedule')}>
                Ver tudo
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentPatients.map((patient, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
                  onClick={() => navigate('/dashboard/consultation')}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl">
                    {patient.species === 'Cão' ? '🐕' : '🐈'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{patient.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        patient.status === 'Consulta' ? 'bg-primary/20 text-primary' :
                        patient.status === 'Retorno' ? 'bg-info/20 text-info' :
                        patient.status === 'Vacina' ? 'bg-success/20 text-success' :
                        'bg-warning/20 text-warning'
                      }`}>
                        {patient.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {patient.breed} • {patient.tutor}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-foreground">{patient.time}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {/* Consulta Rápida CTA */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyek0zNiAyNnYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            
            <div className="relative z-10 p-6">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center mb-4">
                <Stethoscope className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-primary-foreground mb-1">
                Consulta Rápida
              </h3>
              <p className="text-primary-foreground/80 text-sm mb-4">
                Registre em menos de 30 segundos
              </p>
              <Button
                onClick={() => navigate('/dashboard/consultation')}
                className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Iniciar
              </Button>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="glass-card p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Ações Rápidas
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/dashboard/search')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
              >
                <Search className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">Buscar por Microchip/RGA</span>
              </button>
              <button 
                onClick={() => navigate('/dashboard/consultation')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
              >
                <Syringe className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">Registrar Vacina</span>
              </button>
              <button 
                onClick={() => navigate('/dashboard/import')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
              >
                <UserPlus className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">Importar Pacientes</span>
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
