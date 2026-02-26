import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, FileDown, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlanGateBanner } from '@/components/tutor/PlanGate';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface PrescriptionRow {
  id: string;
  diagnosis: string | null;
  instructions: string | null;
  medications: any;
  date: string;
  valid_until: string | null;
  pet_id: string;
  pet_name: string;
}

const FREE_LIMIT = 3;

export function TutorReceitasPage() {
  const { profile } = useAuth();
  const { isPremium } = useSubscription();
  const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([]);
  const [pets, setPets] = useState<{ id: string; name: string }[]>([]);
  const [selectedPet, setSelectedPet] = useState('all');
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<PrescriptionRow | null>(null);

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

    const { data } = await supabase
      .from('prescriptions')
      .select('id, diagnosis, instructions, medications, date, valid_until, pet_id')
      .in('pet_id', petsData.map(p => p.id))
      .order('date', { ascending: false });

    setPrescriptions((data || []).map(p => ({
      ...p,
      pet_name: petsData.find(pt => pt.id === p.pet_id)?.name || '',
    })));
    setLoading(false);
  };

  const filtered = selectedPet === 'all' ? prescriptions : prescriptions.filter(p => p.pet_id === selectedPet);
  const visible = isPremium ? filtered : filtered.slice(0, FREE_LIMIT);
  const hasHidden = !isPremium && filtered.length > FREE_LIMIT;

  const downloadTxt = (p: PrescriptionRow) => {
    const meds = Array.isArray(p.medications) ? p.medications.map((m: any) => `- ${m.name || m}`).join('\n') : '';
    const content = `RECEITA VETERINÁRIA\n${'='.repeat(40)}\nPet: ${p.pet_name}\nData: ${format(new Date(p.date), 'dd/MM/yyyy')}\nDiagnóstico: ${p.diagnosis || '-'}\n\nMedicamentos:\n${meds || '-'}\n\nInstruções:\n${p.instructions || '-'}\n\nVálida até: ${p.valid_until ? format(new Date(p.valid_until), 'dd/MM/yyyy') : '-'}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receita-${format(new Date(p.date), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <Pill className="w-7 h-7 text-accent" />
          Receitas
        </h1>
        <p className="text-muted-foreground mt-1">Receitas e prescrições dos seus pets.</p>
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
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="glass-card p-16 text-center">
          <div className="w-20 h-20 rounded-full bg-accent/10 mx-auto flex items-center justify-center mb-6">
            <Pill className="w-10 h-10 text-accent" />
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground mb-2">Nenhuma receita</h3>
          <p className="text-muted-foreground">Quando o veterinário prescrever medicamentos, eles aparecerão aqui.</p>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {visible.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card p-5 hover:border-primary/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">{p.pet_name}</span>
                        <Badge variant="outline" className="text-[10px]">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(p.date), 'dd/MM/yyyy')}
                        </Badge>
                      </div>
                      <p className="font-semibold text-foreground">{p.diagnosis || 'Prescrição'}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.instructions || 'Sem instruções adicionais'}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="icon" onClick={() => setViewing(p)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => downloadTxt(p)}>
                        <FileDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {hasHidden && (
            <PlanGateBanner feature={`+${filtered.length - FREE_LIMIT} receitas ocultas`} />
          )}
        </>
      )}

      {/* Detail Modal */}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="glass-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Receita — {viewing?.pet_name}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div>
                <span className="text-xs text-muted-foreground">Data</span>
                <p className="text-foreground">{format(new Date(viewing.date), 'dd/MM/yyyy')}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Diagnóstico</span>
                <p className="text-foreground">{viewing.diagnosis || '—'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Medicamentos</span>
                {Array.isArray(viewing.medications) && viewing.medications.length > 0 ? (
                  <ul className="list-disc list-inside text-foreground">
                    {viewing.medications.map((m: any, i: number) => <li key={i}>{typeof m === 'string' ? m : m.name || JSON.stringify(m)}</li>)}
                  </ul>
                ) : <p className="text-foreground">—</p>}
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Instruções</span>
                <p className="text-foreground whitespace-pre-wrap">{viewing.instructions || '—'}</p>
              </div>
              {viewing.valid_until && (
                <div>
                  <span className="text-xs text-muted-foreground">Válida até</span>
                  <p className="text-foreground">{format(new Date(viewing.valid_until), 'dd/MM/yyyy')}</p>
                </div>
              )}
              <Button onClick={() => downloadTxt(viewing)} variant="outline" className="rounded-full w-full">
                <FileDown className="w-4 h-4 mr-2" />
                Baixar Receita
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
