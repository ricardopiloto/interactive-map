# Contract: CLI `usuario promover-admin` / `usuario rebaixar-admin`

**Feature**: 129
**Entrypoint**: `python -m app.cli` (dentro do venv/container — ver runbook de migração já em uso)

## Invocação

```text
usuario promover-admin --email EMAIL
usuario rebaixar-admin --email EMAIL
```

## Parâmetros

| Flag | Obrigatório | Notas |
|---|---|---|
| `--email` | sim | Usuário existente; precisa estar ativo (mesma regra de `atribuir-dono`) |

## Efeitos (sucesso, exit 0)

- `promover-admin`: `Usuario.is_admin = True` para o e-mail informado. Stdout: `OK admin=email`.
- `rebaixar-admin`: `Usuario.is_admin = False`. Stdout: `OK removido admin=email`.

## Recusas (exit 1, stderr `ERRO {CODIGO}`)

| Código | Quando |
|---|---|
| `USUARIO_NAO_ENCONTRADO` | e-mail não existe |
| `USUARIO_INACTIVO` | usuário existe mas não está ativo (mesma regra de `assign_owner`) |

## Não-efeitos

- Não cria usuário novo (usa `usuario criar` pra isso, já existente).
- Não afeta `Membro`/dono de campanha — são conceitos independentes.
- Idempotente: promover quem já é admin, ou rebaixar quem já não é, retorna sucesso sem erro.
