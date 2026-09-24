# Quickstart: Estrutura e navegação

**Feature**: `102-estrutura-navegacao`  
**Purpose**: Validar chrome único, tema persistido, Modo edição e bottom nav ([contracts/](./contracts/), [spec.md](./spec.md)).

## Prerequisites

- Frontend `npm run dev`; backend com campanha `/c/:slug` e (opcional) utilizador membro 095.
- Preferir duas viewports: largo (>800px) e estreito (≤800px).

## 1. Marca e cabeçalho partilhado (SC-001, SC-002, SC-005)

1. Abrir `/c/:slug` (Mapa) e `/c/:slug/relacoes`.
2. Verificar: mesma barra; marca «Campaign Codex» **uma** vez; nome da campanha visível; sem brand na coluna.
3. Locale pt-BR e en: marca continua «Campaign Codex».
4. Clicar a marca → `/`. Nome da campanha não é link.
5. `<title>` reflecte Campaign Codex (não «Mapa da Campanha» / «Codex da Campanha» como produto).

## 2. Tema (SC-003)

1. Menu → Claro; reload → continua claro.
2. Escuro; reload → escuro.
3. Auto; mudar preferência do SO (ou DevTools) com app aberta → acompanha.

## 3. Modo edição (FR-004)

1. Anónimo: sem «Modo edição»; sem tags Modo GM na coluna/topo.
2. Login como membro: um toggle no topo; ligar → ir a Relações → continua ligado; voltar ao Mapa → ligado.
3. Ir a `/` ou outra campanha → modo desligado.
4. Desligar modo **não** faz logout; Sair no menu **sim**.

## 4. Bottom nav (SC-004)

1. Viewport estreito: barra inferior só Mapa | Relações; tabs **ausentes** no topo.
2. Viewport largo: tabs no topo; sem barra inferior.
3. Home/painel: sem bottom nav nem tabs de secção.

## 5. Gates

- `npm run lint:tokens` / `test:contrast` (regressão UX-1).
- Visual: zero duplicação marca/modo nas vistas revistas.
