import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Plus, Copy, Check, Clock, CheckCircle2, XCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const MAX_TICKETS = 5;

interface TicketData {
  id: string;
  code: string;
  status: string;
  invited_email: string | null;
  is_redeemed: boolean;
  created_at: string;
  expires_at: string | null;
  plan_id: string;
}

export function VetGoldenTicketsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (profile) loadTickets();
  }, [profile]);

  const loadTickets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('golden_tickets')
      .select('*')
      .eq('created_by', profile!.id)
      .order('created_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return 'GT-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const createTicket = async () => {
    if (!profile) return;
    setCreating(true);
    try {
      // Get a plan to associate
      const { data: plans } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('plan_type', 'b2b')
        .eq('is_active', true)
        .limit(1);

      const planId = plans?.[0]?.id;
      if (!planId) {
        // fallback: get any plan
        const { data: anyPlan } = await supabase
          .from('subscription_plans')
          .select('id')
          .eq('is_active', true)
          .limit(1);
        if (!anyPlan?.[0]) {
          toast({ title: 'Erro', description: 'Nenhum plano disponível.', variant: 'destructive' });
          return;
        }
      }

      const code = generateCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error } = await supabase.from('golden_tickets').insert({
        code,
        created_by: profile.id,
        plan_id: planId || plans![0].id,
        invited_email: inviteEmail || null,
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;

      toast({ title: 'Golden Ticket criado!', description: `Código: ${code}` });
      setShowInvite(false);
      setInviteEmail('');
      loadTickets();
    } catch (err: any) {
      toast({ title: 'Erro ao criar ticket', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (ticket: TicketData) => {
    const link = `${window.location.origin}/login?ticket=${ticket.code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(ticket.id);
    toast({ title: 'Link copiado!' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const usedCount = tickets.filter(t => t.is_redeemed).length;
  const availableCount = tickets.filter(t => !t.is_redeemed).length;
  const canCreate = tickets.length < MAX_TICKETS;

  const statusConfig: Record<string, { icon: any; label: string; color: string }> = {
    pending: { icon: Clock, label: 'Pendente', color: 'bg-warning/10 text-warning' },
    redeemed: { icon: CheckCircle2, label: 'Resgatado', color: 'bg-success/10 text-success' },
    expired: { icon: XCircle, label: 'Expirado', color: 'bg-destructive/10 text-destructive' },
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-4"><Skeleton className="h-24 flex-1" /><Skeleton className="h-24 flex-1" /><Skeleton className="h-24 flex-1" /></div>
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <Ticket className="w-7 h-7 text-warning" />
          Golden Tickets
        </h1>
        <p className="text-muted-foreground mt-1">Convide clínicas parceiras com tickets exclusivos.</p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
        <Card className="glass-card p-4 sm:p-5 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{MAX_TICKETS}</p>
          <p className="text-xs text-muted-foreground mt-1">Total</p>
        </Card>
        <Card className="glass-card p-4 sm:p-5 text-center border-success/20">
          <p className="text-2xl sm:text-3xl font-bold text-success">{usedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Resgatados</p>
        </Card>
        <Card className="glass-card p-4 sm:p-5 text-center border-warning/20">
          <p className="text-2xl sm:text-3xl font-bold text-warning">{MAX_TICKETS - tickets.length + availableCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Disponíveis</p>
        </Card>
      </div>

      {/* Ticket slots */}
      <div className="flex flex-wrap gap-3 mb-8">
        {Array.from({ length: MAX_TICKETS }).map((_, i) => {
          const ticket = tickets[i];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border-2 transition-colors ${
                ticket?.is_redeemed
                  ? 'bg-success/10 border-success/30'
                  : ticket
                  ? 'bg-warning/10 border-warning/30'
                  : 'bg-muted/30 border-border border-dashed'
              }`}
            >
              <Ticket className={`w-6 h-6 sm:w-8 sm:h-8 ${
                ticket?.is_redeemed ? 'text-success' : ticket ? 'text-warning' : 'text-muted-foreground/30'
              }`} />
            </motion.div>
          );
        })}
      </div>

      {/* Create button */}
      {canCreate && (
        <Button onClick={() => setShowInvite(true)} className="btn-primary-gradient rounded-full mb-8">
          <Plus className="w-4 h-4 mr-2" /> Criar Golden Ticket
        </Button>
      )}

      {/* Tickets list */}
      {tickets.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-display font-bold text-foreground">Tickets Emitidos</h3>
          {tickets.map((ticket, i) => {
            const status = ticket.is_redeemed ? 'redeemed' : 
              (ticket.expires_at && new Date(ticket.expires_at) < new Date()) ? 'expired' : 'pending';
            const cfg = statusConfig[status];
            const StatusIcon = cfg.icon;
            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono font-bold text-foreground">{ticket.code}</code>
                      <Badge className={`text-[10px] ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {cfg.label}
                      </Badge>
                    </div>
                    {ticket.invited_email && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Send className="w-3 h-3" /> {ticket.invited_email}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Criado em {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                      {ticket.expires_at && ` • Expira em ${new Date(ticket.expires_at).toLocaleDateString('pt-BR')}`}
                    </p>
                  </div>
                  {status === 'pending' && (
                    <Button variant="outline" size="sm" onClick={() => copyLink(ticket)} className="flex-shrink-0">
                      {copiedId === ticket.id ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                      {copiedId === ticket.id ? 'Copiado!' : 'Copiar Link'}
                    </Button>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {tickets.length === 0 && (
        <Card className="glass-card p-12 sm:p-16 text-center">
          <div className="w-20 h-20 rounded-full bg-warning/10 mx-auto flex items-center justify-center mb-6">
            <Ticket className="w-10 h-10 text-warning" />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-2">Nenhum ticket criado</h3>
          <p className="text-muted-foreground mb-6">Crie Golden Tickets para convidar clínicas parceiras.</p>
          <Button onClick={() => setShowInvite(true)} className="btn-primary-gradient rounded-full">
            <Plus className="w-4 h-4 mr-2" /> Criar Primeiro Ticket
          </Button>
        </Card>
      )}

      {/* Invite Modal */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="glass-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Ticket className="w-5 h-5 text-warning" />
              Novo Golden Ticket
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-foreground">Email da Clínica (opcional)</Label>
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="clinica@email.com"
                className="input-premium mt-1.5"
                type="email"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se informado, o ticket ficará vinculado a este email.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
              <p className="text-sm text-muted-foreground">
                O ticket expira em <strong className="text-warning">30 dias</strong> e dá acesso ao plano B2B.
              </p>
            </div>
            <Button
              onClick={createTicket}
              disabled={creating}
              className="w-full btn-primary-gradient rounded-full"
            >
              {creating ? 'Criando...' : 'Gerar Golden Ticket'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
