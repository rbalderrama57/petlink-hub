import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bug, Plus, MapPin, Search, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const ZOONOSIS_TYPES = [
  'Raiva', 'Leishmaniose', 'Leptospirose', 'Esporotricose', 'Toxoplasmose', 'Larva Migrans', 'Outro',
];

const typeColorMap: Record<string, string> = {
  Raiva: 'bg-destructive/20 text-destructive',
  Leishmaniose: 'bg-warning/20 text-warning',
  Leptospirose: 'bg-info/20 text-info',
  Esporotricose: 'bg-accent/20 text-accent',
  Toxoplasmose: 'bg-primary/20 text-primary',
  'Larva Migrans': 'bg-success/20 text-success',
};

const createIcon = (type: string) => {
  const colors: Record<string, string> = {
    Raiva: '#ef4444', Leishmaniose: '#eab308', Leptospirose: '#3b82f6',
    Esporotricose: '#f97316', Toxoplasmose: '#2dd4bf', 'Larva Migrans': '#22c55e',
  };
  const color = colors[type] || '#8b5cf6';
  return L.divIcon({
    className: '',
    html: `<div style="width:24px;height:24px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

interface CaseForm { type: string; zipcode: string; date: string; latitude: string; longitude: string; }

export function VetZoonosesPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [cases, setCases] = useState<any[]>([]);
  const [allCases, setAllCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<CaseForm>({ type: '', zipcode: '', date: new Date().toISOString().split('T')[0], latitude: '', longitude: '' });

  useEffect(() => {
    if (profile) loadData();
  }, [profile]);

  const loadData = async () => {
    setLoading(true);
    const [clinicRes, allRes] = await Promise.all([
      supabase.from('zoonosis_cases').select('*').eq('clinic_id', profile!.id).order('date', { ascending: false }),
      supabase.from('zoonosis_cases').select('*').order('date', { ascending: false }).limit(500),
    ]);
    setCases(clinicRes.data || []);
    setAllCases(allRes.data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.type) {
      toast({ title: 'Selecione o tipo de zoonose', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('zoonosis_cases').insert({
      type: form.type,
      zipcode: form.zipcode || null,
      date: form.date,
      clinic_id: profile!.id,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao registrar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Caso registrado ✅', description: 'O caso de zoonose foi notificado com sucesso.' });
      setShowNew(false);
      setForm({ type: '', zipcode: '', date: new Date().toISOString().split('T')[0], latitude: '', longitude: '' });
      loadData();
    }
  };

  const geolocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      setForm(f => ({ ...f, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }));
      toast({ title: 'Localização capturada 📍' });
    });
  };

  const mapCases = allCases.filter(c => c.latitude && c.longitude);
  const filteredCases = cases.filter(c => {
    if (!search) return true;
    return c.type.toLowerCase().includes(search.toLowerCase()) || c.zipcode?.includes(search);
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Bug className="w-8 h-8 text-warning" /> Zoonoses
          </h1>
          <p className="text-muted-foreground mt-1">Vigilância epidemiológica e rastreio regional</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="btn-accent-gradient rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Registrar Caso
        </Button>
      </motion.div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="map" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <MapPin className="w-4 h-4 mr-1" /> Mapa
          </TabsTrigger>
          <TabsTrigger value="table" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <AlertTriangle className="w-4 h-4 mr-1" /> Casos da Clínica
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl overflow-hidden" style={{ height: 500 }}>
            {mapCases.length === 0 && !loading ? (
              <div className="h-full flex items-center justify-center flex-col gap-3">
                <MapPin className="w-12 h-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">Nenhum caso com geolocalização registrado</p>
                <p className="text-xs text-muted-foreground">Registre um caso com coordenadas para visualizar no mapa</p>
              </div>
            ) : (
              <MapContainer center={mapCases.length > 0 ? [mapCases[0].latitude, mapCases[0].longitude] : [-23.55, -46.63]} zoom={10} style={{ height: '100%', width: '100%' }} className="rounded-2xl">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {mapCases.map(c => (
                  <Marker key={c.id} position={[c.latitude, c.longitude]} icon={createIcon(c.type)}>
                    <Popup>
                      <div className="text-sm">
                        <strong>{c.type}</strong><br />
                        {c.zipcode && <>CEP: {c.zipcode}<br /></>}
                        {format(new Date(c.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </motion.div>
          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-3">
            {ZOONOSIS_TYPES.filter(t => t !== 'Outro').map(t => (
              <Badge key={t} className={`${typeColorMap[t] || 'bg-muted text-muted-foreground'} text-xs`}>{t}</Badge>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table">
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por tipo ou CEP..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 input-premium" />
          </div>
          <div className="glass-card rounded-2xl divide-y divide-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/3" /></div>
                </div>
              ))
            ) : filteredCases.length === 0 ? (
              <div className="p-12 text-center">
                <AlertTriangle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum caso registrado</p>
              </div>
            ) : (
              filteredCases.map(c => (
                <div key={c.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                    <Bug className="w-5 h-5 text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{c.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(c.date), 'dd MMM yyyy', { locale: ptBR })}
                      {c.zipcode && ` · CEP ${c.zipcode}`}
                    </p>
                  </div>
                  <Badge className={`${typeColorMap[c.type] || 'bg-muted text-muted-foreground'} text-xs shrink-0`}>{c.type}</Badge>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Case Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Bug className="w-5 h-5 text-warning" /> Novo Caso de Zoonose</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Tipo *</label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="input-premium"><SelectValue placeholder="Tipo de zoonose" /></SelectTrigger>
                <SelectContent>
                  {ZOONOSIS_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">CEP</label>
              <Input className="input-premium" value={form.zipcode} onChange={e => setForm(f => ({ ...f, zipcode: e.target.value }))} placeholder="00000-000" maxLength={9} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Data</label>
              <Input type="date" className="input-premium" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Latitude</label>
                <Input className="input-premium" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} placeholder="-23.5505" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Longitude</label>
                <Input className="input-premium" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} placeholder="-46.6333" />
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={geolocate} className="w-full">
              <MapPin className="w-4 h-4 mr-2" /> Usar minha localização atual
            </Button>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving} className="btn-accent-gradient rounded-xl">
                {saving ? 'Salvando...' : 'Registrar Caso'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
