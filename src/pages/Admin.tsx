import { Navigate, useNavigate } from 'react-router-dom'
import { Pencil as LuPencil, LogOut as LuLogOut, Plus as LuPlus, Trash2 as LuTrash2, BriefcaseBusiness as LuBriefcase, Download as LuDownload, Copy as LuCopy, Check as LuCheck } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import FadeIn from '../components/FadeIn'
import { useAuth } from '../contexts/AuthContext'
import { serviceTypes, useServicesAdmin } from '../hooks/useServicesAdmin'

const Admin = () => {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const hasLoginGate = sessionStorage.getItem('popinfo_admin_access') === '1'

  const {
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
    handleImageUpload,
    handleSelectAddress,
    handleScheduleChange,
    handle24HoursToggle,
    handleEditClick,
    handleDeleteService,
    handleServiceSubmit,
    handleCopyExport,
  } = useServicesAdmin()

  const handleLogout = () => {
    sessionStorage.removeItem('popinfo_admin_access')
    logout()
    navigate('/')
  }

  if (!hasLoginGate || !isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="pt-32 pb-20 bg-[#F8FAFC] dark:bg-[#050505] grow w-full">
      <Helmet>
        <title>Área Administrativa - PopInfo</title>
      </Helmet>
      <div className="container mx-auto px-6 max-w-7xl">
        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Painel Administrativo</h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2">Gerencie serviços do sistema</p>
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
          <form onSubmit={handleServiceSubmit} className="bg-white dark:bg-[#111111] p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-[#242424] dark:shadow-none space-y-5 backdrop-blur-sm max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <LuBriefcase size={22} strokeWidth={1.5} className="text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cadastro de Serviço</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nome</label>
                <input name="name" value={serviceForm.name} onChange={handleServiceChange} maxLength={120} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#242424] bg-slate-50 dark:bg-[#191919] focus:bg-white dark:focus:bg-[#191919] focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" required />
                {fieldErrors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tipo</label>
                <select name="type" value={serviceForm.type} onChange={handleServiceChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#242424] bg-slate-50 dark:bg-[#191919] focus:bg-white dark:focus:bg-[#191919] focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" required>
                  {serviceTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">CEP</label>
                <input name="zip" value={serviceForm.zip} onChange={handleZipChange} maxLength={9} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#242424] bg-slate-50 dark:bg-[#191919] focus:bg-white dark:focus:bg-[#191919] focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" placeholder="00000-000" required />
                {fieldErrors.zip && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.zip}</p>}
              </div>
              <div className="relative md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Endereço</label>
                <input name="address" value={serviceForm.address} onChange={handleServiceChange} maxLength={160} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#242424] bg-slate-50 dark:bg-[#191919] focus:bg-white dark:focus:bg-[#191919] focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" required autoComplete="off" />
                {fieldErrors.address && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.address}</p>}
                {showSuggestions && addressSuggestions.length > 0 && (
                  <ul className="absolute z-50 w-full bg-white dark:bg-[#191919] border border-slate-200 dark:border-[#242424] rounded-xl mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {addressSuggestions.map((suggestion, index) => (
                      <li key={index} onClick={() => handleSelectAddress(suggestion)} className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#202020] cursor-pointer text-slate-700 dark:text-slate-200 text-sm">
                        {suggestion.logradouro}, {suggestion.bairro} - {suggestion.localidade}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Número</label>
                <input name="number" value={serviceForm.number} onChange={handleServiceChange} maxLength={20} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#242424] bg-slate-50 dark:bg-[#191919] focus:bg-white dark:focus:bg-[#191919] focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" />
                {fieldErrors.number && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.number}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Bairro</label>
                <input name="neighborhood" value={serviceForm.neighborhood} onChange={handleServiceChange} maxLength={120} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#242424] bg-slate-50 dark:bg-[#191919] focus:bg-white dark:focus:bg-[#191919] focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" required />
                {fieldErrors.neighborhood && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.neighborhood}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Telefone</label>
                <input name="phone" value={serviceForm.phone} onChange={handlePhoneChange} maxLength={20} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#242424] bg-slate-50 dark:bg-[#191919] focus:bg-white dark:focus:bg-[#191919] focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" placeholder="(00) 00000-0000" required />
                {fieldErrors.phone && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.phone}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">E-mail</label>
                <input type="email" name="email" value={serviceForm.email} onChange={handleServiceChange} maxLength={254} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#242424] bg-slate-50 dark:bg-[#191919] focus:bg-white dark:focus:bg-[#191919] focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" />
                {fieldErrors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</p>}
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Horário</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={is24Hours} onChange={handle24HoursToggle} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">24 horas</span>
                  </label>
                </div>
                {!is24Hours && (
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1 block">Dias de Funcionamento</label>
                      <input name="operatingDays" value={serviceForm.operatingDays || ''} onChange={handleServiceChange} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#242424] bg-slate-50 dark:bg-[#111111] focus:bg-white text-slate-900 dark:text-slate-200" placeholder="Ex: Seg a Sex" />
                      {fieldErrors.operatingDays && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.operatingDays}</p>}
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Abertura</label>
                        <input type="time" value={schedule.start} onChange={(e) => handleScheduleChange('start', e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-[#242424] bg-slate-50 dark:bg-[#111111] focus:bg-white text-slate-900 dark:text-slate-200" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Fechamento</label>
                        <input type="time" value={schedule.end} onChange={(e) => handleScheduleChange('end', e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-[#242424] bg-slate-50 dark:bg-[#111111] focus:bg-white text-slate-900 dark:text-slate-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Serviços Oferecidos (separados por vírgula)</label>
                <input name="services_offered_text" value={serviceForm.services_offered_text} onChange={handleServiceChange} maxLength={500} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#242424] bg-slate-50 dark:bg-[#191919] focus:bg-white dark:focus:bg-[#191919] focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" placeholder="Alimentação, Banho, Pernoite..." required />
                {fieldErrors.services_offered_text && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.services_offered_text}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ícone / Imagem do Serviço (Opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    await handleImageUpload(file)
                  }}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#242424] bg-slate-50 dark:bg-[#191919] focus:bg-white dark:focus:bg-[#191919] focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {fieldErrors.imagemUrl && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.imagemUrl}</p>}
                {serviceForm.imagemUrl && (
                  <div className="mt-4">
                    <div className="w-full h-40 bg-slate-50 dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-[#242424] overflow-hidden flex items-center justify-center">
                      <img src={serviceForm.imagemUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Descrição</label>
                <textarea name="description" value={serviceForm.description} onChange={handleServiceChange} maxLength={2000} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#242424] bg-slate-50 dark:bg-[#191919] focus:bg-white dark:focus:bg-[#191919] focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" rows={3} required />
                {fieldErrors.description && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.description}</p>}
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
            {services.map((service) => (
              <div key={service.id} className="flex flex-col md:flex-row items-center md:justify-between p-4 bg-white dark:bg-[#191919] rounded-xl border border-slate-100 dark:border-[#242424] text-center md:text-left">
                <div className="flex flex-col items-center md:items-start">
                  <div className="font-semibold text-slate-900 dark:text-white">{service.name}</div>
                  <div className="text-sm text-slate-500">{service.type} • {service.neighborhood}</div>
                </div>
                <div className="flex gap-2 mt-3 md:mt-0">
                  <button onClick={() => handleEditClick(service)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><LuPencil /></button>
                  <button onClick={() => handleDeleteService(service.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><LuTrash2 /></button>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#191919] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-[#242424] flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Exportar Dados JSON</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-300">Copie o código abaixo como backup</p>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-[#202020] rounded-full transition-colors"
                >
                  <LuLogOut className="rotate-180" />
                </button>
              </div>

              <div className="grow overflow-auto p-6 bg-slate-50 dark:bg-[#111111]">
                <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {exportData}
                </pre>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-[#242424] flex justify-end gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-6 py-2 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors"
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
