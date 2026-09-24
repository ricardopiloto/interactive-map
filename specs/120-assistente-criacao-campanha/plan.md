# Implementation Plan: Assistente de criação de campanha

**Branch**: `120-assistente-criacao-campanha` | **Date**: 2026-09-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/120-assistente-criacao-campanha/spec.md`

## Summary

Extrair o formulário de criação embutido em `PainelPage` para a rota autenticada **`/painel/novo`**: assistente de **4 passos** (Identidade → Sistema e género → Visibilidade → Revisão) + ecrã de sucesso, alinhado a `frontend-next` NovoCodexWizard. POST via `campanhasApi.criar` inalterado (nome, slug, sistema, género, visibilidade). Slugify automático + aviso de imutabilidade; `data-genre` ao vivo no passo 2. CTA do Painel passa a `Link`/`navigate` para `/painel/novo`; remover formulário inline. Sem campo `resumo` no payload (API não o tem).

## Technical Context

**Language/Version**: TypeScript / React (Vite); CSS tokens 110/111

**Primary Dependencies**: `react-router-dom`, `campanhasApi.criar`, `authApi.me` (guarda), `theme/genres` + `dataset.genre` / `campaignGenre`, kit `Button`/`Input`/`Select`/`Chip`, i18n `comum`

**Storage**: N/A (rascunho só em state React até ao POST)

**Testing**: [quickstart.md](./quickstart.md) + capturas por passo/género; `tsc`; pytest API criação existente (sem mudança)

**Target Platform**: Browser; autenticado

**Project Type**: web app frontend

**Performance Goals**: N/A

**Constraints**: MUST NOT alterar contrato POST; MUST NOT segundo formulário inline; MUST NOT inventar endpoint de resumo; auth = mesmo padrão `/painel?next=`

**Scale/Scope**: `NovoCodexPage` (+ CSS), rota em `App.tsx`, strip create form de `PainelPage`, i18n keys wizard, util `slugify`

## Constitution Check

*GATE: before Phase 0 — re-check after Phase 1*

- **I. Isolamento**: Sem API nova. **N/A**. **PASS**
- **II. Testes primeiro**: UI polish — quickstart. **PASS**
- **III. Produção legada**: Só `frontend/`. **PASS**
- **IV. Simplicidade**: Reutilizar `campanhasApi.criar`. **PASS**
- **V. i18n**: Passos/avisos/sucesso pt-BR+en. **PASS**
- **VI. Migrações**: N/A. **PASS**

Post-design: unchanged. **PASS**

## Project Structure

### Documentation (this feature)

```text
specs/120-assistente-criacao-campanha/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── wizard-flow.md
│   └── create-api.md
└── tasks.md            # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/pages/NovoCodexPage.tsx          # NEW — wizard + success
frontend/src/pages/NovoCodexPage.css
frontend/src/utils/slugify.ts                 # NEW or shared — NFD + kebab
frontend/src/App.tsx                          # Route /painel/novo
frontend/src/pages/PainelPage.tsx             # CTA → /painel/novo; remove inline create
frontend/src/pages/PainelPage.css             # drop create-form chrome if unused
frontend/src/locales/{pt-BR,en}/comum.json    # wizard.* keys
frontend/src/theme/genres.ts                  # suggestedSystems for datalist
frontend-next/.../NovoCodexWizard.*           # visual reference only
```

**Structure Decision**: Produção `frontend/` only; protótipo é planta.

## Complexity Tracking

Nenhuma violação.
