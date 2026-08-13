# Research: Acesso ao Mapa Sem Imagem (GM)

**Feature**: `083-map-absent-gm-access`  
**Date**: 2026-08-13

## 1. Gate no router vs só no header

**Decision**: Ajustar `RootRoute` (e `AdminRedirect`) **e** o header. O header sozinho não basta: hoje `RootRoute` faz `Navigate` para `/relacoes` sempre que `!has_map_image`, pelo que o `Link` «Mapa» nunca chega a `MapPage`.

**Rationale**: FR-004 / bug actual.

**Alternatives considered**: Só esconder o botão — rejeitado (GM ainda bloqueado se abrir `/`). Context GM global — rejeitado (overkill; credenciais já em `sessionStorage`).

## 2. Como o router sabe que é GM

**Decision**: Em `RootRoute`, se `!has_map_image`:

- Sem `hasAdminCredentials()` → `<Navigate to="/relacoes" replace />`
- Com `hasAdminCredentials()` → renderizar `<MapPage />`

`MapPage` já valida a sessão (`adminApi.session()`); se falhar, limpa credenciais e **redirecciona para `/relacoes`** (novo guard alinhado a FR-007).

**Rationale**: `isGm` é estado local por página; as credenciais são a ponte entre Relações → Mapa. Clarification Q2: entrada sem credenciais (incl. `/?gm=1`) não abre o Mapa.

**Alternatives considered**: Validar sessão async no `RootRoute` antes de decidir — rejeitado (duplica lógica; loading extra). Permitir `/` com `gm=1` sem credenciais — rejeitado na clarify.

## 3. `/admin` e `/?gm=1` sem mapa

**Decision**:

- `AdminRedirect`: se `!has_map_image` → `/relacoes` (sem query); se tem mapa → `/?gm=1` (comportamento actual).
- `RootRoute`: `/?gm=1` sem mapa e sem credenciais → `/relacoes` (o query é irrelevante; não abre gate no Mapa).
- **Não** propagar `gm=1` para `/relacoes` (clarification Q3 — sem auto-diálogo).

**Rationale**: Clarifications Q2 + Q3.

**Alternatives considered**: `/relacoes?gm=1` com gate — rejeitado pelo utilizador. Abrir MapPage só com `gm=1` — rejeitado.

## 4. Catch-all

**Decision**: Manter `CatchAllRoute`: sem mapa → `/relacoes`; com mapa → `/`. GM autenticado usa o link «Mapa», não o catch-all.

**Rationale**: Spec edge case + clarification Q2.

## 5. Visibilidade do link «Mapa»

**Decision**: Em `CodexHeader`, nova prop (ex. `showMapNav` ou `hasMapImage`) calculada nas páginas:

```text
showMapNav = Boolean(has_map_image) || isGm
```

Enquanto `config` ainda carrega e `isGm` é false, **não** mostrar «Mapa» (evita falso positivo para jogadores). Quando a sessão GM restaura em Relações, o link aparece.

**Rationale**: FR-002/003; edge «sem flicker enganador».

**Alternatives considered**: Sempre mostrar e deixar o router redireccionar — rejeitado (UX confusa). Só `has_map_image` — rejeitado (GM sem mapa precisa do link).

## 6. Sair do modo GM no Mapa sem imagem

**Decision**: Em `logoutGm` de `MapPage`, se `!instanceConfig.has_map_image`, `navigate('/relacoes', { replace: true })` após limpar credenciais. Em `RelacoesPage`, só esconder o link (já está em Relações).

**Rationale**: Clarification Q1 / FR-007.

**Alternatives considered**: Ficar no Mapa em vista jogador — rejeitado. Confirmar com diálogo — rejeitado.

## 7. Guard em MapPage (defesa em profundidade)

**Decision**: Após restore de sessão (ou ausência de credenciais), se `!has_map_image && !isGm` → `Navigate`/`navigate` para `/relacoes`. Cobre: credenciais inválidas, deep link residual, race no router.

**Rationale**: FR-001/004; evita ficar preso no Mapa sem privilégio.

## 8. Cache de `useInstanceConfig` após upload

**Decision**: **Mínimo**: após upload bem-sucedido, invalidar o módulo `cachedConfig` (exportar `clearInstanceConfigCache` ou actualizar `has_map_image: true` no cache) e refrescar config usada pelo header/`RootRoute`, para o botão «Mapa» aparecer a jogadores na mesma sessão sem full reload quando possível. Se a invalidação for arriscada no scope, documentar no quickstart que **reload** actualiza a nav (spec já admite «recarregar»).

**Rationale**: Edge case da spec; SC-004 foca o caminho GM. Preferir invalidação leve se for 1 função.

**Alternatives considered**: Ignorar cache nesta feature — aceitável como fallback documentado.

## 9. Versão SemVer

**Decision**: **0.16.2** (patch).

**Rationale**: Bugfix de acesso/navegação; sem contrato API novo; 0.16.1 foi o combobox.

**Alternatives considered**: 0.17.0 — rejeitado (não é capacidade nova de domínio).
