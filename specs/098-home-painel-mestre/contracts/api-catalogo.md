# Contract: Catálogo público

**Feature**: 098  
**Auth**: nenhuma

## `GET /api/campanhas/catalogo`

Resposta `200`:

```json
{
  "campanhas": [
    { "slug": "mesa-alfa", "nome": "Alfa", "sistema": "wfrp4e" }
  ]
}
```

Ordenação: por `nome` (case-insensitive) ou `slug` — estável e documentada na implementação.

## Regras

- Incluir só `activa=true` e `visibilidade=listada`.
- MUST NOT devolver `so_link`, inactivas, cota, membros, `caminho`, emails.
- Anónimo e autenticado recebem o **mesmo** conjunto (catálogo público).
