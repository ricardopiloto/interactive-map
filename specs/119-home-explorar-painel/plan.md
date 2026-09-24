# Implementation Plan: Home, Explorar e Painel (três telas)

**Branch**: `119-home-explorar-painel` | **Date**: 2026-09-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/119-home-explorar-painel/spec.md`

## Summary

Separar **`/`** (marketing / Landing), **`/explorar`** (catálogo público) e **`/painel`** (minhas campanhas). Extrair um **`CampaignCard`** único (variantes `compact` + `footer`) reusado nas três. Home ganha hero, «como funciona», vitrine de géneros com pré-visualização real via `data-genre`, destaque opcional. Explorar: busca + filtro género + grade. Painel: casca alinhada ao MestrePainel, mesmo cartão com rodapé de cota/acções; formulário criar/import permanece. APIs `catalogo` / `minhas` inalteradas. Campos só do protótipo (jogadores, última sessão, resumo) omitidos se a API não os tiver.

## Technical Context

**Language/Version**: TypeScript / React (Vite); CSS tokens 110/111

**Primary Dependencies**: `react-router-dom`, `SiteChrome`, `campanhasApi.catalogo` / `minhas`, `theme/genres` + `campaignGenre` (`data-genre`), kit `Button`/`Chip`/`EmptyState`, i18n `comum`

**Storage**: N/A

**Testing**: [quickstart.md](./quickstart.md) + capturas claro/escuro; `tsc`; sem pytest

**Target Platform**: Browser (público + autenticado)

**Project Type**: web app frontend

**Performance Goals**: N/A (listas pequenas)

**Constraints**: MUST NOT mudar contratos API; MUST NOT segundo cartão paralelo; MUST NOT redesenhar mapa/relações/rota; MUST NOT inventar endpoints para campos mock do protótipo

**Scale/Scope**: Novo `CampaignCard` + CSS; rewrite `HomePage` → Landing; nova `ExplorarPage` + rota `/explorar`; restyle `PainelPage` shell; i18n keys; App route

## Constitution Check

*GATE: before Phase 0 — re-check after Phase 1*

- **I. Isolamento**: Sem API nova. **N/A**. **PASS**
- **II. Testes primeiro**: UI polish — quickstart/captura. **PASS**
- **III. Produção legada**: Só `frontend/`. **PASS**
- **IV. Simplicidade**: Um `CampaignCard`; APIs existentes. **PASS**
- **V. i18n**: Copy nova pt-BR+en. **PASS**
- **VI. Migrações**: N/A. **PASS**

Post-design: unchanged. **PASS**

## Project Structure

### Documentation (this feature)

```text
specs/119-home-explorar-painel/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── campaign-card.md
│   └── routes-surfaces.md
└── tasks.md            # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/campaign/CampaignCard.tsx   # NEW — shared card
frontend/src/components/campaign/CampaignCard.css
frontend/src/pages/HomePage.tsx                     # Landing marketing (was catalog grid)
frontend/src/pages/HomePage.css                     # landing sections
frontend/src/pages/ExplorarPage.tsx                 # NEW — public catalog
frontend/src/pages/ExplorarPage.css
frontend/src/pages/PainelPage.tsx                   # shell + CampaignCard footer
frontend/src/pages/PainelPage.css
frontend/src/App.tsx                                # Route /explorar
frontend/src/locales/{pt-BR,en}/comum.json          # landing/explore/painel copy
frontend/src/theme/campaignGenre.ts                 # reuse for landing genre preview
frontend/src/api/campanhas.ts                       # unchanged contracts
frontend-next/.../LandingPage|ExplorePage|MestrePainel|CampaignCard  # visual SoT
```

**Structure Decision**: Produção `frontend/` only; protótipo é planta. Card API-shaped (`CatalogoItem` / `PainelItem`), not mock `Campaign`.

## Complexity Tracking

Nenhuma violação.
