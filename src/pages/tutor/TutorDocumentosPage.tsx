import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileUp, FileText, Image, Trash2, Eye, FolderOpen, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { PlanGate } from '@/components/tutor/PlanGate';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface DocRow {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
  pet_id: string;
  pet_name: string;
}

const MAX_STORAGE_MB = 50;

export function TutorDocumentosPage() {
  const { profile } = useAuth();
  const { isPremium } = useSubscription();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [pets, setPets] = useState<{ id: string; name: string }[]>([]);
  const [selectedPet, setSelectedPet] = useState('all');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);
  const [viewingType, setViewingType] = useState<string>('');
  const [uploadPet, setUploadPet] = useState('');

  useEffect(() => {
    if (profile) loadData();
  }, [profile]);

  const loadData = async () => {
    const { data: petsData } = await supabase
      .from('pets')
      .select('id, name')
      .eq('tutor_id', profile!.id)
      .order('name');
    setPets(petsData || []);
    if (petsData?.length) setUploadPet(petsData[0].id);

    if (!petsData?.length) { setLoading(false); return; }

    const { data } = await supabase
      .from('documents')
      .select('id, title, description, file_path, file_type, file_size, created_at, pet_id')
      .in('pet_id', petsData.map(p => p.id))
      .order('created_at', { ascending: false });

    setDocs((data || []).map(d => ({
      ...d,
      pet_name: petsData.find(p => p.id === d.pet_id)?.name || '',
    })));
    setLoading(false);
  };

  const totalSizeMB = docs.reduce((acc, d) => acc + (d.file_size || 0), 0) / (1024 * 1024);
  const storagePercent = Math.min((totalSizeMB / MAX_STORAGE_MB) * 100, 100);

  const filtered = selectedPet === 'all' ? docs : docs.filter(d => d.pet_id === selectedPet);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadPet) return;

    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast({ title: 'Formato não suportado', description: 'Envie PDF ou imagens (JPG, PNG, WebP).', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${profile!.id}/${uploadPet}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage.from('pet-documents').upload(path, file);
    if (uploadErr) {
      toast({ title: 'Erro no upload', description: uploadErr.message, variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { error: insertErr } = await supabase.from('documents').insert({
      pet_id: uploadPet,
      uploaded_by: profile!.id,
      title: file.name,
      file_path: path,
      file_type: file.type,
      file_size: file.size,
    });

    if (insertErr) {
      toast({ title: 'Erro ao salvar', description: insertErr.message, variant: 'destructive' });
    } else {
      toast({ title: 'Documento enviado!' });
      loadData();
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const viewDoc = async (doc: DocRow) => {
    const { data } = await supabase.storage.from('pet-documents').createSignedUrl(doc.file_path, 300);
    if (data?.signedUrl) {
      setViewingUrl(data.signedUrl);
      setViewingType(doc.file_type);
    }
  };

  const getIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    return FileText;
  };

  const pageContent = (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <FolderOpen className="w-7 h-7 text-primary" />
          Documentos
        </h1>
        <p className="text-muted-foreground mt-1">Exames, laudos e documentos dos seus pets.</p>
      </motion.div>

      {/* Storage indicator */}
      <Card className="glass-card p-4 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <HardDrive className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {totalSizeMB.toFixed(1)} MB / {MAX_STORAGE_MB} MB usados
          </span>
        </div>
        <Progress value={storagePercent} className="h-2" />
      </Card>

      {/* Upload area */}
      <Card className="glass-card p-6 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          {pets.length > 0 && (
            <Select value={uploadPet} onValueChange={setUploadPet}>
              <SelectTrigger className="input-premium w-48">
                <SelectValue placeholder="Pet" />
              </SelectTrigger>
              <SelectContent>
                {pets.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleUpload} />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !uploadPet}
            className="btn-primary-gradient rounded-full"
          >
            <FileUp className="w-4 h-4 mr-2" />
            {uploading ? 'Enviando...' : 'Enviar Documento'}
          </Button>
        </div>
      </Card>

      {/* Filter */}
      {pets.length > 1 && (
        <div className="mb-6">
          <Select value={selectedPet} onValueChange={setSelectedPet}>
            <SelectTrigger className="input-premium w-64">
              <SelectValue placeholder="Filtrar por pet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os pets</SelectItem>
              {pets.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="glass-card p-16 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-6">
            <FolderOpen className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground mb-2">Nenhum documento</h3>
          <p className="text-muted-foreground">Envie exames, laudos e outros documentos dos seus pets.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((d, i) => {
            const Icon = getIcon(d.file_type);
            return (
              <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="glass-card p-4 hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{d.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.pet_name} · {format(new Date(d.created_at), 'dd/MM/yyyy')} · {d.file_size ? (d.file_size / 1024).toFixed(0) + ' KB' : ''}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => viewDoc(d)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Viewer */}
      <Dialog open={!!viewingUrl} onOpenChange={() => setViewingUrl(null)}>
        <DialogContent className="glass-card max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Visualizar Documento</DialogTitle>
          </DialogHeader>
          {viewingUrl && viewingType.startsWith('image/') && (
            <img src={viewingUrl} alt="Documento" className="w-full rounded-xl" />
          )}
          {viewingUrl && viewingType === 'application/pdf' && (
            <iframe src={viewingUrl} className="w-full h-[60vh] rounded-xl" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <PlanGate isPremium={isPremium} feature="Documentos" mode="overlay">
      {pageContent}
    </PlanGate>
  );
}
