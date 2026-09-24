# Implementation Plan: Rede de rotas — entrada em Rota e casca visual

**Branch**: `118-rede-rotas-entrada` | **Date**: 2026-09-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/118-rede-rotas-entrada/spec.md`

## Summary

Mover a abertura do digitalizador de rede do menu GM do **Mapa** para um botão **«Rede de rotas»** (GM / Modo edição) no topo da página **Rota**, reutilizando o mesmo `RouteDigitizerView` (sem duplicar). Actualizar a **casca** do digitalizador (`RouteDigitizer.css` + swaps de apresentação mínimos) para tokens/formas pós-115 (zoom pílula/círculo, chips de modo, lista no padrão visual do painel flutuante) alinhados ao protótipo. **MUST NOT** alterar lógica de nós/segmentos/pontos intermediários/escala; **MUST NOT** reabrir specs 114–116.

## Technical Context

**Language/Version**: TypeScript / React (Vite); CSS tokens (110/115)

**Primary Dependencies**: `RouteDigitizerView`, `DigitizerListPanel`, `useEditMode`, `CampaignMap` (zoom chrome 115), kit `Button`/`Chip`/`IconButton`, i18n `mapa.json` (`mapPage.routeNetwork`)

**Storage**: N/A

**Testing**: [quickstart.md](./quickstart.md) smoke + captura claro/escuro; `npx tsc -p tsconfig.app.json --noEmit`; sem pytest

**Target Platform**: Browser (desktop + ~860px); claro/escuro

**Project Type**: web app frontend

**Performance Goals**: N/A

**Constraints**: MUST NOT mudar comportamento de digitalização; MUST NOT duplicar o digitalizador; MUST NOT remover o menu GM do Mapa (outras acções permanecem); MUST NOT reimplementar 114–116

**Scale/Scope**: `MapPage.tsx` (remover 1 menuitem + estado/import se órfãos), `RotaPage.tsx` + `RotaPage.css` (botão + mount), `RouteDigitizer.css` (+ swaps Chip/IconButton em `RouteDigitizerView` só se necessários à casca)

## Constitution Check

*GATE: before Phase 0 — re-check after Phase 1*

- **I. Isolamento**: Sem API nova. **N/A**. **PASS**
- **II. Testes primeiro**: UI polish — quickstart/captura. **PASS**
- **III. Produção legada**: Só `frontend/`. **PASS**
- **IV. Simplicidade**: Reutilizar `RouteDigitizerView` + zoom chrome 115; sem fork. **PASS**
- **V. i18n**: Reusar `mapPage.routeNetwork` (pt-BR/en); novas strings só se necessárias. **PASS**
- **VI. Migrações**: N/A. **PASS**

Post-design: unchanged. **PASS**

## Project Structure

### Documentation (this feature)

```text
specs/118-rede-rotas-entrada/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── entry-relocation.md
│   └── digitizer-shell.md
└── tasks.md            # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/pages/MapPage.tsx                 # remove route-network menuitem; drop digitizer state/mount if unused
frontend/src/pages/RotaPage.tsx                # GM button + RouteDigitizerView mount (fullscreen over stage)
frontend/src/pages/RotaPage.css                # .rota-page__digitizer-btn placement (prototype)
frontend/src/components/gm/RouteDigitizerView.tsx  # presentation-only: DigControls → circular IconButtons; mode → Chip
frontend/src/components/gm/RouteDigitizer.css  # tokens: --radius-full / --shadow-md; list/panel chrome
frontend/src/components/gm/DigitizerListPanel.tsx  # only if class hooks needed for MapSidePanel-like rows (no logic)
frontend/src/locales/{pt-BR,en}/mapa.json     # reuse mapPage.routeNetwork
frontend-next/.../route/RouteDigitizer.*       # visual reference only
frontend-next/.../pages/RotaPage.*             # entry placement reference only
```

**Structure Decision**: Produção só em `frontend/`; protótipo é planta visual. Comportamento = digitalizador actual.

## Complexity Tracking

Nenhuma violação.
