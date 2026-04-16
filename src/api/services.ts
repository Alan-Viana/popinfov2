import type { ServiceLocation } from '../data/services'
import { supabase } from '../lib/supabase'

const assertSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase não está configurado neste ambiente.')
  }
  return supabase
}

const fromDbService = (row: any): ServiceLocation => ({
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
  email: row.email,
  hours: row.hours,
  operatingDays: row.operating_days ?? undefined,
  description: row.description,
  services_offered: row.services_offered || [],
  lat: row.lat ?? undefined,
  lng: row.lng ?? undefined,
  created_at: row.created_at,
  imagemUrl: row.imagem_url ?? undefined
})

const toDbServiceInsert = (service: Omit<ServiceLocation, 'id'>) => ({
  name: service.name,
  type: service.type,
  address: service.address,
  number: service.number ?? null,
  complement: service.complement ?? null,
  neighborhood: service.neighborhood,
  city: service.city,
  zip: service.zip,
  phone: service.phone,
  email: service.email,
  hours: service.hours,
  operating_days: service.operatingDays ?? null,
  description: service.description,
  services_offered: service.services_offered ?? [],
  lat: service.lat ?? null,
  lng: service.lng ?? null,
  imagem_url: service.imagemUrl ?? null
})

const toDbServicePatch = (patch: Partial<ServiceLocation>) => ({
  ...(patch.name !== undefined ? { name: patch.name } : {}),
  ...(patch.type !== undefined ? { type: patch.type } : {}),
  ...(patch.address !== undefined ? { address: patch.address } : {}),
  ...(patch.number !== undefined ? { number: patch.number } : {}),
  ...(patch.complement !== undefined ? { complement: patch.complement } : {}),
  ...(patch.neighborhood !== undefined ? { neighborhood: patch.neighborhood } : {}),
  ...(patch.city !== undefined ? { city: patch.city } : {}),
  ...(patch.zip !== undefined ? { zip: patch.zip } : {}),
  ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
  ...(patch.email !== undefined ? { email: patch.email } : {}),
  ...(patch.hours !== undefined ? { hours: patch.hours } : {}),
  ...(patch.operatingDays !== undefined ? { operating_days: patch.operatingDays } : {}),
  ...(patch.description !== undefined ? { description: patch.description } : {}),
  ...(patch.services_offered !== undefined ? { services_offered: patch.services_offered } : {}),
  ...(patch.lat !== undefined ? { lat: patch.lat } : {}),
  ...(patch.lng !== undefined ? { lng: patch.lng } : {}),
  ...(patch.imagemUrl !== undefined ? { imagem_url: patch.imagemUrl } : {})
})

export const fetchServices = async (): Promise<ServiceLocation[]> => {
  const client = assertSupabase()
  const { data, error } = await client.from('services').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message || 'Falha ao carregar serviços')
  return (data || []).map(fromDbService)
}

export const fetchServiceById = async (id: string): Promise<ServiceLocation> => {
  const client = assertSupabase()
  const { data, error } = await client.from('services').select('*').eq('id', id).single()
  if (error) throw new Error(error.message || 'Serviço não encontrado')
  return fromDbService(data)
}

export const createService = async (service: Omit<ServiceLocation, 'id'>) => {
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


