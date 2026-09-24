# Implementation Plan: Cabeçalho e navegação (reconstrução)

**Branch**: `114-cabecalho-navegacao` | **Date**: 2026-09-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/114-cabecalho-navegacao/spec.md`

## Summary

Reconstruir a casca de navegação da mesa para paridade estrutural com `frontend-next` `CampaignLayout`: marca + seletor de campanha à esquerda; abas Mapa/Relações/Rota/Sessões centradas; Modo edição em pílula; tema Auto/Claro/Escuro visível; `UserMenu`; barra inferior com as mesmas 4 abas. Reutilizar `useEditMode`, i18n e slug real. Contentor mínimo `/c/:slug/rota` a hospedar o `RoutePlannerPanel` existente (redesenho do conteúdo = spec 116).

## Technical Context

**Language/Version**: TypeScript / React (Vite); CSS tokens da spec 110

**Primary Dependencies**: react-router-dom, react-i18next, `@tabler/icons-react`, `EditModeContext`, `themePreference`, `RoutePlannerPanel`, `useInstanceConfig` / `useCampaignData`

**Storage**: N/A (só `sessionStorage`/`localStorage` já usados por edição e tema)

**Testing**: quickstart manual + captura lado a lado; `tsc`; smoke Playwright opcional se já houver chrome e2e — sem pytest/API

**Target Platform**: Browser (desktop + móvel ~860px breakpoint alinhado ao protótipo)

**Project Type**: web app frontend

**Performance Goals**: N/A (chrome estático)

**Constraints**: MUST NOT mudar ACL/`canEdit`; MUST NOT redesenhar Mapa/Relações/painéis flutuantes; MUST NOT eliminar tema Auto; MUST NOT hardcode strings

**Scale/Scope**: `CodexHeader` + CSS, `CampaignBottomNav`, `UserMenu`/tema no header, rota + página mínima Rota, chaves `comum.json` pt-BR/en, `App.tsx` route

## Constitution Check

*GATE: before Phase 0 — re-check after Phase 1*

- **I. Isolamento**: Sem API nova; abas usam o mesmo `:slug` da URL. Matriz isolamento **N/A**. **PASS**
- **II. Testes primeiro**: UI de polimento — quickstart/captura (constituição: MAY). **PASS**
- **III. Produção legada**: Só `frontend/` Codex. **PASS**
- **IV. Simplicidade**: Sem libs novas; reutilizar painel de rotas e preferências. **PASS**
- **V. i18n**: Chaves novas pt-BR+en; nome da campanha não traduzido. **PASS**
- **VI. Migrações**: N/A. **PASS**

Post-design: unchanged. **PASS**

## Project Structure

### Documentation (this feature)

```text
specs/114-cabecalho-navegacao/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── chrome-layout.md
│   └── routes.md
└── tasks.md            # /speckit-tasks (not this command)
```

### Source Code (repository root)

```text
frontend/src/components/layout/CodexHeader.tsx
frontend/src/components/layout/CodexHeader.css
frontend/src/components/layout/CampaignBottomNav.tsx
frontend/src/components/layout/CampaignBottomNav.css
frontend/src/components/layout/UserMenu.tsx          # tema pode sair daqui para o header
frontend/src/components/layout/ThemeSelector.tsx     # novo (opcional) — Auto/Claro/Escuro
frontend/src/pages/RotaPage.tsx                      # contentor mínimo
frontend/src/App.tsx                                 # Route /c/:slug/rota
frontend/src/locales/{pt-BR,en}/comum.json
frontend-next/src/pages/CampaignLayout.tsx|.css      # referência visual (não importar)
```

**Structure Decision**: Só frontend de produção; protótipo é planta visual, não dependência de build.

## Complexity Tracking

Nenhuma violação.
