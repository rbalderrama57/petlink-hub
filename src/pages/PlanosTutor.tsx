import { motion } from 'framer-motion';
import { Check, Heart, ArrowLeft, Shield, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { useToast } from '@/hooks/use-toast';

const plans = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    desc: 'Para começar a cuidar',
    icon: Sparkles,
    popular: false,
    features: ['Até 2 pets', 'Carteirinha de vacinação', 'Alertas de saúde', 'Cofre Digital básico (100MB)'],
    cta: 'Criar Conta Grátis',
    gradient: 'from-secondary to-secondary/80',
  },
  {
    name: 'Premium',
    price: 'R$ 14,90',
    period: '/mês',
    desc: 'Para quem ama seus pets',
    icon: Crown,
    popular: true,
    features: [
      'Pets ilimitados',
      'Cofre Digital completo (5GB)',
      'Histórico completo de consultas',
      'Prescrições e diagnósticos',
      'Compartilhamento com vet',
      'Exportação de dados em PDF',
      'Suporte prioritário',
      'RG Animal com QR Code',
    ],
    cta: 'Assinar Premium',
    gradient: 'from-accent to-accent/80',
  },
];

export function PlanosTutor() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscribe = () => {
    toast({
      title: '🚀 Em breve!',
      description: 'O sistema de pagamentos será ativado em breve. Você é um Early Adopter!',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Logo size="sm" />
        </div>
        <Button variant="ghost" onClick={() => navigate('/login')}>Entrar</Button>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Heart className="w-4 h-4" /> Planos para Tutores
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-3">Cuide de quem você ama</h1>
          <p className="text-muted-foreground text-lg">Escolha o plano ideal para acompanhar a saúde do seu pet.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-4 mb-8 border-primary/30 bg-primary/5 text-center">
            <p className="text-foreground font-medium text-sm">
              🏆 <strong>Early Adopter</strong> — Os primeiros 50 assinantes ganham <span className="text-primary font-bold">3 meses grátis</span>!
            </p>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * i }}>
              <Card className={`relative p-8 h-full flex flex-col ${plan.popular ? 'border-2 border-accent shadow-xl shadow-accent/10' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold shadow-lg">Recomendado</span>
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4`}>
                  <plan.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
                <div className="my-6">
                  <span className="text-4xl font-display font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-3 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={plan.popular ? handleSubscribe : () => navigate('/login')}
                  className={`w-full mt-6 h-12 rounded-full ${plan.popular ? 'btn-accent-gradient' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
