import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  Upload, 
  FileText, 
  Image, 
  File, 
  Plus,
  Search,
  Calendar,
  Trash2,
  Download,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface VaultDocument {
  id: string;
  title: string;
  type: string;
  size: string;
  date: string;
  pet: string;
  icon: 'pdf' | 'image' | 'doc';
}

const mockDocuments: VaultDocument[] = [
  { id: '1', title: 'Hemograma Completo - Thor', type: 'PDF', size: '2.3 MB', date: '10 Dez 2024', pet: 'Thor', icon: 'pdf' },
  { id: '2', title: 'Raio-X Tórax - Luna', type: 'JPEG', size: '5.1 MB', date: '05 Dez 2024', pet: 'Luna', icon: 'image' },
  { id: '3', title: 'Receita Médica - Thor', type: 'PDF', size: '150 KB', date: '28 Nov 2024', pet: 'Thor', icon: 'pdf' },
  { id: '4', title: 'Carteira de Vacinação - Luna', type: 'PDF', size: '890 KB', date: '15 Nov 2024', pet: 'Luna', icon: 'pdf' },
  { id: '5', title: 'Ultrassom Abdominal - Thor', type: 'JPEG', size: '3.7 MB', date: '01 Nov 2024', pet: 'Thor', icon: 'image' },
];

const iconMap = {
  pdf: FileText,
  image: Image,
  doc: File,
};

export function DigitalVault() {
  const [isDragging, setIsDragging] = useState(false);
  const [documents, setDocuments] = useState(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
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
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      const newDoc: VaultDocument = {
        id: Date.now().toString() + Math.random(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
        pet: 'Não atribuído',
        icon: file.type.startsWith('image/') ? 'image' : 'pdf',
      };
      setDocuments(prev => [newDoc, ...prev]);
    });
    toast({
      title: '📁 Arquivo(s) enviado(s)!',
      description: `${files.length} arquivo(s) adicionado(s) ao Cofre Digital.`,
    });
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const newDoc: VaultDocument = {
        id: Date.now().toString() + Math.random(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
        pet: 'Não atribuído',
        icon: file.type.startsWith('image/') ? 'image' : 'pdf',
      };
      setDocuments(prev => [newDoc, ...prev]);
    });
    if (files.length > 0) {
      toast({ title: '📁 Arquivo(s) enviado(s)!', description: `${files.length} arquivo(s) adicionado(s).` });
    }
  };

  const filteredDocs = documents.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.pet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cofre Digital</h1>
            <p className="text-muted-foreground">Todos os exames e documentos dos seus pets em segurança</p>
          </div>
        </div>
      </motion.div>

      {/* Dropzone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`drag-drop-zone text-center mb-8 ${isDragging ? 'drag-drop-zone-active' : ''}`}
        >
          <input type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" id="vault-upload" />
          <label htmlFor="vault-upload" className="cursor-pointer">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-accent" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-1">Arraste exames e documentos aqui</p>
            <p className="text-muted-foreground text-sm">PDF, imagens, receitas — tudo em um lugar seguro</p>
          </label>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar documentos..."
            className="pl-10 input-premium"
          />
        </div>
        <Button variant="outline" size="sm">
          <Calendar className="w-4 h-4 mr-1" /> Filtrar
        </Button>
      </div>

      {/* Documents Grid */}
      <div className="space-y-2">
        {filteredDocs.map((doc, index) => {
          const IconComponent = iconMap[doc.icon];
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * index }}
            >
              <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${doc.icon === 'pdf' ? 'bg-destructive/10' : doc.icon === 'image' ? 'bg-info/10' : 'bg-primary/10'}`}>
                  <IconComponent className={`w-5 h-5 ${doc.icon === 'pdf' ? 'text-destructive' : doc.icon === 'image' ? 'text-info' : 'text-primary'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{doc.pet} • {doc.type} • {doc.size}</p>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block">{doc.date}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost"><Download className="w-4 h-4" /></Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum documento encontrado</p>
        </div>
      )}
    </div>
  );
}
