# Quickstart: 025-route-type-title

## Prerequisites

- App a correr; Calcular rota com ≥1 rota (ideal: rio vs estrada, ou duas estradas)
- [ui-route-type-title.md](./contracts/ui-route-type-title.md)

## Steps

1. Calcular rota com alternativa só-rio → título **Rio** (não “Rota 1”); sem linha extra de tipos.
2. Alternativa só-estrada → **Estrada**.
3. Se houver duas só-estrada → **Estrada** e **Estrada (2)**.
4. Rota mista → título com ambos os tipos (ex. **Estrada, Rio**).
5. Primeira da lista ainda indica mais rápida (sufixo/estilo), sem “Rota N”.

## Pass criteria

- [ ] Sem “Rota N” no título
- [ ] Sem linha secundária de tipos
- [ ] Duplicados desambiguados
- [ ] Distância e tempo visíveis
