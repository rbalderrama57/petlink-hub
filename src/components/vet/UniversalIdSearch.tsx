import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, CheckCircle, XCircle, Copy, ExternalLink, FileText, QrCode, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { fetchPetByUniversalId, mockPetDatabase } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import type { MockPetData } from '@/types';
import { QRCodeSVG } from 'qrcode.react';

// ISO 11784/11785 validation: exactly 15 digits
const isISO11784 = (id: string) => /^\d{15}$/.test(id.trim());
const isRGA = (id: string) => /^RGA-/i.test(id.trim());

interface SinPatinhasResult extends MockPetData {
  registration_source: string;
  microchip_id?: string;
  rga_id?: string;
  tutor_name?: string;
  tutor_cpf?: string;
  city?: string;
  state?: string;
}

export function UniversalIdSearch() {
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SinPatinhasResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showRGAnimal, setShowRGAnimal] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchId.trim()) {
      toast({ title: 'ID obrigatório', description: 'Digite um ID de microchip (ISO 11784/11785) ou RGA.', variant: 'destructive' });
      return;
    }

    const trimmed = searchId.trim();

    // Validate ISO format
    if (!isISO11784(trimmed) && !isRGA(trimmed)) {
      toast({
        title: 'Formato inválido',
        description: 'Use microchip ISO 11784/11785 (15 dígitos) ou RGA (ex: RGA-SP-001234).',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setNotFound(false);
    setShowRGAnimal(false);

    // Simulate SinPatinhas (Gov.br) integration
    const pet = await fetchPetByUniversalId(trimmed);

    if (pet) {
      const sinPatinhasData: SinPatinhasResult = {
        ...pet,
        registration_source: isRGA(trimmed) ? 'SinPatinhas' : 'Microchip ISO',
        microchip_id: isISO11784(trimmed) ? trimmed : undefined,
        rga_id: isRGA(trimmed) ? trimmed : undefined,
        tutor_name: ['Maria Silva', 'João Santos', 'Ana Oliveira', 'Carlos Lima', 'Pedro Costa'][Math.floor(Math.random() * 5)],
        tutor_cpf: '***.***.***-' + Math.floor(Math.random() * 100).toString().padStart(2, '0'),
        city: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba'][Math.floor(Math.random() * 4)],
        state: ['SP', 'RJ', 'MG', 'PR'][Math.floor(Math.random() * 4)],
      };
      setResult(sinPatinhasData);
      toast({ title: '✅ Pet encontrado via SinPatinhas!', description: `${pet.name} localizado no sistema Gov.br.` });
    } else {
      setNotFound(true);
      toast({ title: 'Não encontrado', description: 'Nenhum registro no SinPatinhas para este ID.', variant: 'destructive' });
    }

    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado!', description: 'Texto copiado.' });
  };

  const exampleIds = Object.keys(mockPetDatabase).slice(0, 3);

  const rgAnimalUrl = result ? `https://ampet.app/rg/${searchId}` : '';

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Identidade Universal</h1>
            <p className="text-muted-foreground">Busca ISO 11784/11785 • Ponte SinPatinhas (Gov.br)</p>
          </div>
        </div>
      </motion.div>

      {/* Search Box */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-card p-8">
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Microchip ISO (15 dígitos) ou RGA..."
                className="input-premium pl-12 pr-4 h-14 text-lg font-mono"
              />
            </div>

            <div className="flex gap-2 mt-3">
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">ISO 11784/11785</span>
              <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent font-medium">RGA Nacional</span>
              <span className="text-xs px-2 py-1 rounded-full bg-info/10 text-info font-medium">SinPatinhas</span>
            </div>

            <Button onClick={handleSearch} disabled={loading} className="w-full mt-4 h-12 btn-primary-gradient">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Search className="w-5 h-5 mr-2" />}
              Buscar no SinPatinhas
            </Button>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">IDs de teste:</p>
              <div className="flex flex-wrap gap-2">
                {exampleIds.map((id) => (
                  <button key={id} onClick={() => setSearchId(id)} className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-mono hover:bg-secondary/80 transition-colors">
                    {id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div key="result" initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} className="mt-6 space-y-4">
            <Card className="glass-card p-6 border-success/50">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-foreground">{result.name}</h3>
                    <span className="alert-badge alert-badge-success">SinPatinhas ✓</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Fonte: <span className="font-medium text-primary">{result.registration_source}</span>
                  </p>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Espécie / Raça</p>
                        <p className="font-medium text-foreground">{result.species === 'dog' ? 'Cão' : result.species === 'cat' ? 'Gato' : result.species} • {result.breed}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Nascimento</p>
                        <p className="font-medium text-foreground">{new Date(result.birth_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Tutor</p>
                        <p className="font-medium text-foreground">{result.tutor_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">CPF</p>
                        <p className="font-medium text-foreground">{result.tutor_cpf}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Localidade</p>
                        <p className="font-medium text-foreground">{result.city} - {result.state}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">ID</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground font-mono text-sm">{searchId}</p>
                          <button onClick={() => copyToClipboard(searchId)} className="p-1 hover:bg-secondary rounded">
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <Button className="btn-primary-gradient">Importar para Consulta</Button>
                    <Button variant="outline" onClick={() => setShowRGAnimal(!showRGAnimal)}>
                      <QrCode className="w-4 h-4 mr-2" />
                      {showRGAnimal ? 'Fechar' : 'Gerar'} RG Animal
                    </Button>
                    <Button variant="outline">
                      Ver Histórico <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* RG Animal PDF Preview */}
            <AnimatePresence>
              {showRGAnimal && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <Card className="p-8 border-2 border-primary/20" id="rg-animal">
                    <div className="max-w-md mx-auto">
                      <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Shield className="w-6 h-6 text-primary" />
                          <h2 className="text-xl font-bold gradient-text">RG Animal</h2>
                        </div>
                        <p className="text-xs text-muted-foreground">Registro Geral de Identificação Animal • Ampet</p>
                        <div className="w-20 h-0.5 bg-primary/30 mx-auto mt-2" />
                      </div>

                      <div className="flex gap-6">
                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Nome</p>
                            <p className="font-bold text-foreground text-lg">{result.name}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Espécie</p>
                              <p className="font-medium text-foreground">{result.species === 'dog' ? 'Canino' : result.species === 'cat' ? 'Felino' : result.species}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Raça</p>
                              <p className="font-medium text-foreground">{result.breed}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Nascimento</p>
                              <p className="font-medium text-foreground">{new Date(result.birth_date).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">ID</p>
                              <p className="font-medium text-foreground font-mono text-xs">{searchId.slice(0, 10)}...</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Tutor Responsável</p>
                            <p className="font-medium text-foreground">{result.tutor_name}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <QRCodeSVG value={rgAnimalUrl} size={120} level="M" bgColor="transparent" fgColor="hsl(190, 80%, 35%)" />
                          <p className="text-[9px] text-muted-foreground mt-2 text-center">Escaneie para<br />verificar</p>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                        <p className="text-[10px] text-muted-foreground">Emitido em {new Date().toLocaleDateString('pt-BR')} via Ampet</p>
                        <Button size="sm" variant="outline" onClick={() => window.print()}>
                          <FileText className="w-3 h-3 mr-1" /> Imprimir PDF
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {notFound && (
          <motion.div key="not-found" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6">
            <Card className="glass-card p-6 border-destructive/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Pet não encontrado no SinPatinhas</h3>
                  <p className="text-muted-foreground mt-1">Nenhum registro Gov.br para o ID "{searchId}".</p>
                  <p className="text-sm text-muted-foreground mt-2">Verifique o número ou cadastre manualmente.</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
