import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, Check, X, AlertTriangle, ArrowRight, ArrowLeft, Download, MessageSquare, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';

type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'report';

interface ParsedData {
  headers: string[];
  rows: string[][];
}

interface ColumnMapping {
  tutor_name: string;
  tutor_email: string;
  tutor_phone: string;
  pet_name: string;
  pet_species: string;
  pet_breed: string;
  microchip_id: string;
}

interface ImportResult {
  total: number;
  success: number;
  errors: { row: number; reason: string }[];
}

const REQUIRED_FIELDS = ['tutor_name', 'tutor_email', 'pet_name'] as const;
const FIELD_LABELS: Record<string, string> = {
  tutor_name: 'Nome do Tutor *',
  tutor_email: 'Email do Tutor *',
  tutor_phone: 'Telefone',
  pet_name: 'Nome do Pet *',
  pet_species: 'Espécie',
  pet_breed: 'Raça',
  microchip_id: 'Microchip',
};

export function VetImportacaoPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState<ParsedData | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({
    tutor_name: '', tutor_email: '', tutor_phone: '',
    pet_name: '', pet_species: '', pet_breed: '', microchip_id: '',
  });
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'txt'].includes(ext || '')) {
      toast({ title: 'Formato inválido', description: 'Envie um arquivo CSV.', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Arquivo grande demais', description: 'Máximo 5MB.', variant: 'destructive' });
      return;
    }

    setFileName(file.name);
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as string[][];
        if (data.length < 2) {
          toast({ title: 'Arquivo vazio', description: 'O arquivo precisa ter pelo menos 2 linhas.', variant: 'destructive' });
          return;
        }
        setParsed({ headers: data[0], rows: data.slice(1) });
        // Auto-map columns
        const autoMap = { ...mapping };
        const headerLower = data[0].map(h => h.toLowerCase().trim());
        const autoMappings: [keyof ColumnMapping, string[]][] = [
          ['tutor_name', ['nome', 'tutor', 'proprietário', 'cliente', 'name']],
          ['tutor_email', ['email', 'e-mail', 'mail']],
          ['tutor_phone', ['telefone', 'phone', 'celular', 'whatsapp', 'tel']],
          ['pet_name', ['pet', 'animal', 'nome do pet', 'nome pet', 'pet_name']],
          ['pet_species', ['espécie', 'especie', 'species', 'tipo']],
          ['pet_breed', ['raça', 'raca', 'breed']],
          ['microchip_id', ['microchip', 'chip', 'id']],
        ];
        autoMappings.forEach(([field, keywords]) => {
          const idx = headerLower.findIndex(h => keywords.some(k => h.includes(k)));
          if (idx >= 0) autoMap[field] = data[0][idx];
        });
        setMapping(autoMap);
        setStep('mapping');
        toast({ title: 'Arquivo carregado!', description: `${data.length - 1} linhas encontradas.` });
      },
      error: () => {
        toast({ title: 'Erro ao ler arquivo', variant: 'destructive' });
      },
    });
  }, [mapping, toast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const canProceedMapping = REQUIRED_FIELDS.every(f => mapping[f]);

  const runImport = async () => {
    if (!parsed || !profile) return;
    setStep('importing');
    setProgress(0);

    const errors: ImportResult['errors'] = [];
    let success = 0;
    const total = parsed.rows.length;
    const headerIdx = (col: string) => parsed.headers.indexOf(col);

    for (let i = 0; i < total; i++) {
      const row = parsed.rows[i];
      try {
        const name = row[headerIdx(mapping.tutor_name)]?.trim();
        const email = row[headerIdx(mapping.tutor_email)]?.trim();
        const petName = row[headerIdx(mapping.pet_name)]?.trim();

        if (!name || !email || !petName) {
          errors.push({ row: i + 2, reason: 'Campos obrigatórios vazios' });
          continue;
        }

        // Check if tutor profile exists
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        let tutorProfileId: string;

        if (existing) {
          tutorProfileId = existing.id;
        } else {
          // Create auth user
          const tempPass = `Ampet_${Math.random().toString(36).slice(2, 10)}!`;
          const { data: authData, error: authErr } = await supabase.auth.signUp({
            email,
            password: tempPass,
            options: { data: { full_name: name, role: 'tutor' } },
          });
          if (authErr || !authData.user) {
            errors.push({ row: i + 2, reason: authErr?.message || 'Erro ao criar conta' });
            continue;
          }
          // Wait for profile trigger
          await new Promise(r => setTimeout(r, 500));
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', authData.user.id)
            .maybeSingle();
          if (!newProfile) {
            errors.push({ row: i + 2, reason: 'Perfil não criado' });
            continue;
          }
          tutorProfileId = newProfile.id;

          // Update phone if available
          const phoneCol = mapping.tutor_phone ? headerIdx(mapping.tutor_phone) : -1;
          if (phoneCol >= 0 && row[phoneCol]) {
            await supabase.from('profiles').update({ phone: row[phoneCol].trim() }).eq('id', tutorProfileId);
          }
        }

        // Create pet
        const speciesCol = mapping.pet_species ? headerIdx(mapping.pet_species) : -1;
        const breedCol = mapping.pet_breed ? headerIdx(mapping.pet_breed) : -1;
        const chipCol = mapping.microchip_id ? headerIdx(mapping.microchip_id) : -1;
        const speciesRaw = speciesCol >= 0 ? row[speciesCol]?.trim().toLowerCase() : '';
        const species = ['dog', 'cat', 'bird'].includes(speciesRaw) ? speciesRaw : speciesRaw.includes('gato') || speciesRaw.includes('cat') ? 'cat' : speciesRaw.includes('ave') || speciesRaw.includes('bird') ? 'bird' : 'dog';

        await supabase.from('pets').insert({
          tutor_id: tutorProfileId,
          name: petName,
          species: species as any,
          breed: breedCol >= 0 ? row[breedCol]?.trim() || null : null,
          microchip_id: chipCol >= 0 ? row[chipCol]?.trim() || null : null,
          registration_source: 'CSV Import',
        });

        success++;
      } catch (err: any) {
        errors.push({ row: i + 2, reason: err.message || 'Erro desconhecido' });
      }

      setProgress(Math.round(((i + 1) / total) * 100));
    }

    setResult({ total, success, errors });
    setStep('report');
    toast({
      title: 'Importação concluída!',
      description: `${success} de ${total} registros importados.`,
    });
  };

  const reset = () => {
    setStep('upload');
    setParsed(null);
    setMapping({ tutor_name: '', tutor_email: '', tutor_phone: '', pet_name: '', pet_species: '', pet_breed: '', microchip_id: '' });
    setProgress(0);
    setResult(null);
    setFileName('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <Upload className="w-7 h-7 text-primary" />
          Importação de Pacientes
        </h1>
        <p className="text-muted-foreground mt-1">Importe clientes e pets via CSV com mapeamento inteligente.</p>
      </motion.div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {(['upload', 'mapping', 'preview', 'importing', 'report'] as Step[]).map((s, i) => {
          const labels = ['Upload', 'Mapeamento', 'Preview', 'Importando', 'Relatório'];
          const current = ['upload', 'mapping', 'preview', 'importing', 'report'].indexOf(step);
          const stepIdx = i;
          return (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                stepIdx < current ? 'bg-primary text-primary-foreground' :
                stepIdx === current ? 'bg-primary/20 text-primary border-2 border-primary' :
                'bg-muted text-muted-foreground'
              }`}>
                {stepIdx < current ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${stepIdx === current ? 'text-primary' : 'text-muted-foreground'}`}>{labels[i]}</span>
              {i < 4 && <div className="w-6 sm:w-12 h-px bg-border" />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Upload */}
        {step === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card
              className={`p-8 sm:p-16 text-center cursor-pointer transition-all duration-200 ${
                dragOver ? 'drag-drop-zone-active border-primary bg-primary/10' : 'drag-drop-zone'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div className="w-20 h-20 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center mb-6">
                <FileSpreadsheet className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">Arraste seu arquivo CSV aqui</h3>
              <p className="text-muted-foreground mb-4">ou clique para selecionar • Máximo 5MB</p>
              <Badge variant="secondary" className="text-xs">Formatos: .csv, .txt</Badge>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Column Mapping */}
        {step === 'mapping' && parsed && (
          <motion.div key="mapping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-display font-bold text-foreground">Mapeamento de Colunas</h3>
                  <p className="text-sm text-muted-foreground">Arquivo: {fileName} • {parsed.rows.length} linhas</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {parsed.headers.length} colunas
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {(Object.keys(FIELD_LABELS) as (keyof ColumnMapping)[]).map(field => (
                  <div key={field}>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      {FIELD_LABELS[field]}
                    </label>
                    <Select
                      value={mapping[field]}
                      onValueChange={(v) => setMapping(prev => ({ ...prev, [field]: v }))}
                    >
                      <SelectTrigger className="input-premium">
                        <SelectValue placeholder="Selecionar coluna..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Não mapear —</SelectItem>
                        {parsed.headers.map(h => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="ghost" onClick={reset}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <Button
                  onClick={() => setStep('preview')}
                  disabled={!canProceedMapping}
                  className="btn-primary-gradient rounded-full"
                >
                  Visualizar dados <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Preview */}
        {step === 'preview' && parsed && (
          <motion.div key="preview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="glass-card p-6">
              <h3 className="text-lg font-display font-bold text-foreground mb-4">
                Preview — Primeiras 5 linhas
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">#</th>
                      {REQUIRED_FIELDS.map(f => (
                        <th key={f} className="text-left py-2 px-3 text-muted-foreground font-medium">{FIELD_LABELS[f]?.replace(' *', '')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.rows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="py-2 px-3 text-muted-foreground">{i + 2}</td>
                        {REQUIRED_FIELDS.map(f => {
                          const idx = parsed.headers.indexOf(mapping[f]);
                          const val = idx >= 0 ? row[idx] : '—';
                          return (
                            <td key={f} className="py-2 px-3 text-foreground">
                              {val || <span className="text-destructive text-xs">vazio</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-warning/10 border border-warning/20 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-warning">Atenção</p>
                  <p className="text-muted-foreground">Tutores sem conta receberão um convite automático. Serão importados <strong>{parsed.rows.length}</strong> registros.</p>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="ghost" onClick={() => setStep('mapping')}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <Button onClick={runImport} className="btn-primary-gradient rounded-full">
                  Iniciar Importação <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Importing */}
        {step === 'importing' && (
          <motion.div key="importing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="glass-card p-8 sm:p-16 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-6 animate-pulse">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">Importando...</h3>
              <p className="text-muted-foreground mb-6">{progress}% concluído</p>
              <Progress value={progress} className="h-3 max-w-md mx-auto" />
            </Card>
          </motion.div>
        )}

        {/* Step 5: Report */}
        {step === 'report' && result && (
          <motion.div key="report" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <Card className="glass-card p-8 text-center">
              <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${
                result.errors.length === 0 ? 'bg-success/10' : 'bg-warning/10'
              }`}>
                {result.errors.length === 0 ? (
                  <Check className="w-10 h-10 text-success" />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-warning" />
                )}
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">Importação Concluída</h3>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-6">
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">{result.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="p-4 rounded-xl bg-success/10">
                  <p className="text-2xl font-bold text-success">{result.success}</p>
                  <p className="text-xs text-muted-foreground">Sucesso</p>
                </div>
                <div className="p-4 rounded-xl bg-destructive/10">
                  <p className="text-2xl font-bold text-destructive">{result.errors.length}</p>
                  <p className="text-xs text-muted-foreground">Erros</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <Button variant="outline" size="sm" className="gap-2">
                  <MessageSquare className="w-4 h-4" /> Enviar WhatsApp
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Mail className="w-4 h-4" /> Enviar Email
                </Button>
              </div>
            </Card>

            {result.errors.length > 0 && (
              <Card className="glass-card p-6">
                <h4 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <X className="w-5 h-5 text-destructive" /> Erros ({result.errors.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10 text-sm">
                      <Badge variant="destructive" className="flex-shrink-0">Linha {err.row}</Badge>
                      <span className="text-muted-foreground">{err.reason}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <div className="flex justify-center">
              <Button onClick={reset} className="btn-primary-gradient rounded-full">
                Nova Importação
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
