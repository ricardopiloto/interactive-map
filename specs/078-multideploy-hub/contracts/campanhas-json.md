# Contract: `campanhas.json`

**Feature**: `078-multideploy-hub`  
**Served at**: `hub/campanhas.json` (same origin as hub HTML)

## Shape

```json
[
  {
    "nome": "Ecos de Reikland",
    "sistema": "WFRP4e",
    "mestre": "Ricardo",
    "url": "https://codex-wfrp.1nodado.com.br",
    "capa_url": "/capas/wfrp.jpg"
  }
]
```

| Field | Required |
|-------|----------|
| `nome` | yes |
| `sistema` | yes |
| `mestre` | yes |
| `url` | yes |
| `capa_url` | no |

## Semantics

- Hub **fetches** this file on each page load (no build step).
- Empty array `[]` → empty state copy (“Nenhuma campanha listada”).
- Invalid JSON → user-visible error, no crash.
- Missing `capa_url` → card without image.
- `url` opens in same tab (plain `<a href>`).

## Security

- File is public. MUST NOT contain lore, passwords, or character data.
- Scripts print a **candidate object**; humans paste into this file.
