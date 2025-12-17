import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, CheckCircle, XCircle, Copy, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { fetchPetByUniversalId, mockPetDatabase } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import type { MockPetData } from '@/types';

export function UniversalIdSearch() {
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MockPetData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchId.trim()) {
      toast({
        title: 'ID obrigatório',
        description: 'Digite um ID de microchip ou RGA para buscar.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setNotFound(false);

    const pet = await fetchPetByUniversalId(searchId.trim());
    
    if (pet) {
      setResult(pet);
      toast({
        title: 'Pet encontrado!',
        description: `${pet.name} foi localizado no sistema.`,
      });
    } else {
      setNotFound(true);
      toast({
        title: 'Não encontrado',
        description: 'Nenhum pet com este ID foi encontrado no sistema.',
        variant: 'destructive',
      });
    }
    
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: 'Texto copiado para a área de transferência.',
    });
  };

  const exampleIds = Object.keys(mockPetDatabase).slice(0, 3);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground">Buscar ID Universal</h1>
        <p className="text-muted-foreground mt-1">
          Localize um pet pelo número do microchip ISO ou RGA
        </p>
      </motion.div>

      {/* Search Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card p-8">
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Digite o Microchip ISO ou RGA..."
                className="input-premium pl-12 pr-4 h-14 text-lg"
              />
            </div>
            
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="w-full mt-4 h-12 btn-primary-gradient"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Search className="w-5 h-5 mr-2" />
              )}
              Buscar Pet
            </Button>

            {/* Example IDs */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">IDs de exemplo para teste:</p>
              <div className="flex flex-wrap gap-2">
                {exampleIds.map((id) => (
                  <button
                    key={id}
                    onClick={() => setSearchId(id)}
                    className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
                  >
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
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <Card className="glass-card p-6 border-success/50">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-foreground">{result.name}</h3>
                    <span className="alert-badge alert-badge-success">Encontrado</span>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Espécie</p>
                        <p className="font-medium text-foreground capitalize">{result.species === 'dog' ? 'Cão' : result.species === 'cat' ? 'Gato' : result.species}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Raça</p>
                        <p className="font-medium text-foreground">{result.breed}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Data de Nascimento</p>
                        <p className="font-medium text-foreground">
                          {new Date(result.birth_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">ID</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground font-mono">{searchId}</p>
                          <button
                            onClick={() => copyToClipboard(searchId)}
                            className="p-1 hover:bg-secondary rounded"
                          >
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button className="btn-primary-gradient">
                      Importar para Consulta
                    </Button>
                    <Button variant="outline">
                      Ver Histórico Completo
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {notFound && (
          <motion.div
            key="not-found"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <Card className="glass-card p-6 border-destructive/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Pet não encontrado</h3>
                  <p className="text-muted-foreground mt-1">
                    Nenhum registro foi localizado com o ID "{searchId}".
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Verifique se o número está correto ou cadastre um novo pet.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
