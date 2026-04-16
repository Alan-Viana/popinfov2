import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil as LuPencil, LogOut as LuLogOut, Plus as LuPlus, Trash2 as LuTrash2, BriefcaseBusiness as LuBriefcase, Download as LuDownload, Copy as LuCopy, Check as LuCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import FadeIn from '../components/FadeIn'
import { useAuth } from '../contexts/AuthContext'
import type { ServiceLocation } from '../data/services'
import { copyToClipboard } from '../utils/clipboard'
import { fetchServices, createService, updateService, deleteService } from '../api/services'

type AddressSuggestion = {
  bairro: string
  cep: string
  localidade: string
  logradouro: string
}

const formatPhone = (v: string) => {
  v = v.replace(/\D/g, '')
  if (v.length <= 11) {
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2')
    v = v.replace(/(\d)(\d{4})$/, '$1-$2')
  }
  return v
}

const formatZip = (v: string) => {
  v = v.replace(/\D/g, '')
  if (v.length <= 8) {
    v = v.replace(/^(\d{5})(\d)/, '$1-$2')
  }
  return v
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
        const MAX_WIDTH = 800
        const MAX_HEIGHT = 800
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.onerror = (error) => reject(error)
    }
    reader.onerror = (error) => reject(error)
  })
}

const Admin = () => {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  
  const [services, setServices] = useState<ServiceLocation[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const [is24Hours, setIs24Hours] = useState(false)
  const [schedule, setSchedule] = useState({ start: '', end: '' })

  const [serviceForm, setServiceForm] = useState({
    name: '',
    type: 'Outro' as ServiceLocation['type'],
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
  })

  const geocodeAddress = async (address: string, number: string, city: string) => {
    if (address.length < 3 || !city) return
    
    try {
      const query = encodeURIComponent(`${address}, ${number}, ${city}, Brasil`)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`)
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        setServiceForm(prev => ({ ...prev, lat: String(lat), lng: String(lon) }))
      }
    } catch (error) {
      toast.error('Não foi possível buscar coordenadas.')
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (serviceForm.address && serviceForm.number && serviceForm.city) {
        geocodeAddress(serviceForm.address, serviceForm.number, serviceForm.city)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [serviceForm.address, serviceForm.number, serviceForm.city]);

  const getExportData = () => {
    const uniqueServices = Array.from(new Map(services.map(s => [s.id, s])).values())
    return JSON.stringify(uniqueServices, null, 2)
  }

  const handleCopyExport = async () => {
    const ok = await copyToClipboard(getExportData())
    if (!ok) {
      toast.error('Não foi possível copiar.')
      return
    }
    setCopied(true)
    toast.success('JSON copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    let cancelled = false
    fetchServices()
      .then((data) => {
        if (cancelled) return
        setServices(data)
      })
      .catch(() => {
        if (cancelled) return
        toast.error('Não foi possível carregar serviços.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setServiceForm(prev => ({ ...prev, [name]: value }))
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

  const saveService = async (service: Omit<ServiceLocation, 'id'>) => {
    const token = sessionStorage.getItem('popinfo_admin_token') || ''
    const created = await createService(service, token)
    setServices(prev => [created, ...prev])
    toast.success('Serviço criado')
  }

  const updateExistingService = async (id: string, patch: Partial<ServiceLocation>) => {
    const token = sessionStorage.getItem('popinfo_admin_token') || ''
    const updated = await updateService(id, patch, token)
    setServices(prev => prev.map(s => (s.id === id ? updated : s)))
    toast.success('Serviço atualizado')
  }

  const deleteExistingService = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) return
    const token = sessionStorage.getItem('popinfo_admin_token') || ''
    await deleteService(id, token)
    setServices(prev => prev.filter(s => s.id !== id))
    toast.success('Serviço excluído')
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = formatPhone(e.target.value)
    setServiceForm(prev => ({ ...prev, phone: v }))
  }

  const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = formatZip(e.target.value)
    setServiceForm(prev => ({ ...prev, zip: v }))

    const cleanZip = v.replace(/\D/g, '')
    if (cleanZip.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`)
        const data = await response.json()
        if (!data.erro) {
          setServiceForm(prev => ({
            ...prev,
            address: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade
          }))
        }
      } catch {
        toast.error('Não foi possível buscar o CEP.')
      }
    }
  }

  const ignoreAddressSearch = useRef(false)

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
        } catch (error) {
          toast.error('Não foi possível buscar sugestões de endereço.')
        }
      } else {
        setAddressSuggestions([])
        setShowSuggestions(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [serviceForm.address, serviceForm.city])

  const handleSelectAddress = (suggestion: AddressSuggestion) => {
    ignoreAddressSearch.current = true
    setServiceForm(prev => ({
      ...prev,
      address: suggestion.logradouro,
      neighborhood: suggestion.bairro,
      city: suggestion.localidade,
      zip: suggestion.cep
    }))
    setShowSuggestions(false)
  }

  const handleScheduleChange = (type: 'start' | 'end', value: string) => {
    setIs24Hours(false)
    setSchedule(prev => {
      const newSchedule = { ...prev, [type]: value }
      if (newSchedule.start && newSchedule.end) {
        setServiceForm(form => ({
          ...form,
          hours: `${newSchedule.start} às ${newSchedule.end}`
        }))
      }
      return newSchedule
    })
  }

  const handle24HoursToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setIs24Hours(checked)
    if (checked) {
      setSchedule({ start: '', end: '' })
      setServiceForm(prev => ({ ...prev, hours: '24 horas' }))
    } else {
      setServiceForm(prev => ({ ...prev, hours: '' }))
    }
  }

  const handleEditClick = (s: ServiceLocation) => {
    setEditingId(s.id)
    setServiceForm({
      name: s.name,
      type: s.type,
      address: s.address,
      number: s.number || '',
      complement: s.complement || '',
      neighborhood: s.neighborhood,
      city: s.city,
      zip: s.zip,
      phone: s.phone,
      email: s.email,
      hours: s.hours,
      operatingDays: s.operatingDays || '',
      description: s.description,
      services_offered_text: s.services_offered.join(', '),
      lat: s.lat ? String(s.lat) : '',
      lng: s.lng ? String(s.lng) : '',
      imagemUrl: s.imagemUrl || ''
    })
  }

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    const services_offered = serviceForm.services_offered_text
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const base: Omit<ServiceLocation, 'id'> = {
      name: serviceForm.name,
      type: serviceForm.type,
      address: serviceForm.address,
      number: serviceForm.number,
      complement: serviceForm.complement,
      neighborhood: serviceForm.neighborhood,
      city: serviceForm.city,
      zip: serviceForm.zip,
      phone: serviceForm.phone,
      email: serviceForm.email,
      hours: serviceForm.hours,
      operatingDays: serviceForm.operatingDays || undefined,
      description: serviceForm.description,
      services_offered,
      lat: serviceForm.lat ? parseFloat(serviceForm.lat) : undefined,
      lng: serviceForm.lng ? parseFloat(serviceForm.lng) : undefined,
      imagemUrl: serviceForm.imagemUrl || undefined
    }

    if (editingId) {
      updateExistingService(editingId, base)
      setEditingId(null)
    } else {
      saveService(base)
    }

    setServiceForm({
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
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!isAuthenticated) return null

  return (
    <div className="pt-32 pb-20 bg-[#F8FAFC] dark:bg-slate-900 flex-grow w-full">
      <Helmet>
        <title>Área Administrativa - PopInfo</title>
      </Helmet>
      <div className="container mx-auto px-6 max-w-7xl">
        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Painel Administrativo</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Gerencie serviços do sistema</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button onClick={() => setShowExportModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-md">
                <LuDownload />
                Exportar JSON
              </button>
              
              <button onClick={handleLogout} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-red-600 font-semibold transition-colors">
                <LuLogOut />
                Sair
              </button>
            </div>
          </div>
        </FadeIn>

        <FadeIn>
            <form onSubmit={handleServiceSubmit} className="bg-white dark:bg-transparent p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-transparent space-y-5 backdrop-blur-sm max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <LuBriefcase size={22} strokeWidth={1.5} className="text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cadastro de Serviço</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nome</label>
                  <input name="name" value={serviceForm.name} onChange={handleServiceChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tipo</label>
                  <select name="type" value={serviceForm.type} onChange={handleServiceChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" required>
                    {['CAPS', 'CRAS', 'CREAS', 'C.A / CTA', 'Saúde', 'Alimentação', 'Trabalho', 'Outro'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">CEP</label>
                  <input name="zip" value={serviceForm.zip} onChange={handleZipChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" placeholder="00000-000" required />
                </div>
                <div className="relative md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Endereço</label>
                  <input name="address" value={serviceForm.address} onChange={handleServiceChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" required autoComplete="off" />
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <ul className="absolute z-50 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl mt-1 shadow-lg max-h-60 overflow-y-auto">
                      {addressSuggestions.map((suggestion, index) => (
                        <li key={index} onClick={() => handleSelectAddress(suggestion)} className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-200 text-sm">
                          {suggestion.logradouro}, {suggestion.bairro} - {suggestion.localidade}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Número</label>
                  <input name="number" value={serviceForm.number} onChange={handleServiceChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Bairro</label>
                  <input name="neighborhood" value={serviceForm.neighborhood} onChange={handleServiceChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Telefone</label>
                  <input name="phone" value={serviceForm.phone} onChange={handlePhoneChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" placeholder="(00) 00000-0000" required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">E-mail</label>
                  <input type="email" name="email" value={serviceForm.email} onChange={handleServiceChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Horário</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={is24Hours} onChange={handle24HoursToggle} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">24 horas</span>
                    </label>
                  </div>
                  {!is24Hours && (
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <label className="text-xs text-slate-500 mb-1 block">Dias de Funcionamento</label>
                        <input name="operatingDays" value={serviceForm.operatingDays || ''} onChange={handleServiceChange} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white text-slate-900 dark:text-slate-200" placeholder="Ex: Seg a Sex" />
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Abertura</label>
                          <input type="time" value={schedule.start} onChange={(e) => handleScheduleChange('start', e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white text-slate-900 dark:text-slate-200" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Fechamento</label>
                          <input type="time" value={schedule.end} onChange={(e) => handleScheduleChange('end', e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white text-slate-900 dark:text-slate-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Serviços Oferecidos (separados por vírgula)</label>
                  <input name="services_offered_text" value={serviceForm.services_offered_text} onChange={handleServiceChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" placeholder="Alimentação, Banho, Pernoite..." required />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Imagem do Serviço (Opcional)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={async (e) => {
                      await handleImageFile(e.target.files?.[0], (base64) => {
                        setServiceForm(prev => ({ ...prev, imagemUrl: base64 }))
                      })
                    }}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
                  />
                  {serviceForm.imagemUrl && (
                    <div className="mt-4">
                      <div className="w-full h-40 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                        <img src={serviceForm.imagemUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Descrição</label>
                  <textarea name="description" value={serviceForm.description} onChange={handleServiceChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" rows={3} required />
                </div>
              </div>

              {error && <div className="text-red-600 text-sm font-medium">{error}</div>}

              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-3">
                <LuPlus />
                {editingId ? 'Salvar Alterações' : 'Criar Serviço'}
              </button>
            </form>

            <div className="mt-8 space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-4">Serviços cadastrados</h2>
              {services.map(s => (
                <div key={s.id} className="flex flex-col md:flex-row items-center md:justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-transparent text-center md:text-left">
                  <div className="flex flex-col items-center md:items-start">
                    <div className="font-semibold text-slate-900 dark:text-white">{s.name}</div>
                    <div className="text-sm text-slate-500">{s.type} • {s.neighborhood}</div>
                  </div>
                  <div className="flex gap-2 mt-3 md:mt-0">
                    <button onClick={() => handleEditClick(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><LuPencil /></button>
                    <button onClick={() => deleteExistingService(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><LuTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
      </div>

      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Exportar Dados JSON</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Copie o código abaixo como backup
                  </p>
                </div>
                <button 
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <LuLogOut className="rotate-180" />
                </button>
              </div>
              
              <div className="flex-grow overflow-auto p-6 bg-slate-50 dark:bg-slate-900/50">
                <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {getExportData()}
                </pre>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-6 py-2 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={handleCopyExport}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg"
                >
                  {copied ? <LuCheck /> : <LuCopy />}
                  {copied ? 'Copiado!' : 'Copiar JSON'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Admin
