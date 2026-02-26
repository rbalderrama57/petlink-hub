import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Search, PawPrint, User, Syringe, Clock, Terminal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SearchResult {
  pet: any;
  tutor: any;
  vaccines: any[];
  timestamp: string;
}

export function VetMicrochipPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [history, setHistory] = useState<{ query: string; petName: string | null; time: string }[]>([]);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearching(true);
    setResult(null);
    setNotFound(false);

    // Simulate terminal delay
    await new Promise(r => setTimeout(r, 600));

    const { data: petData } = await supabase
      .from('pets')
      .select('*, profiles:tutor_id(full_name, email, phone)')
      .eq('microchip_id', trimmed)
      .maybeSingle();

    const now = new Date().toISOString();

    if (!petData) {
      setNotFound(true);
      setHistory(h => [{ query: trimmed, petName: null, time: now }, ...h.slice(0, 19)]);
      toast({ title: 'Microchip não encontrado', description: `Nenhum pet com ID ${trimmed}`, variant: 'destructive' });
    } else {
      const { data: vaccines } = await supabase
        .from('vaccines')
        .select('*')
        .eq('pet_id', petData.id)
        .order('applied_date', { ascending: false });

      setResult({ pet: petData, tutor: petData.profiles, vaccines: vaccines || [], timestamp: now });
      setHistory(h => [{ query: trimmed, petName: petData.name, time: now }, ...h.slice(0, 19)]);
      toast({ title: 'Pet localizado ✅', description: petData.name });
    }
    setSearching(false);
  };

  const speciesEmoji: Record<string, string> = { dog: '🐕', cat: '🐱', bird: '🐦', other: '🐾' };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Cpu className="w-8 h-8 text-primary" /> Busca por Microchip
        </h1>
        <p className="text-muted-foreground mt-1">Consulte a ficha completa de um pet pelo número do microchip</p>
      </motion.div>

      {/* Terminal search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        <div className="px-4 py-2 bg-muted/50 border-b border-border flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-warning/60" />
            <div className="w-3 h-3 rounded-full bg-success/60" />
          </div>
          <span className="text-xs text-muted-foreground font-mono ml-2">ampet:microchip-scanner</span>
        </div>
        <div className="p-6 font-mono text-sm space-y-3" style={{ background: 'hsl(var(--background))' }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Terminal className="w-4 h-4" />
            <span>AMPET Microchip Scanner v1.0</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary">$</span>
            <span className="text-muted-foreground">scan --id</span>
            <div className="flex-1 flex gap-2">
              <Input
                className="flex-1 font-mono bg-transparent border-none shadow-none h-8 px-1 text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-0"
                placeholder="Digite o número do microchip..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <Button size="sm" onClick={handleSearch} disabled={searching} className="btn-primary-gradient rounded-lg h-8 px-4 font-mono text-xs">
                {searching ? '...' : 'SCAN'}
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {searching && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-primary">
                {'>'} Buscando registro... <span className="animate-pulse">█</span>
              </motion.div>
            )}
            {notFound && !searching && (
              <motion.div key="notfound" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive">
                {'>'} ERR: Nenhum registro encontrado para "{query}"
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Pet Card */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl shrink-0">
                  {speciesEmoji[result.pet.species] || '🐾'}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-foreground">{result.pet.name}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{result.pet.species === 'dog' ? 'Cão' : result.pet.species === 'cat' ? 'Gato' : result.pet.species === 'bird' ? 'Ave' : 'Outro'}</Badge>
                    {result.pet.breed && <Badge variant="outline" className="text-xs">{result.pet.breed}</Badge>}
                    {result.pet.sex && <Badge variant="outline" className="text-xs">{result.pet.sex === 'male' ? '♂ Macho' : result.pet.sex === 'female' ? '♀ Fêmea' : result.pet.sex}</Badge>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  { label: 'Microchip', value: result.pet.microchip_id },
                  { label: 'RGA', value: result.pet.rga_id || '—' },
                  { label: 'Nascimento', value: result.pet.birth_date ? format(new Date(result.pet.birth_date), 'dd/MM/yyyy') : '—' },
                  { label: 'Peso', value: result.pet.weight ? `${result.pet.weight} kg` : '—' },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tutor Card */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Tutor</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="text-sm text-foreground">{result.tutor?.full_name || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground truncate">{result.tutor?.email || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="text-sm text-foreground">{result.tutor?.phone || '—'}</p>
                </div>
              </div>
            </div>

            {/* Vaccines */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Syringe className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Vacinas ({result.vaccines.length})</h3>
              </div>
              {result.vaccines.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma vacina registrada</p>
              ) : (
                <div className="space-y-2">
                  {result.vaccines.slice(0, 10).map(v => (
                    <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                      <div>
                        <p className="text-sm font-medium text-foreground">{v.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.applied_date ? format(new Date(v.applied_date), 'dd/MM/yyyy') : 'Não aplicada'}
                          {v.batch_number && ` · Lote ${v.batch_number}`}
                        </p>
                      </div>
                      <Badge variant="outline" className={v.vaccine_type === 'government' ? 'text-warning border-warning/30' : 'text-primary border-primary/30'}>
                        {v.vaccine_type === 'government' ? 'Obrigatória' : 'Opcional'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search History */}
      {history.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Histórico de buscas</h3>
          </div>
          <div className="space-y-1">
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => { setQuery(h.query); }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors text-left"
              >
                <span className="text-sm font-mono text-foreground">{h.query}</span>
                <div className="flex items-center gap-2">
                  {h.petName ? (
                    <Badge variant="outline" className="text-xs text-primary border-primary/30">{h.petName}</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-destructive border-destructive/30">Não encontrado</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{format(new Date(h.time), 'HH:mm')}</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
