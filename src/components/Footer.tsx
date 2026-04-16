import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 pt-8 pb-6 mt-auto border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="container mx-auto px-8 max-w-7xl flex flex-col items-center justify-center gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <img 
            src="/logo.png" 
            alt="Logo PopInfo" 
            className="w-8 h-8 rounded-lg shadow-sm group-hover:scale-[1.02] group-hover:rotate-3 transition-all duration-300 object-cover dark:brightness-0 dark:invert dark:shadow-none"
          />
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:opacity-80 transition-opacity duration-300">PopInfo</span>
        </Link>
        <div className="text-xs text-slate-500 dark:text-slate-500 text-center flex flex-col sm:flex-row items-center gap-2">
          <span>por Alan Viana • Projeto de portfólio</span>
          <span className="hidden sm:inline">•</span>
          <span>© 2026 • v2.0</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer

