# Contract: CLI export / import

**Feature**: 097  
**Entrypoint**: `uv run campaign-codex` / `python -m app.cli` (como 093)

## `campanha exportar`

```text
campanha exportar --slug SLUG --out PATH.zip
```

- Escreve zip no path.
- Exit 0 sucesso; ≠0 se slug inexistente / erro IO.
- Não exige utilizador (operador no host).

## `campanha importar`

```text
campanha importar --zip PATH.zip --email EMAIL [--slug SLUG]
```

- `EMAIL` MUST existir e estar activo → vira dono.
- Slug: `--slug` se dado; senão `slug_origem` se livre; senão erro `SLUG_OCUPADO`.
- Exit 0 → imprime slug (e opcionalmente UUID) em stdout.
- Mesmas recusas de validação que a API (mensagem + código).

## Erros CLI (stderr)

Texto curto + código estável (ex. `SLUG_OCUPADO`) para scripts.
