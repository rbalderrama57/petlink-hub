import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PawPrint, Plus, Pencil, Trash2, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birth_date: string | null;
  sex: string | null;
  microchip_id: string | null;
  avatar_url: string | null;
  weight: number | null;
}

const emptyForm = {
  name: '',
  species: 'dog' as string,
  breed: '',
  birth_date: '',
  sex: 'unknown',
  microchip_id: '',
  avatar_url: '',
};

const speciesEmoji: Record<string, string> = { dog: '🐕', cat: '🐈', bird: '🐦', other: '🐾' };
const speciesLabel: Record<string, string> = { dog: 'Cão', cat: 'Gato', bird: 'Ave', other: 'Outro' };
const sexLabel: Record<string, string> = { male: 'Macho', female: 'Fêmea', unknown: 'Não informado' };

export function TutorPetsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (profile) loadPets();
  }, [profile]);

  const loadPets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('pets')
      .select('id, name, species, breed, birth_date, sex, microchip_id, avatar_url, weight')
      .eq('tutor_id', profile!.id)
      .order('created_at', { ascending: false });
    setPets((data as Pet[]) || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditingPet(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (pet: Pet) => {
    setEditingPet(pet);
    setForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      birth_date: pet.birth_date || '',
      sex: pet.sex || 'unknown',
      microchip_id: pet.microchip_id || '',
      avatar_url: pet.avatar_url || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' });
      return;
    }
    if (form.name.length > 100) {
      toast({ title: 'Nome muito longo (máx. 100 caracteres)', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      species: form.species as any,
      breed: form.breed.trim() || null,
      birth_date: form.birth_date || null,
      sex: form.sex,
      microchip_id: form.microchip_id.trim() || null,
      avatar_url: form.avatar_url.trim() || null,
    };

    try {
      if (editingPet) {
        const { error } = await supabase.from('pets').update(payload).eq('id', editingPet.id);
        if (error) throw error;
        toast({ title: 'Pet atualizado!' });
      } else {
        const { error } = await supabase.from('pets').insert({ ...payload, tutor_id: profile!.id });
        if (error) throw error;
        toast({ title: 'Pet cadastrado!' });
      }
      setDialogOpen(false);
      loadPets();
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('pets').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Pet removido' });
      loadPets();
    }
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <PawPrint className="w-7 h-7 text-accent" />
            Meus Pets
          </h1>
          <p className="text-muted-foreground mt-1">{pets.length} pet{pets.length !== 1 ? 's' : ''} cadastrado{pets.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openCreate} className="btn-accent-gradient rounded-full">
          <Plus className="w-4 h-4 mr-2" />
          Novo Pet
        </Button>
      </motion.div>

      {/* Empty State */}
      {pets.length === 0 && (
        <Card className="glass-card p-16 text-center">
          <div className="w-20 h-20 rounded-full bg-accent/10 mx-auto flex items-center justify-center mb-6">
            <PawPrint className="w-10 h-10 text-accent" />
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground mb-2">Nenhum pet cadastrado</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Cadastre seu primeiro pet e comece a acompanhar vacinas, consultas e documentos.
          </p>
          <Button onClick={openCreate} size="lg" className="btn-accent-gradient rounded-full">
            <Plus className="w-5 h-5 mr-2" />
            Cadastrar Meu Primeiro Pet
          </Button>
        </Card>
      )}

      {/* Pet Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pets.map((pet, i) => (
          <motion.div
            key={pet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="glass-card p-5 hover:border-accent/30 transition-colors group relative">
              {/* Actions */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(pet)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={() => setDeleteConfirm(pet.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                {pet.avatar_url ? (
                  <img src={pet.avatar_url} alt={pet.name} className="w-16 h-16 rounded-2xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-3xl">
                    {speciesEmoji[pet.species] || '🐾'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-lg">{pet.name}</p>
                  <p className="text-sm text-muted-foreground">{speciesLabel[pet.species] || pet.species}{pet.breed ? ` • ${pet.breed}` : ''}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {pet.birth_date && (
                  <div className="px-2 py-1.5 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Nascimento</span>
                    <p className="text-foreground font-medium">{new Date(pet.birth_date).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                {pet.sex && pet.sex !== 'unknown' && (
                  <div className="px-2 py-1.5 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Sexo</span>
                    <p className="text-foreground font-medium">{sexLabel[pet.sex]}</p>
                  </div>
                )}
                {pet.microchip_id && (
                  <div className="px-2 py-1.5 rounded-lg bg-secondary/50 col-span-2">
                    <span className="text-muted-foreground">Microchip</span>
                    <p className="text-foreground font-medium font-mono text-[11px]">{pet.microchip_id}</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Excluir pet?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Essa ação não pode ser desfeita. Todos os registros médicos e documentos serão removidos.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" className="flex-1" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Excluir</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editingPet ? 'Editar Pet' : 'Novo Pet'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <Label>Nome *</Label>
              <Input className="input-premium mt-1" placeholder="Nome do pet" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} maxLength={100} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Espécie</Label>
                <Select value={form.species} onValueChange={v => setForm(f => ({ ...f, species: v }))}>
                  <SelectTrigger className="input-premium mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">🐕 Cão</SelectItem>
                    <SelectItem value="cat">🐈 Gato</SelectItem>
                    <SelectItem value="bird">🐦 Ave</SelectItem>
                    <SelectItem value="other">🐾 Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sexo</Label>
                <Select value={form.sex} onValueChange={v => setForm(f => ({ ...f, sex: v }))}>
                  <SelectTrigger className="input-premium mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Macho</SelectItem>
                    <SelectItem value="female">Fêmea</SelectItem>
                    <SelectItem value="unknown">Não informado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Raça</Label>
              <Input className="input-premium mt-1" placeholder="Ex: Golden Retriever" value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} maxLength={100} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Nascimento</Label>
                <Input className="input-premium mt-1" type="date" value={form.birth_date} onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))} />
              </div>
              <div>
                <Label>Microchip</Label>
                <Input className="input-premium mt-1" placeholder="15 dígitos ISO" value={form.microchip_id} onChange={e => setForm(f => ({ ...f, microchip_id: e.target.value }))} maxLength={15} />
              </div>
            </div>

            <div>
              <Label>URL da Foto (opcional)</Label>
              <Input className="input-premium mt-1" placeholder="https://..." value={form.avatar_url} onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button className="flex-1 btn-primary-gradient" onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : editingPet ? 'Salvar' : 'Cadastrar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
