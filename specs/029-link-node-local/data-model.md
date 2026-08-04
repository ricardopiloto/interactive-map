# Data Model: 029-link-node-local

**Sem migration.** Campos existentes:

| Entidade | Campo | Papel |
|----------|-------|--------|
| Waypoint | `local_id` (nullable, unique intent) | Dono do vínculo |
| Local | `x`, `y` | Atualizados para o nó ao vincular |

## Regras

1. No máximo um Waypoint com o mesmo `local_id` não-nulo.
2. Ao **definir** vínculo (`local_id = L` no nó, ou `waypoint_id = W` no Local):
   - `Local.x = Waypoint.x`, `Local.y = Waypoint.y`
3. Ao **limpar** vínculo: `Waypoint.local_id = None`; Local mantém `x/y`.
4. Trocar Local do nó A→B: nó deixa A; B recebe vínculo e snap; posição de A inalterada.
5. Trocar nó do Local W1→W2: W1.local_id limpo; W2.local_id = Local; Local snap para W2.

## Campo de API (não coluna nova)

`waypoint_id` no create/update/read de Local é **derivado** / parâmetro de sync, não coluna em `local`.
