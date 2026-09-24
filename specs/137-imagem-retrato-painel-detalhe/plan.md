# Implementation Plan: Exibição da imagem do personagem no painel de detalhe (Relações)

**Branch**: `137-imagem-retrato-painel-detalhe` | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/137-imagem-retrato-painel-detalhe/spec.md`

**Backlog**: [BKLG-026](../../docs/v2/backlog.md#bklg-026-bugdesign--exibição-da-imagem-do-personagem-no-painel-de-detalhe-relações-desproporcional)

## Summary

`.relacoes-page__detail-portrait` só define `max-height: 140px`. O `ImageSlot` base usa `display: grid` + `border: dashed` + padding; sem `width: 100%` na `<img>`, o retrato fica pequeno ao centro e a moldura tracejada aparece nas laterais. Corrigir replicando o padrão já validado em `.npc-form__portrait` / `.local-form__image` (`width: 100%; height: auto; object-fit: contain; padding: 0`), com `max-height: 140px` no contexto do painel. JSX condicional (`retrato_url ? … : null`) permanece.

## Technical Context

**Language/Version**: TypeScript / React 19 + CSS (frontend Vite)

**Primary Dependencies**: Nenhuma nova — `ImageSlot` já usado em `PersonagemDetailBody`

**Storage**: N/A

**Testing**: Quickstart manual / visual (Constitution II — UI de polimento MAY)

**Target Platform**: Painel de detalhe em `/c/:slug/relacoes` (desktop + mobile estreito)

**Project Type**: Frontend web application

**Performance Goals**: N/A

**Constraints**: Preservar proporção (sem stretch); manter teto de altura (~140px, FR-003); sem moldura de placeholder aparente com retrato carregado (FR-001); não mudar upload/API

**Scale/Scope**: CSS do retrato de detalhe (+ eventual consolidação junto às regras de form em `ImageSlot.css`); sem mudança de lógica React além do necessário

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: PASS / N/A — sem rota API.
- **II. Testes primeiro**: PASS — UI de polimento; [quickstart.md](./quickstart.md).
- **III. Produção legada**: PASS / N/A.
- **IV. Simplicidade**: PASS — reutiliza receita CSS existente; zero deps.
- **V. i18n**: PASS / N/A — sem copy.
- **VI. Migrações**: PASS / N/A.

**Post-design re-check**: Inalterado — só CSS de apresentação.

## Project Structure

### Documentation (this feature)

```text
specs/137-imagem-retrato-painel-detalhe/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── detail-portrait-layout.md
└── tasks.md             # /speckit-tasks (not this command)
```

### Source Code (repository root)

```text
frontend/src/
├── pages/RelacoesPage.css              # hoje: só max-height; pode ceder regras ao ImageSlot.css
├── pages/RelacoesPage.tsx              # ImageSlot já condicional — sem mudança funcional esperada
└── components/media/ImageSlot.css      # padrão form a espelhar; candidato a hospedar .detail-portrait
```

**Structure Decision**: Preferir colocar as regras de `.relacoes-page__detail-portrait.image-slot` (+ `img`) junto do bloco form em `ImageSlot.css` (mesma receita, `max-height: 140px`), e remover/simplificar a regra incompleta em `RelacoesPage.css` para não haver duas fontes de verdade.

## Complexity Tracking

Nenhuma violação.
