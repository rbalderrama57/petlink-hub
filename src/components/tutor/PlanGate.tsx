import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Crown, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

interface PlanGateProps {
  isPremium: boolean;
  feature: string;
  children: React.ReactNode;
  /** 'overlay' blocks entirely with overlay, 'banner' shows content + banner, 'inline' shows inline lock */
  mode?: 'overlay' | 'banner' | 'inline';
  /** For banner mode: how many items to show before the banner */
  freeLimit?: number;
}

export function PlanGate({ isPremium, feature, children, mode = 'overlay' }: PlanGateProps) {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  if (isPremium) return <>{children}</>;

  if (mode === 'inline') {
    return (
      <button
        onClick={() => setShowModal(true)}
        className="w-full text-left"
      >
        <Card className="glass-card p-6 border-2 border-accent/20 hover:border-accent/40 transition-colors cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{feature}</p>
              <p className="text-sm text-muted-foreground">Disponível no plano Premium</p>
            </div>
            <Crown className="w-5 h-5 text-accent ml-auto" />
          </div>
        </Card>
        <UpgradeModal open={showModal} onClose={() => setShowModal(false)} feature={feature} />
      </button>
    );
  }

  if (mode === 'banner') {
    return (
      <>
        {children}
        <PlanGateBanner feature={feature} />
      </>
    );
  }

  // overlay mode
  return (
    <div className="relative">
      <div className="pointer-events-none opacity-30 blur-[2px] select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Card className="glass-card border-2 border-accent/30 p-10 text-center max-w-md mx-4">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5 rounded-xl" />
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-accent/10 mx-auto flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-2">
              Recurso Premium
            </h3>
            <p className="text-muted-foreground mb-6">
              <strong className="text-accent">{feature}</strong> está disponível no plano Premium por apenas <strong className="text-accent">R$ 14,90/mês</strong>.
            </p>
            <Button onClick={() => navigate('/planos/tutor')} className="btn-accent-gradient rounded-full px-8">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade para Premium
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function PlanGateBanner({ feature }: { feature: string }) {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
      <Card className="relative overflow-hidden border-2 border-accent/30">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent" />
        <div className="relative p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-accent/10 mx-auto flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-accent" />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-2">
            {feature}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Assine o <strong className="text-accent">Premium</strong> por apenas <strong className="text-accent">R$ 14,90/mês</strong> para desbloquear este recurso.
          </p>
          <Button onClick={() => navigate('/planos/tutor')} className="btn-accent-gradient rounded-full px-8">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade para Premium
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function UpgradeModal({ open, onClose, feature }: { open: boolean; onClose: () => void; feature: string }) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-accent/30 max-w-md">
        <DialogTitle className="sr-only">Upgrade para Premium</DialogTitle>
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-accent/10 mx-auto flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-2">Desbloqueie {feature}</h3>
          <p className="text-muted-foreground mb-6">
            Por apenas <strong className="text-accent">R$ 14,90/mês</strong>, tenha acesso completo a todos os recursos Premium.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => { onClose(); navigate('/planos/tutor'); }}
              className="btn-accent-gradient rounded-full px-8 w-full"
            >
              <Crown className="w-4 h-4 mr-2" />
              Ver Planos
            </Button>
            <Button variant="ghost" onClick={onClose} className="w-full text-muted-foreground">
              Agora não
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
