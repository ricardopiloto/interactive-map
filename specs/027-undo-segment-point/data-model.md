# Data Model: 027-undo-segment-point

**N/A** para persistência — sem entidades novas na API/DB.

## Estado de rascunho (cliente)

| Campo | Tipo | Significado |
|-------|------|-------------|
| `mode` | `'idle' \| 'place-wp' \| 'draw-seg'` | Só `draw-seg` ativa o gesto |
| `draftA` | `number \| null` | ID do nó de origem do rascunho |
| `draftMids` | `MapPoint[]` | Pontos intermédios ainda não guardados (ordem de colocação) |

## Transições no botão direito (`draw-seg`)

```text
[draftA set, draftMids = [p1..pn], n≥1]
  --contextmenu--> [draftA set, draftMids = [p1..p(n-1)]]

[draftA set, draftMids = []]
  --contextmenu--> [draftA = null, draftMids = []]

[draftA = null, draftMids = []]
  --contextmenu--> no-op (mode continua draw-seg)

[busy = true]
  --contextmenu--> preventDefault; sem mutação do rascunho
```

## Invariantes

- Direito nunca chama create/delete de segmentos ou nós.
- Direito nunca define `mode` para `idle` (exceto fluxos já existentes de save bem-sucedido no clique esquerdo).
