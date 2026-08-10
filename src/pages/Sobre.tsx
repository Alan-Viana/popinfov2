import { Helmet } from 'react-helmet-async'
import { HandHeart as LuHeartHandshake, Eye as LuEye, Heart as LuHeart, Shield as LuShield, MapPin as LuMapPin, Target as LuTarget } from 'lucide-react'
import FadeIn from '../components/FadeIn'

const values = [
  {
    title: 'Transparência',
    description: 'Informações claras, organizadas e confiáveis para consulta rápida.',
    icon: LuEye,
  },
  {
    title: 'Inclusão',
    description: 'Acesso pensado para pessoas em diferentes contextos e necessidades.',
    icon: LuHeart,
  },
  {
    title: 'Ética',
    description: 'Compromisso com responsabilidade, cuidado e uso responsável dos dados.',
    icon: LuShield,
  },
  {
    title: 'Atualização',
    description: 'Evolução contínua para manter o conteúdo útil e atual.',
    icon: LuTarget,
  },
]

const Sobre = () => {
  return (
    <div className="grow w-full bg-[#F8FAFC] pt-32 pb-24 dark:bg-[#050505]">
      <Helmet>
        <title>Sobre o Projeto - PopInfo</title>
        <meta name="description" content="Saiba mais sobre o PopInfo, a missão de conectar pessoas a serviços essenciais e os valores de transparência e inclusão." />
      </Helmet>
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mx-auto max-w-3xl pb-16 md:pb-24">
          <FadeIn>
            <h1 className="bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent dark:bg-none dark:text-white md:text-6xl">
              Sobre o PopInfo
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300 md:text-xl">
              Uma plataforma dedicada a conectar pessoas aos serviços essenciais de São Paulo
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FadeIn>
            <article className="group h-full rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:p-10 dark:border-[#242424] dark:bg-[#111111] dark:shadow-none dark:hover:border-[#303030]">
              <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-900 ring-1 ring-slate-100 transition-transform duration-300 group-hover:scale-[1.02] dark:bg-[#191919] dark:text-white dark:ring-[#2a2a2a]">
                <LuHeartHandshake />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Missão</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300 md:text-lg">
                Facilitar o acesso da população de São Paulo aos serviços públicos essenciais,
                promovendo a inclusão social e ampliando o alcance das informações para pessoas em situação de vulnerabilidade.
              </p>
            </article>
          </FadeIn>

          <FadeIn>
            <article className="group h-full rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:p-10 dark:border-[#242424] dark:bg-[#111111] dark:shadow-none dark:hover:border-[#303030]">
              <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-900 ring-1 ring-slate-100 transition-transform duration-300 group-hover:scale-[1.02] dark:bg-[#191919] dark:text-white dark:ring-[#2a2a2a]">
                <LuMapPin />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Abrangência</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300 md:text-lg">
                Cobrimos todos os distritos da cidade de São Paulo, oferecendo informações
                atualizadas sobre serviços disponíveis em cada região. Seja no centro da
                cidade ou nas periferias, o objetivo é garantir que ninguém fique sem
                acesso às informações necessárias.
              </p>
            </article>
          </FadeIn>

          <FadeIn className="md:col-span-2">
            <section className="mt-6 rounded-3xl bg-slate-50 p-8 md:p-10 dark:bg-[#090909]">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {values.map((value) => {
                  const Icon = value.icon

                  return (
                    <div
                      key={value.title}
                      className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-[#242424] dark:bg-[#111111] dark:shadow-none dark:hover:border-[#303030]"
                    >
                      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-900 ring-1 ring-slate-100 dark:bg-[#191919] dark:text-white dark:ring-[#2a2a2a]">
                        <Icon size={20} strokeWidth={1.75} />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        {value.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {value.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}

export default Sobre

