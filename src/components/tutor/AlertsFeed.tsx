import { motion } from 'framer-motion';
import { Bell, AlertTriangle, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { mockAlerts } from '@/lib/mockData';

export function AlertsFeed() {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'danger': return <AlertTriangle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'danger': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'warning': return 'bg-warning/10 text-warning border-warning/30';
      case 'info': return 'bg-info/10 text-info border-info/30';
      default: return 'bg-success/10 text-success border-success/30';
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Alertas de Saúde</h1>
        <p className="text-muted-foreground mt-1">Fique informado sobre surtos e zoonoses na sua região</p>
      </motion.div>

      <div className="space-y-4">
        {mockAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className={`glass-card p-5 border-l-4 ${getAlertStyle(alert.alert_type)}`}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${getAlertStyle(alert.alert_type)}`}>
                  {getAlertIcon(alert.alert_type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">{alert.title}</h3>
                  <p className="text-muted-foreground mt-1">{alert.message}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    {alert.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {alert.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(alert.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
