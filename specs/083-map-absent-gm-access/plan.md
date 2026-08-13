# Implementation Plan: Acesso ao Mapa Sem Imagem (GM)

**Branch**: `083-map-absent-gm-access` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/083-map-absent-gm-access/spec.md`

**Release**: Codex **0.16.2** (patch — bugfix de routing/nav; sem API nova)

## Summary

Corrigir o redireccionamento «sem imagem de mapa → sempre Relações», que hoje bloqueia também o GM. **Não-GM** sem mapa: raiz/`/?gm=1`/`/admin`/catch-all → Relações; botão «Mapa» oculto. **GM** (credenciais admin na sessão): botão «Mapa» visível; `/` serve `MapPage` para upload. Sair do modo GM no Mapa sem imagem → redireccionar já para Relações. Sem abrir diálogo GM automaticamente no redireccionamento.

## Technical Context

**Language/Version**: TypeScript / React 19 / Vite 8  
**Primary Dependencies**: `react-router-dom`; `useInstanceConfig` (`has_map_image`); `hasAdminCredentials` / sessão admin existentes; `CodexHeader`  
**Storage**: N/A (flag já em `GET /api/config`; credenciais GM em `sessionStorage`)  
**Testing**: Manual quickstart; `npm run build`  
**Target Platform**: Web (Mapa + Relações)  
**Project Type**: Frontend routing/nav (`App.tsx`, `CodexHeader`, `MapPage` logout/guard)  
**Performance Goals**: Abertura do Mapa &lt;3 s após clique GM (SC-002); sem flicker de «Mapa» para jogadores  
**Constraints**: Clarifications 2026-08-13 (3/3); sem mudar upload/auth GM; hub fora de âmbito  
**Scale/Scope**: ~4 ficheiros TS + versão 0.16.2; backend só se precisar invalidar cache de config no cliente após upload (opcional mínimo)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clarified (3/3): **PASS**
- Escopo limitado a acesso/navegação (upload/auth intactos): **PASS**
- Hub fora de âmbito: **PASS**
- Sem endpoints novos; reutiliza `has_map_image` + credenciais existentes: **PASS**
- Comportamento GM vs jogador explícito e testável: **PASS**

**Post-Phase 1**: Unchanged. Contratos UI documentam regras de nav/routing; data-model só estados derivados.

## Project Structure

### Documentation (this feature)

```text
specs/083-map-absent-gm-access/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-map-nav-access.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/
├── App.tsx                          # RootRoute / AdminRedirect / CatchAll: excepções GM
├── components/layout/CodexHeader.tsx  # ocultar link Mapa quando !hasMap && !isGm
├── pages/MapPage.tsx                # guard + logoutGm → /relacoes se !has_map
├── pages/RelacoesPage.tsx           # passar hasMapImage / showMapNav ao header
└── hooks/useInstanceConfig.ts       # opcional: invalidar cache após upload (ver research)

README.md / CHANGELOG.md / package.json(s) / backend version bump → 0.16.2
```

**Structure Decision**: Mudança in-place no router e header; sem contexto GM global novo — gate de router usa `hasAdminCredentials()`; `isGm` continua por página com restore de sessão.

## Complexity Tracking

> None.
