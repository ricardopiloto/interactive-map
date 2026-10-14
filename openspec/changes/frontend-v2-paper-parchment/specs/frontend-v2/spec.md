# Spec Delta

## Purpose

Define o contrato que a nova interface web do produto (`frontend-v2/`, derivada do design de `paper-parchment-pages-main`) precisa satisfazer para substituir `frontend/` sem perder nenhuma funcionalidade, regra de negócio ou garantia já entregue hoje.

## ADDED Requirements

### Requirement: Paridade funcional com o frontend atual
Toda tela, fluxo e ação disponível hoje em `frontend/` SHALL ter um equivalente funcional em `frontend-v2/`, incluindo telas que não existem no template de origem (`paper-parchment-pages-main`). Uma tela só SHALL ser omitida se for código morto/depreciado confirmado no frontend atual (ex.: componente órfão não importado, página marcada `@deprecated`).

#### Scenario: Funcionalidade existente em frontend/ sem equivalente
- **WHEN** uma tela ou ação de `frontend/` (ex. CRUD de Sessões, Linha do Tempo, export/import de campanha, console de super-admin) é auditada em `frontend-v2/`
- **THEN** existe uma tela ou fluxo equivalente em `frontend-v2/` que cobre a mesma ação, ou a ausência está documentada como código morto/depreciado do frontend atual

#### Scenario: Tela presente só no template de origem é mantida
- **WHEN** uma tela já existente em `paper-parchment-pages-main` (Mapa, Relações, Rota, Sessões, Cronologia) é adaptada para `frontend-v2/`
- **THEN** a tela continua disponível em `frontend-v2/`, agora ligada a dados e regras reais em vez do mock original

### Requirement: Stack de aplicação igual à do frontend atual
`frontend-v2/` SHALL usar as mesmas bibliotecas de aplicação que `frontend/` já usa hoje (roteamento, busca de dados, i18n, conteúdo rico, interação de mapa, gerenciador de pacotes), não o harness de aplicação do template de origem. Esta Requirement é independente da de design visual: tecnologia de aplicação não muda; só o visual vem do template.

#### Scenario: Roteamento usa react-router-dom, não o roteador do template
- **WHEN** qualquer navegação entre telas de `frontend-v2/` é implementada
- **THEN** ela usa `react-router-dom`, sem nenhuma dependência de `@tanstack/react-router` ou `@tanstack/react-start` no projeto

#### Scenario: Busca de dados usa client HTTP próprio, não TanStack Query
- **WHEN** qualquer tela de `frontend-v2/` busca dados da API
- **THEN** ela usa o client HTTP próprio do projeto (hooks equivalentes aos de `frontend/src/api/`), sem nenhuma dependência de `@tanstack/react-query` no projeto

#### Scenario: Demais bibliotecas de aplicação seguem o padrão de frontend/
- **WHEN** i18n, renderização de conteúdo rico, interação de pan/zoom do mapa ou build/empacotamento são implementados em `frontend-v2/`
- **THEN** usam, respectivamente, `react-i18next`, `react-markdown`/`rehype-sanitize`, `react-zoom-pan-pinch` e npm — as mesmas bibliotecas já usadas em `frontend/`, não as do template de origem

### Requirement: Design visual exclusivo do paper-parchment-pages-main
`frontend-v2/` SHALL usar exclusivamente o design system herdado de `paper-parchment-pages-main` (paleta OKLCH, Tailwind v4, componentes `shadcn/ui`/Radix, tipografia). Nenhuma cor, token, componente ou classe CSS do design system "Nocturne" de `frontend/` ou de `frontend-next/` SHALL ser portada. Telas sem equivalente no template de origem SHALL ser construídas estendendo esse mesmo design system, nunca introduzindo um segundo vocabulário visual.

#### Scenario: Tela nova sem equivalente no template usa o mesmo design system
- **WHEN** uma tela que não existe em `paper-parchment-pages-main` (ex. Painel do mestre, Linha do Tempo, Console de administração) é construída em `frontend-v2/`
- **THEN** ela usa os mesmos tokens de cor OKLCH, a mesma tipografia e os mesmos componentes `shadcn/ui` já presentes no projeto, sem reintroduzir nenhum componente, token ou classe CSS vindo de `frontend/` ou `frontend-next/`

### Requirement: Dados reais da API, nunca mock
`frontend-v2/` SHALL obter todo o conteúdo de campanha (locais, personagens, vínculos, sessões, eventos, arcos, itens, rotas, grupo) através da API do backend existente. Nenhuma tela de produto SHALL depender de dados hardcoded ou de um arquivo de mock equivalente ao `codex-data.ts` do template de origem.

#### Scenario: Tela de domínio carrega dados reais
- **WHEN** qualquer tela de campanha (Mapa, Relações, Rota, Sessões, Linha do Tempo) é aberta em `frontend-v2/`
- **THEN** o conteúdo exibido vem de uma chamada à API do backend da campanha correspondente, não de um arquivo de dados estático no frontend

### Requirement: Autenticação e Modo GM reais
`frontend-v2/` SHALL implementar autenticação real (login por e-mail/senha, convite, reset de senha, sessão por cookie) e SHALL derivar o Modo GM/Mestre de uma checagem real de permissão (`canEdit`/`isDono` via `/api/c/{slug}/admin/session`), nunca de um toggle local sem verificação no servidor.

#### Scenario: Visitante sem sessão não vê controles de edição
- **WHEN** uma pessoa sem sessão autenticada ou sem permissão de edição na campanha abre qualquer tela de campanha
- **THEN** nenhum controle de criação/edição/exclusão de GM é exibido, independentemente de qualquer estado local no navegador

#### Scenario: Dono autenticado entra em Modo GM
- **WHEN** um usuário autenticado com papel `dono` na campanha ativa o Modo GM
- **THEN** o frontend confirma a permissão via `/api/c/{slug}/admin/session` antes de exibir os controles de edição

### Requirement: Isolamento multi-tenant por campanha via rota por slug
Toda tela de conteúdo de campanha em `frontend-v2/` SHALL ser roteada sob `/c/:slug/...`, usando o slug da URL para resolver qual campanha carregar, e SHALL NOT reter dados ou estado da campanha anterior ao navegar para um slug diferente.

#### Scenario: Troca de campanha não reutiliza dados antigos
- **WHEN** uma pessoa sai de uma campanha e abre uma segunda campanha com slug diferente
- **THEN** os dados exibidos (locais, personagens, sessões etc.) pertencem exclusivamente à segunda campanha

### Requirement: i18n pt-BR/en obrigatório
Todo texto de interface (labels, botões, mensagens de erro, títulos de página) em `frontend-v2/` SHALL estar disponível em pt-BR e en através de uma infraestrutura de i18n, com pt-BR como padrão. Conteúdo escrito pelo mestre (nomes, descrições, resumos) SHALL NOT ser traduzido automaticamente.

#### Scenario: Troca de idioma não deixa texto de interface hardcoded
- **WHEN** uma pessoa troca o idioma da interface de pt-BR para en em qualquer tela de `frontend-v2/`
- **THEN** todos os textos de interface (não o conteúdo escrito pelo mestre) são exibidos em inglês

### Requirement: Build e deploy compatíveis com a stack já usada pelo projeto
`frontend-v2/` SHALL ser compilado como aplicação cliente estática (SPA), sem exigir um runtime de servidor Node em produção, e SHALL ser empacotado num container Docker que sirva os arquivos estáticos via nginx, seguindo o mesmo padrão já usado por `frontend/Dockerfile`.

#### Scenario: Deploy de frontend-v2 não introduz runtime novo em produção
- **WHEN** o serviço `web` do `docker-compose.yml` passa a apontar para `frontend-v2/`
- **THEN** o container resultante serve arquivos estáticos via nginx, sem processo Node residente em produção

### Requirement: Migração não regride o frontend em produção antes da paridade
Enquanto `frontend-v2/` não tiver atingido paridade funcional validada, `frontend/` SHALL continuar sendo o frontend servido em produção, sem alteração de comportamento. A troca do serviço `web` para `frontend-v2/` SHALL ser uma ação explícita e posterior à validação de paridade, nunca um efeito colateral automático da migração.

#### Scenario: Produção não é afetada durante o desenvolvimento de frontend-v2
- **WHEN** `frontend-v2/` está em desenvolvimento, incompleto ou não validado
- **THEN** o ambiente de produção continua servindo `frontend/` sem nenhuma mudança de comportamento observável

### Requirement: Conteúdo rico renderizado como Markdown sanitizado
Todo campo de texto longo vindo do backend (descrição de local, resumo de sessão, descrição de evento/item) SHALL ser renderizado em `frontend-v2/` como Markdown sanitizado, reaproveitando o mesmo contrato de conteúdo já usado por `frontend/`. `frontend-v2/` SHALL NOT introduzir um segundo formato de texto rico (como o micro-formato de referência cruzada do template de origem) para o mesmo conteúdo.

#### Scenario: Resumo de sessão com Markdown é exibido com formatação, não como texto cru
- **WHEN** uma sessão com resumo em Markdown (ex. listas, ênfase) é exibida em `frontend-v2/`
- **THEN** o resumo aparece formatado e sanitizado, sem sintaxe de Markdown literal visível e sem HTML não sanitizado executado

### Requirement: Cálculo de rota usa o motor real do backend
A tela de Rota/viagem em `frontend-v2/` SHALL calcular alternativas de viagem chamando `GET /api/c/{slug}/routes/plan`, incluindo ritmo, transporte, ordenação, preferência de via e pernoites quando aplicável, e SHALL NOT aproximar distância ou tempo por geometria local no frontend.

#### Scenario: Resultado de rota reflete a rede de rotas real da campanha
- **WHEN** uma pessoa calcula uma rota entre dois pontos nomeados numa campanha com rede de rotas digitalizada
- **THEN** as alternativas exibidas (distância, tempo, custo) vêm da resposta de `GET /api/c/{slug}/routes/plan`, não de um cálculo geométrico local

### Requirement: Rede de Relações usa os tipos reais de vínculo
O grafo de Relações em `frontend-v2/` SHALL representar os 8 tipos de vínculo do backend (Aliado, Vínculo de Sangue, Amizade, Inimizade, Adversário, Romance, Família, Conhecido), com suporte a modo recíproco ou duas vias, qualificador e direção por sentido, e SHALL NOT substituí-los por uma classificação simplificada (como "famílias" de vínculo).

#### Scenario: Vínculo direcional com qualificador é exibido corretamente
- **WHEN** um vínculo cadastrado como "duas vias" com qualificador diferente em cada sentido (ex. Mentor/Lacaio) é exibido no grafo de Relações
- **THEN** o tipo, a direção e o qualificador de cada sentido aparecem corretamente, sem ser reduzidos a uma categoria genérica
