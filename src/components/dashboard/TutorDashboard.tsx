import { motion } from 'framer-motion';
import { 
  PawPrint, 
  Syringe, 
  FolderOpen, 
  Bell,
  Heart,
  Calendar,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { mockAlerts } from '@/lib/mockData';

const myPets = [
  { name: 'Thor', species: 'Cão', breed: 'Golden Retriever', avatar: '🐕', nextVaccine: '15 Jan' },
  { name: 'Luna', species: 'Gato', breed: 'Siamês', avatar: '🐈', nextVaccine: '22 Fev' },
];

const upcomingVaccines = [
  { pet: 'Thor', vaccine: 'V10 Polivalente', date: '15 Jan 2025', type: 'optional' as const, daysLeft: 28 },
  { pet: 'Luna', vaccine: 'Antirrábica', date: '22 Fev 2025', type: 'government' as const, daysLeft: 66 },
  { pet: 'Thor', vaccine: 'Antirrábica', date: '10 Mar 2025', type: 'government' as const, daysLeft: 82 },
];

const recentDocuments = [
  { title: 'Exame de Sangue - Thor', date: '10 Dez 2024', type: 'Hemograma' },
  { title: 'Raio-X Tórax - Luna', date: '05 Dez 2024', type: 'Imagem' },
  { title: 'Ultrassom - Thor', date: '28 Nov 2024', type: 'Imagem' },
];

export function TutorDashboard() {
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
          Olá, {profile?.full_name?.split(' ')[0] || 'Tutor'} 💜
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe a saúde dos seus pets em um só lugar
        </p>
      </motion.div>

      {/* Pets Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Meus Pets</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/pets')}>
            Ver todos
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myPets.map((pet, index) => (
            <motion.div
              key={pet.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card 
                className="glass-card p-5 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                onClick={() => navigate('/dashboard/pets')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl">
                    {pet.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-lg">{pet.name}</p>
                    <p className="text-sm text-muted-foreground">{pet.breed}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                      <Syringe className="w-3 h-3" />
                      Próxima vacina: {pet.nextVaccine}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          
          {/* Add Pet Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card 
              className="border-2 border-dashed border-border p-5 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 h-full min-h-[100px] flex items-center justify-center"
              onClick={() => navigate('/dashboard/pets')}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-secondary mx-auto flex items-center justify-center mb-2">
                  <PawPrint className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Adicionar Pet</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Vaccines */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2"
        >
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Carteirinha de Vacinação</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/vaccines')}>
                Ver tudo
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {upcomingVaccines.map((vaccine, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`p-4 rounded-xl ${vaccine.type === 'government' ? 'vaccine-gov' : 'vaccine-optional'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${vaccine.type === 'government' ? 'bg-warning/20' : 'bg-primary/20'}`}>
                        <Syringe className={`w-4 h-4 ${vaccine.type === 'government' ? 'text-warning' : 'text-primary'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{vaccine.vaccine}</p>
                        <p className="text-sm text-muted-foreground">{vaccine.pet}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-foreground">
                        <Calendar className="w-4 h-4" />
                        {vaccine.date}
                      </div>
                      <p className={`text-xs mt-1 ${vaccine.daysLeft <= 30 ? 'text-warning' : 'text-muted-foreground'}`}>
                        {vaccine.daysLeft} dias restantes
                      </p>
                    </div>
                  </div>
                  {vaccine.type === 'government' && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-warning">
                      <AlertTriangle className="w-3 h-3" />
                      Vacina obrigatória (Governo)
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">Alertas</h2>
              </div>
              <span className="alert-badge alert-badge-destructive">
                {mockAlerts.length} novos
              </span>
            </div>
            
            <div className="space-y-3">
              {mockAlerts.slice(0, 3).map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-3 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors"
                  onClick={() => navigate('/dashboard/alerts')}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg ${
                      alert.alert_type === 'danger' ? 'bg-destructive/20 text-destructive' :
                      alert.alert_type === 'warning' ? 'bg-warning/20 text-warning' :
                      'bg-info/20 text-info'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{alert.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{alert.location}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-4"
              onClick={() => navigate('/dashboard/alerts')}
            >
              Ver todos os alertas
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* Recent Documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Cofre Digital</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/documents')}>
              Ver tudo
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentDocuments.map((doc, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => navigate('/dashboard/documents')}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.type}</p>
                    <p className="text-xs text-muted-foreground mt-1">{doc.date}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
