# Contract: CLI reconciliar cota

**Feature**: `096-uploads-cota`

## Comando

```bash
uv run python -m app.cli campanha reconciliar-cota --slug SLUG
```

## Comportamento

1. Resolver campanha pelo slug (erro se inexistente).
2. Somar tamanhos de todos os ficheiros sob `data/campanhas/<uuid>/uploads/` (recursivo).
3. Gravar `Campanha.bytes_usados` = soma.
4. Stdout: `OK slug bytes_usados=<n> cota_bytes=<n>`.

MUST NOT somar ficheiros de outra campanha.  
MUST NOT apagar órfãos (só contador).
