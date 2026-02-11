import { motion } from 'framer-motion';
import { Check, Crown, Building2, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const plans = [
  {
    name: 'Gratuito',
    slug: 'free',
    price: 'R$ 0',
    period: '/mês',
    description: 'Para tutores que querem começar',
    icon: Sparkles,
    features: ['Até 2 pets', 'Carteirinha de Vacinação', 'Alertas de Saúde', 'Cofre Digital básico'],
    cta: 'Plano Atual',
    disabled: true,
    popular: false,
    gradient: 'from-secondary to-secondary/80',
  },
  {
    name: 'Premium',
    slug: 'b2c-premium',
    price: 'R$ 14,90',
    period: '/mês',
    description: 'Para tutores que amam seus pets',
    icon: Crown,
    features: ['Pets ilimitados', 'Cofre Digital completo', 'Histórico completo de consultas', 'Suporte prioritário', 'Exportação de dados', 'Compartilhamento com vet'],
    cta: 'Assinar Premium',
    disabled: false,
    popular: true,
    gradient: 'from-primary to-primary/80',
  },
  {
    name: 'Clínicas B2B',
    slug: 'b2b-clinicas',
    price: 'R$ 199',
    period: '/mês',
    description: 'Para clínicas veterinárias',
    icon: Building2,
    features: ['Pacientes ilimitados', 'Importação Mágica CSV', 'Prontuário rápido (<30s)', 'Convites automáticos WhatsApp', 'Golden Tickets (viral)', 'Dashboard analítico', 'API de integração', 'Suporte dedicado'],
    cta: 'Começar Trial B2B',
    disabled: false,
    popular: false,
    gradient: 'from-accent to-accent/80',
  },
];

export function PlansPage() {
  const { toast } = useToast();

  const handleSubscribe = (planSlug: string) => {
    toast({
      title: '🚀 Em breve!',
      description: 'O sistema de pagamentos será ativado em breve. Você é um Early Adopter!',
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Zap className="w-4 h-4" /> Planos Ampet
        </span>
        <h1 className="text-4xl font-bold text-foreground mb-3">Escolha o plano ideal</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Do tutor dedicado à clínica veterinária. Temos o plano perfeito para cada necessidade.
        </p>
      </motion.div>

      {/* Early Adopter Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-4 mb-8 border-primary/30 bg-primary/5 text-center">
          <p className="text-foreground font-medium">
            🏆 <strong>Programa Early Adopter</strong> — Os primeiros 50 assinantes ganham <span className="text-primary font-bold">3 meses grátis</span> em qualquer plano!
          </p>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.slug}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 * index }}
          >
            <Card className={`relative p-6 h-full flex flex-col ${plan.popular ? 'border-2 border-primary shadow-xl shadow-primary/10' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4`}>
                <plan.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>

              <div className="my-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.slug)}
                disabled={plan.disabled}
                className={`w-full mt-6 h-12 ${plan.popular ? 'btn-primary-gradient' : plan.slug === 'b2b-clinicas' ? 'btn-accent-gradient' : ''}`}
                variant={plan.disabled ? 'secondary' : plan.popular || plan.slug === 'b2b-clinicas' ? 'default' : 'outline'}
              >
                {plan.cta}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
