import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, ChevronLeft, ChevronRight, X, PawPrint, FileText, History, User as UserIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Profile, Pet } from '@/types';

const PAGE_SIZE = 10;
const speciesEmoji: Record<string, string> = { dog: '🐕', cat: '🐈', bird: '🐦', other: '🐾' };

export function VetClientesPage() {
  const { profile: vetProfile } = useAuth();
  const { toast } = useToast();

  const [clients, setClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // New client dialog
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newClient, setNewClient] = useState({ full_name: '', email: '', phone: '' });
  const [newPet, setNewPet] = useState({ name: '', species: 'dog' as string, breed: '' });

  // Client profile dialog
  const [selectedClient, setSelectedClient] = useState<Profile | null>(null);
  const [clientPets, setClientPets] = useState<Pet[]>([]);
  const [clientConsultations, setClientConsultations] = useState<any[]>([]);
  const [clientPrescriptions, setClientPrescriptions] = useState<any[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, [page]);

  const loadClients = async () => {
    setLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('role', 'tutor')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error) {
      setClients((data || []) as Profile[]);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(c =>
      c.full_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleSaveClient = async () => {
    if (!newClient.full_name || !newClient.email) {
      toast({ title: 'Preencha nome e email', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      // Create auth user for the tutor with a random password (invite flow)
      const tempPassword = crypto.randomUUID().slice(0, 16);
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: newClient.email,
        password: tempPassword,
        options: {
          data: { full_name: newClient.full_name, role: 'tutor' },
        },
      });

      if (authErr) throw authErr;

      // Wait a bit for the trigger to create the profile
      await new Promise(r => setTimeout(r, 1500));

      // Find the created profile
      const { data: createdProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', newClient.email)
        .maybeSingle();

      if (createdProfile && newClient.phone) {
        await supabase.from('profiles').update({ phone: newClient.phone }).eq('id', createdProfile.id);
      }

      // Create pet if provided
      if (createdProfile && newPet.name) {
        await supabase.from('pets').insert({
          tutor_id: createdProfile.id,
          name: newPet.name,
          species: newPet.species as any,
          breed: newPet.breed || null,
        });
      }

      toast({ title: '✅ Cliente cadastrado', description: `Convite enviado para ${newClient.email}` });
      setShowNew(false);
      setNewClient({ full_name: '', email: '', phone: '' });
      setNewPet({ name: '', species: 'dog', breed: '' });
      loadClients();
    } catch (err: any) {
      toast({ title: 'Erro ao cadastrar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const openClientProfile = async (client: Profile) => {
    setSelectedClient(client);
    setProfileLoading(true);

    const [petsRes, consultRes, prescRes] = await Promise.all([
      supabase.from('pets').select('*').eq('tutor_id', client.id),
      supabase.from('consultations').select('*, pets(name)').in('pet_id',
        (await supabase.from('pets').select('id').eq('tutor_id', client.id)).data?.map((p: any) => p.id) || []
      ).order('consultation_date', { ascending: false }).limit(20),
      supabase.from('prescriptions').select('*, pets(name)').in('pet_id',
        (await supabase.from('pets').select('id').eq('tutor_id', client.id)).data?.map((p: any) => p.id) || []
      ).order('date', { ascending: false }).limit(20),
    ]);

    setClientPets((petsRes.data || []) as Pet[]);
    setClientConsultations(consultRes.data || []);
    setClientPrescriptions(prescRes.data || []);
    setProfileLoading(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" /> Clientes
          </h1>
          <p className="text-muted-foreground mt-1">{totalCount} tutor{totalCount !== 1 ? 'es' : ''} cadastrado{totalCount !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="btn-primary-gradient rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Novo Cliente
        </Button>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email ou telefone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-premium pl-10"
        />
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Telefone</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Desde</th>
                <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="p-4 hidden md:table-cell"><Skeleton className="h-5 w-40" /></td>
                    <td className="p-4 hidden lg:table-cell"><Skeleton className="h-5 w-28" /></td>
                    <td className="p-4 hidden sm:table-cell"><Skeleton className="h-5 w-24" /></td>
                    <td className="p-4"><Skeleton className="h-8 w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhum cliente encontrado</td>
                </tr>
              ) : (
                filtered.map(client => (
                  <tr key={client.id} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => openClientProfile(client)}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-accent text-sm font-bold">
                          {client.full_name.charAt(0)}
                        </div>
                        <span className="font-medium text-foreground">{client.full_name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{client.email}</td>
                    <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">{client.phone || '—'}</td>
                    <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">
                      {format(new Date(client.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" className="text-primary">Ver perfil</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Página {page + 1} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New Client Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl">Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dados do Tutor</h3>
              <div className="grid gap-3">
                <div>
                  <Label>Nome completo *</Label>
                  <Input className="input-premium" value={newClient.full_name} onChange={e => setNewClient(p => ({ ...p, full_name: e.target.value }))} />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" className="input-premium" value={newClient.email} onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input className="input-premium" value={newClient.phone} onChange={e => setNewClient(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pet (opcional)</h3>
              <div className="grid gap-3">
                <div>
                  <Label>Nome do pet</Label>
                  <Input className="input-premium" value={newPet.name} onChange={e => setNewPet(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Espécie</Label>
                    <Select value={newPet.species} onValueChange={v => setNewPet(p => ({ ...p, species: v }))}>
                      <SelectTrigger className="input-premium"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">🐕 Cão</SelectItem>
                        <SelectItem value="cat">🐈 Gato</SelectItem>
                        <SelectItem value="bird">🐦 Ave</SelectItem>
                        <SelectItem value="other">🐾 Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Raça</Label>
                    <Input className="input-premium" value={newPet.breed} onChange={e => setNewPet(p => ({ ...p, breed: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleSaveClient} disabled={saving} className="w-full btn-primary-gradient rounded-xl h-12">
              {saving ? 'Salvando...' : 'Cadastrar e Enviar Convite'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Profile Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[85vh] overflow-y-auto">
          {selectedClient && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-accent text-lg font-bold">
                    {selectedClient.full_name.charAt(0)}
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedClient.full_name}</DialogTitle>
                    <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="dados" className="mt-4">
                <TabsList className="grid grid-cols-4 w-full bg-muted/50 rounded-xl">
                  <TabsTrigger value="dados" className="rounded-lg gap-1 text-xs"><UserIcon className="w-3.5 h-3.5" /> Dados</TabsTrigger>
                  <TabsTrigger value="pets" className="rounded-lg gap-1 text-xs"><PawPrint className="w-3.5 h-3.5" /> Pets</TabsTrigger>
                  <TabsTrigger value="historico" className="rounded-lg gap-1 text-xs"><History className="w-3.5 h-3.5" /> Histórico</TabsTrigger>
                  <TabsTrigger value="receitas" className="rounded-lg gap-1 text-xs"><FileText className="w-3.5 h-3.5" /> Receitas</TabsTrigger>
                </TabsList>

                <TabsContent value="dados" className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Telefone:</span> <span className="text-foreground ml-1">{selectedClient.phone || '—'}</span></div>
                    <div><span className="text-muted-foreground">Cadastro:</span> <span className="text-foreground ml-1">{format(new Date(selectedClient.created_at), 'dd/MM/yyyy', { locale: ptBR })}</span></div>
                  </div>
                </TabsContent>

                <TabsContent value="pets" className="mt-4">
                  {profileLoading ? (
                    <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
                  ) : clientPets.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">Nenhum pet cadastrado</p>
                  ) : (
                    <div className="space-y-3">
                      {clientPets.map(pet => (
                        <div key={pet.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                          <span className="text-2xl">{speciesEmoji[pet.species] || '🐾'}</span>
                          <div>
                            <p className="font-medium text-foreground">{pet.name}</p>
                            <p className="text-xs text-muted-foreground">{pet.breed || pet.species} {pet.microchip_id ? `· Chip: ${pet.microchip_id}` : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="historico" className="mt-4">
                  {profileLoading ? (
                    <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
                  ) : clientConsultations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">Nenhuma consulta registrada</p>
                  ) : (
                    <div className="space-y-2">
                      {clientConsultations.map((c: any) => (
                        <div key={c.id} className="p-3 rounded-xl bg-muted/30 flex justify-between items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{c.chief_complaint}</p>
                            <p className="text-xs text-muted-foreground">{c.pets?.name} · {format(new Date(c.consultation_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                          </div>
                          {c.diagnosis && <Badge variant="outline" className="text-xs shrink-0">{c.diagnosis.slice(0, 20)}</Badge>}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="receitas" className="mt-4">
                  {profileLoading ? (
                    <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
                  ) : clientPrescriptions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">Nenhuma receita emitida</p>
                  ) : (
                    <div className="space-y-2">
                      {clientPrescriptions.map((p: any) => (
                        <div key={p.id} className="p-3 rounded-xl bg-muted/30">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-foreground">{p.diagnosis || 'Receita'}</p>
                              <p className="text-xs text-muted-foreground">{p.pets?.name} · {format(new Date(p.date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                            </div>
                            {p.valid_until && (
                              <Badge variant="outline" className="text-xs">
                                Válida até {format(new Date(p.valid_until), 'dd/MM', { locale: ptBR })}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
