import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Copy, Plus, Gift, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface GoldenTicket {
  id: string;
  code: string;
  isRedeemed: boolean;
  createdAt: string;
  redeemedBy?: string;
}

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'AMPET-';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) code += '-';
  }
  return code;
};

export function GoldenTickets() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<GoldenTicket[]>([
    { id: '1', code: 'AMPET-VK4M-H7NP', isRedeemed: true, createdAt: '2025-01-15', redeemedBy: 'Clínica PetCare' },
    { id: '2', code: 'AMPET-B9XT-W2LJ', isRedeemed: false, createdAt: '2025-02-01' },
  ]);

  const createTicket = () => {
    const newTicket: GoldenTicket = {
      id: Date.now().toString(),
      code: generateCode(),
      isRedeemed: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTickets(prev => [newTicket, ...prev]);
    toast({ title: '🎫 Golden Ticket gerado!', description: `Código: ${newTicket.code}` });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copiado!', description: 'Código copiado para a área de transferência.' });
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Ticket className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Golden Tickets</h1>
            <p className="text-muted-foreground">Convide outras clínicas e ganhe benefícios exclusivos</p>
          </div>
        </div>
      </motion.div>

      {/* Viral CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent/80 to-primary/60" />
          <div className="relative z-10 p-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">Programa de Indicação Viral</h2>
                <p className="text-white/80 mb-4">
                  Cada Golden Ticket é um convite exclusivo para outra clínica. 
                  Quando resgatado, ambas as clínicas ganham <strong>1 mês grátis</strong> do plano B2B.
                </p>
                <div className="flex gap-3">
                  <Button onClick={createTicket} className="bg-white text-accent hover:bg-white/90 font-semibold">
                    <Plus className="w-4 h-4 mr-2" /> Gerar Golden Ticket
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-white">{tickets.length}</p>
                <p className="text-white/70 text-sm">Tickets gerados</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-white">{tickets.filter(t => t.isRedeemed).length}</p>
                <p className="text-white/70 text-sm">Resgatados</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-white">{tickets.filter(t => t.isRedeemed).length}</p>
                <p className="text-white/70 text-sm">Meses ganhos</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tickets List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Seus Tickets
        </h3>
        <div className="space-y-3">
          {tickets.map((ticket, idx) => (
            <motion.div key={ticket.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * idx }}>
              <Card className={`p-4 flex items-center gap-4 ${ticket.isRedeemed ? 'border-success/30 bg-success/5' : 'hover:border-primary/30 transition-colors'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ticket.isRedeemed ? 'bg-success/20' : 'bg-accent/20'}`}>
                  {ticket.isRedeemed ? <CheckCircle className="w-5 h-5 text-success" /> : <Ticket className="w-5 h-5 text-accent" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-bold text-foreground tracking-wider">{ticket.code}</p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.isRedeemed ? `Resgatado por ${ticket.redeemedBy}` : `Criado em ${ticket.createdAt}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${ticket.isRedeemed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {ticket.isRedeemed ? 'Resgatado' : 'Pendente'}
                  </span>
                  {!ticket.isRedeemed && (
                    <Button size="sm" variant="ghost" onClick={() => copyCode(ticket.code)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
