# Quickstart: Validar borda escura do grupo

## Prerequisites

- App rodando (dev ou Docker) com pelo menos a posição do grupo visível no mapa
- Preferível: poder alternar formato bandeira/brasão no Modo GM (aba Grupo)

## Setup

```bash
# na raiz — conforme README
cd frontend && npm run dev
# backend em :8000 se necessário
```

Abrir `http://localhost:5173`.

## Cenários

### A — Bandeira no mapa (SC-001, SC-002)

1. Garantir formato **bandeira**.
2. Observar o ícone do grupo no mapa.
3. **Esperado**: contorno escuro nítido; nenhuma borda blurple/accent.

### B — Brasão no mapa (SC-001)

1. Em Modo GM → Grupo → escolher **brasão**.
2. **Esperado**: mesma regra de borda escura, sem accent.

### C — Legenda (SC-004)

1. Olhar a legenda “Grupo” no canto do mapa.
2. **Esperado**: miniatura com borda escura alinhada ao ícone.

### D — Pins de local intactos (SC-002)

1. Comparar um pin vermelho de local.
2. **Esperado**: pin de local sem mudança de aparência por esta feature.

### E — Zoom (SC-003)

1. Usar +/−/gesto de zoom.
2. **Esperado**: borda do grupo permanece perceptível.

## Referências

- [spec.md](./spec.md)
- [contracts/ui-group-border.md](./contracts/ui-group-border.md)
- [research.md](./research.md)
