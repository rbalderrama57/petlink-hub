
-- Medical Records table
CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  vet_id UUID REFERENCES public.profiles(id),
  type TEXT NOT NULL DEFAULT 'consultation',
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can view their pet medical records" ON public.medical_records
  FOR SELECT USING (pet_id IN (
    SELECT p.id FROM pets p JOIN profiles pr ON p.tutor_id = pr.id WHERE pr.user_id = auth.uid()
  ));

CREATE POLICY "Vets can manage all medical records" ON public.medical_records
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'vet'
  ));

-- Prescriptions table
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  vet_id UUID REFERENCES public.profiles(id),
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  diagnosis TEXT,
  medications JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can view their pet prescriptions" ON public.prescriptions
  FOR SELECT USING (pet_id IN (
    SELECT p.id FROM pets p JOIN profiles pr ON p.tutor_id = pr.id WHERE pr.user_id = auth.uid()
  ));

CREATE POLICY "Vets can manage all prescriptions" ON public.prescriptions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'vet'
  ));

-- Zoonosis cases table
CREATE TABLE public.zoonosis_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.profiles(id),
  pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  zipcode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.zoonosis_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vets can manage zoonosis cases" ON public.zoonosis_cases
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'vet'
  ));

CREATE POLICY "Anyone can view zoonosis cases" ON public.zoonosis_cases
  FOR SELECT USING (true);

-- Update golden_tickets to use clinic_id and invited_email
ALTER TABLE public.golden_tickets ADD COLUMN IF NOT EXISTS invited_email TEXT;
ALTER TABLE public.golden_tickets ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
