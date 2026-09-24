# Quickstart: Mapa

**Feature**: `103-mapa`

## Prerequisites

`npm run dev` + campanha com mapa; preferir dois temas e mapa claro/escuro.

## Checks

1. **Controlos**: canto inferior direito; +, −, 1:1, ir ao grupo legíveis nos dois temas.
2. **Pinos**: locais com `data_sessao` preenchidos vs vazios → preenchido vs contorno; cor do mestre mantém-se; grupo = bandeira.
3. **Nomes**: zoom baixo sem hover → sem nomes em massa; hover mostra um; zoom alto (≥~1.35) mostra nomes.
4. **Popover**: abrir local → mapa sem overlay escuro; Esc / clique fora / Fechar; local sem descrição sem «Sem descrição.».
5. **Legenda**: começa fechada, canto inferior esquerdo; abre e explica formas.

## Gates

`npm run lint:tokens` && `npm run test:contrast`
