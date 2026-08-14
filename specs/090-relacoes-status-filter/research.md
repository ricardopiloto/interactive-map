# Research: Filtro de estado na Rede de Relações

**Feature**: `090-relacoes-status-filter`  
**Date**: 2026-08-14

## 1. Onde vive o controlo

**Decision**: Na coluna, **no mesmo `relacoes-side__section` que Isolar selecção**, imediatamente **acima** da checkbox Isolar, abaixo da lista e antes da legenda. Controlo: `<label>` + `<select>` nativo com as cinco opções.

**Rationale**: FR-001. Isolar já é um controlo de palco nesse bloco; o filtro é o mesmo tipo de restrição. `<select>` expressa escolha única (FR-002) sem copiar os chips de tipo (multi-toggle) nem o combo de idioma da barra.

**Alternatives considered**: Radios em linha — apertado em 5 opções no breakpoint ≤800px. Chips estilo tipo de vínculo — sugere multi-selecção (fora de âmbito). Combo 082 — excesso para um enum curto.

## 2. Onde filtrar o conjunto

**Decision**: Estado `statusFilter: RelacoesStatusFilter` em `RelacoesPage` (`useState('todos')`). Helper `matchesStatusFilter(p, filter)` (`p.status ?? 'desconhecido'`).

```ts
const visiblePersonagens = personagens.filter((p) => matchesStatusFilter(p, statusFilter))
const visibleIds = new Set(visiblePersonagens.map((p) => p.id))
const visibleVinculos = vinculos.filter(
  (v) => visibleIds.has(v.personagem_a_id) && visibleIds.has(v.personagem_b_id),
)
```

Passar `visiblePersonagens` à lista e ao `GraphStage`; `visibleVinculos` ao palco. A busca da coluna continua a filtrar nomes **dentro** desse array (FR-006). Isolar **não** reduz a lista (086); o filtro de estado **sim**.

`useEffect`: se `selectedId` não está em `visibleIds`, `deselectPersonagem()` (FR-007).

**Rationale**: Um sítio; palco e lista não divergem (SC / paridade 086). Filtrar vínculos nos dois extremos cumpre FR-004 e faz com que `directIds` no foco sejam só vizinhos **ainda visíveis** — o anel interior compacta/abre (088/089) com a contagem correcta.

**Alternatives considered**: Flag `isVisible` no palco sem tirar nós do layout — rejeitado na clarify (buracos). Filtrar só no `GraphStage` e deixar a lista completa — rejeitado (FR-003).

## 3. Recálculo de anéis

**Decision**: Não há código extra de layout. `GraphStage` já calcula anéis a partir de `personagens`. Com o array filtrado, vista geral e foco fecham-se sobre quem resta (FR-010). Isolar continua a esconder no sítio (`isolated` / `isVisible`) **depois**.

**Rationale**: Clarify Q2. Offsets de arrasto de ids que saem do conjunto ficam no `Map` sem efeito; ids que permanecem mantêm o offset (edge case da spec).

**Alternatives considered**: Segundo layout «máscara» — YAGNI.

## 4. i18n

**Decision**: Estados nas opções: `comum:status.vivo|morto|desaparecido|desconhecido` (já existem). Novas chaves em `relacoes.column`:

| Chave | pt-BR (indicativo) |
|-------|-------------------|
| `statusFilter` | Estado |
| `statusFilterTodos` | Todos |
| `listEmptyStatus` | Nenhum personagem neste estado. |

EN equivalente. Sem chaves novas em `comum` para «Todos» (é opção do filtro, não um status de ficha).

**Rationale**: FR-008. «Todos» não é valor de `NPCStatus`.

**Alternatives considered**: Reutilizar `column.listEmpty` para filtro vazio — rejeitado (mensagem errada: «nenhum visível» vs «nenhum neste estado»).

## 5. Backend e dados

**Decision**: Zero alterações em Python, SQLite, API. `Personagem.status` já vem nas listagens.

**Rationale**: Spec. Jogador vs GM continua a ser a API (084).

**Alternatives considered**: Query `?status=` — fora de âmbito; o conjunto completo visível ao papel já está no cliente.

## 6. Documentação

**Decision**: `docs/manual-relacoes.md` coluna: filtro de estado junto a Isolar. CHANGELOG **0.19.0**. Linha 090 em `specs/v2/README.md`.

**Rationale**: Superfície nova (controlo), não só afinação de folga → minor, não 0.18.4.

**Alternatives considered**: 0.18.4 — rejeitado (capacidade nova).

## 7. Testes

**Decision**: Quickstart manual + `npm run build`. Sem Vitest.

**Rationale**: Igual 086–089. Aceite visual de anéis sem buracos.

**Alternatives considered**: Unit test `matchesStatusFilter` — deferido; a função cabe no contrato.
