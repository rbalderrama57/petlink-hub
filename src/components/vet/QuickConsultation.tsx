import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Search, 
  Stethoscope, 
  FileText, 
  Pill, 
  Calendar,
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const consultationSteps = [
  { id: 1, label: 'Paciente', icon: User },
  { id: 2, label: 'Queixa', icon: Stethoscope },
  { id: 3, label: 'Diagnóstico', icon: FileText },
  { id: 4, label: 'Tratamento', icon: Pill },
  { id: 5, label: 'Finalizar', icon: CheckCircle },
];

export function QuickConsultation() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    petName: '',
    tutorName: '',
    tutorPhone: '',
    chiefComplaint: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    followUpDate: '',
    notes: '',
  });
  const { toast } = useToast();

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateWhatsAppMessage = () => {
    const message = `
*Resumo da Consulta - Ampet*

🐾 *Paciente:* ${formData.petName}
👤 *Tutor:* ${formData.tutorName}

📋 *Queixa Principal:*
${formData.chiefComplaint}

🔍 *Diagnóstico:*
${formData.diagnosis}

💊 *Tratamento:*
${formData.treatment}

${formData.prescription ? `📝 *Prescrição:*\n${formData.prescription}\n` : ''}
${formData.followUpDate ? `📅 *Retorno:* ${formData.followUpDate}` : ''}

_Consulta realizada via Ampet - Pet Health Hub_
    `.trim();

    const phoneNumber = formData.tutorPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: 'WhatsApp aberto!',
      description: 'O resumo da consulta foi preparado para envio.',
    });
  };

  const handleFinish = () => {
    toast({
      title: 'Consulta registrada!',
      description: 'A consulta foi salva com sucesso.',
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground">Nova Consulta</h1>
        <p className="text-muted-foreground mt-1">
          Registre uma consulta em menos de 30 segundos
        </p>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          {consultationSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  currentStep >= step.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <step.icon className="w-5 h-5" />
              </div>
              {index < consultationSteps.length - 1 && (
                <div
                  className={`w-12 sm:w-20 h-1 mx-2 rounded transition-all duration-300 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          {consultationSteps.map((step) => (
            <span key={step.id} className="w-10 text-center">{step.label}</span>
          ))}
        </div>
      </motion.div>

      {/* Form Steps */}
      <Card className="glass-card p-6">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Dados do Paciente
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="petName">Nome do Pet</Label>
                  <Input
                    id="petName"
                    value={formData.petName}
                    onChange={(e) => updateField('petName', e.target.value)}
                    className="input-premium mt-2"
                    placeholder="Ex: Thor"
                  />
                </div>
                <div>
                  <Label htmlFor="tutorName">Nome do Tutor</Label>
                  <Input
                    id="tutorName"
                    value={formData.tutorName}
                    onChange={(e) => updateField('tutorName', e.target.value)}
                    className="input-premium mt-2"
                    placeholder="Ex: Maria Silva"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="tutorPhone">WhatsApp do Tutor</Label>
                <Input
                  id="tutorPhone"
                  value={formData.tutorPhone}
                  onChange={(e) => updateField('tutorPhone', e.target.value)}
                  className="input-premium mt-2"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" />
                Queixa Principal
              </h2>
              
              <div>
                <Label htmlFor="chiefComplaint">Descreva a queixa</Label>
                <Textarea
                  id="chiefComplaint"
                  value={formData.chiefComplaint}
                  onChange={(e) => updateField('chiefComplaint', e.target.value)}
                  className="input-premium mt-2 min-h-[120px]"
                  placeholder="Ex: Paciente apresenta apatia há 2 dias, não está se alimentando bem..."
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Diagnóstico
              </h2>
              
              <div>
                <Label htmlFor="diagnosis">Diagnóstico</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => updateField('diagnosis', e.target.value)}
                  className="input-premium mt-2 min-h-[120px]"
                  placeholder="Ex: Gastrite aguda. Paciente estável..."
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                Tratamento e Prescrição
              </h2>
              
              <div>
                <Label htmlFor="treatment">Tratamento</Label>
                <Textarea
                  id="treatment"
                  value={formData.treatment}
                  onChange={(e) => updateField('treatment', e.target.value)}
                  className="input-premium mt-2"
                  placeholder="Ex: Dieta leve, hidratação..."
                />
              </div>
              
              <div>
                <Label htmlFor="prescription">Prescrição (opcional)</Label>
                <Textarea
                  id="prescription"
                  value={formData.prescription}
                  onChange={(e) => updateField('prescription', e.target.value)}
                  className="input-premium mt-2"
                  placeholder="Ex: Omeprazol 10mg - 1x ao dia por 7 dias..."
                />
              </div>
              
              <div>
                <Label htmlFor="followUpDate">Data de Retorno (opcional)</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => updateField('followUpDate', e.target.value)}
                  className="input-premium mt-2"
                />
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Resumo da Consulta
              </h2>
              
              <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paciente:</span>
                  <span className="font-medium text-foreground">{formData.petName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tutor:</span>
                  <span className="font-medium text-foreground">{formData.tutorName || '-'}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <span className="text-muted-foreground text-sm">Queixa:</span>
                  <p className="text-foreground mt-1">{formData.chiefComplaint || '-'}</p>
                </div>
                <div className="border-t border-border pt-3">
                  <span className="text-muted-foreground text-sm">Diagnóstico:</span>
                  <p className="text-foreground mt-1">{formData.diagnosis || '-'}</p>
                </div>
                <div className="border-t border-border pt-3">
                  <span className="text-muted-foreground text-sm">Tratamento:</span>
                  <p className="text-foreground mt-1">{formData.treatment || '-'}</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={generateWhatsAppMessage}
                  className="flex-1 h-12 bg-[#25D366] hover:bg-[#25D366]/90 text-white"
                  disabled={!formData.tutorPhone}
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Enviar via WhatsApp
                </Button>
                <Button
                  onClick={handleFinish}
                  className="flex-1 h-12 btn-primary-gradient"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Salvar Consulta
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Voltar
          </Button>
          
          {currentStep < 5 ? (
            <Button onClick={nextStep} className="btn-primary-gradient">
              Próximo
            </Button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
