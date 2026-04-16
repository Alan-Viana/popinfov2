import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as LuSearch } from 'lucide-react'
import { motion } from 'framer-motion'
import FadeIn from './FadeIn'

const Hero = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const descriptionText =
    'Conectamos você a serviços socioassistenciais essenciais na capital paulista. Informação, ajuda, apoio e recursos em um só lugar.'
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [shouldAnimateTyping, setShouldAnimateTyping] = useState(() => {
    try {
      return sessionStorage.getItem('popinfo_hero_typed_once') !== '1'
    } catch {
      return true
    }
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(mediaQuery.matches)
    update()

    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedText(descriptionText)
      return
    }

    if (!shouldAnimateTyping) {
      setTypedText(descriptionText)
      return
    }

    setTypedText('')
    let index = 0
    let intervalId: number | null = null

    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        index += 1
        setTypedText(descriptionText.slice(0, index))
        if (index >= descriptionText.length && intervalId !== null) {
          window.clearInterval(intervalId)
          intervalId = null
          setShouldAnimateTyping(false)
          try {
            sessionStorage.setItem('popinfo_hero_typed_once', '1')
          } catch {
          }
        }
      }, 16)
    }, 180)

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId !== null) window.clearInterval(intervalId)
    }
  }, [descriptionText, prefersReducedMotion, shouldAnimateTyping])

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate('/servicos') 
    } else {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement
      input?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <section className="min-h-[90vh] flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 relative overflow-hidden pt-32 md:pt-20 transition-colors duration-500 perspective-[1000px]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.92] dark:opacity-[0.28]" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(24,63,140,0.14) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(24,63,140,0.14) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }} />
        <div className="absolute inset-0 opacity-[0.68] dark:opacity-[0.22]" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(24,63,140,0.09) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(24,63,140,0.09) 1px, transparent 1px)
          `,
          backgroundSize: '12px 12px'
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F8FAFC]/10 to-[#F8FAFC] dark:via-slate-950/10 dark:to-slate-900" />
      </div>
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[20%] w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-[#6F8ABF]/10 dark:bg-[#6F8ABF]/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      </div>

      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-b from-transparent to-[#F8FAFC] dark:to-slate-900 pointer-events-none transition-colors duration-500" />

      <div className="container mx-auto px-8 max-w-5xl text-center z-10 relative">
        <FadeIn>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-10 leading-tight text-slate-900 dark:text-white tracking-tight">
            <span className="block font-extrabold">
              Central de Informações
            </span>
            <span className="relative inline-block mt-2 font-black">
              <span aria-hidden className="absolute -inset-x-6 -inset-y-4 -z-10 rounded-3xl bg-gradient-to-r from-[#183F8C]/10 to-[#6F8ABF]/10 blur-2xl dark:from-[#183F8C]/15 dark:to-[#6F8ABF]/15" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1C4AA6] via-[#3F61A6] to-[#6F8ABF] dark:from-[#6F8ABF] dark:via-[#3F61A6] dark:to-[#1C4AA6] relative inline-block after:content-[''] after:absolute after:left-0 after:bottom-1 after:h-[6px] after:w-full after:bg-blue-600/20 after:rounded-full after:-z-10 after:rotate-[-1deg] after:scale-x-[1.04]">
                Apoio ao Cidadão
              </span>
            </span>
          </h1>
        </FadeIn>



        <FadeIn>
          <div className="max-w-3xl mx-auto w-full">
            <motion.div 
              whileHover={{ scale: 1.02, rotateX: 2, rotateY: 0, boxShadow: "0px 20px 40px rgba(0,0,0,0.1)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative flex flex-col md:flex-row items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 dark:border-slate-800 focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all transform-style-3d"
            >
              <LuSearch className="hidden md:block text-slate-400 text-2xl ml-4" />
              <input
                type="text"
                className="w-full px-4 py-3 md:py-4 text-base md:text-lg rounded-lg focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 bg-transparent"
                placeholder="Busque por serviço ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                onClick={handleSearch} 
                className="bg-slate-900 dark:bg-[#183F8C] text-white dark:text-white px-8 py-3.5 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-all hover:bg-[#183F8C] dark:hover:bg-white dark:hover:text-slate-900 hover:shadow-md md:w-auto w-full shrink-0"
              >
                Buscar
              </button>
            </motion.div>
            <p className="relative text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium mt-10 md:mt-16 lg:mt-24 mb-12" aria-label={descriptionText}>
              <span className="sr-only">{descriptionText}</span>
              <span aria-hidden className="block opacity-0 select-none pointer-events-none">
                {descriptionText}
              </span>
              <span aria-hidden className="absolute inset-0">
                {typedText}
                {!prefersReducedMotion && shouldAnimateTyping && typedText.length < descriptionText.length && (
                  <motion.span
                    aria-hidden
                    className="inline-block w-[1ch] font-mono text-slate-500 dark:text-slate-400"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    |
                  </motion.span>
                )}
              </span>
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

export default Hero
