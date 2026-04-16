import type { ServiceLocation } from '../data/services'

const STORAGE_KEY = 'popinfo_user_services'

const logStorageError = (message: string, error: unknown) => {
  if (!import.meta.env.DEV) return
  console.error(message, error)
}

export const getStoredServices = (): ServiceLocation[] => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    return existing ? JSON.parse(existing) : []
  } catch (error) {
    logStorageError('Error reading services from storage', error)
    return []
  }
}

export const saveStoredServices = (services: ServiceLocation[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services))
  } catch (error) {
    logStorageError('Error saving services to storage', error)
  }
}

export const addStoredService = (service: ServiceLocation) => {
  const services = getStoredServices()
  services.push(service)
  saveStoredServices(services)
  return services
}

export const updateStoredService = (service: ServiceLocation) => {
  const services = getStoredServices()
  const updated = services.map(s => (s.id === service.id ? service : s))
  saveStoredServices(updated)
  return updated
}

export const deleteStoredService = (id: string) => {
  const services = getStoredServices()
  const filtered = services.filter(s => s.id !== id)
  saveStoredServices(filtered)
  return filtered
}

