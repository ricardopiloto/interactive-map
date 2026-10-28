# Proposal

## Why

O grafo de Relações usa um layout radial determinístico com espaçamento fixo, calculado para que nenhuma caixa de nó se sobreponha. Em elencos grandes o grafo fica muito espalhado e obriga a usar zoom; em elencos pequenos ou ao inspecionar um cluster, a pessoa gostaria de aproximar os personagens. Hoje não há como ajustar isso.

## What Changes

- Novo controle deslizante "Distância entre personagens" no painel de controles do grafo (junto de zoom e "Ajustar à tela").
- O valor padrão (espaçamento atual do layout) fica exatamente no **meio** do slider, que sempre começa centralizado. Esquerda («Perto») aproxima até 0,25×, direita («Longe») afasta até 2× — a metade esquerda é mais longa, para permitir aproximar bastante. Escala logarítmica por metade (meio = 1× exato). O slider é um item **à parte**, separado do painel de zoom, com apenas os rótulos «Perto» e «Longe» nas pontas (sem rótulo para o padrão).
- Voltar ao padrão por duplo clique no slider (sem botão dedicado).
- O fator multiplica o raio dos anéis dos dois layouts (PJ/NPC e centrado na seleção); tamanho das caixas dos nós e das fontes não muda.
- Ao mudar o fator, o enquadramento é refeito (ajustar à tela, ou centralizar no selecionado) e os deslocamentos de arraste da visita são descartados.
- Abaixo do padrão (< 1×) as caixas dos nós **podem se sobrepor**, por escolha explícita da pessoa. No padrão e acima, a garantia de não sobreposição continua.
- Estado apenas no cliente, em memória (como os deslocamentos de arraste); sem backend, sem migração, sem dependência nova (o componente `Slider` shadcn/Radix já existe).

## Capabilities

### New Capabilities

### Modified Capabilities
- `rede-relacoes`: o requisito "Nenhuma caixa de nó se sobrepõe" passa a valer no espaçamento padrão e acima; novo requisito do controle de distância.

## Impact

- `frontend-v2/src/lib/graphLayout.ts` (parâmetro `spacing`), `frontend-v2/src/components/codex/RelationsGraph.tsx` (estado, controle, refit), `frontend-v2/src/locales/{pt-BR,en}/relacoes.json`.
- Testes: `graphLayout` e `RelationsGraph.test.tsx`.
- Sem mudança de API, banco, deploy ou versão obrigatória (entra no próximo CHANGELOG).
