import { Loader as LuLoader } from 'lucide-react'

const Loading = () => {
  return (
    <div className="grow w-full flex items-center justify-center bg-slate-50 dark:bg-[#050505] min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <LuLoader className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">Carregando...</p>
      </div>
    </div>
  )
}

export default Loading

