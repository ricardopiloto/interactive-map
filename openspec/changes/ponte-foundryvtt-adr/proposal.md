# Proposal

## Why

O objetivo declarado (BKLG-041) é que, no futuro, o que o Campaign Codex produz possa ser levado ao FoundryVTT, por módulo ou por exportação/importação. O FoundryVTT guarda `Actor` e `Item` com schema que **cada sistema de jogo define** (`wfrp4e`, `vtm5e`, …); o Campaign Codex guarda uma casca narrativa e agnóstica de sistema (Personagem = retrato + papel + facção + status + descrição, sem ficha). Se cada feature nova de game-prep escolher sozinha como modelar mecânica, o risco é construir um schema de ficha que não bate com o do Foundry e refazê-lo quando a ponte for desenhada.

Duas entregas recentes já tocam esse ponto e hoje não têm uma regra escrita que as ancore: `notas_mecanicas` (Personagem) e `notas_preparo` (Sessão) são texto livre **só para o mestre**, e a exportação portátil existente (spec 097) leva **todas** as linhas, inclusive esses campos, porque é um backup para o dono. Falta uma decisão documentada sobre o que a ponte exporta, o que nunca exporta, e qual é o primeiro artefato a construir. Este change produz essa decisão, sem código.

## What Changes

- Registra um **ADR** (`docs/adr/0001-ponte-foundryvtt.md`) que responde as três perguntas abertas do BKLG-041: módulo ao vivo contra exportação pontual, qual sistema suportar primeiro (resposta: nenhum precisa de mapeamento na primeira entrega, porque nada vira `Actor`), e como mapear as entidades narrativas para `JournalEntry` e `Scene`.
- Fixa a direção recomendada: **primeiro artefato é uma exportação pontual** (arquivo JSON mais imagens que o mestre importa no Foundry por um **módulo mínimo**, no padrão de módulos comunitários como o `FVTT-DD-Import`), não um módulo ao vivo que consulta a API do Codex. A entrega inclui, portanto, manter esse módulo mínimo. Motivo central, verificado no código: a autenticação do Codex é por cookie de sessão com checagem de origem em requisições de escrita, e não existe token de API; um módulo ao vivo exigiria primeiro uma capacidade de autenticação nova.
- Fixa a fronteira: o Codex exporta a **casca narrativa**, nunca a ficha, e nesta fase **não gera nenhum `Actor`**: Personagens viram páginas de `JournalEntry`. A mecânica o mestre completa dentro do próprio Foundry, se quiser.
- Registra as **decisões do mestre (2026-10-20)**: versão alvo **FoundryVTT v14**; o sistema do WoD é **`wod20`** (id exato a confirmar, relevante só numa fase futura com atores); NPCs visíveis exportados como diário por padrão e **PJs desligados por padrão** (opt-in); exportação toda como diário.
- Formaliza como requisitos de capability as **invariantes** que as features futuras devem respeitar (sem schema de ficha por sistema enquanto a ponte não existir; exportação para o Foundry respeita visibilidade e campos de mestre; Personagens saem como diário, nunca como ator; a exportação não depende de `Campanha.sistema`).
- Lista as **verificações pendentes** contra a documentação oficial do Foundry na versão alvo antes de qualquer implementação, em vez de afirmar como fato o que depende de versão.
- **Fora de escopo:** criação de `Actor`/`Item` (fase futura, se houver demanda); qualquer endpoint, módulo, exportador, migração ou alteração de código; desenhar schema de ficha ou stat block; importação do Foundry para o Codex (sentido inverso); o BKLG-043 (encontros), que apenas passa a ter este ADR como referência.

## Capabilities

### New Capabilities
- `ponte-foundryvtt`: invariantes de arquitetura da integração futura com o FoundryVTT — a casca narrativa como único contrato de troca, ausência de schema de ficha por sistema, respeito à visibilidade e aos campos de mestre na exportação, e independência de `Campanha.sistema` na primeira entrega (tudo é diário, então nenhum sistema precisa de mapeamento).

### Modified Capabilities
_Nenhuma — não há capability existente sobre integração externa de dados. A exportação portátil da spec 097 (`specs/097-exportar-importar/`) **não é alterada**: continua sendo o backup completo do dono; este change só estabelece que ela não serve de base para a exportação ao Foundry._

## Impact

- **Código:** nenhum. Sem backend, frontend, migração Alembic ou dependência nova.
- **Documentação:** novo ADR em `docs/adr/`; atualização do status do BKLG-041 e anotação em BKLG-043 no `docs/backlog/backlog.md`.
- **Specs:** nova spec principal `ponte-foundryvtt` (depois do archive), que serve de critério de revisão para BKLG-043, BKLG-046 e qualquer feature de mecânica.
- **Dependências de decisão:** BKLG-029 (sistema agnóstico) e BKLG-013 (módulos por sistema) tocam a mesma tensão e devem ser lidos junto com o ADR.
- **Sem impacto** em `frontend/` nem `frontend-next/` (não deployados).
