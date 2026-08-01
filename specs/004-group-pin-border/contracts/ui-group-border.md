# UI Contract: Borda escura do ícone do grupo

Escopo: marcador `.campaign-map__party` e miniatura `.campaign-map__legend-party` em `frontend/src/components/map/`.

## Must

| Elemento | Regra |
|----------|--------|
| Ícone grupo (bandeira) | Contorno escuro visível; **sem** borda accent |
| Ícone grupo (brasão) | Idem |
| Legenda Grupo | Miniatura com contorno escuro; **sem** accent |
| Pins de local | Aparência inalterada |

## Must not

- Coexistir borda accent + borda escura no grupo
- Alterar cor de preenchimento do grupo como objetivo desta feature
- Exigir mudança de API ou de `formato`

## Acceptance check

Comparar visualmente com pin de local: o “papel” da borda (escura, ~2px / equivalente) deve ser o mesmo tipo de contraste, adaptado à forma do grupo.
