# Quickstart: 027-undo-segment-point

## Prerequisites

- App a correr; entrar em **Rede de rotas** (GM) com ≥2 nós
- [ui-undo-segment-point.md](./contracts/ui-undo-segment-point.md)

## Steps

1. **Traçar segmento** → clicar origem → 2–3 pontos intermédios no mapa.
2. Botão direito no mapa → some só o **último** intermédio; origem e restantes ficam.
3. Botão direito de novo → remove o próximo (ordem inversa).
4. Com origem e **zero** mids → botão direito → origem desmarcada; modo Traçar segmento **ainda ativo**.
5. Escolher origem de novo → colocar 1 mid → botão direito **em cima de um nó** → mid removido; segmento **não** é gravado.
6. Completar um segmento com clique **esquerdo** no destino → grava como antes.
7. Confirmar: menu de contexto do browser **não** aparece no mapa durante o traçado; segmentos antigos intactos.

## Pass criteria

- [ ] Direito remove um mid por clique
- [ ] Sem mids, direito limpa origem; modo continua
- [ ] Direito no nó = undo, não save
- [ ] Esquerdo no destino ainda grava
- [ ] Sem menu de contexto no mapa em `draw-seg`
- [ ] Zero deletes acidentais na lista de segmentos
