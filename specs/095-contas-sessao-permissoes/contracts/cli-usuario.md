# Contract: CLI super-admin (utilizador / dono)

**Feature**: `095-contas-sessao-permissoes`

Invocação: `uv run python -m app.cli …` (estender argparse existente).

## Comandos

### `usuario criar --email EMAIL`

- Cria Usuario (`activo=false`, sem senha) se email livre.
- Cria Convite `activar` (72 h, uso único).
- Imprime URL `/convite/{token}` (base `PUBLIC_BASE_URL`).
- Email duplicado → erro código; sem órfãos.

### `usuario reset --email EMAIL`

- Utilizador deve existir e estar activo (ou ter senha) conforme regra de implementação documentada — omissão: existe e não desactivado.
- Novo Convite `reset`; imprime `/reset/{token}`.

### `usuario desactivar --email EMAIL`

- `activo=false`; revoga sessões.

### `campanha atribuir-dono --slug SLUG --email EMAIL`

- Campanha e utilizador existem.
- Utilizador deve poder ser membro (preferir já activo; se ainda pendente, documentar — omissão: exigir activo).
- Remove dono anterior (membership); cria/actualiza Membro `dono` para o email.

## Saída

Stdout: link completo numa linha (fácil de copiar). Códigos de erro estruturados em stderr/exit ≠ 0.
