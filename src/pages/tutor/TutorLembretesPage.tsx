import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, Check, Calendar, Trash2, Syringe, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PlanGate, PlanGateBanner } from '@/components/tutor/PlanGate';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format, isPast, isToday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ReminderRow {
  id: string;
  title: string;
  description: string | null;
  reminder_type: string;
  reminder_date: string;
  is_completed: boolean;
  pet_id: string;
  pet_name: string;
}

export function TutorLembretesPage() {
  const { profile } = useAuth();
  const { isPremium } = useSubscription();
  const { toast } = useToast();
  const [reminders, setReminders] = useState<ReminderRow[]>([]);
  const [pets, setPets] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', reminder_type: 'vaccine', reminder_date: '', pet_id: '' });

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
      .from('reminders' as any)
      .select('id, title, description, reminder_type, reminder_date, is_completed, pet_id')
      .eq('tutor_id', profile!.id)
      .order('reminder_date', { ascending: true });

    setReminders(((data as any[]) || []).map((r: any) => ({
      ...r,
      pet_name: petsData.find(p => p.id === r.pet_id)?.name || '',
    })));
    setLoading(false);
  };

  const createReminder = async () => {
    if (!formData.title || !formData.reminder_date || !formData.pet_id) return;

    const { error } = await supabase.from('reminders' as any).insert({
      title: formData.title,
      description: formData.description || null,
      reminder_type: formData.reminder_type,
      reminder_date: formData.reminder_date,
      pet_id: formData.pet_id,
      tutor_id: profile!.id,
    } as any);

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Lembrete criado!' });
      setShowForm(false);
      setFormData({ title: '', description: '', reminder_type: 'vaccine', reminder_date: '', pet_id: '' });
      loadData();
    }
  };

  const toggleComplete = async (r: ReminderRow) => {
    await supabase.from('reminders' as any).update({ is_completed: !r.is_completed } as any).eq('id', r.id);
    loadData();
  };

  const deleteReminder = async (id: string) => {
    await supabase.from('reminders' as any).delete().eq('id', id);
    loadData();
  };

  const getTypeIcon = (type: string) => type === 'vaccine' ? Syringe : Stethoscope;

  const upcoming = reminders.filter(r => !r.is_completed);
  const completed = reminders.filter(r => r.is_completed);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <Bell className="w-7 h-7 text-warning" />
              Lembretes
            </h1>
            <p className="text-muted-foreground mt-1">Lembretes de vacinas e consultas.</p>
          </div>
          {isPremium && (
            <Button onClick={() => setShowForm(true)} className="btn-accent-gradient rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Novo Lembrete
            </Button>
          )}
        </div>
      </motion.div>

      {!isPremium && (
        <PlanGateBanner feature="Criar lembretes personalizados" />
      )}

      {loading ? (
        <div className="space-y-4 mt-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : reminders.length === 0 ? (
        <Card className="glass-card p-16 text-center mt-6">
          <div className="w-20 h-20 rounded-full bg-warning/10 mx-auto flex items-center justify-center mb-6">
            <Bell className="w-10 h-10 text-warning" />
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground mb-2">Nenhum lembrete</h3>
          <p className="text-muted-foreground">
            {isPremium ? 'Crie lembretes para vacinas e consultas.' : 'Lembretes criados pelo veterinário aparecerão aqui.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-6 mt-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground mb-3">Pendentes</h2>
              <div className="space-y-3">
                {upcoming.map((r, i) => {
                  const Icon = getTypeIcon(r.reminder_type);
                  const overdue = isPast(new Date(r.reminder_date)) && !isToday(new Date(r.reminder_date));
                  const today = isToday(new Date(r.reminder_date));
                  return (
                    <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                      <Card className={`glass-card p-4 border-l-4 ${overdue ? 'border-l-destructive' : today ? 'border-l-warning' : 'border-l-primary'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${overdue ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                            <Icon className={`w-5 h-5 ${overdue ? 'text-destructive' : 'text-primary'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-medium text-foreground">{r.title}</p>
                              {overdue && <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">Atrasado</Badge>}
                              {today && <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/30">Hoje</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {r.pet_name} · {format(new Date(r.reminder_date), 'dd/MM/yyyy')}
                            </p>
                          </div>
                          {isPremium && (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => toggleComplete(r)}>
                                <Check className="w-4 h-4 text-success" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteReminder(r.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="text-lg font-display font-semibold text-muted-foreground mb-3">Concluídos</h2>
              <div className="space-y-3">
                {completed.map(r => {
                  const Icon = getTypeIcon(r.reminder_type);
                  return (
                    <Card key={r.id} className="glass-card p-4 opacity-60">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground line-through">{r.title}</p>
                          <p className="text-xs text-muted-foreground">{r.pet_name} · {format(new Date(r.reminder_date), 'dd/MM/yyyy')}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Novo Lembrete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Título" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="input-premium" />
            <Input placeholder="Descrição (opcional)" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="input-premium" />
            <Select value={formData.reminder_type} onValueChange={v => setFormData({ ...formData, reminder_type: v })}>
              <SelectTrigger className="input-premium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vaccine">Vacina</SelectItem>
                <SelectItem value="consultation">Consulta</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formData.pet_id} onValueChange={v => setFormData({ ...formData, pet_id: v })}>
              <SelectTrigger className="input-premium">
                <SelectValue placeholder="Selecione o pet" />
              </SelectTrigger>
              <SelectContent>
                {pets.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" value={formData.reminder_date} onChange={e => setFormData({ ...formData, reminder_date: e.target.value })} className="input-premium" />
            <Button onClick={createReminder} className="btn-accent-gradient rounded-full w-full" disabled={!formData.title || !formData.reminder_date || !formData.pet_id}>
              Criar Lembrete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
