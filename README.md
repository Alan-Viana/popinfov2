# PopInfo — Hub Socioassistencial

O PopInfo é uma plataforma centralizadora de informações socioassistenciais, desenvolvida para facilitar o acesso de cidadãos e profissionais da rede aos serviços, contatos e locais de atendimento em São Paulo.

O projeto foi pensado para unir agilidade operacional, organização de dados e uma base técnica preparada para evolução incremental.

## Stack Tecnológica

O projeto utiliza uma stack moderna, com foco em tipagem, previsibilidade e segurança de dados:

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- Lucide React
- Framer Motion
- Leaflet e React-Leaflet

## Funcionalidades Principais

- Busca com filtros por categoria e pesquisa textual por serviços e bairros.
- Exibição de unidades em mapa interativo com marcadores georreferenciados.
- Compartilhamento rápido de contato via WhatsApp e demais canais.
- Painel administrativo com CRUD para gerenciamento de serviços.
- Interface responsiva com suporte aos temas claro e escuro.

## Arquitetura de Software

- A lógica de domínio e manipulação de estado do painel administrativo foi isolada em custom hooks, com destaque para `useServicesAdmin`.
- O componente de UI de administração foi reduzido ao papel de apresentação, recebendo estados e handlers prontos do hook.
- A camada de acesso a dados permanece centralizada em uma API única, evitando duplicação de regras de leitura e escrita.
- O projeto utiliza uma separação explícita entre dados públicos e dados administrativos.

## Segurança e Validação

- O frontend valida entradas com Zod antes de enviar qualquer payload ao banco.
- O PostgreSQL reforça a integridade com check constraints alinhadas ao contrato do frontend.
- O acesso administrativo é protegido por Row Level Security (RLS) no Supabase.
- A autorização de administrador é controlada por uma tabela dedicada de permissões (`admins`).
- A leitura pública é feita por meio de view dedicada, separando consumo público de acesso administrativo.

## Estabilidade

- O projeto inclui Error Boundaries para capturar falhas críticas de renderização e evitar telas em branco.
- Erros de busca de coordenadas, carregamento de serviços e envio de formulário são tratados com feedback visual.
- O fluxo de edição mantém a sincronização entre formulário, geocoding e persistência no banco.

## Camada de Dados

- A aplicação usa Supabase como backend para autenticação, persistência e políticas de acesso.
- A tabela `services` concentra a fonte de verdade administrativa.
- A view `public_services` expõe apenas os campos necessários para consumo público.
- As políticas de RLS restringem leitura e escrita conforme o perfil autenticado e a lista de administradores.

## Como Rodar o Projeto

1. Instale as dependências:

```bash
npm install
```

2. Crie o arquivo `.env.local` na raiz do projeto com as variáveis necessárias:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_TURNSTILE_SITE_KEY=...
VITE_CONTACT_EMAIL=...
```

3. Execute o ambiente de desenvolvimento:

```bash
npm run dev
```

4. Para gerar a build de produção:

```bash
npm run build
```

## Observações Técnicas

- O mapa depende de coordenadas válidas (`lat` e `lng`) para exibir marcadores.
- A autenticação administrativa depende do Supabase Auth combinado com a política de RLS.
- As constraints do banco devem ser aplicadas junto com a migration do schema para garantir consistência entre ambiente local e produção.

