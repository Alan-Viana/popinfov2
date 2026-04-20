import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { z } from 'zod'
import { createService, deleteService, fetchServices, updateService } from '../api/services'
import type { ServiceLocation } from '../data/services'
import { copyToClipboard } from '../utils/clipboard'

export type AddressSuggestion = {
  bairro: string
  cep: string
  localidade: string
  logradouro: string
}

export const serviceTypes = ['CAPS', 'CRAS', 'CREAS', 'C.A / CTA', 'Saúde', 'Alimentação', 'Trabalho', 'Outro'] as const
export const serviceTypeSchema = z.enum(serviceTypes)

export const serviceFormSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(120, 'Nome deve ter no máximo 120 caracteres'),
  type: serviceTypeSchema,
  address: z.string().trim().min(3, 'Endereço deve ter pelo menos 3 caracteres').max(160, 'Endereço muito longo'),
  number: z.string().trim().max(20, 'Número muito longo').optional().or(z.literal('')),
  complement: z.string().trim().max(60, 'Complemento muito longo').optional().or(z.literal('')),
  neighborhood: z.string().trim().min(2, 'Bairro deve ter pelo menos 2 caracteres').max(120, 'Bairro muito longo'),
  city: z.string().trim().min(2, 'Cidade deve ter pelo menos 2 caracteres').max(120, 'Cidade muito longa'),
  zip: z.string().trim().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  phone: z.string().trim().min(10, 'Telefone inválido').max(20, 'Telefone muito longo'),
  email: z.string().trim().email('E-mail inválido').max(254, 'E-mail muito longo').optional().or(z.literal('')),
  hours: z.string().trim().min(1, 'Horário obrigatório').max(80, 'Horário muito longo'),
  operatingDays: z.string().trim().max(80, 'Dias de funcionamento muito longo').optional().or(z.literal('')),
  description: z.string().trim().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(2000, 'Descrição deve ter no máximo 2000 caracteres'),
  services_offered_text: z.string().trim().min(1, 'Informe ao menos um serviço').max(500, 'Lista de serviços muito longa'),
  lat: z.string().trim().optional(),
  lng: z.string().trim().optional(),
  imagemUrl: z.string().trim().max(250000, 'Imagem muito grande').optional().or(z.literal(''))
})

export type ServiceFormData = z.infer<typeof serviceFormSchema>
export type ServiceFormField = keyof ServiceFormData

const defaultServiceForm: ServiceFormData = {
  name: '',
  type: 'Outro',
  address: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: 'São Paulo',
  zip: '',
  phone: '',
  email: '',
  hours: '',
  operatingDays: '',
  description: '',
  services_offered_text: '',
  lat: '',
  lng: '',
  imagemUrl: ''
}

const defaultSchedule = { start: '', end: '' }

const clearCoordinates = () => ({ lat: '', lng: '' })

const mapZodErrors = (issues: z.ZodIssue[]) => {
  return issues.reduce<Partial<Record<ServiceFormField, string>>>((acc, issue) => {
    const field = issue.path[0] as ServiceFormField | undefined
    if (field && acc[field] === undefined) {
      acc[field] = issue.message
    }
    return acc
  }, {})
}

const formatPhone = (value: string) => {
  let formatted = value.replace(/\D/g, '')
  if (formatted.length <= 11) {
    formatted = formatted.replace(/^(\d{2})(\d)/g, '($1) $2')
    formatted = formatted.replace(/(\d)(\d{4})$/, '$1-$2')
  }
  return formatted
}

const formatZip = (value: string) => {
  let formatted = value.replace(/\D/g, '')
  if (formatted.length <= 8) {
    formatted = formatted.replace(/^(\d{5})(\d)/, '$1-$2')
  }
  return formatted
}

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxWidth = 800
        const maxHeight = 800
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width
            width = maxWidth
          }
        } else if (height > maxHeight) {
          width *= maxHeight / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        context?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.onerror = (error) => reject(error)
    }
    reader.onerror = (error) => reject(error)
  })
}

const normalizeOptionalText = (value: string | undefined) => {
  if (value === undefined) return undefined

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const parseHours = (hours: string) => {
  const match = hours.match(/^([0-2]\d:[0-5]\d) às ([0-2]\d:[0-5]\d)$/)
  if (!match) {
    return { start: '', end: '' }
  }

  return { start: match[1], end: match[2] }
}

export const useServicesAdmin = () => {
  const [services, setServices] = useState<ServiceLocation[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ServiceFormField, string>>>({})
  const [showExportModal, setShowExportModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [is24Hours, setIs24Hours] = useState(false)
  const [schedule, setSchedule] = useState(defaultSchedule)
  const [serviceForm, setServiceForm] = useState<ServiceFormData>(defaultServiceForm)

  const ignoreAddressSearch = useRef(false)

  const exportData = useMemo(() => {
    const uniqueServices = Array.from(new Map(services.map((service) => [service.id, service])).values())
    return JSON.stringify(uniqueServices, null, 2)
  }, [services])

  const resetForm = () => {
    setEditingId(null)
    setError(null)
    setFieldErrors({})
    setIs24Hours(false)
    setSchedule(defaultSchedule)
    setShowSuggestions(false)
    setAddressSuggestions([])
    setServiceForm(defaultServiceForm)
  }

  useEffect(() => {
    let cancelled = false
    fetchServices()
      .then((data) => {
        if (!cancelled) {
          setServices(data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Não foi possível carregar serviços.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (serviceForm.address && serviceForm.number && serviceForm.city) {
        void (async () => {
          try {
            const query = encodeURIComponent(`${serviceForm.address}, ${serviceForm.number}, ${serviceForm.city}, Brasil`)
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`)
            const data = await response.json()

            if (data && data.length > 0) {
              const { lat, lon } = data[0]
              setServiceForm((previous) => ({ ...previous, lat: String(lat), lng: String(lon) }))
              return
            }

            setServiceForm((previous) => ({ ...previous, ...clearCoordinates() }))
            toast.error('Não foi possível encontrar coordenadas para esse endereço.')
          } catch {
            setServiceForm((previous) => ({ ...previous, ...clearCoordinates() }))
            toast.error('Não foi possível buscar coordenadas.')
          }
        })()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [serviceForm.address, serviceForm.number, serviceForm.city])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (ignoreAddressSearch.current) {
        ignoreAddressSearch.current = false
        return
      }

      if (serviceForm.address.length > 3) {
        try {
          const city = serviceForm.city || 'São Paulo'
          const uf = 'SP'
          const response = await fetch(`https://viacep.com.br/ws/${uf}/${city}/${serviceForm.address.trim()}/json/`)
          const data = await response.json()

          if (Array.isArray(data)) {
            setAddressSuggestions(data)
            setShowSuggestions(true)
          } else {
            setAddressSuggestions([])
            setShowSuggestions(false)
          }
        } catch {
          toast.error('Não foi possível buscar sugestões de endereço.')
        }
      } else {
        setAddressSuggestions([])
        setShowSuggestions(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [serviceForm.address, serviceForm.city])

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setServiceForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === 'address' || name === 'number' || name === 'city' ? clearCoordinates() : {})
    }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServiceForm((previous) => ({ ...previous, phone: formatPhone(e.target.value) }))
  }

  const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatZip(e.target.value)
    setServiceForm((previous) => ({ ...previous, zip: value, ...clearCoordinates() }))

    const cleanZip = value.replace(/\D/g, '')
    if (cleanZip.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`)
        const data = await response.json()
        if (!data.erro) {
          setServiceForm((previous) => ({
            ...previous,
            address: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            ...clearCoordinates()
          }))
        }
      } catch {
        toast.error('Não foi possível buscar o CEP.')
      }
    }
  }

  const handleImageFile = async (file: File | undefined, onBase64: (base64: string) => void) => {
    if (!file) return

    try {
      const base64 = await compressImage(file)
      onBase64(base64)
    } catch {
      toast.error('Erro ao processar imagem.')
    }
  }

  const handleImageUpload = async (file: File | undefined) => {
    if (!file) return

    try {
      const base64 = await compressImage(file)
      setServiceForm((previous) => ({ ...previous, imagemUrl: base64 }))
    } catch {
      toast.error('Erro ao processar imagem.')
    }
  }

  const handleSelectAddress = (suggestion: AddressSuggestion) => {
    ignoreAddressSearch.current = true
    setServiceForm((previous) => ({
      ...previous,
      address: suggestion.logradouro,
      neighborhood: suggestion.bairro,
      city: suggestion.localidade,
      zip: suggestion.cep,
      ...clearCoordinates()
    }))
    setShowSuggestions(false)
  }

  const handleScheduleChange = (type: 'start' | 'end', value: string) => {
    setIs24Hours(false)
    setSchedule((previous) => {
      const nextSchedule = { ...previous, [type]: value }
      if (nextSchedule.start && nextSchedule.end) {
        setServiceForm((form) => ({ ...form, hours: `${nextSchedule.start} às ${nextSchedule.end}` }))
      }
      return nextSchedule
    })
  }

  const handle24HoursToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setIs24Hours(checked)

    if (checked) {
      setSchedule(defaultSchedule)
      setServiceForm((previous) => ({ ...previous, hours: '24 horas' }))
      return
    }

    setServiceForm((previous) => ({ ...previous, hours: '' }))
  }

  const saveService = async (service: Omit<ServiceLocation, 'id'>) => {
    try {
      const created = await createService(service)
      setServices((previous) => [created, ...previous])
      toast.success('Serviço criado')
      return true
    } catch (caughtError) {
      toast.error(caughtError instanceof Error ? caughtError.message : 'Falha ao criar serviço')
      return false
    }
  }

  const updateExistingService = async (id: string, patch: Partial<ServiceLocation>) => {
    try {
      const updated = await updateService(id, patch)
      setServices((previous) => previous.map((service) => (service.id === id ? updated : service)))
      toast.success('Serviço atualizado')
      return true
    } catch (caughtError) {
      toast.error(caughtError instanceof Error ? caughtError.message : 'Falha ao atualizar serviço')
      return false
    }
  }

  const deleteExistingService = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) return

    try {
      await deleteService(id)
      setServices((previous) => previous.filter((service) => service.id !== id))
      toast.success('Serviço excluído')
    } catch (caughtError) {
      toast.error(caughtError instanceof Error ? caughtError.message : 'Falha ao excluir serviço')
    }
  }

  const handleEditClick = (service: ServiceLocation) => {
    setEditingId(service.id)
    setFieldErrors({})
    setError(null)

    const parsedSchedule = parseHours(service.hours)
    setIs24Hours(service.hours === '24 horas')
    setSchedule(service.hours === '24 horas' ? defaultSchedule : parsedSchedule)

    setServiceForm({
      name: service.name,
      type: service.type,
      address: service.address,
      number: service.number || '',
      complement: service.complement || '',
      neighborhood: service.neighborhood,
      city: service.city,
      zip: service.zip,
      phone: service.phone,
      email: service.email,
      hours: service.hours,
      operatingDays: service.operatingDays || '',
      description: service.description,
      services_offered_text: service.services_offered.join(', '),
      lat: service.lat ? String(service.lat) : '',
      lng: service.lng ? String(service.lng) : '',
      imagemUrl: service.imagemUrl || ''
    })
  }

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const parsed = serviceFormSchema.safeParse(serviceForm)
    if (!parsed.success) {
      const nextFieldErrors = mapZodErrors(parsed.error.issues)
      const firstError = parsed.error.issues[0]?.message || 'Revise os campos do formulário.'
      setFieldErrors(nextFieldErrors)
      setError(firstError)
      toast.error(firstError)
      return
    }

    const servicesOffered = parsed.data.services_offered_text
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    const payload: Omit<ServiceLocation, 'id'> = {
      name: parsed.data.name,
      type: parsed.data.type,
      address: parsed.data.address,
      number: parsed.data.number,
      complement: normalizeOptionalText(parsed.data.complement),
      neighborhood: parsed.data.neighborhood,
      city: parsed.data.city,
      zip: parsed.data.zip,
      phone: parsed.data.phone,
      email: normalizeOptionalText(parsed.data.email) || '',
      hours: parsed.data.hours,
      operatingDays: normalizeOptionalText(parsed.data.operatingDays),
      description: parsed.data.description,
      services_offered: servicesOffered,
      lat: parsed.data.lat ? Number.parseFloat(parsed.data.lat) : undefined,
      lng: parsed.data.lng ? Number.parseFloat(parsed.data.lng) : undefined,
      imagemUrl: normalizeOptionalText(parsed.data.imagemUrl)
    }

    const success = editingId
      ? await updateExistingService(editingId, payload)
      : await saveService(payload)

    if (!success) return

    resetForm()
  }

  const handleCopyExport = async () => {
    const ok = await copyToClipboard(exportData)
    if (!ok) {
      toast.error('Não foi possível copiar.')
      return
    }

    setCopied(true)
    toast.success('JSON copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  return {
    services,
    editingId,
    error,
    fieldErrors,
    showExportModal,
    setShowExportModal,
    copied,
    addressSuggestions,
    showSuggestions,
    is24Hours,
    schedule,
    serviceForm,
    exportData,
    handleServiceChange,
    handlePhoneChange,
    handleZipChange,
    handleImageFile,
    handleImageUpload,
    handleSelectAddress,
    handleScheduleChange,
    handle24HoursToggle,
    handleEditClick,
    handleDeleteService: deleteExistingService,
    handleServiceSubmit,
    handleCopyExport,
  }
}