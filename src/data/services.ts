import initialServices from './services.json'

export interface ServiceLocation {
  id: string;
  name: string;
  type: 'CAPS' | 'CRAS' | 'CREAS' | 'C.A / CTA' | 'Saúde' | 'Alimentação' | 'Trabalho' | 'Outro';
  address: string;
  number?: string;
  complement?: string;
  neighborhood: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
  hours: string;
  operatingDays?: string;
  description: string;
  services_offered: string[];
  lat?: number;
  lng?: number;
  created_at?: string;
  imagemUrl?: string;
}

export const servicesData: ServiceLocation[] = initialServices as ServiceLocation[];
