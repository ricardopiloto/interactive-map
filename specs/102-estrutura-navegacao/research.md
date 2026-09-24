# Research: Estrutura e navegação

**Feature**: `102-estrutura-navegacao`  
**Date**: 2026-09-20

## 1. Preferência de tema

**Decision**: Chave `codex.theme` em `localStorage` com valores `auto` | `light` | `dark`. `applyThemePreference()` define `html[data-theme]` e, se Auto, escuta `prefers-color-scheme`. FOUC em `index.html` lê a mesma chave. Inválido → `auto`. Styleguide preview scoped permanece independente.

**Rationale**: Clarify Q1; UX-1 já usa `data-theme`.

**Alternatives**: cookie server-side (desnecessário); só `sessionStorage` (não cobre «entre visitas»).

## 2. Modo edição — controlo e persistência

**Decision**: Um toggle «Modo edição» só no topo. Estado booleano partilhado via `EditModeProvider` no `CampaignShell` (React context). Persistência opcional em `sessionStorage` chave `codex.editMode.<slug>` para sobreviver a remounts na mesma aba; ao mudar `slug` ou sair de `/c/:slug`, estado = `false`. **Não** faz logout ao desligar.

**Rationale**: Clarify Q2; hoje o botão GM faz login/logout — UX-3 separa sessão (menu) de modo UI.

**Alternatives**: só `useState` local por página (quebra Mapa↔Relações); `localStorage` (persistiria entre dias — indesejado).

## 3. Quem vê «Modo edição»

**Decision**: Visível só se sessão autenticada **e** membership activo na campanha (095 `require_membro`). Probe: após `authApi.me()`, um GET admin leve já existente sob `/api/c/:slug/admin/...` (ex. lista ou endpoint que 401/403 para não-membro). 200 → `canEdit=true`; 401/403 → ocultar. Sem novo endpoint nesta fase salvo bloqueio prático (então `GET` mínimo documentado em tasks).

**Rationale**: FR-004; spec 095 — qualquer membro activo autoriza admin.

**Alternatives**: lista `minhas` (só donos — incompleto para co-mestre); sempre mostrar e falhar nas APIs (má UX).

## 4. Barra inferior e tabs

**Decision**: Viewport estreito (`max-width: 800px` ou o mesmo `isMobile` já usado no mapa): bottom nav com **só** Mapa e Relações (ícones Tabler + rótulo); tabs do topo **ocultas**. Viewport largo: tabs no topo; sem bottom nav.

**Rationale**: Clarify Q3–Q4.

## 5. Marca e nome da campanha

**Decision**: Marca fixa «Campaign Codex» em pt-BR e en (`comum.brand`), `<title>` e favicon alinhados. `Link` da marca → `/`. Nome da campanha (`instanceConfig.nome` / equivalente) como `<span>` não clicável.

**Rationale**: Clarify Q5; FR-002.

## 6. Unificar chrome home vs campanha

**Decision**: Extrair menu utilizador (Entrar/Sair, idioma, tema) partilhável; `SiteChrome` (home/painel) e chrome de campanha reutilizam-no. Tabs + nome + Modo edição só em `/c/:slug`. Remover `side-menu__brand` e tags `gm.modeTag` da coluna.

**Rationale**: FR-001/003/007; Edge Cases home/painel.

## 7. Copy «Modo edição»

**Decision**: Novas chaves i18n (ex. `editMode.on` / `editMode.off` / `editMode.label`); deprecar uso visível de «Modo GM» no chrome. Rótulo do controlo reflecte estado (ligado/desligado) de forma sempre legível (`aria-pressed` ou texto explícito).

**Rationale**: FR-003; Constituição V.
