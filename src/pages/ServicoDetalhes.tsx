import { useEffect, useState, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { 
  ArrowLeft as LuArrowLeft, 
  Clock3 as LuClock, 
  List as LuList, 
  MapPin as LuMapPin, 
  Phone as LuPhone, 
  Mail as LuMail, 
  MessageCircle as LuMessageCircle, 
  Share2 as LuShare2, 
  Copy as LuCopy, 
  Send as LuSend,
  ExternalLink as LuExternalLink
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import FadeIn from '../components/FadeIn'
import Map from '../components/Map'
import WhatsAppIcon from '../components/WhatsAppIcon'
import { servicesData, type ServiceLocation } from '../data/services'
import { copyToClipboard } from '../utils/clipboard'
import { getStoredServices } from '../utils/storage'
import { fetchServiceById } from '../api/services'

const ServicoDetalhes = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [service, setService] = useState<ServiceLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const shareButtonRef = useRef<HTMLButtonElement>(null)
  const shareMenuRef = useRef<HTMLDivElement>(null)

  const mapLocations = useMemo(() => {
    if (service && service.lat && service.lng) {
      return [{
        id: service.id,
        name: service.name,
        lat: service.lat,
        lng: service.lng,
        address: service.address,
        type: service.type,
        phone: service.phone,
        hours: service.hours
      }]
    }
    return []
  }, [service])

  const getServiceBadgeClassName = (index: number) => {
    const variants = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-emerald-100 text-emerald-800 border-emerald-200',
      'bg-amber-100 text-amber-800 border-amber-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-sky-100 text-sky-800 border-sky-200'
    ]
    return `${variants[index % variants.length]} dark:bg-slate-900/30 dark:text-slate-200 dark:border-transparent`
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node) && 
          shareButtonRef.current && !shareButtonRef.current.contains(event.target as Node)) {
        setShowShareMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const updateMenuPosition = () => {
    if (shareButtonRef.current) {
      const rect = shareButtonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right - 208
      })
    }
  }

  const toggleShareMenu = () => {
    if (navigator.share && !showShareMenu) {
      navigator.share({
        title: `PopInfo: ${service?.name}`,
        text: `Confira este serviço no PopInfo: ${service?.name}\nEndereço: ${service?.address}`,
        url: window.location.href
      }).catch(() => {
        updateMenuPosition()
        setShowShareMenu(true)
      })
    } else {
      updateMenuPosition()
      setShowShareMenu(!showShareMenu)
    }
  }

  const handleShare = (platform: 'whatsapp' | 'telegram' | 'email') => {
    const text = `Confira este serviço no PopInfo: ${service?.name}\nEndereço: ${service?.address}\nMais detalhes em: ${window.location.href}`
    let url = ''
    
    if (platform === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    } else if (platform === 'telegram') {
      url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`
    } else if (platform === 'email') {
      url = `mailto:?subject=${encodeURIComponent(`PopInfo: ${service?.name}`)}&body=${encodeURIComponent(text)}`
    }
    
    if (url) {
      const newWindow = window.open(url, '_blank')
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        toast.error('O compartilhamento foi bloqueado pelo seu navegador.')
      }
    }
    setShowShareMenu(false)
  }

  const copyText = async (text: string, successMessage: string, closeShareMenu = false) => {
    const ok = await copyToClipboard(text)
    if (!ok) {
      toast.error('Não foi possível copiar.')
      return
    }

    toast.success(successMessage)
    if (closeShareMenu) setShowShareMenu(false)
  }

  const getWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
    const message = `Olá! Vi o serviço "${service?.name}" no PopInfo e gostaria de mais informações.`
    return `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(message)}`
  }

  const isMobilePhone = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, '')
    if (!digitsOnly) return false

    const withoutCountryCode = digitsOnly.startsWith('55') && digitsOnly.length > 11 ? digitsOnly.slice(2) : digitsOnly

    const localNumber =
      withoutCountryCode.length === 11 || withoutCountryCode.length === 10
        ? withoutCountryCode.slice(2)
        : withoutCountryCode

    return localNumber.length === 9 && localNumber.startsWith('9')
  }

  useEffect(() => {
    let cancelled = false
    const fetchService = async () => {
      const searchId = String(id)
      setLoading(true)

      try {
        const remote = await fetchServiceById(searchId)
        if (cancelled) return
        setService(remote)
        setLoading(false)
        return
      } catch {
        if (cancelled) return
      }

      const staticService = servicesData.find(s => String(s.id) === searchId)
      if (staticService) {
        setService(staticService)
        setLoading(false)
        return
      }

      const userServices = getStoredServices()
      const userService = userServices.find(s => String(s.id) === searchId)
      if (userService) {
        setService(userService)
        setLoading(false)
        return
      }

      setService(null)
      setLoading(false)
    }

    fetchService()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex-grow w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-slate-900 text-center px-6">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <LuMapPin size={40} strokeWidth={1.5} className="text-slate-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Serviço não encontrado</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
          O serviço que você está procurando não existe ou foi removido do nosso sistema.
        </p>
        <button 
          onClick={() => navigate('/servicos')}
          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
        >
          <LuArrowLeft size={18} strokeWidth={1.5} />
          Voltar para serviços
        </button>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-40 bg-[#F8FAFC] dark:bg-slate-900 flex-grow w-full">
      <Helmet>
        <title>{service.name} - PopInfo</title>
        <meta name="description" content={`Detalhes sobre ${service.name}`} />
      </Helmet>
      
      <div className="container mx-auto px-6 max-w-6xl">
        <FadeIn>
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-bold"
            >
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:border-blue-200 group-hover:text-blue-600">
                <LuArrowLeft size={18} strokeWidth={1.5} />
              </div>
              <span className="hidden sm:inline">Voltar</span>
            </button>

            <div className="relative">
              <button 
                ref={shareButtonRef}
                onClick={toggleShareMenu}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm border ${
                  showShareMenu 
                    ? 'bg-[#183F8C] text-white border-[#183F8C]' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-100 dark:border-slate-700 hover:border-blue-200'
                }`}
              >
                <LuShare2 size={18} />
                <span>Compartilhar</span>
              </button>

              {showShareMenu && createPortal(
                <div 
                  className="fixed z-[9999]" 
                  style={{ top: menuPosition.top, left: menuPosition.left }}
                  ref={shareMenuRef}
                >
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-700 p-2 overflow-hidden"
                    >
                      <button 
                        onClick={() => handleShare('whatsapp')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 rounded-xl transition-colors"
                      >
                        <LuMessageCircle size={18} className="text-green-600" />
                        WhatsApp
                      </button>
                      <button 
                        onClick={() => handleShare('telegram')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 rounded-xl transition-colors"
                      >
                        <LuSend size={18} className="text-blue-500" />
                        Telegram
                      </button>
                      <button 
                        onClick={() => handleShare('email')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 rounded-xl transition-colors"
                      >
                        <LuMail size={18} className="text-amber-600" />
                        E-mail
                      </button>
                      <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2" />
                      <button 
                        onClick={() => copyText(window.location.href, 'Link copiado!', true)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                      >
                        <LuCopy size={18} className="text-slate-500" />
                        Copiar Link
                      </button>
                    </motion.div>
                  </AnimatePresence>
                </div>,
                document.body
              )}
            </div>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="mb-10 text-center max-w-4xl mx-auto">
            <span className="inline-block text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#183F8C] dark:text-[#6F8ABF] border border-slate-200 dark:border-slate-700">
              {service.type}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight mt-5">{service.name}</h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {service.description}
            </p>
          </div>

          <div className="mb-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-stretch gap-6 lg:gap-8">
              <div className="w-full md:w-7/12 flex flex-col gap-6 h-full">
                <div className="ui-card p-6 flex-1 min-h-0 flex flex-col items-center justify-center text-center">
                  <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center text-center gap-y-4">
                    <div className="ui-icon-box text-[#183F8C] dark:text-[#6F8ABF]">
                      <LuClock size={30} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      <span className="ui-ink-underline">Horário</span>
                    </h3>

                    <div className="ui-card-muted w-full p-6 flex flex-col items-center justify-center text-center gap-y-4">
                      {service.hours.toLowerCase().includes('24') ? (
                        <>
                          <p className="inline-flex items-center justify-center px-3 py-1 rounded-full uppercase text-[11px] tracking-[0.16em] font-bold text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-transparent mb-3">
                            Aberto 24h
                          </p>
                          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">24 horas</p>
                        </>
                      ) : (
                        <>
                          {service.operatingDays && (
                            <p className="inline-flex items-center justify-center px-3 py-1 rounded-full uppercase text-[11px] tracking-[0.16em] font-bold text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-transparent mb-3">
                              {service.operatingDays}
                            </p>
                          )}
                          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">{service.hours}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="ui-card p-6 flex-1 min-h-0 flex flex-col items-center justify-center text-center">
                  <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center text-center gap-y-4">
                    <div className="ui-icon-box text-[#183F8C] dark:text-[#6F8ABF]">
                      <LuPhone size={30} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      <span className="ui-ink-underline">Contatos</span>
                    </h3>

                    <div className="w-full flex flex-col items-center justify-center text-center gap-y-4">
                      {service.phone && (
                        <div className="ui-card-muted w-full p-7 flex flex-col items-center justify-center text-center gap-y-4 relative">
                          <button
                            type="button"
                            onClick={() => copyText(service.phone, 'Telefone copiado!')}
                            className="absolute top-4 right-4 inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white/60 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            aria-label="Copiar telefone"
                            title="Copiar telefone"
                          >
                            <LuCopy size={18} strokeWidth={1.5} />
                          </button>
                          <p className="inline-flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                            <LuPhone size={14} strokeWidth={1.5} className="text-slate-500 dark:text-slate-400" />
                            Telefone
                          </p>
                          <a href={`tel:${service.phone}`} className="text-2xl font-bold text-slate-800 dark:text-slate-100 hover:text-[#183F8C] dark:hover:text-[#6F8ABF] transition-colors break-words">
                            {service.phone}
                          </a>
                          {isMobilePhone(service.phone) && (
                            <a 
                              href={getWhatsAppLink(service.phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Abrir WhatsApp"
                              title="Abrir WhatsApp"
                              className="inline-flex items-center justify-center w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full transition-all hover:brightness-110 shadow-lg shadow-green-600/20 hover:shadow-green-600/30"
                            >
                              <WhatsAppIcon size={32} />
                            </a>
                          )}
                        </div>
                      )}

                      {service.email && (
                        <div className="ui-card-muted w-full p-7 flex flex-col items-center justify-center text-center gap-y-4 relative">
                          <button
                            type="button"
                            onClick={() => copyText(service.email, 'E-mail copiado!')}
                            className="absolute top-4 right-4 inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white/60 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            aria-label="Copiar e-mail"
                            title="Copiar e-mail"
                          >
                            <LuCopy size={18} strokeWidth={1.5} />
                          </button>
                          <p className="inline-flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                            <LuMail size={14} strokeWidth={1.5} className="text-slate-500 dark:text-slate-400" />
                            E-mail
                          </p>
                          <a href={`mailto:${service.email}`} className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 hover:text-[#183F8C] dark:hover:text-[#6F8ABF] transition-colors truncate w-full">
                            {service.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-5/12 h-full">
                <div className="ui-card h-full p-7">
                <div className="flex items-center gap-4 mb-5">
                  <div className="ui-icon-box text-[#183F8C] dark:text-[#6F8ABF] dark:bg-slate-800/40">
                    <LuMapPin size={30} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    <span className="ui-ink-underline">Localização</span>
                  </h3>
                </div>

                {service.lat && service.lng && (
                  <Map 
                    locations={mapLocations} 
                    center={[service.lat, service.lng]} 
                    zoom={15}
                    heightClassName="h-[240px] sm:h-[260px]"
                    containerClassName="mb-5 rounded-2xl"
                  />
                )}

                <div className="ui-card-muted p-5 text-center flex flex-col items-center">
                  <p className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-2">
                    {service.address}{service.number ? `, ${service.number}` : ''}{service.complement ? ` - ${service.complement}` : ''}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-500 mb-4">{service.neighborhood}, {service.city} - CEP: {service.zip}</p>
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${service.address}, ${service.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ui-btn-primary"
                  >
                    <LuExternalLink size={18} strokeWidth={1.5} className="flex-shrink-0" />
                    Abrir no Google Maps
                  </a>
                </div>

                {service.imagemUrl && (
                  <div className="ui-card-muted mt-5 overflow-hidden">
                    <div className="w-full h-[140px] sm:h-[180px] bg-transparent flex items-center justify-center">
                      <img
                        src={service.imagemUrl}
                        alt={`Imagem de ${service.name}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="ui-card p-8">
              <div className="flex items-center justify-center gap-4 mb-5 text-center">
                <div className="ui-icon-box text-[#183F8C] dark:text-[#6F8ABF] dark:bg-slate-800/40">
                  <LuList size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Serviços oferecidos</h3>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {service.services_offered.map((item, index) => (
                  <div key={index} className={`flex items-center gap-2 px-4 py-2.5 rounded-full border shadow-sm ${getServiceBadgeClassName(index)}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"></div>
                    <span className="font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </FadeIn>
      </div>

    </div>
  )
}

export default ServicoDetalhes
