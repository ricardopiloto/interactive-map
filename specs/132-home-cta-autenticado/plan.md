# Implementation Plan: CTAs da Home respeitam sessão já autenticada

**Branch**: `132-home-cta-autenticado` | **Date**: 2026-09-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/132-home-cta-autenticado/spec.md`

## Summary

`HomePage.tsx` nunca chama `authApi.me()` — os dois CTAs (`landing.ctaMaster`, `landing.ctaFinal`) são `<Link>` estáticos sempre apontando pra `/login?next=...`. A correção: `HomePage` passa a checar a sessão no mount (mesmo padrão já usado em `UserMenu.tsx`/`NovoCodexPage.tsx`), e os dois `<Link>` trocam `to`/`state` condicionalmente — autenticado vai direto ao destino final, sem sessão (ou enquanto a checagem ainda não respondeu) mantém o comportamento atual de abrir o login.

## Technical Context

**Language/Version**: TypeScript/React 19

**Primary Dependencies**: Nenhuma nova — reaproveita `authApi.me()` já existente

**Storage**: N/A

**Testing**: Quickstart manual (Constitution II permite pra UI de navegação/polimento)

**Target Platform**: Frontend web, tela `/` (Home)

**Project Type**: Frontend web application

**Performance Goals**: N/A — uma chamada `me()` a mais no mount da Home, mesmo custo já pago por `UserMenu`/`SiteChrome` (que já a chama independentemente, sem cache compartilhado hoje — ver Riscos)

**Constraints**: Não pode atrasar nem bloquear o clique nos CTAs enquanto `me()` está pendente (FR-004); não pode mudar aparência/texto/posição dos CTAs (FR-005)

**Scale/Scope**: Um arquivo (`HomePage.tsx`), dois `<Link>` existentes, um estado novo

## Constitution Check

- **I. Isolamento**: PASS / N/A.
- **II. Testes primeiro**: PASS. UI de navegação — quickstart manual é suficiente.
- **III. Produção legada**: PASS / N/A.
- **IV. Simplicidade**: PASS. Reaproveita `authApi.me()` sem dependência nova.
- **V. i18n**: PASS / N/A. Sem copy nova.
- **VI. Migrações**: PASS / N/A.

## Project Structure

### Documentation (this feature)

```text
specs/132-home-cta-autenticado/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md                    # Created by speckit-tasks, not this phase
```

### Source Code (repository root)

```text
frontend/src/
└── pages/HomePage.tsx    # authApi.me() no mount; os dois <Link> ganham to/state condicionais
```

**Structure Decision**: Mudança pontual em `HomePage.tsx` — nenhum outro arquivo muda. `authApi`, `createLoginModalState` e as rotas de destino (`/painel`, `/painel#criar`, `/login`) já existem e não mudam de contrato.

## Complexity Tracking

Nenhuma violação de constituição, nenhuma dependência nova.
