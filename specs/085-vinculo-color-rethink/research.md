# Research: Cores de Vínculo (Sangue, Inimizade, Adversário)

**Feature**: `085-vinculo-color-rethink`  
**Date**: 2026-08-13

## 1. Fonte única de cor

**Decision**: Alterar apenas `VINCULO_STYLES` em `frontend/src/components/relacoes/vinculoStyles.ts`. Não tocar em `GraphStage`, chips, legenda, ficha nem `vinculoDirection.ts`.

**Rationale**: FR-006 / SC-002. Grep do repo: os hex actuais (`#6a3d8c`, `#e0707a`, `#c86b3c`) existem **só** neste ficheiro no código. Todos os surfaces já chamam `vinculoStyle(tipo)` / `VINCULO_STYLES[tipo]`.

**Alternatives considered**: CSS variables por tipo — rejeitado (o catálogo TS já é a fonte; duplicar em CSS cria paleta paralela). Hardcode nos componentes — rejeitado (SC-002).

## 2. Hex exactos (Nocturne `#161826`)

**Decision**: linhas continuam **sólidas** (`dashed: false`):

| ID | Família (spec) | Antes | Depois | Distinção |
|----|----------------|-------|--------|-----------|
| `vinculo_sangue` | vermelho escuro / borgonha | `#6a3d8c` (violeta) | `#9e2436` | H≈351°, L≈38% — vinho, não laranja nem rosa; leveza próxima do violeta antigo para traços finos |
| `inimizade` | magenta / fúcsia | `#e0707a` (vermelho-rosa) | `#d12d9a` | H≈318°, L≈50%, saturado — longe do borgonha e do rosa pastel de Romance `#e08fc0` (H≈328°, L≈72%) |
| `adversario` | cobre / laranja queimado | `#c86b3c` | `#c86b3c` | Sem mudança; H≈22°, L≈51% — cobre vs borgonha (H 351°, L 38%) e vs magenta |

Cinco inalterados: Aliado `var(--color-accent)` (`#9184d9`), Amizade `#79c48f`, Romance `#e08fc0`, Família `#d9a35b`, Conhecido `#9397ab` tracejado.

**Rationale**: Spec deixou hex para o plano. `#9e2436` é borgonha visível no palco (mais claro que `#8b1e2d`, que ficaria opaco em traço 2px). Magenta `#d12d9a` não colapsa com Romance (mais escuro e mais magenta). Cobre actual não encosta ao borgonha o suficiente para obrigar afinação (clarification Q2 + assumption).

**Alternatives considered**:

- Sangue `#8b1e2d` / `#6e1a24` — rejeitado (demasiado escuro no fundo `#161826`).
- Sangue `#c42b3f` (carmesim vivo) — rejeitado (afasta-se de «escuro» e aproxima-se do cobre).
- Inimizade aço/ardósia — rejeitado na clarify (Q1 = magenta).
- Inimizade `#db2777` (hue ~336) — rejeitado (encosta ao hue de Romance).
- Adversário violeta (tom libertado pelo sangue) — rejeitado na clarify (Q2 = manter cobre).
- Afinar cobre para `#d4783a` — rejeitado por agora; só se o quickstart mostrar colisão com `#9e2436`.

## 3. Duas vias / gradiente

**Decision**: Nenhuma alteração em `GraphStage` / `vinculoDirection.ts`. O gradiente SVG já usa `vinculoStyle(tipo_ab).color` e `vinculoStyle(tipo_ba).color`.

**Rationale**: Com borgonha + magenta + cobre, os três pares (Sangue–Inimizade, Sangue–Adversário, Inimizade–Adversário) têm hues afastados; o risco de «um único vermelho-acastanhado» da spec deixa de se aplicar.

**Alternatives considered**: Padrão extra (tracejado, setas duplas) nas misturas — rejeitado (fora de âmbito; estilo de linha não muda).

## 4. Backend e dados

**Decision**: Zero alterações em Python, SQLite, API, seed.

**Rationale**: FR-006. Cor não está na tabela `vinculo`; IDs `vinculo_sangue` / `inimizade` / `adversario` inalterados. Vínculos existentes adoptam a nova cor no próximo load do frontend.

**Alternatives considered**: Persistir cor por vínculo — rejeitado (spec: catálogo por tipo).

## 5. Documentação de produto

**Decision**: Actualizar **apenas** `docs/feature-rede-relacoes.md` §6 (coluna Cor das três linhas). Não reescrever a entrada histórica `[0.16.0]` do CHANGELOG. Não exigir `docs/v2/feature-rede-relacoes.md`.

**Rationale**: FR-007; mesmo ficheiro canónico da 081. Histórico 0.16.0 descreve o estado *naquela* release.

**Alternatives considered**: Actualizar também `docs/v2/feature-rede-relacoes.md` — rejeitado (081 já o deixou fora; 085 não alarga esse âmbito).

## 6. Versão

**Decision**: **0.17.1** (patch).

**Rationale**: Mudança visual de catálogo existente; sem capacidade de domínio nova (contrasta com 0.17.0 visibilidade). Alinhado a 0.16.1 (Changed de UI).

**Alternatives considered**: 0.18.0 — rejeitado (não é feature de produto nova). 0.17.0 in-place — rejeitado (já publicado).

## 7. Acessibilidade

**Decision**: Distinção primária = famílias de hue + rótulo/posição na legenda (já existentes). Não adicionar padrão de traço aos três tipos. Quickstart inclui olhar os três lados a lado e Romance vs Inimizade.

**Rationale**: Spec: cor não é o único canal; Conhecido continua o único tracejado. Os três hues (351 / 318 / 22) sobrevivem a deuteranopia melhor do que o trio vermelho–rosa–laranja anterior.

**Alternatives considered**: Ícones por tipo — rejeitado (fora de âmbito). WCAG contrast ratio numérico no texto da ficha — deferido; as cores pintam linhas/chips, não texto de corpo.
