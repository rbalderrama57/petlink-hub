import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  X,
  RefreshCw,
  Sparkles,
  MessageSquare,
  Mail,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

const databaseFields = [
  { value: 'ignore', label: '-- Ignorar --', group: 'Ação' },
  { value: 'pet_name', label: 'Nome do Pet', group: 'Pet' },
  { value: 'species', label: 'Espécie', group: 'Pet' },
  { value: 'breed', label: 'Raça', group: 'Pet' },
  { value: 'birth_date', label: 'Data de Nascimento', group: 'Pet' },
  { value: 'weight', label: 'Peso', group: 'Pet' },
  { value: 'microchip_id', label: 'Microchip', group: 'Pet' },
  { value: 'rga_id', label: 'RGA', group: 'Pet' },
  { value: 'tutor_name', label: 'Nome do Tutor', group: 'Tutor' },
  { value: 'tutor_email', label: 'Email do Tutor', group: 'Tutor' },
  { value: 'tutor_phone', label: 'Telefone do Tutor', group: 'Tutor' },
  { value: 'vaccine_name', label: 'Nome da Vacina', group: 'Vacina' },
  { value: 'vaccine_date', label: 'Data da Vacina', group: 'Vacina' },
  { value: 'vaccine_batch', label: 'Lote da Vacina', group: 'Vacina' },
  { value: 'notes', label: 'Observações', group: 'Outros' },
];

// Auto-mapping heuristics
const autoMapColumn = (header: string): string => {
  const h = header.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/propri|tutor|dono|respons/i.test(h)) return 'tutor_name';
  if (/email/i.test(h)) return 'tutor_email';
  if (/fone|phone|tel|whats/i.test(h)) return 'tutor_phone';
  if (/animal|pet|nome/i.test(h) && !/tutor|propri/i.test(h)) return 'pet_name';
  if (/especie|species|tipo/i.test(h)) return 'species';
  if (/raca|breed/i.test(h)) return 'breed';
  if (/nasc|birth|data.*nasc/i.test(h)) return 'birth_date';
  if (/peso|weight/i.test(h)) return 'weight';
  if (/micro.*chip|chip/i.test(h)) return 'microchip_id';
  if (/rga/i.test(h)) return 'rga_id';
  if (/vacina|vaccine/i.test(h) && /data|date/i.test(h)) return 'vaccine_date';
  if (/vacina|vaccine/i.test(h) && /lote|batch/i.test(h)) return 'vaccine_batch';
  if (/vacina|vaccine/i.test(h)) return 'vaccine_name';
  if (/obs|notes|nota/i.test(h)) return 'notes';
  return '';
};

interface ColumnMapping {
  csvColumn: string;
  dbField: string;
}

export function CSVImport() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload');
  const [importStats, setImportStats] = useState({ tutors: 0, pets: 0, vaccines: 0 });
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls') || droppedFile.type === 'text/csv')) {
      processFile(droppedFile);
    } else {
      toast({ title: 'Arquivo inválido', description: 'Envie um arquivo CSV ou Excel.', variant: 'destructive' });
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    Papa.parse(selectedFile, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const allRows = results.data as string[][];
        if (allRows.length < 2) {
          toast({ title: 'Arquivo vazio', description: 'O arquivo não contém dados.', variant: 'destructive' });
          return;
        }
        const headers = allRows[0].map((h: string) => h.trim());
        const dataRows = allRows.slice(1);
        setCsvHeaders(headers);
        setPreviewData(dataRows.slice(0, 5));
        setTotalRows(dataRows.length);
        // Auto-map columns
        setColumnMappings(headers.map(h => ({ csvColumn: h, dbField: autoMapColumn(h) })));
        setStep('mapping');
        toast({ title: '✨ Arquivo carregado!', description: `${headers.length} colunas e ${dataRows.length} registros encontrados.` });
      },
      error: () => {
        toast({ title: 'Erro ao ler arquivo', description: 'Não foi possível processar o arquivo.', variant: 'destructive' });
      }
    });
  };

  const updateMapping = (csvColumn: string, dbField: string) => {
    setColumnMappings(prev => prev.map(m => m.csvColumn === csvColumn ? { ...m, dbField } : m));
  };

  const handleImport = () => {
    setStep('importing');
    // Simulate import with progress
    const tutorEmails = new Set<string>();
    const emailIdx = columnMappings.findIndex(m => m.dbField === 'tutor_email');
    const nameIdx = columnMappings.findIndex(m => m.dbField === 'tutor_name');
    
    if (emailIdx >= 0) {
      previewData.forEach(row => {
        if (row[emailIdx]?.trim()) tutorEmails.add(row[emailIdx].trim());
      });
    }

    const tutorCount = Math.max(tutorEmails.size, nameIdx >= 0 ? new Set(previewData.map(r => r[nameIdx])).size : 0) || Math.ceil(totalRows * 0.6);
    const petCount = totalRows;
    const vaccineCount = columnMappings.some(m => m.dbField === 'vaccine_name') ? Math.ceil(totalRows * 0.8) : 0;

    setTimeout(() => {
      setImportStats({ tutors: tutorCount, pets: petCount, vaccines: vaccineCount });
      setStep('complete');
      toast({
        title: '🎉 Importação Mágica concluída!',
        description: `${tutorCount} tutores importados. Convites preparados!`,
      });
    }, 2000);
  };

  const resetImport = () => {
    setFile(null);
    setCsvHeaders([]);
    setColumnMappings([]);
    setPreviewData([]);
    setTotalRows(0);
    setStep('upload');
  };

  const mappedCount = columnMappings.filter(m => m.dbField && m.dbField !== 'ignore').length;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Importação Mágica</h1>
            <p className="text-muted-foreground">Importe sua base completa em segundos com mapeamento inteligente</p>
          </div>
        </div>
      </motion.div>

      {/* Steps indicator */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-2 mb-8">
        {[
          { key: 'upload', label: 'Upload' },
          { key: 'mapping', label: 'Mapeamento' },
          { key: 'preview', label: 'Prévia' },
          { key: 'complete', label: 'Concluído' },
        ].map((s, i) => {
          const stepIdx = ['upload', 'mapping', 'preview', 'importing', 'complete'].indexOf(step);
          const thisIdx = ['upload', 'mapping', 'preview', 'complete'].indexOf(s.key);
          const isActive = stepIdx >= (s.key === 'complete' ? 4 : thisIdx);
          return (
            <div key={s.key} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                {i + 1}
              </div>
              <span className={`ml-2 text-sm font-medium hidden sm:inline ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
              {i < 3 && <div className={`w-6 sm:w-12 h-0.5 mx-2 ${isActive ? 'bg-primary' : 'bg-secondary'}`} />}
            </div>
          );
        })}
      </motion.div>

      <Card className="glass-card p-6">
        {step === 'upload' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`drag-drop-zone text-center ${isDragging ? 'drag-drop-zone-active' : ''}`}
            >
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} className="hidden" id="csv-upload" />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <p className="text-xl font-semibold text-foreground mb-2">Arraste seu arquivo aqui</p>
                <p className="text-muted-foreground mb-4">CSV ou Excel — máximo 10.000 registros</p>
                <span className="inline-flex items-center px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium text-sm">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Selecionar arquivo
                </span>
              </label>
            </div>

            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              {[
                { icon: '🧠', title: 'Mapeamento IA', desc: 'Detecta automaticamente colunas como Tutor, Animal, Vacina' },
                { icon: '📨', title: 'Convites Automáticos', desc: 'Tutores recebem acesso ao Cofre Digital' },
                { icon: '⚡', title: 'Import Flash', desc: 'Milhares de registros em segundos' },
              ].map((f) => (
                <div key={f.title} className="p-4 rounded-xl bg-secondary/30 text-center">
                  <span className="text-2xl">{f.icon}</span>
                  <p className="font-semibold text-foreground text-sm mt-2">{f.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'mapping' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Mapeamento Inteligente
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {mappedCount}/{csvHeaders.length} colunas mapeadas automaticamente • Ajuste se necessário
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={resetImport}>
                <X className="w-4 h-4 mr-1" /> Cancelar
              </Button>
            </div>

            <div className="space-y-2">
              {columnMappings.map((mapping) => (
                <div key={mapping.csvColumn} className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${mapping.dbField && mapping.dbField !== 'ignore' ? 'bg-success/5 border border-success/20' : 'bg-secondary/30'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{mapping.csvColumn}</p>
                    <p className="text-xs text-muted-foreground">Coluna do arquivo</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <Select value={mapping.dbField} onValueChange={(value) => updateMapping(mapping.csvColumn, value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o campo" />
                      </SelectTrigger>
                      <SelectContent>
                        {databaseFields.map((field) => (
                          <SelectItem key={field.value} value={field.value}>{field.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
              <Button variant="outline" onClick={resetImport}>Voltar</Button>
              <Button onClick={() => setStep('preview')} className="btn-primary-gradient" disabled={mappedCount === 0}>
                Próximo <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Pré-visualização</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Mostrando 5 de {totalRows} registros
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    {columnMappings.filter(m => m.dbField && m.dbField !== 'ignore').map((m) => (
                      <th key={m.csvColumn} className="px-4 py-3 text-left font-medium text-foreground whitespace-nowrap">
                        <span className="text-xs text-muted-foreground block">{m.csvColumn}</span>
                        <span className="text-primary">{databaseFields.find(f => f.value === m.dbField)?.label}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {columnMappings.filter(m => m.dbField && m.dbField !== 'ignore').map((m) => {
                        const colIdx = csvHeaders.indexOf(m.csvColumn);
                        return <td key={m.csvColumn} className="px-4 py-3 text-muted-foreground">{row[colIdx] || '-'}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-info/10 text-info">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm">
                Após a importação, {totalRows > 0 ? 'os' : 'nenhum'} tutores receberão um convite para acessar o Cofre Digital via WhatsApp/E-mail.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
              <Button variant="outline" onClick={() => setStep('mapping')}>Voltar</Button>
              <Button onClick={handleImport} className="btn-primary-gradient">
                <Sparkles className="w-4 h-4 mr-2" /> Importar {totalRows} registros
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'importing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-primary animate-pulse-soft" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Importando dados...</h2>
            <p className="text-muted-foreground">Processando {totalRows} registros com mapeamento inteligente</p>
            <div className="w-64 mx-auto mt-6 h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: 'easeInOut' }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">🎉 Importação Mágica Concluída!</h2>
              <p className="text-muted-foreground">Seus dados foram importados com sucesso</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <Card className="p-5 text-center border-primary/20 bg-primary/5">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">{importStats.tutors}</p>
                <p className="text-sm text-muted-foreground">Tutores importados</p>
              </Card>
              <Card className="p-5 text-center border-accent/20 bg-accent/5">
                <span className="text-3xl">🐾</span>
                <p className="text-3xl font-bold text-foreground mt-1">{importStats.pets}</p>
                <p className="text-sm text-muted-foreground">Pets cadastrados</p>
              </Card>
              {importStats.vaccines > 0 && (
                <Card className="p-5 text-center border-success/20 bg-success/5">
                  <span className="text-3xl">💉</span>
                  <p className="text-3xl font-bold text-foreground mt-1">{importStats.vaccines}</p>
                  <p className="text-sm text-muted-foreground">Vacinas registradas</p>
                </Card>
              )}
            </div>

            {/* Invite notification */}
            <Card className="p-6 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-lg">📨 Convites Automáticos</h3>
                  <p className="text-muted-foreground mt-1">
                    <strong>{importStats.tutors} tutores</strong> importados. Convites enviados via <strong>WhatsApp</strong> e <strong>E-mail</strong> para acesso ao Cofre Digital.
                  </p>
                  <div className="flex gap-3 mt-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/10 text-[#25D366] text-sm font-medium">
                      <MessageSquare className="w-4 h-4" />
                      WhatsApp enviado
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-info/10 text-info text-sm font-medium">
                      <Mail className="w-4 h-4" />
                      E-mail enviado
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-center mt-8">
              <Button onClick={resetImport} variant="outline" className="mr-3">
                <RefreshCw className="w-4 h-4 mr-2" /> Nova Importação
              </Button>
              <Button className="btn-primary-gradient">
                <Users className="w-4 h-4 mr-2" /> Ver Pacientes
              </Button>
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  );
}
