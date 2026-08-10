import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  ArrowLeft as LuArrowLeft,
  Clock3 as LuClock,
  Copy as LuCopy,
  ExternalLink as LuExternalLink,
  Info as LuInfo,
  List as LuList,
  MapPin as LuMapPin,
  Phone as LuPhone,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import FadeIn from '../components/FadeIn'
import Map from '../components/Map'
import { fetchPublicServiceById } from '../api/services'
import { servicesData, type PublicServiceLocation, toPublicServiceLocation } from '../data/services'
import { getStoredServices } from '../utils/storage'
import { copyToClipboard } from '../utils/clipboard'

const ServicoDetalhes = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [service, setService] = useState<PublicServiceLocation | null>(null)
  const [loading, setLoading] = useState(true)

  const mapLocations = useMemo(() => {
    if (!service || service.lat === undefined || service.lng === undefined) return []

    return [{
      id: service.id,
      name: service.name,
      lat: service.lat,
      lng: service.lng,
      address: service.address,
      type: service.type,
      phone: service.phone,
      hours: service.hours,
    }]
  }, [service])

  const copyText = async (text: string) => {
    const copied = await copyToClipboard(text)
    if (copied) {
      toast.success('Telefone copiado!')
    } else {
      toast.error('Não foi possível copiar.')
    }
  }

  useEffect(() => {
    let cancelled = false

    const loadService = async () => {
      const searchId = String(id)
      setLoading(true)

      try {
        const remote = await fetchPublicServiceById(searchId)
        if (cancelled) return
        setService(remote)
        return
      } catch {
        if (cancelled) return
      }

      const staticService = servicesData.find(item => String(item.id) === searchId)
      if (staticService) {
        setService(toPublicServiceLocation(staticService))
        return
      }

      const storedService = getStoredServices().find(item => String(item.id) === searchId)
      setService(storedService ? toPublicServiceLocation(storedService) : null)
    }

    void loadService().finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex w-full grow items-center justify-center bg-[#F8FAFC] dark:bg-[#050505]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#F8FAFC] px-6 text-center dark:bg-[#050505]">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-[#191919]">
          <LuMapPin size={40} strokeWidth={1.5} className="text-slate-400" />
        </div>
        <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">Serviço não encontrado</h2>
        <p className="mb-8 max-w-md text-slate-600 dark:text-slate-300">
          O serviço que você está procurando não existe ou foi removido do nosso sistema.
        </p>
        <button
          onClick={() => navigate('/servicos')}
          className="flex items-center gap-2 rounded-xl bg-[#183F8C] px-8 py-3 font-bold text-white shadow-md transition-all hover:bg-[#1C4AA6]"
        >
          <LuArrowLeft size={18} strokeWidth={1.5} />
          Voltar para serviços
        </button>
      </div>
    )
  }

  const fullAddress = `${service.address}${service.number ? `, ${service.number}` : ''}${service.complement ? ` - ${service.complement}` : ''}`
  const locationLine = `${service.neighborhood}, ${service.city}${service.zip ? ` - CEP: ${service.zip}` : ''}`

  return (
    <div className="w-full grow bg-[#F8FAFC] pb-24 pt-28 dark:bg-[#050505]">
      <Helmet>
        <title>{service.name} - PopInfo</title>
        <meta name="description" content={`Detalhes sobre ${service.name}`} />
      </Helmet>

      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <FadeIn>
          <div className="mb-6 text-center">
            <span className="inline-flex rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 dark:border-[#303030] dark:bg-[#191919] dark:text-slate-200">
              {service.type}
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
            <section className="lg:col-span-7">
              <h1 className="mb-5 px-1 text-center text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl">
                {service.name}
              </h1>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-[#242424] dark:bg-[#111111] dark:shadow-none sm:p-4">
                {service.imagemUrl ? (
                  <img
                    src={service.imagemUrl}
                    alt={`Imagem de ${service.name}`}
                    className="aspect-[4/3] w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-[#191919] dark:text-slate-500">
                    <LuMapPin size={54} strokeWidth={1.25} />
                  </div>
                )}
              </div>

              <div className="max-w-3xl px-1 pt-5 text-left sm:pt-6">
                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300 md:text-xl">
                  {service.description}
                </p>
              </div>
            </section>

            <aside className="space-y-6 lg:col-span-5">
            <section className="ui-card p-5 sm:p-6">
              <div className="mb-5 flex flex-col items-center text-center">
                <div className="ui-icon-box mb-3 h-12 w-12 rounded-xl text-[#183F8C] dark:text-[#6F8ABF]">
                  <LuMapPin size={25} strokeWidth={1.5} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Localização</h2>
              </div>

              {mapLocations.length > 0 ? (
                <Map
                  locations={mapLocations}
                  center={[service.lat!, service.lng!]}
                  zoom={15}
                  heightClassName="h-48 sm:h-56"
                  containerClassName="mb-4 rounded-xl"
                />
              ) : (
                <div className="mb-4 flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-[#242424] dark:bg-[#191919] dark:text-slate-500 sm:h-56">
                  <LuMapPin size={34} strokeWidth={1.5} />
                </div>
              )}

              <div className="ui-card-muted p-4 text-center">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{fullAddress}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{locationLine}</p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${fullAddress}, ${service.city}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ui-btn-primary mt-4"
                >
                  <LuExternalLink size={16} strokeWidth={1.5} />
                  Abrir no Google Maps
                </a>
              </div>
            </section>

            <section className="ui-card hidden p-5 sm:p-6 lg:block">
              <div className="flex items-center gap-3">
                <div className="ui-icon-box h-10 w-10 rounded-xl text-[#183F8C] dark:text-[#6F8ABF]">
                  <LuInfo size={20} strokeWidth={1.5} />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Informações essenciais</h2>
              </div>

              <div className="mt-5 flex items-start gap-3">
                <div className="ui-icon-box h-9 w-9 shrink-0 rounded-xl text-slate-600 dark:text-slate-300">
                  <LuClock size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Horário</p>
                  {service.operatingDays && <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{service.operatingDays}</p>}
                  <p className="text-lg font-bold leading-tight text-slate-900 dark:text-white">{service.hours}</p>
                </div>
              </div>

              <div className="ui-card-muted mt-5 flex items-center gap-3 p-3">
                <div className="ui-icon-box h-9 w-9 shrink-0 rounded-xl text-slate-600 dark:text-slate-300">
                  <LuPhone size={18} strokeWidth={1.5} />
                </div>
                <div className="min-w-0 grow">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Contatos</p>
                  {service.phone ? (
                    <a href={`tel:${service.phone}`} className="mt-1 block text-base font-bold text-slate-900 transition-colors hover:text-[#183F8C] dark:text-white dark:hover:text-[#6F8ABF]">
                      {service.phone}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Não informado</p>
                  )}
                </div>
                {service.phone && (
                  <button
                    type="button"
                    onClick={() => void copyText(service.phone)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-[#183F8C] hover:text-[#183F8C] dark:border-[#303030] dark:bg-[#191919] dark:text-slate-300 dark:hover:border-[#6F8ABF] dark:hover:text-white"
                    aria-label="Copiar telefone"
                    title="Copiar telefone"
                  >
                    <LuCopy size={16} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </section>

            <section className="ui-card hidden p-5 sm:p-6 lg:block">
              <div className="flex items-center gap-3">
                <div className="ui-icon-box h-10 w-10 rounded-xl text-[#183F8C] dark:text-[#6F8ABF]">
                  <LuList size={20} strokeWidth={1.5} />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Serviços oferecidos</h2>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {service.services_offered.length > 0 ? service.services_offered.map((item, index) => (
                  <span
                    key={`${item}-${index}`}
                    className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:border-[#303030] dark:bg-[#191919] dark:text-slate-200"
                  >
                    {item}
                  </span>
                )) : (
                  <p className="text-sm text-slate-600 dark:text-slate-300">Nenhum serviço informado.</p>
                )}
              </div>
            </section>
            </aside>
          </div>

          <div className="mt-6 grid gap-6 lg:hidden">
            <section className="ui-card p-6 sm:p-7 lg:col-span-7 lg:min-h-80">
              <div className="flex items-center gap-4">
                <div className="ui-icon-box h-12 w-12 rounded-xl text-[#183F8C] dark:text-[#6F8ABF]">
                  <LuInfo size={24} strokeWidth={1.5} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Informações essenciais</h2>
              </div>

              <div className="mt-6 flex items-start gap-4">
                <div className="ui-icon-box h-11 w-11 shrink-0 rounded-xl text-slate-600 dark:text-slate-300">
                  <LuClock size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Horário</p>
                  {service.operatingDays && <p className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100">{service.operatingDays}</p>}
                  <p className="text-xl font-bold leading-tight text-slate-900 dark:text-white">{service.hours}</p>
                </div>
              </div>

              <div className="ui-card-muted mt-6 flex items-center gap-4 p-4">
                <div className="ui-icon-box h-11 w-11 shrink-0 rounded-xl text-slate-600 dark:text-slate-300">
                  <LuPhone size={22} strokeWidth={1.5} />
                </div>
                <div className="min-w-0 grow">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Contatos</p>
                  {service.phone ? (
                    <a href={`tel:${service.phone}`} className="mt-1 block text-xl font-bold text-slate-900 transition-colors hover:text-[#183F8C] dark:text-white dark:hover:text-[#6F8ABF]">
                      {service.phone}
                    </a>
                  ) : (
                    <p className="mt-1 text-base text-slate-600 dark:text-slate-300">Não informado</p>
                  )}
                </div>
                {service.phone && (
                  <button
                    type="button"
                    onClick={() => void copyText(service.phone)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-[#183F8C] hover:text-[#183F8C] dark:border-[#303030] dark:bg-[#191919] dark:text-slate-300 dark:hover:border-[#6F8ABF] dark:hover:text-white"
                    aria-label="Copiar telefone"
                    title="Copiar telefone"
                  >
                    <LuCopy size={18} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </section>

            <section className="ui-card p-6 sm:p-7 lg:col-span-5 lg:min-h-80">
              <div className="flex items-center gap-4">
                <div className="ui-icon-box h-12 w-12 rounded-xl text-[#183F8C] dark:text-[#6F8ABF]">
                  <LuList size={24} strokeWidth={1.5} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Serviços oferecidos</h2>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {service.services_offered.length > 0 ? service.services_offered.map((item, index) => (
                  <span
                    key={`${item}-${index}`}
                    className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 dark:border-[#303030] dark:bg-[#191919] dark:text-slate-200"
                  >
                    {item}
                  </span>
                )) : (
                  <p className="text-sm text-slate-600 dark:text-slate-300">Nenhum serviço informado.</p>
                )}
              </div>
            </section>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}

export default ServicoDetalhes
