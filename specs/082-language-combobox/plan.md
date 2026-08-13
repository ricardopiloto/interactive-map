# Implementation Plan: Seletor de Idioma em Combo-box

**Branch**: `082-language-combobox` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/082-language-combobox/spec.md`

**Release**: Codex **0.16.1** (patch — só UI do seletor; i18n 080 inalterado)

## Summary

Substituir o grupo de dois botões PT/EN em `LanguageSelector` por um **combo-box custom**: um trigger ghost (sigla + chevron) que abre um listbox Nocturne com nomes localizados (seguem o locale da UI), highlight na opção activa, teclado completo, Escape/clique fora, e foco de volta ao trigger. Persistência e `i18n.changeLanguage` da 080 mantêm-se; colocação no `CodexHeader` (à esquerda do toggle GM) inalterada.

## Technical Context

**Language/Version**: TypeScript / React 19 / Vite 8  
**Primary Dependencies**: `react-i18next` (existente); `LanguageSelector.tsx` / `.css`; `CodexHeader` (sem mudança de slot)  
**Storage**: Sem mudança — `localStorage` via detector i18next (080)  
**Testing**: Manual quickstart; `npm run build`; teclado + viewport ≤800px  
**Target Platform**: Web desktop + mobile (header partilhado)  
**Project Type**: Frontend-only (`frontend/src/components/layout/` + `locales/*/comum.json`)  
**Performance Goals**: Troca de idioma &lt;1 s (SC-001); sem reload  
**Constraints**: Clarifications 2026-08-13 (5/5); sem `<select>` nativo; sem novos idiomas; hub fora de âmbito  
**Scale/Scope**: ~3 ficheiros TS/CSS + 2 JSON i18n + versão 0.16.1  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clarified (5/5): **PASS**
- Só muda o controlo (080 detection/persistência intactos): **PASS**
- Hub / conteúdo do mestre fora de âmbito: **PASS**
- Sem dependência de backend: **PASS**
- Acessibilidade teclado + foco ao trigger: **PASS** (FR-006)

**Post-Phase 1**: Unchanged. Padrão a11y documentado em contracts; chevron `aria-hidden`.

## Project Structure

### Documentation (this feature)

```text
specs/082-language-combobox/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-language-combobox.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/layout/
├── LanguageSelector.tsx    # rewrite: trigger + listbox
├── LanguageSelector.css    # dropdown Nocturne; chevron
└── CodexHeader.tsx         # unchanged placement (verify only)

frontend/src/locales/pt-BR/comum.json   # language.pt / language.en
frontend/src/locales/en/comum.json

README.md / CHANGELOG.md / package.json / package-lock.json
backend/pyproject.toml / uv.lock   # bump 0.16.1 for monorepo parity
```

**Structure Decision**: Reescrever o componente existente in-place (mesmo export `LanguageSelector`); não criar pacote novo. Referência de padrões de teclado/listbox: `WaypointCombobox.tsx` (adaptado a botão, não input pesquisável).

## Complexity Tracking

> None.
