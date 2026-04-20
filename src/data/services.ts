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

export type PublicServiceLocation = Omit<ServiceLocation, 'email'>

export const toPublicServiceLocation = (service: ServiceLocation): PublicServiceLocation => {
  const { email: _email, ...publicService } = service
  return publicService
}

export const servicesData: ServiceLocation[] = initialServices as ServiceLocation[];

