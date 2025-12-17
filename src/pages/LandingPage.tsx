import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Stethoscope, Heart, Shield, Zap, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: Stethoscope, title: 'Prontuário Rápido', desc: 'Consultas registradas em menos de 30 segundos' },
    { icon: Globe, title: 'ID Universal', desc: 'Microchip ISO e RGA integrados ao sistema' },
    { icon: Shield, title: 'Cofre Digital', desc: 'Exames e documentos sempre seguros e acessíveis' },
    { icon: Zap, title: 'Alertas Inteligentes', desc: 'Notificações de surtos e vacinas em tempo real' },
  ];

  return (
    <div className="min-h-screen hero-gradient">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex items-center justify-between">
        <Logo size="md" />
        <Button onClick={() => navigate('/auth')} variant="outline" className="rounded-full">
          Entrar
        </Button>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-6 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            O Hub que conecta a
            <span className="gradient-text block">saúde do seu pet</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Conectamos veterinários, tutores e dados de saúde em uma plataforma integrada, intuitiva e segura.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/auth')} size="lg" className="btn-primary-gradient text-lg px-8 h-14 rounded-full">
              Começar Agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-lg">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 text-center text-muted-foreground text-sm border-t border-border">
        © 2024 Ampet. Hub de Saúde Pet.
      </footer>
    </div>
  );
}
