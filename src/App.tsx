import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp as LuArrowUp } from 'lucide-react'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import Loading from './components/Loading'
import Home from './pages/Home'

const Servicos = lazy(() => import('./pages/Servicos'))
const Sobre = lazy(() => import('./pages/Sobre'))
const Contato = lazy(() => import('./pages/Contato'))
const ServicoDetalhes = lazy(() => import('./pages/ServicoDetalhes'))
const Login = lazy(() => import('./pages/Login'))
const Admin = lazy(() => import('./pages/Admin'))

function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let rafId = 0
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = window.requestAnimationFrame(() => {
        setIsVisible(window.scrollY > 500)
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Voltar ao topo"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-2xl bg-[#183F8C] text-white shadow-xl shadow-[#183F8C]/20 hover:bg-[#1C4AA6] hover:shadow-[#183F8C]/30 active:scale-95 transition-colors flex items-center justify-center border border-white/10 dark:bg-slate-900 dark:hover:bg-slate-800 dark:shadow-black/30"
        >
          <LuArrowUp size={20} strokeWidth={1.5} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col">
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#333',
                    color: '#fff',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10B981',
                      secondary: 'white',
                    },
                  },
                }} 
              />
              <Header />
              <main id="main-content" className="grow flex flex-col">
                <Suspense fallback={<Loading />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/servicos" element={<Servicos />} />
                    <Route path="/servicos/:id" element={<ServicoDetalhes />} />
                    <Route path="/sobre" element={<Sobre />} />
                    <Route path="/contato" element={<Contato />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              <BackToTopButton />
            </div>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App

