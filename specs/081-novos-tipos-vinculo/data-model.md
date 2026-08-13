# Data Model: Novos Tipos de Vínculo

**Feature**: `081-novos-tipos-vinculo`  
**Date**: 2026-08-13

Nenhuma entidade nova. Extensão do enum lógico **Tipo de vínculo** e das tabelas de sugestão de **Qualificador**. Campos `direcao` / `qualificador_*` inalterados.

## Tipo de vínculo (`VinculoTipo`)

Identificador persistido em `vinculo.tipo_ab` e `vinculo.tipo_ba` (`VARCHAR(20)`).

| ID (API/DB) | Label PT-BR | Label EN | Linha | Cor | Ordem |
|-------------|-------------|----------|-------|-----|-------|
| `aliado` | Aliado | Ally | sólida | `var(--color-accent)` | 1 |
| `vinculo_sangue` | Vínculo de Sangue | Blood Bond | sólida | `#6a3d8c` | 2 |
| `amizade` | Amizade | Friendship | sólida | `#79c48f` | 3 |
| `inimizade` | Inimizade | Enmity | sólida | `#e0707a` | 4 |
| `adversario` | Adversário | Adversary | sólida | `#c86b3c` | 5 |
| `romance` | Romance | Romance | sólida | `#e08fc0` | 6 |
| `familia` | Família | Family | sólida | `#d9a35b` | 7 |
| `conhecido` | Conhecido | Acquaintance | **tracejada** | `#9397ab` | 8 |

**Unicidade**: o ID é o valor canónico; labels nunca se persistem.

**Validação**: create/update rejeitam qualquer string fora deste conjunto (mesmo 422 que tipos ilegais hoje).

**Lifecycle**: sem estados. Tipos novos só existem em linhas criadas/editadas após o deploy; linhas antigas ficam nos 6 legados.

## Vínculo (inalterado)

| Field | Type | Notes |
|-------|------|-------|
| `tipo_ab` | `VinculoTipo` | obrigatório |
| `tipo_ba` | `VinculoTipo \| null` | preenchido só em modo duas vias (tipos distintos) |
| `qualificador_ab` / `qualificador_ba` | string ≤80 | texto livre |
| `direcao` | `null \| a_para_b \| b_para_a` | só significativo em modo recíproco na UI |

Normalização existente (`tipo_ba == tipo_ab` → `tipo_ba = null`) **não muda**.

## Qualificador — sugestões por tipo

Texto livre; datalist não é enum. **Medo** acrescenta-se sempre (união, sem duplicar).

| Tipo activo | Sugestões específicas |
|-------------|------------------------|
| `aliado` | Mentor, Protegido, Patrono, Devedor, Segredo, **Lacaio** |
| `vinculo_sangue` | **Lacaio** |
| `amizade` | Segredo, Companheiro de guerra |
| `inimizade` | Rival, Traidor, Antigo aliado |
| `adversario` | Rival, Traidor, Antigo aliado |
| `romance` | — |
| `familia` | Pai/Mãe, Irmão/Irmã, Tutor |
| `conhecido` | Rival, Desconfiança, Contato |

Duas vias: união das listas dos dois tipos + Medo (comportamento 075).

## Direcção — regra de UI (não é constraint DB)

| Evento | `direcao` |
|--------|-----------|
| Modo recíproco, `<select>` tipo → `vinculo_sangue` | definir `a_para_b` |
| Abrir edição de vínculo já `vinculo_sangue` | preservar valor gravado |
| Modo duas vias | não alterar |
| Utilizador escolhe Mútuo / B→A depois do default | persistir a escolha |

Não há CHECK que proíba `vinculo_sangue` + `direcao IS NULL`.
