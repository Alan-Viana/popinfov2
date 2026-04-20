import type { ServiceLocation } from '../data/services'
import type { PublicServiceLocation } from '../data/services'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database.types'
import { z } from 'zod'

type ServiceRow = Database['public']['Tables']['services']['Row']
type ServiceInsert = Database['public']['Tables']['services']['Insert']
type ServiceUpdate = Database['public']['Tables']['services']['Update']
type PublicServiceRow = Database['public']['Views']['public_services']['Row']

const serviceTypeSchema = z.enum(['CAPS', 'CRAS', 'CREAS', 'C.A / CTA', 'Saúde', 'Alimentação', 'Trabalho', 'Outro'])

const serviceWriteSchema = z.object({
  name: z.string().trim().min(3).max(120),
  type: serviceTypeSchema,
  address: z.string().trim().min(3).max(160),
  number: z.string().trim().max(20).optional().or(z.literal('')),
  complement: z.string().trim().max(60).optional(),
  neighborhood: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(120),
  zip: z.string().trim().regex(/^\d{5}-?\d{3}$/),
  phone: z.string().trim().min(10).max(20),
  email: z.string().trim().email().max(254).optional().nullable().or(z.literal('')),
  hours: z.string().trim().min(1).max(80),
  operatingDays: z.string().trim().max(80).optional(),
  description: z.string().trim().min(10).max(2000),
  services_offered: z.array(z.string().trim().min(1).max(80)).min(1),
  lat: z.number().finite().optional(),
  lng: z.number().finite().optional(),
  imagemUrl: z.string().trim().max(250000).optional().or(z.literal(''))
})

const servicePatchSchema = serviceWriteSchema.partial()

const normalizeOptional = (value: string | undefined) => {
  if (value === undefined) return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const normalizeNullable = (value: string | undefined) => {
  if (value === undefined) return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const assertSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase não está configurado neste ambiente.')
  }
  return supabase
}

const fromDbService = (row: ServiceRow): ServiceLocation => ({
  id: row.id,
  name: row.name,
  type: row.type,
  address: row.address,
  number: row.number ?? undefined,
  complement: row.complement ?? undefined,
  neighborhood: row.neighborhood,
  city: row.city,
  zip: row.zip,
  phone: row.phone,
  email: row.email ?? '',
  hours: row.hours,
  operatingDays: row.operating_days ?? undefined,
  description: row.description,
  services_offered: row.services_offered ?? [],
  lat: row.lat ?? undefined,
  lng: row.lng ?? undefined,
  created_at: row.created_at,
  imagemUrl: row.imagem_url ?? undefined
})

const fromDbPublicService = (row: PublicServiceRow): PublicServiceLocation => ({
  id: row.id,
  name: row.name,
  type: row.type,
  address: row.address,
  number: row.number ?? undefined,
  complement: row.complement ?? undefined,
  neighborhood: row.neighborhood,
  city: row.city,
  zip: row.zip,
  phone: row.phone,
  hours: row.hours,
  operatingDays: row.operating_days ?? undefined,
  description: row.description,
  services_offered: row.services_offered ?? [],
  lat: row.lat ?? undefined,
  lng: row.lng ?? undefined,
  created_at: row.created_at,
  imagemUrl: row.imagem_url ?? undefined
})

const toDbServiceInsert = (service: Omit<ServiceLocation, 'id' | 'created_at'>): ServiceInsert => {
  const validated = serviceWriteSchema.parse({
    ...service,
    complement: normalizeOptional(service.complement),
    email: normalizeNullable(service.email),
    operatingDays: normalizeOptional(service.operatingDays),
    imagemUrl: normalizeOptional(service.imagemUrl),
    services_offered: service.services_offered ?? []
  })

  return {
    name: validated.name,
    type: validated.type,
    address: validated.address,
    number: validated.number ?? null,
    complement: validated.complement ?? null,
    neighborhood: validated.neighborhood,
    city: validated.city,
    zip: validated.zip,
    phone: validated.phone,
    email: validated.email ?? null,
    hours: validated.hours,
    operating_days: validated.operatingDays ?? null,
    description: validated.description,
    services_offered: validated.services_offered,
    lat: validated.lat ?? null,
    lng: validated.lng ?? null,
    imagem_url: validated.imagemUrl ?? null
  }
}

const toDbServicePatch = (patch: Partial<ServiceLocation>): ServiceUpdate => ({
  ...(() => {
    const normalizedNumber = patch.number === undefined ? undefined : normalizeOptional(patch.number)
    const validated = servicePatchSchema.parse({
      ...patch,
      complement: normalizeOptional(patch.complement),
      email: normalizeNullable(patch.email),
      operatingDays: normalizeOptional(patch.operatingDays),
      imagemUrl: normalizeOptional(patch.imagemUrl),
      number: normalizedNumber,
      services_offered: patch.services_offered?.filter(Boolean)
    })

    return {
      ...(validated.name !== undefined ? { name: validated.name } : {}),
      ...(validated.type !== undefined ? { type: validated.type } : {}),
      ...(validated.address !== undefined ? { address: validated.address } : {}),
      ...(patch.number !== undefined ? { number: validated.number ?? null } : {}),
      ...(validated.complement !== undefined ? { complement: validated.complement } : {}),
      ...(validated.neighborhood !== undefined ? { neighborhood: validated.neighborhood } : {}),
      ...(validated.city !== undefined ? { city: validated.city } : {}),
      ...(validated.zip !== undefined ? { zip: validated.zip } : {}),
      ...(validated.phone !== undefined ? { phone: validated.phone } : {}),
      ...(validated.email !== undefined ? { email: validated.email } : {}),
      ...(validated.hours !== undefined ? { hours: validated.hours } : {}),
      ...(validated.operatingDays !== undefined ? { operating_days: validated.operatingDays } : {}),
      ...(validated.description !== undefined ? { description: validated.description } : {}),
      ...(validated.services_offered !== undefined ? { services_offered: validated.services_offered } : {}),
      ...(validated.lat !== undefined ? { lat: validated.lat } : {}),
      ...(validated.lng !== undefined ? { lng: validated.lng } : {}),
      ...(validated.imagemUrl !== undefined ? { imagem_url: validated.imagemUrl } : {})
    }
  })()
})

export const fetchServices = async (): Promise<ServiceLocation[]> => {
  const client = assertSupabase()
  const { data, error } = await client.from('services').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message || 'Falha ao carregar serviços')
  return (data || []).map(fromDbService)
}

export const fetchServicesPage = async (page = 0, pageSize = 12): Promise<ServiceLocation[]> => {
  const client = assertSupabase()
  const from = page * pageSize
  const to = from + pageSize - 1
  const { data, error } = await client
    .from('services')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw new Error(error.message || 'Falha ao carregar serviços')
  return (data || []).map(fromDbService)
}

export const fetchPublicServicesPage = async (page = 0, pageSize = 12): Promise<PublicServiceLocation[]> => {
  const client = assertSupabase()
  const from = page * pageSize
  const to = from + pageSize - 1
  const { data, error } = await client
    .from('public_services')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw new Error(error.message || 'Falha ao carregar serviços')
  return (data || []).map(row => fromDbPublicService(row as PublicServiceRow))
}

export const fetchServiceById = async (id: string): Promise<ServiceLocation> => {
  const client = assertSupabase()
  const { data, error } = await client.from('services').select('*').eq('id', id).single()
  if (error) throw new Error(error.message || 'Serviço não encontrado')
  return fromDbService(data)
}

export const fetchPublicServiceById = async (id: string): Promise<PublicServiceLocation> => {
  const client = assertSupabase()
  const { data, error } = await client
    .from('public_services')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message || 'Serviço não encontrado')
  return fromDbPublicService(data as PublicServiceRow)
}

export const createService = async (service: Omit<ServiceLocation, 'id' | 'created_at'>) => {
  const client = assertSupabase()
  const { data, error } = await client.from('services').insert(toDbServiceInsert(service)).select('*').single()
  if (error) throw new Error(error.message || 'Falha ao criar serviço')
  return fromDbService(data)
}

export const updateService = async (id: string, patch: Partial<ServiceLocation>) => {
  const client = assertSupabase()
  const { data, error } = await client.from('services').update(toDbServicePatch(patch)).eq('id', id).select('*').single()
  if (error) throw new Error(error.message || 'Falha ao atualizar serviço')
  return fromDbService(data)
}

export const deleteService = async (id: string) => {
  const client = assertSupabase()
  const { error } = await client.from('services').delete().eq('id', id)
  if (error) throw new Error(error.message || 'Falha ao excluir serviço')
}