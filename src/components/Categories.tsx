import { useNavigate } from 'react-router-dom'
import {
  Brain,
  House,
  HeartPulse,
  UtensilsCrossed,
  HandHeart,
  BriefcaseBusiness,
  type LucideIcon
} from 'lucide-react'
import { motion } from 'framer-motion'
import FadeIn from './FadeIn'

interface Category {
  iconKey: 'caps' | 'acolhimento' | 'saude' | 'alimentacao' | 'rede' | 'emprego'
  title: string
  description: string
  filterType: string
}

const categoryIconMap: Record<Category['iconKey'], LucideIcon> = {
  caps: Brain,
  acolhimento: House,
  saude: HeartPulse,
  alimentacao: UtensilsCrossed,
  rede: HandHeart,
  emprego: BriefcaseBusiness
}

const categories: Category[] = [
  {
    iconKey: 'caps',
    title: 'CAPS',
    description: 'Centros de Atenção Psicossocial para saúde mental e dependência química.',
    filterType: 'CAPS'
  },
  {
    iconKey: 'acolhimento',
    title: 'Acolhimento',
    description: 'Serviços de acolhimento e moradia temporária.',
    filterType: 'C.A / CTA'
  },
  {
    iconKey: 'saude',
    title: 'Saúde',
    description: 'Atendimento médico, consultas e serviços de saúde pública.',
    filterType: 'Saúde'
  },
  {
    iconKey: 'alimentacao',
    title: 'Alimentação',
    description: 'Restaurantes populares, cestas básicas e bancos de alimentos.',
    filterType: 'Alimentação'
  },
  {
    iconKey: 'rede',
    title: 'Rede Socioassistencial',
    description: 'CRAS, CREAS e outros serviços de proteção social básica.',
    filterType: 'CRAS'
  },
  {
    iconKey: 'emprego',
    title: 'Emprego',
    description: 'Capacitação profissional e oportunidades de trabalho.',
    filterType: 'Trabalho'
  },
]

const Categories = () => {
  const navigate = useNavigate()

  const handleCategoryClick = (type: string) => {
    navigate(`/servicos?type=${type}`)
  }

  return (
    <section id="categorias" className="pb-32 pt-28 bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-500 relative scroll-mt-28">
      <div className="pointer-events-none absolute top-0 left-0 w-full h-24 bg-linear-to-b from-[#F8FAFC] to-transparent dark:from-slate-900 dark:to-transparent" />
      <FadeIn>
        <div className="text-center max-w-3xl mx-auto mb-28 px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Explorar categorias</h2>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 container mx-auto px-8 max-w-7xl">
        {categories.map((category, index) => {
          const Icon = categoryIconMap[category.iconKey]

          return (
            <FadeIn key={index}>
            <motion.div
              onClick={() => handleCategoryClick(category.filterType)}
              whileHover={{ y: -6, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.12 }}
              className="group bg-white dark:bg-slate-900 p-9 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.06)] cursor-pointer border border-blue-300/80 md:border-slate-100/80 dark:border-slate-800 relative overflow-hidden transition-all duration-150 text-left flex flex-col h-full"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-[#183F8C] to-[#6F8ABF] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-150"></div>
              <div className="flex items-center gap-5 mb-6">
                <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-2xl group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400 transition-colors duration-150 border border-slate-100 dark:border-slate-700">
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150">{category.title}</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">{category.description}</p>
            </motion.div>
            </FadeIn>
          )
        })}
      </div>
    </section>
  )
}

export default Categories

