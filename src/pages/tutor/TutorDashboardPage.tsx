import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PawPrint, Syringe, Stethoscope, FolderOpen, ArrowRight, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface PetSummary {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  avatar_url: string | null;
}

interface VaccineSummary {
  pet_name: string;
  vaccine_name: string;
  next_dose_date: string | null;
}

interface ConsultationSummary {
  pet_name: string;
  chief_complaint: string;
  consultation_date: string;
}

export function TutorDashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState<PetSummary[]>([]);
  const [nextVaccine, setNextVaccine] = useState<VaccineSummary | null>(null);
  const [lastConsultation, setLastConsultation] = useState<ConsultationSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    loadData();
  }, [profile]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch pets
      const { data: petsData } = await supabase
        .from('pets')
        .select('id, name, species, breed, avatar_url')
        .eq('tutor_id', profile!.id)
        .order('created_at', { ascending: false });

      const petsList = petsData || [];
      setPets(petsList);

      if (petsList.length > 0) {
        const petIds = petsList.map(p => p.id);

        // Fetch next vaccine
        const { data: vaccineData } = await supabase
          .from('vaccines')
          .select('name, next_dose_date, pet_id')
          .in('pet_id', petIds)
          .not('next_dose_date', 'is', null)
          .gte('next_dose_date', new Date().toISOString().split('T')[0])
          .order('next_dose_date', { ascending: true })
          .limit(1);

        if (vaccineData && vaccineData.length > 0) {
          const pet = petsList.find(p => p.id === vaccineData[0].pet_id);
          setNextVaccine({
            pet_name: pet?.name || '',
            vaccine_name: vaccineData[0].name,
            next_dose_date: vaccineData[0].next_dose_date,
          });
        }

        // Fetch last consultation
        const { data: consultData } = await supabase
          .from('consultations')
          .select('chief_complaint, consultation_date, pet_id')
          .in('pet_id', petIds)
          .order('consultation_date', { ascending: false })
          .limit(1);

        if (consultData && consultData.length > 0) {
          const pet = petsList.find(p => p.id === consultData[0].pet_id);
          setLastConsultation({
            pet_name: pet?.name || '',
            chief_complaint: consultData[0].chief_complaint,
            consultation_date: consultData[0].consultation_date,
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const speciesEmoji: Record<string, string> = {
    dog: '🐕',
    cat: '🐈',
    bird: '🐦',
    other: '🐾',
  };

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <Skeleton className="h-8 w-40" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-sm text-accent font-medium">Painel do Tutor</p>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Olá, {profile?.full_name?.split(' ')[0] || 'Tutor'} 💜
        </h1>
        <p className="text-muted-foreground mt-1">Acompanhe a saúde dos seus pets em um só lugar.</p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="grid sm:grid-cols-3 gap-4 mb-10">
        <motion.div variants={fadeUp}>
          <Card className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-accent/10"><PawPrint className="w-5 h-5 text-accent" /></div>
              <span className="text-sm text-muted-foreground">Meus Pets</span>
            </div>
            <p className="text-3xl font-display font-bold text-foreground">{pets.length}</p>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-warning/10"><Syringe className="w-5 h-5 text-warning" /></div>
              <span className="text-sm text-muted-foreground">Próxima Vacina</span>
            </div>
            {nextVaccine ? (
              <div>
                <p className="text-sm font-semibold text-foreground">{nextVaccine.vaccine_name}</p>
                <p className="text-xs text-muted-foreground">{nextVaccine.pet_name} • {new Date(nextVaccine.next_dose_date!).toLocaleDateString('pt-BR')}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma pendente</p>
            )}
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/10"><Stethoscope className="w-5 h-5 text-primary" /></div>
              <span className="text-sm text-muted-foreground">Última Consulta</span>
            </div>
            {lastConsultation ? (
              <div>
                <p className="text-sm font-semibold text-foreground">{lastConsultation.chief_complaint}</p>
                <p className="text-xs text-muted-foreground">{lastConsultation.pet_name} • {new Date(lastConsultation.consultation_date).toLocaleDateString('pt-BR')}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma registrada</p>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* Pets List */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <PawPrint className="w-5 h-5 text-accent" />
          Meus Pets
        </h2>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/tutor/pets')}>
          Ver todos <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {pets.length === 0 ? (
        <Card className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 mx-auto flex items-center justify-center mb-4">
            <PawPrint className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-lg font-display font-bold text-foreground mb-2">Nenhum pet cadastrado</h3>
          <p className="text-muted-foreground mb-6">Cadastre seu primeiro pet para começar!</p>
          <Button onClick={() => navigate('/app/tutor/pets')} className="btn-accent-gradient rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Pet
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet, i) => (
            <motion.div
              key={pet.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="glass-card p-5 cursor-pointer hover:border-accent/30 hover:-translate-y-1 transition-all duration-300"
                onClick={() => navigate('/app/tutor/pets')}
              >
                <div className="flex items-center gap-4">
                  {pet.avatar_url ? (
                    <img src={pet.avatar_url} alt={pet.name} className="w-14 h-14 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-3xl">
                      {speciesEmoji[pet.species] || '🐾'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-lg">{pet.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{pet.breed || pet.species}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {/* Add Pet Card */}
          <Card
            className="border-2 border-dashed border-accent/20 p-5 cursor-pointer hover:border-accent hover:bg-accent/5 transition-all flex items-center justify-center min-h-[100px]"
            onClick={() => navigate('/app/tutor/pets')}
          >
            <div className="text-center">
              <Plus className="w-8 h-8 text-accent mx-auto mb-1" />
              <p className="text-sm font-medium text-accent">Adicionar Pet</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
