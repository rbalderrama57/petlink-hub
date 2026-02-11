
-- Add registration_source to pets
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS registration_source text NOT NULL DEFAULT 'Manual';

-- Create subscription_plans table (reference data)
CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  plan_type text NOT NULL DEFAULT 'b2c', -- 'b2c' or 'b2b'
  price_cents integer NOT NULL DEFAULT 0,
  interval text NOT NULL DEFAULT 'month',
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- Seed default plans
INSERT INTO public.subscription_plans (name, slug, plan_type, price_cents, features) VALUES
  ('Gratuito', 'free', 'b2c', 0, '["Até 2 pets", "Carteirinha de Vacinação", "Alertas de Saúde"]'::jsonb),
  ('Premium', 'b2c-premium', 'b2c', 1490, '["Pets ilimitados", "Cofre Digital completo", "Histórico completo", "Suporte prioritário"]'::jsonb),
  ('Clínicas', 'b2b-clinicas', 'b2b', 19900, '["Pacientes ilimitados", "Importação CSV", "Prontuário rápido", "Convites automáticos", "Golden Tickets", "Dashboard analítico"]'::jsonb);

-- Create subscription_ledger table for early adopters tracking
CREATE TABLE public.subscription_ledger (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'trial'
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  is_early_adopter boolean NOT NULL DEFAULT false,
  early_adopter_number integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription" ON public.subscription_ledger
  FOR SELECT USING (user_id IN (SELECT profiles.user_id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Users can insert their own subscription" ON public.subscription_ledger
  FOR INSERT WITH CHECK (user_id IN (SELECT profiles.user_id FROM profiles WHERE profiles.user_id = auth.uid()));

-- Create golden_tickets table
CREATE TABLE public.golden_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  created_by uuid NOT NULL,
  redeemed_by uuid,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  is_redeemed boolean NOT NULL DEFAULT false,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.golden_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vets can view their own tickets" ON public.golden_tickets
  FOR SELECT USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vets can create tickets" ON public.golden_tickets
  FOR INSERT WITH CHECK (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'vet'));

-- Add updated_at trigger for subscription_ledger
CREATE TRIGGER update_subscription_ledger_updated_at
  BEFORE UPDATE ON public.subscription_ledger
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
