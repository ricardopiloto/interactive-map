# Feature Specification: CTAs da Home respeitam sessão já autenticada

**Feature Branch**: `132-home-cta-autenticado`
**Backlog**: [BKLG-021](../../docs/backlog/backlog.md#bklg-021-bugdesign--home-marketing-manda-usuário-já-logado-pro-login-de-novo)
**Created**: 2026-09-24
**Status**: Draft

**Input**: User description: "Se já estou logado, ao clicar em 'Entrar como mestre' devo ser direcionado ao painel, em 'Criar meu primeiro codex' também devo ser direcionado ao painel."

**Decision source**: causa raiz já confirmada no próprio item `BKLG-021` do backlog — os dois CTAs da Home nunca checam sessão.

## Constitution *(constraints; not implementation)*

- Isolamento: N/A; mudança de navegação na Home, sem rota nova de dados de campanha.
- Testes primeiro: UI de navegação/polimento — Constitution II permite validação só por quickstart manual (não é rota de auth/permissão/migração/import).
- Produção legada: N/A.
- Simplicidade: reaproveita `authApi.me()`, já chamado do mesmo jeito em `UserMenu.tsx`/`NovoCodexPage.tsx`; sem dependência nova.
- i18n: N/A; nenhuma copy nova, só o destino do link muda.
- Migrações: N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mestre já autenticado clica num CTA da Home e vai direto pro destino (Priority: P1)

Como mestre que já tem sessão ativa, ao clicar em "Entrar como mestre" ou em "Criar meu primeiro codex" na Home, quero ir direto pro Painel (ou pro Painel já no fluxo de criação), sem passar pela tela/modal de login de novo.

**Why this priority**: É o pedido central — hoje os dois CTAs ignoram sessão existente e sempre mandam pro login, uma fricção desnecessária pra quem já está autenticado.

**Independent Test**: Autenticado, abrir a Home, clicar em "Entrar como mestre" e confirmar que vai direto pro Painel, sem qualquer tela de login aparecer. Repetir com "Criar meu primeiro codex" e confirmar que vai pro Painel já no estado/seção de criação.

**Acceptance Scenarios**:

1. **Given** um usuário com sessão ativa, **When** ele abre a Home e clica em "Entrar como mestre", **Then** é levado direto para `/painel`, sem nenhuma tela de login aparecer.
2. **Given** um usuário com sessão ativa, **When** ele clica em "Criar meu primeiro codex", **Then** é levado direto para o Painel já no ponto de criação (`/painel#criar`), sem login.
3. **Given** um usuário sem sessão ativa, **When** ele clica em qualquer um dos dois CTAs, **Then** o comportamento atual continua — abre o login (modal, spec 126), com o destino certo preservado após autenticar.

### Edge Cases

- A checagem de sessão (`authApi.me()`) ainda não respondeu quando o usuário clica no CTA (carregamento inicial da Home): o clique deve continuar funcionando com o comportamento seguro atual (ir para o login) até a resposta chegar — não pode travar nem redirecionar errado por uma corrida.
- A sessão expira entre o carregamento da Home e o clique no CTA: o clique deve, na pior das hipóteses, cair no fluxo de login (comportamento de "não autenticado"), nunca quebrar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A Home MUST verificar o estado de sessão do usuário (mesmo padrão já usado por `UserMenu.tsx`/`NovoCodexPage.tsx`, via `authApi.me()`).
- **FR-002**: Com sessão ativa, o CTA "Entrar como mestre" MUST navegar direto para `/painel`, sem passar pela rota/modal de login.
- **FR-003**: Com sessão ativa, o CTA "Criar meu primeiro codex" MUST navegar direto para `/painel#criar`, sem passar pela rota/modal de login.
- **FR-004**: Sem sessão ativa (ou enquanto a checagem de sessão ainda não respondeu), os dois CTAs MUST manter o comportamento atual — abrir o login com o destino (`next`) preservado.
- **FR-005**: A mudança MUST NOT alterar a aparência, o texto ou a posição dos dois CTAs — só o destino de navegação depende do estado de sessão.

### Key Entities

Não aplicável — mudança de navegação condicional sobre um estado (sessão) que a aplicação já expõe.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Cem por cento dos cliques nos dois CTAs, com sessão ativa, levam direto ao destino final (`/painel` ou `/painel#criar`) sem exibir a tela de login.
- **SC-002**: Sem sessão ativa, o comportamento observável é idêntico ao existente antes desta feature — nenhuma regressão no fluxo de login a partir da Home.
- **SC-003**: Nenhuma mudança visual nos dois CTAs (texto, posição, estilo) — a diferença é só o destino.

## Assumptions

- O destino "Painel já no ponto de criação" continua sendo `/painel#criar`, o mesmo âncora que o fluxo de login já usa hoje como `next` — esta feature não muda esse contrato, só evita o passo intermediário do login para quem já está autenticado.
- Enquanto `authApi.me()` ainda não respondeu, a Home assume "não autenticado" para não atrasar nem travar o clique — é um estado transitório, não uma regressão perceptível na prática (a checagem é rápida e já acontece hoje em outras páginas sem problema notado).
