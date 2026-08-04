# Research: Busca De/Para no Calcular Rota

**Feature**: `036-route-endpoint-search` | **Date**: 2026-08-03

## 1. Controlo: combobox custom vs `<datalist>` vs biblioteca

**Decision**: Combobox custom em React (input + lista de sugestões / listbox), sem nova dependência npm.

**Rationale**: Clarification exige combobox com texto + sugestões filtradas + seleção explícita; `<datalist>` tem UX inconsistente entre browsers e fraco controlo de “limpar seleção ao reeditar”. O projeto não usa headless-UI; lista de waypoints é pequena o suficiente para filtrar em memória.

**Alternatives considered**:
- Filtro + `<select>` nativo — rejeitado na clarification
- Só select nativo — rejeitado
- `@headlessui/react` / similar — overhead e fora do stack actual

## 2. Matching accent-insensitive

**Decision**: Normalizar com Unicode NFD + remover marcas diacríticas (`\p{M}`), depois `toLowerCase`, `trim` no query; `includes` no rótulo normalizado. Ordenação das opções continua com `localeCompare(..., { sensitivity: 'base' })` como hoje.

**Rationale**: Cumpre FR-003 (“sao” → “São”) sem fuzzy match. Alinha-se à sensibilidade já usada na ordenação.

**Alternatives considered**:
- Só `toLowerCase` — falha em acentos (clarification A)
- `localeCompare` por carácter para contains — mais complexo e desnecessário para substring

## 3. Estado query vs seleção (FR-009)

**Decision**: Por campo (`origem` / `destino`): `query: string` + `selectedId: number | ''`. Ao mudar `query` (input do utilizador), pôr `selectedId` a vazio. Ao escolher sugestão: `selectedId = id`, `query = label`. Calcular só se ambos `selectedId` preenchidos (e distintos).

**Rationale**: Evita calcular com nó antigo enquanto o texto já não corresponde; espelha clarification A.

**Alternatives considered**:
- Manter seleção até novo pick — rejeitado
- Auto-select se match exacto único — rejeitado na clarification

## 4. População das listas (FR-010)

**Decision**: Ambos os comboboxes usam a mesma lista `options` (todos os waypoints com `waypointOptionLabel`); filtro só por texto. Validação De ≠ Para permanece em `calcular()`.

**Rationale**: Clarification B; comportamento igual aos selects actuais.

## 5. Acessibilidade mínima

**Decision**: Input com `role="combobox"`, lista `role="listbox"`, opções `role="option"`; teclado: setas + Enter para escolher, Escape fecha; anunciar lista vazia com texto visível (“Nenhuma correspondência”).

**Rationale**: FR-008 (perceber zero resultados) + uso razoável de teclado sem bloquear o MVP.

## 6. Backend / API

**Decision**: Sem alterações de API ou BD.

**Rationale**: Spec assumptions — filtro local sobre opções já carregadas.
