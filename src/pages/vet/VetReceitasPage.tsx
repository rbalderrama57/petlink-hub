import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Plus, Search, FileText, X, Trash2, Download, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionForm {
  pet_id: string;
  diagnosis: string;
  instructions: string;
  valid_until: string;
  medications: Medication[];
}

interface PetOption {
  id: string;
  name: string;
  tutorName: string;
  tutorId: string;
}

const emptyMed: Medication = { name: '', dosage: '', frequency: '', duration: '' };

export function VetReceitasPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showDetail, setShowDetail] = useState<any | null>(null);
  const [pets, setPets] = useState<PetOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PrescriptionForm>({
    pet_id: '', diagnosis: '', instructions: '', valid_until: '', medications: [{ ...emptyMed }],
  });

  useEffect(() => {
    if (profile) {
      loadPrescriptions();
      loadPets();
    }
  }, [profile]);

  const loadPrescriptions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('prescriptions')
      .select('*, pets(name, tutor_id, profiles:tutor_id(full_name))')
      .order('date', { ascending: false });
    setPrescriptions(data || []);
    setLoading(false);
  };

  const loadPets = async () => {
    const { data } = await supabase.from('pets').select('id, name, tutor_id, profiles:tutor_id(full_name, id)');
    setPets((data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      tutorName: p.profiles?.full_name || 'Tutor',
      tutorId: p.profiles?.id || '',
    })));
  };

  const addMedication = () => setForm(f => ({ ...f, medications: [...f.medications, { ...emptyMed }] }));
  const removeMedication = (i: number) => setForm(f => ({ ...f, medications: f.medications.filter((_, idx) => idx !== i) }));
  const updateMedication = (i: number, field: keyof Medication, value: string) => {
    setForm(f => {
      const meds = [...f.medications];
      meds[i] = { ...meds[i], [field]: value };
      return { ...f, medications: meds };
    });
  };

  const handleSave = async () => {
    if (!form.pet_id || form.medications.length === 0 || !form.medications[0].name) {
      toast({ title: 'Preencha os campos obrigatórios', description: 'Pet e ao menos um medicamento são obrigatórios.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('prescriptions').insert({
      pet_id: form.pet_id,
      vet_id: profile!.id,
      diagnosis: form.diagnosis || null,
      instructions: form.instructions || null,
      valid_until: form.valid_until || null,
      medications: form.medications as any,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Receita emitida ✅', description: 'A receita foi salva e está disponível para o tutor.' });
      setShowNew(false);
      setForm({ pet_id: '', diagnosis: '', instructions: '', valid_until: '', medications: [{ ...emptyMed }] });
      loadPrescriptions();
    }
  };

  const generatePrescriptionText = (rx: any) => {
    const meds = (rx.medications as Medication[]) || [];
    const lines = [
      '═══════════════════════════════════════',
      '            RECEITUÁRIO VETERINÁRIO',
      '═══════════════════════════════════════',
      '',
      `Pet: ${rx.pets?.name || '—'}`,
      `Data: ${format(new Date(rx.date), 'dd/MM/yyyy', { locale: ptBR })}`,
      rx.valid_until ? `Válido até: ${format(new Date(rx.valid_until), 'dd/MM/yyyy', { locale: ptBR })}` : '',
      '',
      rx.diagnosis ? `Diagnóstico: ${rx.diagnosis}` : '',
      '',
      '── MEDICAMENTOS ──',
      ...meds.map((m, i) => [
        `${i + 1}. ${m.name}`,
        `   Posologia: ${m.dosage}`,
        `   Frequência: ${m.frequency}`,
        `   Duração: ${m.duration}`,
        '',
      ].join('\n')),
      rx.instructions ? `\n── ORIENTAÇÕES ──\n${rx.instructions}` : '',
      '',
      '═══════════════════════════════════════',
      `Veterinário: ${profile?.full_name || ''}`,
      profile?.crmv ? `CRMV: ${profile.crmv}` : '',
    ].filter(Boolean);
    return lines.join('\n');
  };

  const downloadPrescription = (rx: any) => {
    const text = generatePrescriptionText(rx);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receita-${rx.pets?.name || 'pet'}-${format(new Date(rx.date), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Download iniciado 📄' });
  };

  const filtered = prescriptions.filter(rx => {
    const q = search.toLowerCase();
    if (!q) return true;
    return rx.diagnosis?.toLowerCase().includes(q) || rx.pets?.name?.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Pill className="w-8 h-8 text-primary" /> Receitas
          </h1>
          <p className="text-muted-foreground mt-1">Emita e gerencie receitas veterinárias</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="btn-primary-gradient rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Nova Receita
        </Button>
      </motion.div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por pet ou diagnóstico..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 input-premium" />
      </div>

      <div className="glass-card rounded-2xl divide-y divide-border">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/3" /></div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma receita encontrada</p>
          </div>
        ) : (
          filtered.map(rx => {
            const meds = (rx.medications as Medication[]) || [];
            return (
              <div key={rx.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Pill className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {rx.pets?.name || 'Pet'} — {rx.diagnosis || 'Sem diagnóstico'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(rx.date), "dd MMM yyyy", { locale: ptBR })} · {meds.length} medicamento{meds.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {rx.valid_until && new Date(rx.valid_until) < new Date() && (
                    <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">Expirada</Badge>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowDetail(rx)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadPrescription(rx)}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Prescription Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2"><Pill className="w-5 h-5 text-primary" /> Nova Receita</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Pet *</label>
              <Select value={form.pet_id} onValueChange={v => setForm(f => ({ ...f, pet_id: v }))}>
                <SelectTrigger className="input-premium"><SelectValue placeholder="Selecione o pet" /></SelectTrigger>
                <SelectContent>
                  {pets.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name} — {p.tutorName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Diagnóstico</label>
              <Input className="input-premium" value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder="Ex: Dermatite alérgica" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">Medicamentos *</label>
                <Button variant="ghost" size="sm" onClick={addMedication} className="text-primary text-xs"><Plus className="w-3 h-3 mr-1" /> Adicionar</Button>
              </div>
              <div className="space-y-3">
                {form.medications.map((med, i) => (
                  <div key={i} className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Medicamento {i + 1}</span>
                      {form.medications.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeMedication(i)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input className="input-premium h-9 text-sm" placeholder="Nome do medicamento" value={med.name} onChange={e => updateMedication(i, 'name', e.target.value)} />
                      <Input className="input-premium h-9 text-sm" placeholder="Posologia (ex: 10mg)" value={med.dosage} onChange={e => updateMedication(i, 'dosage', e.target.value)} />
                      <Input className="input-premium h-9 text-sm" placeholder="Frequência (ex: 2x/dia)" value={med.frequency} onChange={e => updateMedication(i, 'frequency', e.target.value)} />
                      <Input className="input-premium h-9 text-sm" placeholder="Duração (ex: 7 dias)" value={med.duration} onChange={e => updateMedication(i, 'duration', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Orientações gerais</label>
              <Textarea className="input-premium min-h-[80px]" value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} placeholder="Instruções adicionais para o tutor..." />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Válido até</label>
              <Input type="date" className="input-premium" value={form.valid_until} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving} className="btn-primary-gradient rounded-xl">
                {saving ? 'Salvando...' : 'Emitir Receita'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
          {showDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Receita — {showDetail.pets?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data</span>
                  <span className="text-foreground">{format(new Date(showDetail.date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
                {showDetail.diagnosis && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Diagnóstico</span>
                    <span className="text-foreground">{showDetail.diagnosis}</span>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Medicamentos</p>
                  <div className="space-y-2">
                    {((showDetail.medications as Medication[]) || []).map((m, i) => (
                      <div key={i} className="p-3 rounded-xl bg-muted/30 border border-border/50">
                        <p className="text-sm font-medium text-foreground">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.dosage} · {m.frequency} · {m.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {showDetail.instructions && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Orientações</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{showDetail.instructions}</p>
                  </div>
                )}
                <Button onClick={() => downloadPrescription(showDetail)} className="w-full btn-primary-gradient rounded-xl">
                  <Download className="w-4 h-4 mr-2" /> Baixar Receita
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
