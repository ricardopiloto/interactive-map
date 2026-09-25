# Data Model: Estado de locais e rolagem de sessões

## Local

Local de uma campanha, armazenado no `campanha.db` daquela campanha.

| Campo | Tipo conceitual | Regras |
|---|---|---|
| `estado_exploracao` | `conhecido` ou `visitado` | Obrigatório após a migração. Novos Locais começam como `conhecido`; somente pessoas com permissão atual de edição do Local podem alterá-lo. |
| `data_sessao` | texto opcional | Rótulo livre associado ao Local. Não determina nem é substituído pelo estado de exploração. |
| `cor_pin` | cor hexadecimal | Preferência visual do marcador. Não determina nem é substituída pelo estado de exploração. |

### Transições

`conhecido` ⇄ `visitado`. A atualização é persistida junto ao Local; um update parcial que não informe `estado_exploracao` não altera o valor atual.

### Migração dos registros existentes

- `data_sessao` nulo, vazio ou composto somente por espaços → `conhecido`.
- `data_sessao` com texto → `visitado`.
- A revisão adiciona o campo e faz o backfill no banco de cada campanha. Nenhum conteúdo textual é modificado.
- O downgrade remove `estado_exploracao`; deve ser precedido de backup para recuperar alterações de estado feitas após o upgrade, pois a estrutura anterior não armazenava essa escolha independentemente.

## Sessão

As entidades e campos das sessões não mudam. A lista principal da tela precisa permitir alcançar todas as sessões armazenadas, mesmo quando a altura total da lista exceder o viewport.

## Isolamento

Cada estado de Local pertence ao banco SQLite da campanha. IDs iguais em bancos de campanhas diferentes não devem compartilhar estado nem ser usados para ler ou atualizar a campanha vizinha.
