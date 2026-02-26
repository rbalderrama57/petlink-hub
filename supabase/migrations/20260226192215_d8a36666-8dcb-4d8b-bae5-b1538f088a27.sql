
-- Allow tutors to delete their own pets
CREATE POLICY "Tutors can delete their own pets" ON public.pets
  FOR DELETE USING (tutor_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));
