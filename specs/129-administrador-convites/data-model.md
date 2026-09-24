# Data Model: Administrador da aplicação e convites de mestres

## Usuario (alterado)

Tabela existente, `control.db`. Um atributo novo:

| Campo | Tipo | Default | Notas |
|---|---|---|---|
| `is_admin` | `bool` | `False` | Sem constraint de unicidade — o schema permite tecnicamente mais de um administrador; "único por enquanto" é regra de produto/CLI, não de banco (FR-010) |

Campos existentes (`id`, `email`, `senha_hash`, `activo`, `criado_em`, `actualizado_em`) não mudam.

**Transições de estado**: `is_admin` só muda via CLI (`usuario promover-admin`/`rebaixar-admin`) — nenhuma rota HTTP escreve esse campo, nem mesmo a de um administrador existente (não há autopromoção na UI, por decisão explícita, edge case da spec).

## Convite (sem alteração de forma)

Continua exatamente como hoje (`id`, `usuario_id`, `tipo`, `token_hash`, `expira_em`, `consumido_em`, `criado_em`). O que muda é **quem pode criar um** — antes só a CLI, agora também um administrador autenticado pela UI, através do mesmo `create_usuario_with_invite`. Nenhum campo novo, nenhuma migração adicional além da de `Usuario`.

## Sem entidade nova

Não há tabela nova nesta feature — só um atributo a mais numa tabela existente.
