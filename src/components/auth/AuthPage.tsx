import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Building2, ArrowRight, Stethoscope, Heart, ArrowLeft, BadgeCheck } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/types';

const authSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(100),
  fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100).optional(),
});

type SignupStep = 'role' | 'form';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [signupStep, setSignupStep] = useState<SignupStep>('role');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [crmv, setCrmv] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateForm = () => {
    try {
      if (isLogin) {
        authSchema.pick({ email: true, password: true }).parse({ email, password });
      } else {
        authSchema.parse({ email, password, fullName });
      }
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) {
            newErrors[e.path[0] as string] = e.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!isLogin && !selectedRole) {
      toast({
        title: 'Selecione seu perfil',
        description: 'Escolha se você é Tutor ou Veterinário.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Credenciais inválidas',
              description: 'Email ou senha incorretos. Verifique e tente novamente.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Erro ao entrar',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Bem-vindo de volta!',
            description: 'Login realizado com sucesso.',
          });
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUp(email, password, fullName, selectedRole!);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Email já cadastrado',
              description: 'Este email já está em uso. Tente fazer login ou use outro email.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Erro ao criar conta',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Conta criada!',
            description: 'Sua conta foi criada com sucesso. Redirecionando...',
          });
          navigate('/dashboard');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setSignupStep('form');
  };

  const resetToRoleSelection = () => {
    setSignupStep('role');
    setSelectedRole(null);
    setFullName('');
    setClinicName('');
    setCrmv('');
    setEmail('');
    setPassword('');
  };

  const switchToSignup = () => {
    setIsLogin(false);
    setSignupStep('role');
    setSelectedRole(null);
    setErrors({});
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setSignupStep('role');
    setSelectedRole(null);
    setErrors({});
  };

  // Show role selection for signup
  const showRoleSelection = !isLogin && signupStep === 'role';

  return (
    <div className="min-h-screen flex hero-gradient">
      {/* Left Side - Branding (hidden on role selection) */}
      {!showRoleSelection && (
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
          <div className="relative z-10 flex flex-col justify-center p-12 xl:p-20">
            <Logo size="lg" />
            
            <div className="mt-12">
              <h1 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight">
                {selectedRole === 'vet' ? (
                  <>
                    Gerencie sua clínica
                    <br />
                    <span className="gradient-text">com eficiência</span>
                  </>
                ) : (
                  <>
                    O Hub que conecta
                    <br />
                    <span className="gradient-text">a saúde do seu pet</span>
                  </>
                )}
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-md">
                {selectedRole === 'vet' 
                  ? 'Prontuário rápido, busca por microchip, importação de pacientes e muito mais.'
                  : 'Conectamos veterinários, tutores e dados de saúde em uma plataforma integrada e intuitiva.'}
              </p>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-6">
              {selectedRole === 'vet' ? (
                <>
                  <div className="glass-card p-4 rounded-2xl">
                    <Stethoscope className="w-8 h-8 text-primary mb-2" />
                    <p className="font-medium text-foreground">Consulta em 30s</p>
                    <p className="text-sm text-muted-foreground">Prontuário ultra-rápido</p>
                  </div>
                  <div className="glass-card p-4 rounded-2xl">
                    <BadgeCheck className="w-8 h-8 text-primary mb-2" />
                    <p className="font-medium text-foreground">ID Universal</p>
                    <p className="text-sm text-muted-foreground">Microchip integrado</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="glass-card p-4 rounded-2xl">
                    <Heart className="w-8 h-8 text-accent mb-2" />
                    <p className="font-medium text-foreground">Carteirinha Digital</p>
                    <p className="text-sm text-muted-foreground">Vacinas em dia</p>
                  </div>
                  <div className="glass-card p-4 rounded-2xl">
                    <Building2 className="w-8 h-8 text-accent mb-2" />
                    <p className="font-medium text-foreground">Cofre Digital</p>
                    <p className="text-sm text-muted-foreground">Exames seguros</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        </div>
      )}

      {/* Right Side - Content */}
      <div className={`flex-1 flex items-center justify-center p-6 lg:p-12 ${showRoleSelection ? 'w-full' : ''}`}>
        
        {/* Role Selection Screen */}
        {showRoleSelection && (
          <div className="w-full max-w-lg animate-fade-in">
            <div className="text-center mb-10">
              <Logo size="lg" />
              <h2 className="text-3xl font-bold text-foreground mt-8">
                Bem-vindo ao Ampet!
              </h2>
              <p className="text-muted-foreground mt-2 text-lg">
                Escolha seu perfil para começar
              </p>
            </div>

            <div className="grid gap-4">
              {/* Tutor Option */}
              <button
                type="button"
                onClick={() => handleRoleSelect('tutor')}
                className="relative overflow-hidden group p-6 rounded-2xl border-2 border-border bg-card hover:border-accent transition-all duration-300 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-7 h-7 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">Sou Tutor</h3>
                    <p className="text-muted-foreground mt-1">
                      Quero acompanhar a saúde do meu pet, ver vacinas, exames e receber alertas.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2 py-1 rounded-lg bg-accent/10 text-accent text-xs font-medium">Carteirinha Digital</span>
                      <span className="px-2 py-1 rounded-lg bg-accent/10 text-accent text-xs font-medium">Cofre de Exames</span>
                      <span className="px-2 py-1 rounded-lg bg-accent/10 text-accent text-xs font-medium">Alertas</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </button>

              {/* Vet Option */}
              <button
                type="button"
                onClick={() => handleRoleSelect('vet')}
                className="relative overflow-hidden group p-6 rounded-2xl border-2 border-border bg-card hover:border-primary transition-all duration-300 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">Sou Veterinário</h3>
                    <p className="text-muted-foreground mt-1">
                      Quero gerenciar minha clínica, registrar consultas e conectar com tutores.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">Prontuário Rápido</span>
                      <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">ID Universal</span>
                      <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">Importar CSV</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            </div>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={switchToLogin}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Já tem conta? Entrar
              </button>
            </div>
          </div>
        )}

        {/* Form Screen */}
        {!showRoleSelection && (
          <div className="w-full max-w-md animate-fade-in">
            <div className="lg:hidden mb-8">
              <Logo size="md" />
            </div>

            <div className="glass-card rounded-3xl p-8 shadow-xl">
              {/* Header */}
              <div className="mb-8">
                {!isLogin && selectedRole && (
                  <button
                    type="button"
                    onClick={resetToRoleSelection}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                  </button>
                )}
                
                <div className="flex items-center gap-3">
                  {!isLogin && selectedRole && (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedRole === 'vet' ? 'bg-primary/20' : 'bg-accent/20'
                    }`}>
                      {selectedRole === 'vet' ? (
                        <Stethoscope className="w-6 h-6 text-primary" />
                      ) : (
                        <Heart className="w-6 h-6 text-accent" />
                      )}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {isLogin ? 'Entrar na conta' : selectedRole === 'vet' ? 'Cadastro Veterinário' : 'Cadastro Tutor'}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {isLogin
                        ? 'Acesse sua conta para continuar'
                        : selectedRole === 'vet' 
                          ? 'Gerencie sua clínica com o Ampet'
                          : 'Cuide da saúde do seu pet'}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name field - signup only */}
                {!isLogin && (
                  <div>
                    <Label htmlFor="fullName" className="text-foreground">
                      {selectedRole === 'vet' ? 'Nome completo (Dr./Dra.)' : 'Seu nome'}
                    </Label>
                    <div className="relative mt-2">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="input-premium pl-11"
                        placeholder={selectedRole === 'vet' ? 'Dr. João Silva' : 'Maria Santos'}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-destructive text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>
                )}

                {/* Vet-specific fields */}
                {!isLogin && selectedRole === 'vet' && (
                  <>
                    <div>
                      <Label htmlFor="clinicName" className="text-foreground">Nome da Clínica (opcional)</Label>
                      <div className="relative mt-2">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="clinicName"
                          type="text"
                          value={clinicName}
                          onChange={(e) => setClinicName(e.target.value)}
                          className="input-premium pl-11"
                          placeholder="Clínica Vet Care"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="crmv" className="text-foreground">CRMV (opcional)</Label>
                      <div className="relative mt-2">
                        <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="crmv"
                          type="text"
                          value={crmv}
                          onChange={(e) => setCrmv(e.target.value)}
                          className="input-premium pl-11"
                          placeholder="CRMV-SP 12345"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-premium pl-11"
                      placeholder="seu@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-destructive text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="text-foreground">Senha</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-premium pl-11 pr-11"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-destructive text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-12 rounded-xl text-base font-medium ${
                    selectedRole === 'vet' || isLogin ? 'btn-primary-gradient' : 'btn-accent-gradient'
                  }`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      {isLogin ? 'Entrar' : 'Criar conta'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={isLogin ? switchToSignup : switchToLogin}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {isLogin ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
