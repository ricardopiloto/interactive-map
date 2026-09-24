# Data Model: Tema visual da campanha editável

**Feature**: `146-tema-campanha-editavel`

## Persisted entity

### Campanha (registro existente no banco de controle)

| Campo | Tipo atual | Uso nesta feature |
|-------|------------|-------------------|
| `id` | inteiro, chave primária | Identifica o registro persistido. |
| `slug` | texto único, índice | Identifica a campanha na API de gestão. |
| `genero` | texto não nulo, até 16 caracteres | Recebe um dos quatro IDs válidos: `fantasia`, `gotico`, `scifi` ou `urbano`. |
| `sistema` | texto | Permanece inalterado quando o gênero muda. |

O banco e a coluna já existem; o escopo não requer entidade, campo ou migration novos.

## Validation rules

- O gênero salvo deve pertencer à lista fechada `GENRE_IDS` já definida em `backend/app/services/genre_palette.py`.
- Valor ausente ou vazio não é uma alteração válida; valor desconhecido deve ser recusado com `GENERO_INVALIDO` (ausente/vazio segue a regra `GENERO_OBRIGATORIO` do normalizador, se recebido explicitamente).
- Uma campanha inexistente ou inativa não pode ser alterada e deve manter o comportamento existente `CAMPANHA_NAO_ENCONTRADA`.
- A alteração só pode afetar o registro de campanha indicado pelo slug validado por autorização de dono.
- `sistema`, módulos ativos, visibilidade, unidade, capa e demais dados não fazem parte desta mutação.

## Relationships

- Cada campanha tem seu próprio valor `genero`; o valor não é armazenado na preferência pessoal do usuário nem compartilhado por associação de conta.
- O dono é determinado pela relação `Membro` existente com `papel == "dono"`; nenhum novo papel ou vínculo é criado.
- Membros leem o valor salvo através do `InstanceConfigRead` existente, que já expõe `genero`.

## State transitions

```text
fantasia ─┬─> fantasia | gotico | scifi | urbano
gotico   ─┤
scifi    ─┤  Somente operação autorizada do dono persiste a transição.
urbano   ─┘
```

Selecionar na interface cria apenas uma escolha pendente em memória. Salvar a confirma no servidor. Cancelar ou falhar mantém como vigente o último valor confirmado.
