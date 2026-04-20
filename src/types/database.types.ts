export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ServiceType = 'CAPS' | 'CRAS' | 'CREAS' | 'C.A / CTA' | 'Saúde' | 'Alimentação' | 'Trabalho' | 'Outro'

export type AdminRow = {
  created_at: string
  email: string
}

type ServiceIdentity = {
  id: string
  created_at: string
}

type ServiceContent = {
  name: string
  type: ServiceType
  address: string
  number: string | null
  complement: string | null
  neighborhood: string
  city: string
  zip: string
  phone: string
  email: string | null
  hours: string
  operating_days: string | null
  description: string
  services_offered: string[]
  lat: number | null
  lng: number | null
  imagem_url: string | null
}

type ServiceInsertOptional = Partial<Pick<ServiceContent, 'number' | 'complement' | 'email' | 'operating_days' | 'services_offered' | 'lat' | 'lng' | 'imagem_url'>> & {
  id?: string
  created_at?: string
}

type ServiceUpdateOptional = Partial<ServiceContent> & {
  id?: string
  created_at?: string
}

export type ServiceRow = ServiceIdentity & ServiceContent
export type ServiceInsert = ServiceContent & ServiceInsertOptional
export type ServiceUpdate = ServiceUpdateOptional

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: AdminRow
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      services: {
        Row: ServiceRow
        Insert: ServiceInsert
        Update: ServiceUpdate
        Relationships: []
      }
    }
    Views: {
      public_services: {
        Row: ServiceRow
        Insert: never
        Update: never
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
