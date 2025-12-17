import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  X,
  RefreshCw,
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
  { value: 'name', label: 'Nome do Pet' },
  { value: 'species', label: 'Espécie' },
  { value: 'breed', label: 'Raça' },
  { value: 'birth_date', label: 'Data de Nascimento' },
  { value: 'microchip_id', label: 'Microchip' },
  { value: 'tutor_name', label: 'Nome do Tutor' },
  { value: 'tutor_email', label: 'Email do Tutor' },
  { value: 'tutor_phone', label: 'Telefone do Tutor' },
  { value: 'ignore', label: '-- Ignorar --' },
];

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
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'complete'>('upload');
  const { toast } = useToast();

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1, 6).map(line => 
      line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    );
    return { headers, data };
  };

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
    if (droppedFile && droppedFile.type === 'text/csv') {
      processFile(droppedFile);
    } else {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, envie um arquivo CSV.',
        variant: 'destructive',
      });
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, data } = parseCSV(text);
      
      setCsvHeaders(headers);
      setPreviewData(data);
      setColumnMappings(headers.map(h => ({ csvColumn: h, dbField: '' })));
      setStep('mapping');
      
      toast({
        title: 'Arquivo carregado!',
        description: `${headers.length} colunas encontradas.`,
      });
    };
    reader.readAsText(selectedFile);
  };

  const updateMapping = (csvColumn: string, dbField: string) => {
    setColumnMappings(prev => 
      prev.map(m => m.csvColumn === csvColumn ? { ...m, dbField } : m)
    );
  };

  const handleImport = () => {
    // Simulate import
    setStep('complete');
    toast({
      title: 'Importação concluída!',
      description: `${previewData.length} registros importados com sucesso.`,
    });
  };

  const resetImport = () => {
    setFile(null);
    setCsvHeaders([]);
    setColumnMappings([]);
    setPreviewData([]);
    setStep('upload');
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground">Importar CSV</h1>
        <p className="text-muted-foreground mt-1">
          Importe sua base de pacientes de forma rápida e inteligente
        </p>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4 mb-8"
      >
        {['upload', 'mapping', 'preview', 'complete'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                step === s || ['upload', 'mapping', 'preview', 'complete'].indexOf(step) > i
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {i + 1}
            </div>
            {i < 3 && (
              <div className={`w-8 sm:w-16 h-0.5 mx-2 ${
                ['upload', 'mapping', 'preview', 'complete'].indexOf(step) > i
                  ? 'bg-primary'
                  : 'bg-secondary'
              }`} />
            )}
          </div>
        ))}
      </motion.div>

      <Card className="glass-card p-6">
        {step === 'upload' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`drag-drop-zone text-center ${isDragging ? 'drag-drop-zone-active' : ''}`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="text-lg font-medium text-foreground mb-2">
                  Arraste seu arquivo CSV aqui
                </p>
                <p className="text-muted-foreground">
                  ou clique para selecionar
                </p>
              </label>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-secondary/50">
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <FileSpreadsheet className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Formatos aceitos: CSV com colunas para nome do pet, espécie, raça, tutor, etc.
              </p>
            </div>
          </motion.div>
        )}

        {step === 'mapping' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Mapeamento de Colunas</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Associe as colunas do CSV aos campos do banco de dados
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={resetImport}>
                <X className="w-4 h-4 mr-1" />
                Cancelar
              </Button>
            </div>

            <div className="space-y-3">
              {columnMappings.map((mapping) => (
                <div
                  key={mapping.csvColumn}
                  className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{mapping.csvColumn}</p>
                    <p className="text-xs text-muted-foreground">Coluna do CSV</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <Select
                      value={mapping.dbField}
                      onValueChange={(value) => updateMapping(mapping.csvColumn, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o campo" />
                      </SelectTrigger>
                      <SelectContent>
                        {databaseFields.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
              <Button variant="outline" onClick={resetImport}>
                Voltar
              </Button>
              <Button 
                onClick={() => setStep('preview')} 
                className="btn-primary-gradient"
                disabled={!columnMappings.some(m => m.dbField && m.dbField !== 'ignore')}
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Pré-visualização</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Confira os primeiros registros antes de importar
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    {csvHeaders.map((header) => (
                      <th key={header} className="px-4 py-3 text-left font-medium text-foreground">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {row.map((cell, j) => (
                        <td key={j} className="px-4 py-3 text-muted-foreground">
                          {cell || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-warning/10 text-warning">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm">
                Mostrando apenas os primeiros {previewData.length} registros para prévia.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
              <Button variant="outline" onClick={() => setStep('mapping')}>
                Voltar
              </Button>
              <Button onClick={handleImport} className="btn-primary-gradient">
                <CheckCircle className="w-4 h-4 mr-2" />
                Importar Dados
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Importação Concluída!
            </h2>
            <p className="text-muted-foreground mb-6">
              Todos os registros foram importados com sucesso.
            </p>
            <Button onClick={resetImport} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Nova Importação
            </Button>
          </motion.div>
        )}
      </Card>
    </div>
  );
}
