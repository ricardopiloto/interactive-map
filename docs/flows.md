# Fluxos do Campaign Codex

Diagramas de referência dos fluxos principais da versão 0.24.5. Eles descrevem o comportamento observado na aplicação e complementam o contrato OpenAPI em [`api-contracts.md`](api-contracts.md).

## Entrada pública da campanha

```mermaid
flowchart LR
  A[Usuário acessa /c/:slug] --> B[Frontend carrega config pública]
  B --> C{Mapa disponível?}
  C -- Sim --> D[Carrega mapa, locais, personagens e saídas]
  C -- Não --> E[Abre Relações]
  D --> F[Usuário navega Mapa, Relações, Rota ou Sessões]
  E --> F
  F --> G[API filtra visibilidade pública]
  G --> H[Interface renderiza dados localizados]
```

## Sessão de mestre e CRUD

```mermaid
sequenceDiagram
  actor GM as Mestre
  participant UI as SPA
  participant API as FastAPI
  participant DB as SQLite da campanha
  GM->>UI: Ativa Modo GM
  UI->>API: POST /api/auth/login
  API-->>UI: Cookie de sessão
  UI->>API: GET /api/admin/...
  API->>DB: Consulta dados da campanha
  DB-->>API: Entidades e visibilidade
  API-->>UI: Resposta tipada
  GM->>UI: Cria ou edita entidade
  UI->>API: POST/PATCH/PUT /api/admin/...
  API->>DB: Valida e persiste
  DB-->>API: Entidade atualizada
  API-->>UI: 201/200 + contrato de leitura
  UI-->>GM: Atualiza lista e detalhe
```

## Sugestão de associações por IA

```mermaid
flowchart TD
  A[Mestre preenche sessão ou evento] --> B{Descrição/resumo vazio?}
  B -- Sim --> C[Não chama o provedor]
  B -- Não --> D[POST sugestão de associações]
  D --> E[Backend verifica GM e campanha]
  E --> F[Seleciona dados visíveis da campanha]
  F --> G[Provedor configurado recebe contexto mínimo]
  G --> H{Resposta válida?}
  H -- Não --> I[Retorna erro explícito e preserva seleção atual]
  H -- Sim --> J[Descarta referências inexistentes/ocultas]
  J --> K[Marca sugestões para revisão]
  K --> L[Mestre edita ou descarta]
  L --> M[Salvar sessão/evento separadamente]
```

## Linha do Tempo por arcos e descoberta

```mermaid
flowchart LR
  A[Abre Linha do Tempo] --> B{Modo escolhido}
  B --> C[Chronológica]
  B --> D[Por arcos]
  B --> E[Por descoberta]
  C --> F[Ordena ano, mês, sessão e id]
  D --> G[Agrupa sessões por arco e trata transições]
  G --> H[Mostra intervalos e ligações tracejadas]
  E --> I[Agrupa primeira aparição de personagens, locais, facções e itens]
  I --> J[Respeita visibilidade para jogadores]
  F --> K[Cards de sessão/evento]
  H --> K
  J --> K
```

## Deploy e operação

```mermaid
flowchart LR
  A[Git pull] --> B[Build frontend]
  B --> C[Build API]
  C --> D[Docker Compose]
  D --> E[Healthcheck /api/health]
  E --> F[Caddy ou proxy existente]
  F --> G[Campaign Codex publicado]
```
