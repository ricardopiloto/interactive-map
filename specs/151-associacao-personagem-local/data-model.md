# Data Model: Associar personagens a Locais

A feature usa o modelo de dados existente; nenhuma entidade ou migration nova é necessária.

## Entidades existentes

### Personagem (`NPC` no schema atual)

- Linha da tabela existente `npc`.
- `tipo` identifica `pj` ou `npc`.
- Possui relação inversa com os Locais associados.
- A visibilidade existente determina se o personagem é consultável por jogadores.

### Local

- Linha da tabela existente `local`.
- Possui relação com personagens por meio de `LocalNPCLink`.
- A visibilidade existente determina se o Local é consultável por jogadores.

### Associação Local-Personagem (`LocalNPCLink`)

- Tabela existente `local_npc`.
- Chave composta: `local_id` + `npc_id`.
- Ambas as chaves são referências às entidades da campanha ativa.
- Permite muitos personagens por Local e muitos Locais por personagem.
- A associação não depende do valor de `tipo`; tanto PJ quanto NPC são linhas da mesma entidade.

## Contrato de dados mantido

Os esquemas existentes de Local expõem `npc_ids` para manter compatibilidade. Apesar do nome histórico, a lista contém IDs da entidade unificada e pode representar PJ ou NPC. O endpoint de personagem correspondente expõe `local_ids`.

## Regras de visibilidade

- O mestre recebe associações completas para edição e consulta.
- O jogador recebe associações somente quando o Local e o Personagem podem ser vistos segundo as regras públicas existentes.
- Um pedido na campanha A consulta e altera somente as tabelas da base da campanha A.
- Remover uma associação remove apenas o registro de vínculo, não o Local nem o Personagem.
