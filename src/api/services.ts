import type { ServiceLocation } from '../data/services'

const parseJson = async (response: Response) => {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export const fetchServices = async (): Promise<ServiceLocation[]> => {
  const response = await fetch('/api/services')
  const body = await parseJson(response)
  if (!response.ok) throw new Error(String(body?.error || 'Falha ao carregar serviços'))
  return Array.isArray(body?.data) ? body.data : []
}

export const fetchServiceById = async (id: string): Promise<ServiceLocation> => {
  const response = await fetch(`/api/services/${encodeURIComponent(id)}`)
  const body = await parseJson(response)
  if (!response.ok) throw new Error(String(body?.error || 'Serviço não encontrado'))
  return body?.data as ServiceLocation
}

export const createService = async (service: Omit<ServiceLocation, 'id'>, token: string) => {
  const response = await fetch('/api/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(service)
  })
  const body = await parseJson(response)
  if (!response.ok) throw new Error(String(body?.error || 'Falha ao criar serviço'))
  return body?.data as ServiceLocation
}

export const updateService = async (id: string, patch: Partial<ServiceLocation>, token: string) => {
  const response = await fetch(`/api/services/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(patch)
  })
  const body = await parseJson(response)
  if (!response.ok) throw new Error(String(body?.error || 'Falha ao atualizar serviço'))
  return body?.data as ServiceLocation
}

export const deleteService = async (id: string, token: string) => {
  const response = await fetch(`/api/services/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!response.ok && response.status !== 204) {
    const body = await parseJson(response)
    throw new Error(String(body?.error || 'Falha ao excluir serviço'))
  }
}

