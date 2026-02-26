import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Stethoscope, Syringe, FileText, Pill, Lock, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TimelineEntry {
  id: string;
  type: 'consultation' | 'vaccine' | 'document' | 'prescription';
  title: string;
  description: string;
  date: string;
  pet_name: string;
  pet_id: string;
}

interface PetOption {
  id: string;
  name: string;
  species: string;
}

const FREE_LIMIT = 3;

const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
  consultation: { icon: Stethoscope, color: 'bg-primary/10 text-primary', label: 'Consulta' },
  vaccine: { icon: Syringe, color: 'bg-warning/10 text-warning', label: 'Vacina' },
  document: { icon: FileText, color: 'bg-info/10 text-info', label: 'Documento' },
  prescription: { icon: Pill, color: 'bg-accent/10 text-accent', label: 'Prescrição' },
};

export function TutorCofrePage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState<PetOption[]>([]);
  const [selectedPet, setSelectedPet] = useState<string>('all');
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium] = useState(false); // TODO: check real subscription

  useEffect(() => {
    if (profile) loadPets();
  }, [profile]);

  useEffect(() => {
    if (profile && pets.length > 0) loadTimeline();
  }, [profile, pets, selectedPet]);

  const loadPets = async () => {
    const { data } = await supabase
      .from('pets')
      .select('id, name, species')
      .eq('tutor_id', profile!.id)
      .order('name');
    setPets(data || []);
  };

  const loadTimeline = async () => {
    setLoading(true);
    const petIds = selectedPet === 'all' ? pets.map(p => p.id) : [selectedPet];
    if (petIds.length === 0) { setLoading(false); return; }

    const allEntries: TimelineEntry[] = [];

    // Consultations
    const { data: consults } = await supabase
      .from('consultations')
      .select('id, chief_complaint, diagnosis, consultation_date, pet_id')
      .in('pet_id', petIds)
      .order('consultation_date', { ascending: false });

    (consults || []).forEach(c => {
      const pet = pets.find(p => p.id === c.pet_id);
      allEntries.push({
        id: c.id,
        type: 'consultation',
        title: c.chief_complaint,
        description: c.diagnosis || 'Sem diagnóstico registrado',
        date: c.consultation_date,
        pet_name: pet?.name || '',
        pet_id: c.pet_id,
      });
    });

    // Vaccines
    const { data: vaccines } = await supabase
      .from('vaccines')
      .select('id, name, applied_date, notes, pet_id')
      .in('pet_id', petIds)
      .not('applied_date', 'is', null)
      .order('applied_date', { ascending: false });

    (vaccines || []).forEach(v => {
      const pet = pets.find(p => p.id === v.pet_id);
      allEntries.push({
        id: v.id,
        type: 'vaccine',
        title: v.name,
        description: v.notes || 'Vacina aplicada',
        date: v.applied_date!,
        pet_name: pet?.name || '',
        pet_id: v.pet_id,
      });
    });

    // Documents
    const { data: docs } = await supabase
      .from('documents')
      .select('id, title, description, created_at, pet_id')
      .in('pet_id', petIds)
      .order('created_at', { ascending: false });

    (docs || []).forEach(d => {
      const pet = pets.find(p => p.id === d.pet_id);
      allEntries.push({
        id: d.id,
        type: 'document',
        title: d.title,
        description: d.description || 'Documento enviado',
        date: d.created_at,
        pet_name: pet?.name || '',
        pet_id: d.pet_id,
      });
    });

    // Prescriptions
    const { data: prescriptions } = await supabase
      .from('prescriptions')
      .select('id, diagnosis, instructions, date, pet_id')
      .in('pet_id', petIds)
      .order('date', { ascending: false });

    (prescriptions || []).forEach(p => {
      const pet = pets.find(pt => pt.id === p.pet_id);
      allEntries.push({
        id: p.id,
        type: 'prescription',
        title: p.diagnosis || 'Prescrição',
        description: p.instructions || 'Sem instruções',
        date: p.date,
        pet_name: pet?.name || '',
        pet_id: p.pet_id,
      });
    });

    // Sort by date desc
    allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setEntries(allEntries);
    setLoading(false);
  };

  const visibleEntries = isPremium ? entries : entries.slice(0, FREE_LIMIT);
  const hasHiddenEntries = !isPremium && entries.length > FREE_LIMIT;

  if (loading && pets.length === 0) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-64" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <FolderOpen className="w-7 h-7 text-accent" />
          Cofre Digital
        </h1>
        <p className="text-muted-foreground mt-1">Histórico médico completo do seu pet.</p>
      </motion.div>

      {/* Pet Filter */}
      {pets.length > 0 && (
        <div className="mb-6">
          <Select value={selectedPet} onValueChange={setSelectedPet}>
            <SelectTrigger className="input-premium w-64">
              <SelectValue placeholder="Filtrar por pet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os pets</SelectItem>
              {pets.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Empty state */}
      {!loading && pets.length === 0 && (
        <Card className="glass-card p-16 text-center">
          <div className="w-20 h-20 rounded-full bg-accent/10 mx-auto flex items-center justify-center mb-6">
            <FolderOpen className="w-10 h-10 text-accent" />
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground mb-2">Nenhum pet cadastrado</h3>
          <p className="text-muted-foreground mb-8">Cadastre um pet para começar a usar o Cofre Digital.</p>
          <Button onClick={() => navigate('/app/tutor/pets')} className="btn-accent-gradient rounded-full">
            Cadastrar Pet
          </Button>
        </Card>
      )}

      {!loading && pets.length > 0 && entries.length === 0 && (
        <Card className="glass-card p-16 text-center">
          <div className="w-20 h-20 rounded-full bg-secondary mx-auto flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground mb-2">Histórico vazio</h3>
          <p className="text-muted-foreground">Quando seu veterinário registrar consultas e vacinas, elas aparecerão aqui.</p>
        </Card>
      )}

      {/* Timeline */}
      {loading && pets.length > 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          {visibleEntries.length > 0 && (
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
          )}

          <div className="space-y-4">
            {visibleEntries.map((entry, i) => {
              const config = typeConfig[entry.type];
              const Icon = config.icon;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative pl-14"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-3 top-5 w-7 h-7 rounded-full ${config.color} flex items-center justify-center z-10 ring-4 ring-background`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <Card className="glass-card p-5 hover:border-primary/20 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="text-xs text-muted-foreground">{entry.pet_name}</span>
                        </div>
                        <p className="font-semibold text-foreground">{entry.title}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{entry.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {new Date(entry.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Paywall Banner */}
          {hasHiddenEntries && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <Card className="relative overflow-hidden border-2 border-accent/30">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent" />
                <div className="relative p-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-accent/10 mx-auto flex items-center justify-center mb-4">
                    <Lock className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-foreground mb-2">
                    +{entries.length - FREE_LIMIT} registros ocultos
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    No plano gratuito, apenas os 3 últimos registros são exibidos. 
                    Assine o <strong className="text-accent">Premium</strong> por apenas <strong className="text-accent">R$ 14,90/mês</strong> para acesso completo.
                  </p>
                  <Button onClick={() => navigate('/planos/tutor')} className="btn-accent-gradient rounded-full px-8">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade para Premium
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
