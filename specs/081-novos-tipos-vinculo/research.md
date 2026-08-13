# Research: Novos Tipos de Vínculo

**Feature**: `081-novos-tipos-vinculo`  
**Date**: 2026-08-13

## 1. Persistência sem migração

**Decision**: Só alargar `VinculoTipo` em `backend/app/models/vinculo.py` (e a union TS). Sem ALTER TABLE, sem Alembic, sem backfill.

**Rationale**: Colunas `tipo_ab` / `tipo_ba` já são strings (`VARCHAR(20)`). `vinculo_sangue` tem 15 caracteres. SQLModel/Pydantic validam o enum na escrita; linhas existentes com os 6 valores continuam válidas. `database.py` não tem CHECK SQL sobre o conjunto de tipos.

**Alternatives considered**: Tabela `vinculo_tipo` normalizada — rejeitado (FR-001: sem novos campos). Migração Alembic “por higiene” — rejeitado (YAGNI; o projecto usa `create_all` + patches pontuais).

## 2. Identificadores estáveis

**Decision**: `adversario` e `vinculo_sangue` (snake_case, alinhado ao enum Python existente: `aliado`, `inimizade`, …).

**Rationale**: Clarification + Assumptions da spec. Payload API = valor persistido = chave i18n `vinculoTipo.<id>`.

**Alternatives considered**: `adversary` / `blood_bond` em inglês no enum — rejeitado (catálogo actual é PT-stem). `vinculo-sangue` kebab — rejeitado (enum Python).

## 3. Cores exactas (Nocturne)

**Decision**: linhas **sólidas** (`dashed: false`):

| ID | Família (spec) | Hex | Distinção |
|----|----------------|-----|-----------|
| `adversario` | cobre / laranja queimado | `#c86b3c` | Longe de Inimizade `#e0707a` (vermelho-rosa) e Família `#d9a35b` (âmbar) |
| `vinculo_sangue` | violeta escuro | `#6a3d8c` | Longe de Romance `#e08fc0` (rosa) e Aliado `var(--color-accent)` (blurple) |

**Rationale**: Spec deixou hex para o plano. Tons médios-escuros lêem-se no fundo Nocturne; saturação suficiente para chips/legenda.

**Alternatives considered**: Reusar accent para sangue — rejeitado (colide com Aliado). Tracejado para Adversário — rejeitado (spec: sólido; tracejado é só Conhecido).

## 4. Ordem canónica (fonte única)

**Decision**: `VINCULO_TIPOS` em `vinculoStyles.ts` na ordem:

`aliado` → `vinculo_sangue` → `amizade` → `inimizade` → `adversario` → `romance` → `familia` → `conhecido`

Formulário, chips, legenda e `Set` inicial de filtros leem este array. Não duplicar listas noutros ficheiros.

**Rationale**: Clarification Q3; `RelacoesSideColumn` e `VinculoFormDialog` já mapeiam `VINCULO_TIPOS`.

**Alternatives considered**: Ordem do `<select>` diferente da legenda — rejeitado (spec FR-003 = FR-006).

## 5. Pré-preenchimento de direcção (Vínculo de Sangue)

**Decision**: Em modo **recíproco**, quando o valor do `<select>` de tipo **passa a** `vinculo_sangue` (`onChange`), definir `direcao: 'a_para_b'`. Editável a seguir. **Não** aplicar ao abrir o diálogo (editar vínculo já `vinculo_sangue` preserva a direcção gravada). Modo **duas vias**: não tocar em `direcao`.

**Rationale**: Clarification Q1 = “ao seleccionar o tipo”. Re-aplicar no mount reescreveria `b_para_a` / mútuo gravados. Duas vias não expõe o controlo de direcção.

**Alternatives considered**: Aplicar também no mount de edição — rejeitado (destrói direcção explícita). Hint só, sem default — rejeitado na clarify.

## 6. Qualificadores

**Decision**:

- `aliado`: lista actual + **Lacaio**
- `vinculo_sangue`: **Lacaio** (+ Medo global)
- `adversario`: **Rival, Traidor, Antigo aliado** (cópia de `inimizade`) + Medo
- Valores do `<datalist>` continuam **texto persistido em PT** (padrão actual: `'Mentor'`, `'Medo'`), não chaves i18n — o campo é conteúdo do mestre
- Acrescentar `qualificador.lacaio` em `relacoes.json` (PT **Lacaio** / EN **Minion**) para paridade do namespace; o formulário pode continuar a usar o literal `'Lacaio'` no datalist até haver migração das sugestões para `t()`

**Rationale**: FR-007; clarification Q5; 075 já trata qualificadores como texto livre armazenado.

**Alternatives considered**: Traduzir sugestões no datalist conforme locale — rejeitado nesta frente (mudaria valores gravados se o mestre clicar a opção EN). Lista vazia para Adversário — rejeitado na clarify.

## 7. i18n

**Decision**: Chaves novas em `frontend/src/locales/{pt-BR,en}/relacoes.json`:

| Key | pt-BR | en |
|-----|-------|-----|
| `vinculoTipo.adversario` | Adversário | Adversary |
| `vinculoTipo.vinculo_sangue` | Vínculo de Sangue | Blood Bond |

`getVinculoTipoLabel` já faz `t('vinculoTipo.' + tipo)`.

**Rationale**: Clarification Q2; 080.

**Alternatives considered**: “Supernatural Bond” — rejeitado na clarify.

## 8. Documentação de produto

**Decision**: Actualizar **apenas** `docs/feature-rede-relacoes.md`:

- §3.1 — legenda “cor de cada tipo” (8 tipos)
- §6 — tabela de tipos com 8 linhas (ordem canónica + cores família/hex)
- §6.1 — Aliado + Lacaio; novas linhas Vínculo de Sangue e Adversário; “Medo em qualquer um dos oito”
- §11 — nota breve: coerção sobrenatural é taxonomia agnóstica (não mecânica VtM)

**Não** tocar `docs/v2/feature-rede-relacoes.md`.

**Rationale**: Clarification Q4.

## 9. Seed

**Decision**: Não obrigar novos vínculos no `seed.py`. Quickstart cria via UI GM.

**Rationale**: Spec não pede dados de exemplo; seed actual demonstra os 6 legados.

**Alternatives considered**: 1 vínculo Adversário + 1 Vínculo de Sangue no seed — opcional, fora do caminho crítico.
