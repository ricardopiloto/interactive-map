# Contract: Atualização do tema visual da campanha

**Feature**: `146-tema-campanha-editavel`  
**Base**: `/api/campanhas`

## PATCH `/{slug}/genero`

Atualiza o gênero visual compartilhado da campanha identificada pelo slug.

**Auth**: sessão autenticada e vínculo como dono da campanha. Anônimo recebe `401`; membro sem papel de dono recebe `403` (`NAO_DONO`).

**Request**:

```json
{
  "genero": "gotico"
}
```

Valores aceitos: `fantasia`, `gotico`, `scifi`, `urbano`.

**Response 200**:

```json
{
  "slug": "mesa-exemplo",
  "genero": "gotico"
}
```

O gênero da resposta é o valor persistido confirmado; apenas o campo `genero` da campanha indicada muda.

## Errors

| Status | Código | Condição |
|--------|--------|----------|
| 400 | `GENERO_INVALIDO` | Valor de gênero fora das quatro opções suportadas. |
| 400 | `GENERO_OBRIGATORIO` | Valor explicitamente enviado vazio, caso o normalizador o receba. |
| 401 | `AUTENTICACAO_NECESSARIA` | Sem sessão válida. |
| 403 | `NAO_DONO` | Usuário autenticado sem papel de dono nesta campanha. |
| 404 | `CAMPANHA_NAO_ENCONTRADA` | Slug inexistente ou campanha inativa. |
| 422 | Validação do request | Corpo ausente ou sem campo obrigatório, conforme validação da API. |

## Isolation and propagation

- A verificação de dono e a escrita são vinculadas ao mesmo `slug`.
- A operação não escreve em qualquer tabela de outra campanha nem modifica `sistema`.
- Próximos `GET /api/c/{slug}/config` expõem o gênero persistido a todos os membros.
- A nova rota de escrita deve ser incluída na cobertura HTTP da matriz de isolamento.

## Existing surfaces retained

`GET /api/c/{slug}/config` continua retornando `genero` em `InstanceConfigRead`. Não há mudança no contrato de criação, exportação, importação nem no schema de banco.
