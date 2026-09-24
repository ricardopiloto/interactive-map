# Implementation Plan: Fundações do sistema visual

**Branch**: `100-fundacoes-sistema-visual` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/100-fundacoes-sistema-visual/spec.md`

**Release**: sem bump obrigatório (`0.19.1` + CHANGELOG `[Unreleased]`). Não corta `/opt/codex-*` (099).

**Depends on**: RFC UX-1; clarifications 2026-09-20 (tema live; styleguide scoped; gate só `#…` em CSS+TS/TSX).

## Summary

Substituir o Nocturne actual (blurple + Google Fonts + tokens de slides) pelos **tokens do RFC** com `data-theme="dark|light"` na raiz, tema inicial e **live sync** via `prefers-color-scheme`, Inter **local** (400/500), lint/script anti-`#hex` (excepto pino do mestre), script de contraste AA/3:1 nos dois temas nos testes, e `/__styleguide` só em dev com toggle **scoped** ao preview. Sem componentes novos nem seletor de tema de produto. Ver [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript/React 19 (Vite 8); Node para scripts de gate  
**Primary Dependencies**: stack FE actual; **sem** design-system lib; Inter woff2 local; scripts Node nativos para contraste + anti-hex (evitar Vitest se não existir — IV)  
**Storage**: N/A  
**Testing**: `npm run test:contrast` + `npm run lint:tokens` (ou equivalentes) na CI/local; oxlint continua  
**Target Platform**: SPA Campaign Codex (browser)  
**Project Type**: web app (frontend; backend intocado)  
**Performance Goals**: fontes locais sem FOIT longo (`font-display: swap`); zero pedido a fonts.googleapis  
**Constraints**: gate só `#…`; pin hex permitido; styleguide fora de production build; reduced-motion nos tokens de movimento  
**Scale/Scope**: `nocturne.css` → tokens RFC; migrar hex em CSS/TSX listados; 1 página styleguide; 2 scripts de gate  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: sem rotas de conteúdo; `/__styleguide` sem dados de campanha. **PASS** (N/A matriz conteúdo)
- **II. Testes primeiro**: scripts contraste + anti-hex MUST falhar antes da migração completa / entrar na suíte. **PASS**
- **III. Produção legada**: Zero `/opt`. **PASS**
- **IV. Simplicidade**: um ficheiro de tokens; scripts Node sem framework de teste novo se evitável. **PASS**
- **V. i18n**: styleguide MAY monolíngue; copy produto intacta. **PASS**
- **VI. Migrações**: N/A. **PASS**

**Post-Phase 1**: Unchanged. Contratos = tokens + tema + gates + styleguide.

## Project Structure

### Documentation (this feature)

```text
specs/100-fundacoes-sistema-visual/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── tokens-theme.md
│   ├── lint-no-hex.md
│   ├── contrast-script.md
│   └── styleguide-dev.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/styles/tokens.css          # NEW — RFC tokens + [data-theme]
frontend/src/styles/nocturne.css        # strip slides / Google Fonts; import tokens or replace
frontend/src/styles/fonts.css           # NEW — @font-face Inter local
frontend/public/fonts/Inter-*.woff2     # NEW — 400 + 500
frontend/src/theme/applySystemTheme.ts  # NEW — data-theme + matchMedia listener
frontend/src/main.tsx                   # import fonts + apply theme before paint
frontend/src/pages/StyleGuidePage.tsx   # NEW — /__styleguide (dev only)
frontend/src/App.tsx                    # rota condicional import.meta.env.DEV
frontend/scripts/check-contrast.mjs     # NEW — AA texto + 3:1 componentes × 2 temas
frontend/scripts/check-no-hex.mjs       # NEW — scan CSS/TS/TSX; allowlist tokens + pin
frontend/package.json                   # scripts test:contrast, lint:tokens
CHANGELOG.md
```

**Structure Decision**: Frontend-only. Tokens num ficheiro canónico; tema na raiz `html[data-theme]`; styleguide com preview scoped (`data-theme` no contentor). Gates = scripts Node invocados por npm (sem Vitest novo).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |
