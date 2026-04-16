# PopInfo — Hub Socioassistencial

O PopInfo é uma plataforma centralizadora de informações socioassistenciais, desenvolvida para facilitar o acesso de cidadãos e profissionais da rede aos serviços, contatos e locais de atendimento em São Paulo.

O projeto nasceu da minha experiência de 8 anos na área social, unindo a necessidade de agilidade no atendimento à tecnologia moderna.

## Tecnologias e Ferramentas

O projeto utiliza uma stack moderna, com foco em desempenho, tipagem e escalabilidade:

- Front-end: React + TypeScript
- Build Tool: Vite
- Estilização: Tailwind CSS
- Animações: Framer Motion
- Mapas: Leaflet e React-Leaflet
- Backend-as-a-Service: Supabase (PostgreSQL e Auth)
- Deploy: Vercel

## Funcionalidades Principais

- Busca inteligente com filtros e pesquisa rápida por serviços e categorias.
- Geolocalização com visualização de unidades de atendimento em mapa interativo.
- Ações rápidas para copiar contatos e iniciar conversas via WhatsApp.
- Painel administrativo com CRUD completo para gerenciamento de serviços, exclusivo para administradores.
- Interface adaptativa com suporte completo aos temas claro e escuro.

## Arquitetura e Segurança

- Autenticação integrada diretamente ao Supabase Auth no front-end.
- Validação de administrador via tabela admins no banco de dados, garantindo que apenas usuários autorizados realizem alterações.
- Proteção de leitura e escrita com Row Level Security (RLS) no Supabase.

