export type UserRole = 'vet' | 'tutor';
export type PetSpecies = 'dog' | 'cat' | 'bird' | 'other';
export type VaccineType = 'government' | 'optional';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  clinic_name?: string;
  crmv?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Pet {
  id: string;
  tutor_id: string;
  name: string;
  species: PetSpecies;
  breed?: string;
  birth_date?: string;
  weight?: number;
  microchip_id?: string;
  rga_id?: string;
  avatar_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  tutor?: Profile;
}

export interface Consultation {
  id: string;
  pet_id: string;
  vet_id?: string;
  chief_complaint: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  notes?: string;
  follow_up_date?: string;
  consultation_date: string;
  created_at: string;
  updated_at: string;
  pet?: Pet;
  vet?: Profile;
}

export interface Vaccine {
  id: string;
  pet_id: string;
  name: string;
  vaccine_type: VaccineType;
  applied_date?: string;
  next_dose_date?: string;
  batch_number?: string;
  vet_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  pet_id: string;
  uploaded_by?: string;
  title: string;
  description?: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  created_at: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  alert_type: 'info' | 'warning' | 'danger' | 'success';
  location?: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export interface MockPetData {
  name: string;
  species: PetSpecies;
  breed: string;
  birth_date: string;
}
