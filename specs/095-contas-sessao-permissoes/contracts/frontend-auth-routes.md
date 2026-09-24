# Contract: rotas frontend de auth

**Feature**: `095-contas-sessao-permissoes`

## Rotas

| Path | UI |
|------|-----|
| `/login` | Email + senha; suporte `?next=` |
| `/convite/:token` | Definir senha (activar) |
| `/reset/:token` | Definir nova senha |
| Pós-login | Se `next` seguro → redirect; senão página mínima («sessão iniciada», peça `/c/…`) |

## Client

- `credentials: 'include'` em todos os `fetch` à API.
- Remover armazenamento/envio de Basic Auth (`codex_admin_basic`).
- 401 em chamada admin → `navigate('/login?next=' + encodeURIComponent(location))`.
- `next` só se path relativo interno (`/…` sem `//` nem esquema).

## i18n

Chaves pt-BR + en: login, convite, reset, pós-login, erros de auth mapeados por código.
