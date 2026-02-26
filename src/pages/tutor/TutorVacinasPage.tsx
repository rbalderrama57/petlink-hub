import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Syringe, CheckCircle2, AlertTriangle, XCircle, Download, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlanGate } from '@/components/tutor/PlanGate';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VaccineRow {
  id: string;
  name: string;
  vaccine_type: string;
  applied_date: string | null;
  next_dose_date: string | null;
  batch_number: string | null;
  notes: string | null;
  pet_id: string;
  pet_name: string;
}

type VaccineStatus = 'up_to_date' | 'due_soon' | 'overdue' | 'not_applied';

function getVaccineStatus(v: VaccineRow): VaccineStatus {
  if (!v.applied_date) return 'not_applied';
  if (!v.next_dose_date) return 'up_to_date';
  const daysUntil = differenceInDays(new Date(v.next_dose_date), new Date());
  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= 30) return 'due_soon';
  return 'up_to_date';
}

const statusConfig = {
  up_to_date: { icon: CheckCircle2, label: 'Em dia', color: 'bg-success/10 text-success border-success/30' },
  due_soon: { icon: AlertTriangle, label: 'Vence em breve', color: 'bg-warning/10 text-warning border-warning/30' },
  overdue: { icon: XCircle, label: 'Atrasada', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  not_applied: { icon: Syringe, label: 'Não aplicada', color: 'bg-muted text-muted-foreground border-border' },
};

export function TutorVacinasPage() {
  const { profile } = useAuth();
  const { isPremium } = useSubscription();
  const [vaccines, setVaccines] = useState<VaccineRow[]>([]);
  const [pets, setPets] = useState<{ id: string; name: string }[]>([]);
  const [selectedPet, setSelectedPet] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) loadData();
  }, [profile]);

  const loadData = async () => {
    const { data: petsData } = await supabase
      .from('pets')
      .select('id, name')
      .eq('tutor_id', profile!.id)
      .order('name');
    setPets(petsData || []);

    if (!petsData?.length) { setLoading(false); return; }

    const { data: vaccinesData } = await supabase
      .from('vaccines')
      .select('id, name, vaccine_type, applied_date, next_dose_date, batch_number, notes, pet_id')
      .in('pet_id', petsData.map(p => p.id))
      .order('next_dose_date', { ascending: true });

    const mapped = (vaccinesData || []).map(v => ({
      ...v,
      pet_name: petsData.find(p => p.id === v.pet_id)?.name || '',
    }));
    setVaccines(mapped);
    setLoading(false);
  };

  const filtered = selectedPet === 'all' ? vaccines : vaccines.filter(v => v.pet_id === selectedPet);

  const exportPDF = () => {
    const content = filtered.map(v => {
      const s = getVaccineStatus(v);
      return `${v.name} | ${v.pet_name} | ${statusConfig[s].label} | Aplicada: ${v.applied_date ? format(new Date(v.applied_date), 'dd/MM/yyyy') : '-'} | Próxima: ${v.next_dose_date ? format(new Date(v.next_dose_date), 'dd/MM/yyyy') : '-'}`;
    }).join('\n');

    const blob = new Blob([`CARTEIRINHA DE VACINAÇÃO\n${'='.repeat(50)}\n\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'carteirinha-vacinacao.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const pageContent = (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <Syringe className="w-7 h-7 text-primary" />
              Carteirinha de Vacinação
            </h1>
            <p className="text-muted-foreground mt-1">Acompanhe o status vacinal dos seus pets.</p>
          </div>
          {isPremium && (
            <Button onClick={exportPDF} variant="outline" className="rounded-full">
              <FileDown className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          )}
        </div>
      </motion.div>

      {pets.length > 1 && (
        <div className="mb-6">
          <Select value={selectedPet} onValueChange={setSelectedPet}>
            <SelectTrigger className="input-premium w-64">
              <SelectValue placeholder="Filtrar por pet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os pets</SelectItem>
              {pets.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="glass-card p-16 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-6">
            <Syringe className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground mb-2">Nenhuma vacina registrada</h3>
          <p className="text-muted-foreground">As vacinas serão exibidas quando seu veterinário registrá-las.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((v, i) => {
            const status = getVaccineStatus(v);
            const cfg = statusConfig[status];
            const Icon = cfg.icon;
            return (
              <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={`glass-card p-5 border-l-4 ${status === 'up_to_date' ? 'border-l-success' : status === 'due_soon' ? 'border-l-warning' : status === 'overdue' ? 'border-l-destructive' : 'border-l-border'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">{v.pet_name}</span>
                        <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>
                          <Icon className="w-3 h-3 mr-1" />
                          {cfg.label}
                        </Badge>
                      </div>
                      <p className="font-semibold text-foreground">{v.name}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {v.vaccine_type === 'government' ? 'Obrigatória' : 'Opcional'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                      <span className="text-xs">Aplicada:</span>
                      <p className="text-foreground">{v.applied_date ? format(new Date(v.applied_date), 'dd/MM/yyyy') : '—'}</p>
                    </div>
                    <div>
                      <span className="text-xs">Próxima dose:</span>
                      <p className="text-foreground">{v.next_dose_date ? format(new Date(v.next_dose_date), 'dd/MM/yyyy') : '—'}</p>
                    </div>
                  </div>
                  {v.batch_number && (
                    <p className="text-xs text-muted-foreground mt-2">Lote: {v.batch_number}</p>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <PlanGate isPremium={isPremium} feature="Carteirinha de Vacinação" mode="overlay">
      {pageContent}
    </PlanGate>
  );
}
