# Quickstart: 026-smooth-wheel-zoom

## Prerequisites

- Frontend + backend a correr
- Mouse com roda (ideal) ou trackpad
- [ui-smooth-wheel-zoom.md](./contracts/ui-smooth-wheel-zoom.md)

## Steps — Mapa da campanha

1. Abrir o mapa; zoom inicial (~1).
2. **Um** tick de scroll para aproximar → zoom sobe de forma moderada (não vai quase ao máximo).
3. Um clique em **+** → comparar: mudança da **mesma ordem de magnitude** que o tick.
4. Vários ticks → consegue parar num nível intermédio útil.
5. Scroll contínuo até ao máximo (4) → completa em **≤ 8 s**.
6. Pan e clicar num pin → sem regressão.

## Steps — Rede de rotas (GM)

1. Entrar em Rede de rotas / digitalização.
2. Repetir comparação tick vs **+** (paridade de ordem de magnitude).
3. Scroll contínuo até ao máximo (12) → completa em **≤ ~15 s**.
4. Desenhar/ajustar um segmento com zoom alto → controlo fino usável.

## Pass criteria

- [ ] Mapa: `wheel.step` efetivo ~0.01 (não 0.1)
- [ ] Digitalização: `wheel.step` efetivo ~0.01 (não 0.2)
- [ ] Tick ≈ clique +/− (ordem de magnitude)
- [ ] Mapa ≤ 8 s até ao máximo; Rede ≤ ~15 s
- [ ] `maxScale` 4 / 12 inalterados; +/− e pan OK

## Tunagem

Se tick ainda for grosseiro ou demasiado fino no hardware local, ajustar só `wheel.step` em **0.008–0.015** sem tocar nos botões.
