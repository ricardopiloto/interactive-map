# Quickstart: Validar hover → destaque do pin

## Prerequisites

- App em dev com ≥3 locais com pins no mapa
- Preferível desktop com mouse

## Setup

```bash
cd frontend && npm run dev
# backend se necessário
```

Abrir `http://localhost:5173`.

## Cenários

### A — Destaque na aba Locais (SC-001, SC-002)

1. Aba **Locais**.
2. Passar o mouse sobre o nome de um local.
3. **Esperado**: só o pin desse local destacado; modal **não** abre.

### B — Troca e saída (SC-003)

1. Hover no local A → pin A destacado.
2. Mover para local B → pin B destacado, A sem hover.
3. Sair da lista → destaque de hover some (seleção por clique anterior, se houver, pode permanecer).

### C — Clique inalterado (SC-004)

1. Clicar no nome de um local.
2. **Esperado**: comportamento atual (modal/detalhe), independente do hover.

### D — Fora de escopo

1. Em História/NPCs, hover em nomes/chips de local.
2. **Esperado**: sem obrigação de destacar pin nesta feature.

### E — Modo GM

1. Entrar Modo GM → aba Locais.
2. Hover no nome de um local na lista admin.
3. **Esperado**: mesmo destaque do pin.

## Referências

- [spec.md](./spec.md)
- [contracts/ui-hover-pin.md](./contracts/ui-hover-pin.md)
- [research.md](./research.md)
