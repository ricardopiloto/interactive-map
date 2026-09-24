# Contract: `require_dono`

**Feature**: 097  
**Extends**: 095 `require_membro`

## Comportamento

```text
require_dono = require_membro + Membro.papel == "dono"
```

- Sem sessão → 401  
- Sessão válida, sem membership no slug → 403  
- Membership `mestre` / `jogador` → 403  
- Membership `dono` → injecta contexto (campanha + utilizador) como `require_membro`

## Uso nesta feature

- `GET /api/c/{slug}/admin/export` MUST usar `require_dono`.
- Outras rotas admin existentes permanecem com `require_membro` até decisão futura.

## Matriz (export)

| Actor | Resultado |
|-------|-----------|
| Anónimo | 401 |
| Utilizador sem membership | 403 |
| Jogador / mestre da campanha | 403 |
| Dono | 200 + zip |
| Dono de **outra** campanha (pede export desta) | 403 |

Testes: estender `test_admin_auth_matrix` / ficheiro dedicado `test_export_auth.py`.
