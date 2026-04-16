# PopInfo — Alan Viana

Este é o repositório do meu projeto PopInfo, um hub socioassistencial para listar serviços, contatos e informações de atendimento, com foco em navegação rápida, mapa e compartilhamento.

## Tecnologias utilizadas

- React + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Leaflet / React-Leaflet
- Vercel Functions (API)
- Supabase (Postgres)

## Funcionalidades

- Catálogo de serviços com busca e filtros
- Tela de detalhes com horário, contatos (copiar/WhatsApp) e mapa
- Painel Admin para criar/editar/excluir serviços (persistência no Supabase)
- Tema claro/escuro

## Como rodar localmente

```bash
git clone https://github.com/SEU_USER/SEU_REPO.git
cd SEU_REPO
npm install
npm run dev
```

## Configuração (Vercel + Supabase)

1) No Supabase, rode o schema:

- Arquivo: supabase/schema.sql

2) No Vercel (Project → Settings → Environment Variables), defina:

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- ADMIN_EMAIL
- ADMIN_PASSWORD
- ADMIN_JWT_SECRET

Se o Vercel reclamar de versão do Node, ajuste em:

- Project → Settings → General → Node.js Version: 20.x

3) Faça deploy no Vercel e teste:

- /api/services
- /login
- /admin
