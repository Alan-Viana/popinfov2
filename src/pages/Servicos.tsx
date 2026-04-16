import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { MapPin as LuMapPin, Phone as LuPhone, Clock3 as LuClock, Search as LuSearch, Map as LuMap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import FadeIn from '../components/FadeIn'
import Map from '../components/Map'
import { servicesData, type ServiceLocation } from '../data/services'
import { getStoredServices } from '../utils/storage'
import { fetchServices } from '../api/services'

const Servicos = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const typeParam = searchParams.get('type')
  const [selectedType, setSelectedType] = useState<string>(typeParam || 'Todos')
  const [userServices, setUserServices] = useState<ServiceLocation[]>([])
  const [remoteServices, setRemoteServices] = useState<ServiceLocation[] | null>(null)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    if (typeParam) {
      setSelectedType(typeParam)
    }
  }, [typeParam])

  useEffect(() => {
    setUserServices(getStoredServices())
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchServices()
      .then((data) => {
        if (cancelled) return
        setRemoteServices(data)
      })
      .catch(() => {
        if (cancelled) return
        setRemoteServices(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    if (type === 'Todos') {
      searchParams.delete('type')
      setSearchParams(searchParams)
    } else {
      setSearchParams({ type })
    }
  }

  const allServices = useMemo(() => {
    if (remoteServices) return remoteServices
    return [...servicesData, ...userServices]
  }, [remoteServices, userServices])
  const uniqueTypes = useMemo(() => ['Todos', ...Array.from(new Set(allServices.map(s => s.type)))], [allServices])

  const filteredServices = useMemo(() => allServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.services_offered.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = selectedType === 'Todos' || service.type === selectedType

    return matchesSearch && matchesType
  }), [allServices, searchTerm, selectedType])

  const mapLocations = useMemo(() => {
    return filteredServices
      .filter(s => s.lat !== undefined && s.lng !== undefined)
      .map(s => ({
        id: s.id,
        name: s.name,
        lat: s.lat!,
        lng: s.lng!,
        address: s.address,
        type: s.type,
        phone: s.phone,
        hours: s.hours
      }))
  }, [filteredServices])

  return (
    <div className="pt-32 pb-20 bg-[#F8FAFC] dark:bg-slate-900 grow w-full">
      <Helmet>
        <title>Rede Socioassistencial - PopInfo</title>
        <meta name="description" content="Encontre serviços da rede socioassistencial, saúde, educação e moradia em São Paulo. Consulte endereços e contatos." />
      </Helmet>
      <div className="container mx-auto px-6 max-w-7xl">
        <FadeIn>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">Rede Socioassistencial</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Encontre os serviços mais próximos de você. Consulte endereços, horários e contatos das unidades de atendimento.
            </p>
          </div>
        </FadeIn>

        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="bg-white dark:bg-transparent p-4 md:p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 dark:border-transparent backdrop-blur-sm overflow-hidden w-full">
            <div className="flex flex-col gap-6">
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative grow">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LuSearch size={18} strokeWidth={1.5} className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="text"
                    aria-label="Buscar serviços"
                    placeholder="Busque por nome, bairro ou serviço..."
                    className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-3.5 border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 text-base md:text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border ${
                    showMap 
                      ? 'bg-[#183F8C] text-white border-[#183F8C] shadow-md hover:bg-[#1C4AA6]' 
                      : 'bg-white dark:bg-transparent text-slate-600 dark:text-slate-300 border-slate-200 dark:border-transparent hover:border-[#6F8ABF]'
                  }`}
                >
                  <LuMap size={18} strokeWidth={1.5} />
                  {showMap ? 'Ocultar Mapa' : 'Ver no Mapa'}
                </button>
              </div>

              <AnimatePresence>
                {showMap && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <Map locations={mapLocations} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-wrap gap-2 md:gap-3 justify-center w-full">
                {uniqueTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    aria-pressed={selectedType === type}
                    className={`px-4 py-2 md:px-6 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all border ${
                      selectedType === type
                        ? 'bg-blue-600 text-white shadow-md border-blue-600 scale-105'
                        : 'bg-white dark:bg-transparent text-slate-600 dark:text-slate-300 border-slate-200 dark:border-transparent hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {filteredServices.map((service) => (
            <li key={service.id}>
              <FadeIn>
                <ServiceCard service={service} />
              </FadeIn>
            </li>
          ))}
        </ul>

        {filteredServices.length === 0 && (
          <div className="text-center py-20 text-slate-500 dark:text-slate-300">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              <LuSearch size={28} strokeWidth={1.5} className="text-slate-300 dark:text-slate-500" />
            </div>
            <p className="text-xl font-medium">Nenhum serviço encontrado com os critérios selecionados.</p>
            <p className="mt-2 text-slate-600 dark:text-slate-500">Tente buscar por outros termos ou limpar os filtros.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const ServiceCard = ({ service }: { service: ServiceLocation }) => {
  const navigate = useNavigate()
  const openDetails = () => navigate(`/servicos/${service.id}`)

  return (
    <div 
      role="link"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openDetails()
        }
      }}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.06)] transition-all duration-300 border border-blue-300/80 md:border-slate-100/80 dark:border-slate-800 hover:-translate-y-2 h-full flex flex-col group relative text-center cursor-pointer overflow-hidden"
      aria-label={`Ver detalhes de ${service.name}`}
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-[#183F8C] to-[#6F8ABF] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      <div className="p-6 md:p-8 flex-1 flex flex-col items-center text-center">
        <div className="flex flex-col mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {service.type}
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">{service.name}</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm line-clamp-2">{service.description}</p>
        </div>

        <div className="flex flex-col gap-3 mb-6 flex-1 text-sm">
          <div className="flex flex-col items-center justify-center text-center gap-2 text-slate-600 dark:text-slate-300 group/item">
            <LuMapPin size={18} strokeWidth={1.5} className="text-slate-400 dark:text-slate-500 group-hover/item:text-blue-500 transition-colors" />
            <div className="flex flex-col items-center text-center">
              <span className="font-medium text-slate-900 dark:text-white">
                {service.address}{service.number ? `, ${service.number}` : ''}
              </span>
              <span className="text-slate-500 dark:text-slate-400">{service.neighborhood}, {service.city}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center text-center gap-2 text-slate-600 dark:text-slate-300 group/item">
            <LuClock size={18} strokeWidth={1.5} className="text-slate-400 dark:text-slate-500 group-hover/item:text-blue-500 transition-colors" />
            <span className="font-medium">{service.hours}</span>
          </div>

          <div className="flex flex-col items-center justify-center text-center gap-2 text-slate-600 dark:text-slate-300 group/item">
            <LuPhone size={18} strokeWidth={1.5} className="text-slate-400 dark:text-slate-500 group-hover/item:text-blue-500 transition-colors" />
            <span className="font-medium">{service.phone}</span>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mt-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {service.services_offered.slice(0, 3).map((item, index) => (
              <span key={index} className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-100 dark:border-slate-700">
                {item}
              </span>
            ))}
            {service.services_offered.length > 3 && (
              <span className="text-slate-500 dark:text-slate-500 text-xs font-medium px-2 py-1">
                +{service.services_offered.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Servicos


