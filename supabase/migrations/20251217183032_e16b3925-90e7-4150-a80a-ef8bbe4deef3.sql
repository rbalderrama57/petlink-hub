
-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('vet', 'tutor');

-- Create enum for pet species
CREATE TYPE public.pet_species AS ENUM ('dog', 'cat', 'bird', 'other');

-- Create enum for vaccine type
CREATE TYPE public.vaccine_type AS ENUM ('government', 'optional');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'tutor',
  clinic_name TEXT,
  crmv TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pets table
CREATE TABLE public.pets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species pet_species NOT NULL DEFAULT 'dog',
  breed TEXT,
  birth_date DATE,
  weight DECIMAL(5,2),
  microchip_id TEXT UNIQUE,
  rga_id TEXT UNIQUE,
  avatar_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consultations table
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  vet_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  chief_complaint TEXT NOT NULL,
  diagnosis TEXT,
  treatment TEXT,
  prescription TEXT,
  notes TEXT,
  follow_up_date DATE,
  consultation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vaccines table
CREATE TABLE public.vaccines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  vaccine_type vaccine_type NOT NULL DEFAULT 'optional',
  applied_date DATE,
  next_dose_date DATE,
  batch_number TEXT,
  vet_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'info',
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vets can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'vet'
  )
);

-- Pets policies
CREATE POLICY "Tutors can view their own pets"
ON public.pets FOR SELECT
USING (tutor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Tutors can manage their own pets"
ON public.pets FOR ALL
USING (tutor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vets can view all pets"
ON public.pets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'vet'
  )
);

CREATE POLICY "Vets can update pets"
ON public.pets FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'vet'
  )
);

-- Consultations policies
CREATE POLICY "Tutors can view consultations for their pets"
ON public.consultations FOR SELECT
USING (
  pet_id IN (
    SELECT p.id FROM public.pets p 
    JOIN public.profiles pr ON p.tutor_id = pr.id 
    WHERE pr.user_id = auth.uid()
  )
);

CREATE POLICY "Vets can manage all consultations"
ON public.consultations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'vet'
  )
);

-- Vaccines policies
CREATE POLICY "Tutors can view vaccines for their pets"
ON public.vaccines FOR SELECT
USING (
  pet_id IN (
    SELECT p.id FROM public.pets p 
    JOIN public.profiles pr ON p.tutor_id = pr.id 
    WHERE pr.user_id = auth.uid()
  )
);

CREATE POLICY "Vets can manage all vaccines"
ON public.vaccines FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'vet'
  )
);

-- Documents policies
CREATE POLICY "Tutors can view documents for their pets"
ON public.documents FOR SELECT
USING (
  pet_id IN (
    SELECT p.id FROM public.pets p 
    JOIN public.profiles pr ON p.tutor_id = pr.id 
    WHERE pr.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload documents for their pets"
ON public.documents FOR INSERT
WITH CHECK (
  pet_id IN (
    SELECT p.id FROM public.pets p 
    JOIN public.profiles pr ON p.tutor_id = pr.id 
    WHERE pr.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'vet'
  )
);

CREATE POLICY "Vets can view all documents"
ON public.documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'vet'
  )
);

-- Alerts policies (public read)
CREATE POLICY "Anyone can view active alerts"
ON public.alerts FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Create function to handle new user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuário'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'tutor')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vaccines_updated_at
  BEFORE UPDATE ON public.vaccines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('pet-documents', 'pet-documents', false);

-- Storage policies
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pet-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view their documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'pet-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'pet-documents' AND auth.role() = 'authenticated');
