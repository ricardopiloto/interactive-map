# Data Model: Cores de Vínculo

**Feature**: `085-vinculo-color-rethink`  
**Date**: 2026-08-13

Nenhuma entidade nova. Nenhuma coluna nova. O modelo persistido (`vinculo.tipo_ab` / `tipo_ba`) é o da [081](../081-novos-tipos-vinculo/data-model.md). Esta frente só actualiza o **catálogo visual** (cor por ID).

## Tipo de vínculo — catálogo visual

Identificador persistido inalterado. Cor é atributo de apresentação, não de dados.

| ID (API/DB) | Label PT-BR | Linha | Cor | Mudança |
|-------------|-------------|-------|-----|---------|
| `aliado` | Aliado | sólida | `var(--color-accent)` | — |
| `vinculo_sangue` | Vínculo de Sangue | sólida | `#9e2436` | violeta `#6a3d8c` → borgonha |
| `amizade` | Amizade | sólida | `#79c48f` | — |
| `inimizade` | Inimizade | sólida | `#d12d9a` | vermelho-rosa `#e0707a` → magenta/fúcsia |
| `adversario` | Adversário | sólida | `#c86b3c` | família cobre mantida |
| `romance` | Romance | sólida | `#e08fc0` | — |
| `familia` | Família | sólida | `#d9a35b` | — |
| `conhecido` | Conhecido | **tracejada** | `#9397ab` | — |

**Unicidade**: o ID é o valor canónico; a cor não se persiste.

**Validação**: nenhuma regra nova de API. Qualquer string fora do enum continua a ser 422 como hoje.

**Lifecycle**: no deploy do frontend, todos os vínculos existentes desses IDs passam a pintar com o hex novo. Sem backfill.

## Vínculo duas vias

Campos `tipo_ab` / `tipo_ba` inalterados. O palco deriva duas cores do catálogo; combinações Sangue+Inimizade, Sangue+Adversário e Inimizade+Adversário são válidas e devem permanecer legíveis no gradiente (ver [research.md](./research.md) §3).
