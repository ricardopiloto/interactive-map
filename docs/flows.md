# Fluxos do Campaign Codex

Diagramas de referência dos fluxos de integração da versão 1.6.1. Eles descrevem o comportamento da aplicação e complementam as rotas e os contratos em [`api-contracts.md`](api-contracts.md). Visão geral: [`README.md`](../README.md).

## Sumário

1. [Entrada pública](#entrada-pública)
2. [URL canónica da campanha](#url-canónica-da-campanha)
3. [Calcular rota com pernoite](#calcular-rota-com-pernoite)
4. [Itens públicos](#itens-públicos)
5. [CRUD do mestre](#crud-do-mestre)
6. [Sugestões por IA](#sugestões-por-ia)
7. [Sessão e login](#sessão-e-login)
8. [Criação de conta com verificação por e-mail](#criação-de-conta-com-verificação-por-e-mail)
9. [Recuperação de senha](#recuperação-de-senha)
10. [Contato com o administrador](#contato-com-o-administrador)
11. [Convite do admin](#convite-do-admin)
12. [Criar campanha, enviar imagens e respeitar a cota](#criar-campanha-enviar-imagens-e-respeitar-a-cota)
13. [Exportar e importar uma campanha](#exportar-e-importar-uma-campanha)
14. [Linha do Tempo por arcos e descoberta](#linha-do-tempo-por-arcos-e-descoberta)
15. [Deploy e operação](#deploy-e-operação)

## Entrada pública

```mermaid
flowchart LR
  A[Usuário acessa /c/:id/:slug] --> B[Carrega configuração pública]
  B --> C{Mapa disponível?}
  C -- Sim --> D[Mapa, locais e saídas]
  C -- Não --> E[Abre Relações]
  D --> F[Navegação Mapa / Relações / Rota / Sessões / Cronologia / Itens]
  E --> F
  F --> G[API aplica visibilidade]
  G --> H[Interface renderiza dados localizados]
```

## URL canónica da campanha

```mermaid
flowchart TD
  A["Pedido /c/:slug/..."] --> B{Slug resolve?}
  B -- Sim --> C["Redirect  → /c/:id/:slug/..."]
  B -- Não --> D[404]
  E["Pedido /c/:id/:slug/..."] --> F[Usa id; slug é decorativo]
  F --> G[Corrige slug na URL se estiver desatualizado]
```

## Calcular rota com pernoite

```mermaid
flowchart TD
  A[Escolher De / Para] --> B[Preferências: transporte, ritmo, via]
  B --> C[POST planeamento de rota]
  C --> D[Alternativas no mapa]
  D --> E{Cada noite}
  E -- Num Local --> F[Marcador de abrigo]
  E -- Perto de cidade no raio --> G[Trata como noite local]
  E -- Campo aberto --> H[Pin ao relento]
  F --> I[Traçado colorido por fadiga se ritmo intenso]
  G --> I
  H --> I
```

## Itens públicos

```mermaid
flowchart LR
  A[Jogador abre /itens] --> B[GET itens visíveis]
  B --> C[Lista + busca]
  C --> D[Detalhe Markdown]
  D --> E[Chips sessões / eventos]
  F[Deep-link ?item=ID] --> D
  G[Mestre autenticado] --> H[Vê também ocultos]
  H --> I[Atalho para editar na Cronologia]
```

## CRUD do mestre

```mermaid
sequenceDiagram
  actor GM as Mestre
  participant UI as SPA
  participant API as FastAPI
  participant DB as SQLite
  GM->>UI: Entrar / Painel
  UI->>API: Login e leitura administrativa
  API->>DB: Consulta campanha
  DB-->>API: Dados autorizados
  API-->>UI: Resposta tipada
  GM->>UI: Cria ou edita entidade
  UI->>API: POST/PATCH/PUT
  API->>DB: Valida e persiste
  API-->>UI: 201/200
```

## Sugestões por IA

```mermaid
flowchart TD
  A[Mestre informa resumo ou descrição] --> B{Texto vazio?}
  B -- Sim --> C[Não chama IA]
  B -- Não --> D[Backend valida GM e campanha]
  D --> E[Provedor recebe contexto mínimo]
  E --> F{Resposta válida?}
  F -- Não --> G[Erro explícito; seleção preservada]
  F -- Sim --> H[Filtra referências inválidas ou ocultas]
  H --> I[Mestre revisa e salva separadamente]
```

## Sessão e login

```mermaid
sequenceDiagram
  actor U as Pessoa
  participant SPA as Frontend
  participant API as FastAPI
  participant DB as control.db
  U->>SPA: e-mail e senha
  SPA->>API: POST /api/auth/login
  API->>DB: confere bloqueio, valida a senha (Argon2)
  alt credenciais válidas
    API->>DB: cria sessão
    API-->>SPA: 200 + cookie codex_session
  else falha
    API->>DB: soma tentativa (5 falhas = bloqueio de 15 min)
    API-->>SPA: 401 CREDENCIAIS_INVALIDAS
  end
```

## Criação de conta com verificação por e-mail

```mermaid
sequenceDiagram
  actor P as Pessoa
  participant SPA as /registo
  participant API as POST /api/auth/registo
  participant BG as Tarefa em segundo plano
  participant R as Resend
  P->>SPA: e-mail + aceite dos termos
  SPA->>API: pedido (honeypot, captcha, limite por IP)
  API-->>SPA: 202 {"ok": true} (sempre igual)
  API->>BG: processar pedido
  BG->>BG: limite por e-mail e decisão (conta nova, pendente ou já existente)
  BG->>R: link de verificação (5 h) ou aviso de conta existente
  P->>SPA: abre /convite/<token> e define a senha
  SPA->>API: POST /api/auth/convite/aceitar
  API-->>SPA: conta ativa + sessão
  Note over BG: a cada 15 min apaga contas não confirmadas
```

## Recuperação de senha

```mermaid
sequenceDiagram
  actor P as Pessoa
  participant SPA as /esqueci-senha
  participant API as POST /api/auth/reset/pedir
  participant BG as Tarefa em segundo plano
  participant R as Resend
  P->>SPA: e-mail
  SPA->>API: pedido
  API-->>SPA: 202 {"ok": true} (sempre igual)
  API->>BG: processar pedido
  BG->>BG: só conta ativa com senha, limite de 5 pedidos por e-mail em 24 h
  BG->>R: link /reset/<token> (1 h, uso único)
  P->>SPA: abre o link e define a nova senha
  SPA->>API: POST /api/auth/reset/confirmar
  API-->>SPA: senha trocada, sessões antigas revogadas
```

## Contato com o administrador

```mermaid
flowchart LR
  A[Pessoa em /contato] --> B{Contato disponível?}
  B -- Não --> C[Mensagem de indisponível]
  B -- Sim --> D[POST /api/contato]
  D --> E{Honeypot, captcha, limites por IP, e-mail e dia}
  E -- Recusado --> F[Erro com código]
  E -- OK --> G[Envia por e-mail ao administrador com reply-to da pessoa]
  G --> H{Provedor aceitou?}
  H -- Sim --> I[202: nada é guardado na aplicação]
  H -- Não --> J[502 CONTATO_ENVIO_FALHOU, texto mantido no formulário]
```

## Convite do admin

```mermaid
flowchart LR
  A[Admin em /admin/convites] --> B[POST /api/admin/convites]
  B --> C[Usuário pendente + convite de 72 h]
  C --> D[Link devolvido ao admin]
  C --> E{enviar_email e provedor ativo?}
  E -- Sim --> F[E-mail ao convidado]
  D --> G[Convidado abre /convite/token e define a senha]
  F --> G
```

## Criar campanha, enviar imagens e respeitar a cota

```mermaid
flowchart TD
  A[POST /api/campanhas] --> B[Cria banco da campanha, pastas de upload e vínculo de dono]
  B --> C[Mestre envia imagem: POST …/admin/uploads]
  C --> D{Tipo, tamanho e cota ok?}
  D -- Não --> E[413 COTA_EXCEDIDA ou 4xx do arquivo]
  D -- Sim --> F[Grava arquivo, soma bytes_usados]
  F --> G{Uso ≥ 90% da cota?}
  G -- Sim --> H[aviso_cota = true no Painel]
```

## Exportar e importar uma campanha

```mermaid
flowchart LR
  A[Dono: GET …/admin/export] --> B[ZIP: manifesto, conteúdo e imagens]
  B --> C[Usuário: POST /api/campanhas/import]
  C --> D{Pacote válido, schema suportado e dentro da cota?}
  D -- Não --> E[Erro: PACOTE_INVALIDO, SCHEMA_FUTURO, COTA_EXCEDIDA…]
  D -- Sim --> F[Cria campanha nova e migra o schema]
```

## Linha do Tempo por arcos e descoberta

```mermaid
flowchart LR
  A[Abre Linha do Tempo] --> B{Modo escolhido}
  B --> C[Cronológica]
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
  A[Git pull] --> B[docker compose build: api e web]
  B --> C[docker compose up -d]
  C --> D[API migra o banco de controle e valida a configuração no arranque]
  D --> E[Healthcheck /api/health]
  E --> F[Caddy do host]
  F --> G[Túnel da Cloudflare]
  G --> H[Campaign Codex publicado]
```

- A migração do banco de cada campanha roda quando a campanha é aberta.
- Com `REGISTO_MODO=aberto`, `CONTATO_EMAIL` ou `EMAIL_API_KEY` definidos e `DEBUG=false`, a API só arranca com `TRUSTED_PROXY=true` (ver o README, seção *Configuração e operação*).
- A cada 15 minutos uma tarefa apaga as contas de registo não confirmadas.
