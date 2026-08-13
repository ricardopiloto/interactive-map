# Data Model: Seletor de Idioma em Combo-box

**Feature**: `082-language-combobox`  
**Date**: 2026-08-13

Sem entidades de servidor. Modelo de UI / runtime apenas.

## Locale option

| Field | Type | Notes |
|-------|------|-------|
| `code` | `'pt-BR' \| 'en'` | Valor passado a `i18n.changeLanguage` |
| `sigla` | `'PT' \| 'EN'` | Texto do trigger (fixo) |
| `nameKey` | `language.pt` \| `language.en` | Chave i18n do rótulo na lista |

Catálogo estático (2 entradas), ordenado: PT-BR primeiro, EN segundo.

## Active locale (derived)

| Source | Rule |
|--------|------|
| `i18n.language` | `startsWith('en')` → `en`; senão → `pt-BR` |

Igual ao selector actual (080).

## Combobox UI state

| Field | Type | Notes |
|-------|------|-------|
| `open` | boolean | Lista visível |
| `focusIndex` | number | 0…n−1; navegação por setas enquanto aberto |

### Transitions

```text
closed + Enter/Space/ArrowDown/ArrowUp → open (focusIndex = index of active)
open + ArrowDown/ArrowUp → move focusIndex (wrap optional; with 2 items, clamp or wrap)
open + Enter → changeLanguage(option[focusIndex].code); open=false; focus trigger
open + Escape | click-outside → open=false; focus trigger; language unchanged
open + click option → changeLanguage(code); open=false; focus trigger
```

Selecting the already-active option: still close + focus trigger (idempotent `changeLanguage` OK).

## Persistence

Unchanged: i18next browser language detector → `localStorage`. No new keys.
