# Research: Seletor de Idioma em Combo-box

**Feature**: `082-language-combobox`  
**Date**: 2026-08-13

## 1. Controlo custom vs nativo

**Decision**: Custom trigger (`button`) + `role="listbox"` / `role="option"`, não `<select>` nativo.

**Rationale**: Clarification Q1; Nocturne dark header; Escape + click-outside + highlight accent alinhados a FR-001/FR-007.

**Alternatives considered**: Native `<select>` — rejeitado (estilo OS). `<details>`/`<summary>` — rejeitado (teclado/listbox fracos).

## 2. Versão SemVer

**Decision**: **0.16.1** (patch).

**Rationale**: Mudança só de apresentação/interacção do seletor; catálogo i18n e API inalterados. 0.16.0 acabou de sair (081); minor seria exagero.

**Alternatives considered**: 0.17.0 — rejeitado (sem capacidade de produto nova além do controlo).

## 3. Padrão ARIA

**Decision**:

| Elemento | Atributos |
|----------|-----------|
| Trigger | `type="button"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls={listId}`, `aria-label={t('language.aria')}` |
| Lista | `role="listbox"`, `id={listId}` |
| Opção | `role="option"`, `aria-selected={active}` |
| Chevron | `aria-hidden="true"` (decorativo) |

Teclado: Enter/Espaço toggle; ArrowUp/Down movem highlight (e abrem se fechado); Enter confirma highlight; Escape fecha sem mudar; Tab fecha (ou deixa o browser sair — preferir fechar e deixar Tab avançar após blur do open state).

Foco após fecho: `triggerRef.focus()` (clarification Q5).

**Rationale**: WAI-ARIA APG “Select-Only Combobox” / button + listbox; o projecto já usa listbox em `WaypointCombobox` (input pesquisável — aqui só o padrão de teclado/highlight, sem `role="combobox"` no input).

**Alternatives considered**: Manter foco na opção seleccionada — rejeitado na clarify. `role="menu"`/`menuitem` — rejeitado (não é menu de acções; é escolha de valor).

## 4. Rótulos e i18n

**Decision**:

- Trigger: literais **`PT`** / **`EN`** (não traduzidos) + chevron CSS/unicode.
- Lista: `t('language.pt')` / `t('language.en')` no namespace `comum`:

| Key | pt-BR | en |
|-----|-------|-----|
| `language.aria` | Idioma da interface (já existe) | Interface language |
| `language.pt` | Português | Portuguese |
| `language.en` | Inglês | English |

**Rationale**: Clarification Q2 — rótulos seguem locale da UI; após `changeLanguage`, reabrir mostra o novo par.

**Alternatives considered**: Endónimos fixos — rejeitado na clarify.

## 5. Highlight activo

**Decision**: Classe CSS (ex. `language-selector__option--active`) com cor/fundo accent; `aria-selected={true}` na opção do locale activo. Sem checkmark.

Highlight de navegação por teclado (índice) pode usar classe separada `--focused` se distinto do seleccionado; com 2 itens, accent no activo + outline no focused é suficiente.

**Rationale**: Clarification Q3.

## 6. Click outside e fecho

**Decision**: `useEffect` com `pointerdown`/`mousedown` em `document` enquanto `open`; se o evento não for dentro do root do selector, fechar e `triggerRef.focus()`. Escape no `keydown` do root ou window enquanto aberto.

**Rationale**: FR-007; padrão já familiar no codebase (blur timeout no WaypointCombobox — aqui preferir listener document para botão).

**Alternatives considered**: Só `onBlur` no trigger — rejeitado (blur antes do click na opção).

## 7. Colocação e compactação

**Decision**: Manter `<LanguageSelector />` em `CodexHeader` antes do toggle GM. Um único botão (~min-width similar a um dos botões actuais + chevron) reduz largura vs dois botões — atende SC-003.

**Rationale**: FR-005; sem mexer na estrutura do header.

## 8. Referência de código

**Decision**: Reutilizar ideias de teclado/listbox de `frontend/src/components/routes/WaypointCombobox.tsx`, **sem** campo de texto e **sem** filtragem. Não partilhar componente — scopes diferentes (idioma vs waypoint).

**Alternatives considered**: Extrair `Listbox` genérico — rejeitado (YAGNI nesta frente).
