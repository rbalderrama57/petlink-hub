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
  Plus,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { mockAlerts } from '@/lib/mockData';

const myPets = [
  { name: 'Thor', species: 'Cão', breed: 'Golden Retriever', avatar: '🐕', nextVaccine: '15 Jan', vaccineStatus: 'ok' },
  { name: 'Luna', species: 'Gato', breed: 'Siamês', avatar: '🐈', nextVaccine: '22 Fev', vaccineStatus: 'soon' },
];

const upcomingVaccines = [
  { pet: 'Thor', vaccine: 'V10 Polivalente', date: '15 Jan 2025', type: 'optional' as const, daysLeft: 28 },
  { pet: 'Luna', vaccine: 'Antirrábica', date: '22 Fev 2025', type: 'government' as const, daysLeft: 66 },
  { pet: 'Thor', vaccine: 'Antirrábica', date: '10 Mar 2025', type: 'government' as const, daysLeft: 82 },
];

const recentDocuments = [
  { title: 'Exame de Sangue - Thor', date: '10 Dez 2024', type: 'Hemograma' },
  { title: 'Raio-X Tórax - Luna', date: '05 Dez 2024', type: 'Imagem' },
];

export function TutorDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header with Tutor Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Heart className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-accent font-medium">Painel do Tutor</p>
            <h1 className="text-3xl font-bold text-foreground">
              Olá, {profile?.full_name?.split(' ')[0] || 'Tutor'} 💜
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground">
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
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-accent" />
            Meus Pets
          </h2>
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
                className="glass-card p-5 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-accent"
                onClick={() => navigate('/dashboard/pets')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-4xl shadow-inner">
                    {pet.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-lg">{pet.name}</p>
                    <p className="text-sm text-muted-foreground">{pet.breed}</p>
                    <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                      pet.vaccineStatus === 'ok' ? 'text-success' : 'text-warning'
                    }`}>
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
              className="border-2 border-dashed border-accent/30 p-5 cursor-pointer hover:border-accent hover:bg-accent/5 transition-all duration-300 h-full min-h-[120px] flex items-center justify-center"
              onClick={() => navigate('/dashboard/pets')}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 mx-auto flex items-center justify-center mb-2">
                  <Plus className="w-6 h-6 text-accent" />
                </div>
                <p className="text-sm font-medium text-accent">Adicionar Pet</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Vaccination Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-accent" />
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
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`p-4 rounded-xl ${vaccine.type === 'government' ? 'vaccine-gov' : 'vaccine-optional'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${vaccine.type === 'government' ? 'bg-warning/20' : 'bg-accent/20'}`}>
                        {vaccine.type === 'government' ? (
                          <Shield className={`w-4 h-4 text-warning`} />
                        ) : (
                          <Syringe className={`w-4 h-4 text-accent`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{vaccine.vaccine}</p>
                        <p className="text-sm text-muted-foreground">{vaccine.pet}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-foreground font-medium">
                        <Calendar className="w-4 h-4" />
                        {vaccine.date}
                      </div>
                      <p className={`text-xs mt-1 ${vaccine.daysLeft <= 30 ? 'text-warning font-medium' : 'text-muted-foreground'}`}>
                        {vaccine.daysLeft} dias restantes
                      </p>
                    </div>
                  </div>
                  {vaccine.type === 'government' && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-warning bg-warning/10 px-2 py-1 rounded-lg w-fit">
                      <Shield className="w-3 h-3" />
                      Obrigatória por lei
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* Alerts */}
          <Card className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-destructive" />
                <h2 className="text-lg font-semibold text-foreground">Alertas</h2>
              </div>
              <span className="px-2 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-medium">
                {mockAlerts.length} novos
              </span>
            </div>
            
            <div className="space-y-2">
              {mockAlerts.slice(0, 2).map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-3 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors"
                  onClick={() => navigate('/dashboard/alerts')}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      alert.alert_type === 'danger' ? 'text-destructive' :
                      alert.alert_type === 'warning' ? 'text-warning' : 'text-info'
                    }`} />
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
              className="w-full mt-3"
              onClick={() => navigate('/dashboard/alerts')}
            >
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Card>

          {/* Digital Vault */}
          <Card className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">Cofre Digital</h2>
              </div>
            </div>
            
            <div className="space-y-2">
              {recentDocuments.map((doc, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => navigate('/dashboard/documents')}
                >
                  <p className="font-medium text-foreground text-sm truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{doc.date}</p>
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={() => navigate('/dashboard/documents')}
            >
              <Plus className="w-4 h-4 mr-1" />
              Enviar Documento
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
