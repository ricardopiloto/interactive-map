# Data Model: Contas de mestre (control.db)

**Feature**: `095-contas-sessao-permissoes`  
**Date**: 2026-09-20

## Layout

Sem mudança ao layout em disco 093. Novas tabelas **só** em `{DATA_DIR}/control.db` via Alembic controlo (revisão `002_…`).

## Usuario

| Campo | Tipo | Regras |
|-------|------|--------|
| id | PK | Auto |
| email | string | Único; normalizado lower-case; = login |
| senha_hash | string \| null | Null até aceitar convite |
| activo | bool | False se desactivado ou ainda não activou; True após definir senha |
| criado_em | datetime | |
| actualizado_em | datetime | |

### Validation

- Email único; formato email básico.
- Desactivar: `activo=false` + invalidar Sessao.
- Login exige `activo=true` e `senha_hash` presente.

## Membro

| Campo | Tipo | Regras |
|-------|------|--------|
| id | PK | |
| usuario_id | FK Usuario | |
| campanha_id | FK Campanha | |
| papel | string | `dono` (MVP); `co_mestre` reservado sem UI |
| criado_em | datetime | |

### Validation

- Unique `(usuario_id, campanha_id)`.
- No máximo **um** Membro com `papel=dono` por `campanha_id`.
- Atribuir dono: remover membership dono anterior; criar/actualizar o novo como `dono`.

## Convite

| Campo | Tipo | Regras |
|-------|------|--------|
| id | PK | |
| usuario_id | FK Usuario | |
| tipo | string | `activar` \| `reset` |
| token_hash | string | Hash do token opaco |
| expira_em | datetime | criado + 72 h |
| consumido_em | datetime \| null | Null = válido se não expirado |
| criado_em | datetime | |

### Transitions

```text
criar (CLI) → pendente
aceitar/confirmar (API) → consumido (+ activar user ou nova senha)
expirado ou reutilizado → recusa
```

## Sessao

| Campo | Tipo | Regras |
|-------|------|--------|
| id | PK | |
| usuario_id | FK Usuario | |
| token_hash | string | Único |
| criado_em | datetime | Max age 30 d |
| ultimo_acesso | datetime | Idle 12 h |
| revogada | bool | Default false |

### Transitions

```text
login → activa
pedido auth → refresh ultimo_acesso se válida
logout / reset senha / desactivar → revogada ou apagada
idle>12h ou age>30d → inválida
```

## LoginBloqueio (ou equivalente)

| Campo | Tipo | Regras |
|-------|------|--------|
| chave | string | `email:{email}` ou `ip:{ip}` |
| falhas | int | Janela deslizante / reset ao sucesso |
| bloqueado_ate | datetime \| null | now+15m após 5 falhas |

## Campanha (093)

Sem novos campos obrigatórios. Membership via `campanha_id`.

## Relationships

```text
Usuario 1—* Membro *—1 Campanha
Usuario 1—* Convite
Usuario 1—* Sessao
```
