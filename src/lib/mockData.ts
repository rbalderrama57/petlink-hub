import type { MockPetData, Alert } from '@/types';

// Mock database for Universal ID search (SinPatinhas / ISO 11784/11785)
export const mockPetDatabase: Record<string, MockPetData> = {
  '123456789012345': {
    name: 'Thor',
    species: 'dog',
    breed: 'Golden Retriever',
    birth_date: '2020-05-15',
  },
  '987654321098765': {
    name: 'Luna',
    species: 'cat',
    breed: 'Siamês',
    birth_date: '2019-08-20',
  },
  'RGA-SP-001234': {
    name: 'Max',
    species: 'dog',
    breed: 'Labrador',
    birth_date: '2021-01-10',
  },
  'RGA-RJ-005678': {
    name: 'Mia',
    species: 'cat',
    breed: 'Persa',
    birth_date: '2022-03-25',
  },
  '111222333444555': {
    name: 'Bob',
    species: 'dog',
    breed: 'Bulldog Francês',
    birth_date: '2023-02-14',
  },
  '900100200300400': {
    name: 'Mel',
    species: 'dog',
    breed: 'Poodle',
    birth_date: '2021-07-22',
  },
  'RGA-MG-009012': {
    name: 'Simba',
    species: 'cat',
    breed: 'Maine Coon',
    birth_date: '2020-11-03',
  },
};

// Mock zoonosis alerts
export const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'Alerta de Raiva',
    message: 'Casos confirmados de raiva em morcegos na região central de São Paulo. Mantenha a vacinação do seu pet em dia.',
    alert_type: 'danger',
    location: 'São Paulo - Centro',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Surto de Leptospirose',
    message: 'Aumento de casos após período de chuvas intensas. Evite áreas alagadas com seu pet.',
    alert_type: 'warning',
    location: 'Rio de Janeiro - Zona Norte',
    is_active: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Campanha de Vacinação',
    message: 'Campanha gratuita de vacinação antirrábica acontece neste fim de semana em todas as UBS.',
    alert_type: 'info',
    location: 'Belo Horizonte',
    is_active: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '4',
    title: 'Leishmaniose - Área Endêmica',
    message: 'Região identificada como área endêmica. Consulte seu veterinário sobre medidas preventivas.',
    alert_type: 'warning',
    location: 'Brasília - DF',
    is_active: true,
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

// Required government vaccines
export const governmentVaccines = [
  { name: 'Antirrábica', interval_days: 365 },
];

// Common optional vaccines
export const optionalVaccines = [
  { name: 'V8/V10 (Polivalente)', interval_days: 365 },
  { name: 'Gripe Canina', interval_days: 180 },
  { name: 'Giárdia', interval_days: 365 },
  { name: 'Leishmaniose', interval_days: 365 },
  { name: 'Tríplice Felina', interval_days: 365 },
  { name: 'Leucemia Felina (FeLV)', interval_days: 365 },
];

// Function to simulate API fetch for Universal ID
export async function fetchPetByUniversalId(id: string): Promise<MockPetData | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pet = mockPetDatabase[id];
      resolve(pet || null);
    }, 800);
  });
}
