import { Helmet } from 'react-helmet-async'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/Hero'
import Categories from '../components/Categories'

const Home = () => {
  const location = useLocation()

  useEffect(() => {
    if (location.hash !== '#categorias') return
    const el = document.getElementById('categorias')
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [location.hash])

  return (
    <>
      <Helmet>
        <title>PopInfo - Informação e Serviços ao seu Alcance</title>
        <meta name="description" content="Encontre serviços essenciais e acesse informações úteis para o seu dia a dia. Conectando pessoas e serviços." />
      </Helmet>
      <main className="w-full">
        <Hero />
        <Categories />
      </main>
    </>
  )
}

export default Home




