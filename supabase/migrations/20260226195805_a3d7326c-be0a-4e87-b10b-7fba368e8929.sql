
-- Create reminders table
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  reminder_type TEXT NOT NULL DEFAULT 'vaccine',
  reminder_date DATE NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Tutors can view their own reminders
CREATE POLICY "Tutors can view their own reminders" ON public.reminders
  FOR SELECT USING (tutor_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

-- Tutors can insert their own reminders
CREATE POLICY "Tutors can insert their own reminders" ON public.reminders
  FOR INSERT WITH CHECK (tutor_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

-- Tutors can update their own reminders
CREATE POLICY "Tutors can update their own reminders" ON public.reminders
  FOR UPDATE USING (tutor_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

-- Tutors can delete their own reminders
CREATE POLICY "Tutors can delete their own reminders" ON public.reminders
  FOR DELETE USING (tutor_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

-- Vets can view all reminders
CREATE POLICY "Vets can view all reminders" ON public.reminders
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'vet'
  ));
