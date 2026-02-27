import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Stethoscope, Heart, Shield, Zap, Globe, Lock, 
  Upload, FileText, Bell, Search, Ticket, Star, ChevronDown,
  Check, Crown, Building2, Sparkles, PawPrint, QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export function LandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const howItWorks = [
    { step: '01', title: 'Crie sua conta', desc: 'Escolha seu perfil: Tutor ou Veterinário.', icon: PawPrint },
    { step: '02', title: 'Cadastre seus pets', desc: 'Adicione dados, microchip e vacinas.', icon: QrCode },
    { step: '03', title: 'Conecte-se', desc: 'Vet importa pacientes, tutor acessa o cofre.', icon: Globe },
  ];

  const tutorFeatures = [
    { icon: Shield, title: 'Cofre Digital', desc: 'Exames, laudos e documentos sempre seguros e acessíveis de qualquer lugar.' },
    { icon: Bell, title: 'Alertas Inteligentes', desc: 'Notificações de surtos, vacinas pendentes e campanhas na sua região.' },
    { icon: FileText, title: 'Carteirinha Digital', desc: 'Histórico completo de vacinação com status e próximas doses.' },
    { icon: Heart, title: 'Histórico Médico', desc: 'Consultas, prescrições e diagnósticos em um só lugar.' },
  ];

  const vetFeatures = [
    { icon: Stethoscope, title: 'Prontuário em 30s', desc: 'Registre consultas com velocidade recorde. Interface otimizada para produtividade.' },
    { icon: Upload, title: 'Importação Mágica', desc: 'Importe pacientes por CSV/Excel com mapeamento inteligente de colunas.' },
    { icon: Search, title: 'ID Universal', desc: 'Busca por microchip ISO 11784/11785, RGA e integração com SinPatinhas.' },
    { icon: Ticket, title: 'Golden Tickets', desc: 'Mecanismo viral: convide clínicas parceiras e cresça sua rede.' },
  ];

  const testimonials = [
    { name: 'Dra. Ana Costa', role: 'Veterinária, SP', text: 'A importação mágica mudou minha rotina. Migrei 300 pacientes em minutos.', avatar: '👩‍⚕️' },
    { name: 'Carlos Mendes', role: 'Tutor de 3 pets', text: 'Finalmente um app que me avisa das vacinas e guarda todos os exames.', avatar: '👨' },
    { name: 'Dra. Juliana Lima', role: 'Clínica VetCare, RJ', text: 'O prontuário rápido é fantástico. Meus atendimentos ficaram 40% mais ágeis.', avatar: '👩‍⚕️' },
  ];

  const faqs = [
    { q: 'O AMPET é gratuito?', a: 'Sim! Tutores podem usar gratuitamente com até 2 pets. Para acesso ilimitado, o plano Premium custa apenas R$ 14,90/mês.' },
    { q: 'Como funciona a importação de pacientes?', a: 'Veterinários podem importar planilhas CSV/Excel com dados de pacientes. Nosso sistema mapeia automaticamente as colunas.' },
    { q: 'Meus dados estão seguros?', a: 'Absolutamente. Utilizamos criptografia de ponta e infraestrutura cloud com certificações de segurança.' },
    { q: 'Posso integrar com o SinPatinhas?', a: 'Sim! O AMPET suporta busca por microchip ISO 11784/11785 e integração com bases governamentais.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como Funciona</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#precos" className="hover:text-foreground transition-colors">Preços</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')} className="text-muted-foreground">
              Entrar
            </Button>
            <Button onClick={() => navigate('/login')} className="btn-primary-gradient rounded-full px-6">
              Começar Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center max-w-4xl mx-auto">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Cofre Digital para Pets — Lançamento 2026
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold leading-[1.1] text-foreground">
              A saúde do seu pet,
              <span className="gradient-text block mt-2">protegida e conectada.</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="mt-8 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Prontuário digital, cofre de exames, identidade universal por microchip e alertas inteligentes. Tudo em uma plataforma premium.
            </motion.p>
            
            <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/login')} size="lg" className="btn-primary-gradient text-lg px-10 h-14 rounded-full shadow-glow">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button onClick={async () => {
                try {
                  const { supabase } = await import('@/integrations/supabase/client');
                  const { error } = await supabase.auth.signInWithPassword({ email: 'demo@ampet.com.br', password: 'demo123456' });
                  if (error) {
                    navigate('/login');
                  } else {
                    navigate('/app/tutor/dashboard');
                  }
                } catch { navigate('/login'); }
              }} size="lg" variant="outline" className="text-lg px-10 h-14 rounded-full border-border/50">
                Ver Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-24 border-t border-border/30">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-primary font-medium mb-3">Como Funciona</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl font-display font-bold text-foreground">Simples como deve ser</motion.h2>
          </motion.div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorks.map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <span className="text-primary/50 font-display text-sm font-bold">{item.step}</span>
                <h3 className="text-xl font-display font-bold text-foreground mt-1">{item.title}</h3>
                <p className="text-muted-foreground mt-2">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Tutor */}
      <section id="features" className="py-24 bg-secondary/20 border-t border-border/30">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-3">
              <Heart className="w-6 h-6 text-accent" />
              <p className="text-accent font-medium">Para Tutores</p>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl font-display font-bold text-foreground mb-12">
              Tudo que seu pet precisa,<br />na palma da mão.
            </motion.h2>
          </motion.div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tutorFeatures.map((f, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="glass-card p-6 h-full hover:border-accent/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Vet */}
      <section className="py-24 border-t border-border/30">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-3">
              <Stethoscope className="w-6 h-6 text-primary" />
              <p className="text-primary font-medium">Para Veterinários</p>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl font-display font-bold text-foreground mb-12">
              Gerencie sua clínica<br />com eficiência máxima.
            </motion.h2>
          </motion.div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vetFeatures.map((f, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="glass-card p-6 h-full hover:border-primary/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Preços Resumidos */}
      <section id="precos" className="py-24 bg-secondary/20 border-t border-border/30">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-primary font-medium mb-3">Preços</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl font-display font-bold text-foreground">Planos para cada necessidade</motion.h2>
          </motion.div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <motion.div variants={fadeUp}>
              <Card className="glass-card p-8 border-accent/30 hover:shadow-glow transition-all">
                <Heart className="w-8 h-8 text-accent mb-4" />
                <h3 className="text-2xl font-display font-bold text-foreground">Premium Tutor</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-display font-extrabold text-foreground">R$ 14,90</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Pets ilimitados', 'Cofre Digital completo', 'Alertas em tempo real', 'Histórico médico'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-accent flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button onClick={() => navigate('/planos/tutor')} className="w-full btn-accent-gradient rounded-full h-12">
                  Ver Plano Tutor
                </Button>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeUp}>
              <Card className="glass-card p-8 border-primary/30 hover:shadow-glow transition-all relative">
                <div className="absolute -top-3 right-6">
                  <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">B2B</span>
                </div>
                <Building2 className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-2xl font-display font-bold text-foreground">Clínicas</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-display font-extrabold text-foreground">R$ 199</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Pacientes ilimitados', 'Importação CSV mágica', 'Prontuário rápido', 'Golden Tickets'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button onClick={() => navigate('/planos/veterinario')} className="w-full btn-primary-gradient rounded-full h-12">
                  Ver Plano Clínicas
                </Button>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-24 border-t border-border/30">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-primary font-medium mb-3">Depoimentos</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl font-display font-bold text-foreground">O que dizem sobre nós</motion.h2>
          </motion.div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="glass-card p-6 h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-warning fill-warning" />)}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{t.avatar}</span>
                    <div>
                      <p className="font-medium text-foreground text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-secondary/20 border-t border-border/30">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-primary font-medium mb-3">FAQ</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl font-display font-bold text-foreground">Perguntas Frequentes</motion.h2>
          </motion.div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left glass-card rounded-xl p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </div>
                  {openFaq === i && (
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  )}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/30">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo size="sm" />
            <p className="text-muted-foreground text-sm">© 2026 AMPET. Cofre Digital para Pets.</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
              <a href="#" className="hover:text-foreground transition-colors">Termos</a>
              <a href="#" className="hover:text-foreground transition-colors">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
