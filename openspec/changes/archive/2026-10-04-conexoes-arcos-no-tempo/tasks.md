# Tasks

## 1. Cálculo do layout

- [x] 1.1 Em `computeArcosLayout`, manter a ordem pela data do evento (mais recente no topo; vários eventos usam a data mais antiga; mês ausente conta como 0; sem ano, a sessão fica abaixo das datadas, desempate por `numero` descendente) e passar a atribuir colunas por concorrência: uma coluna partilhada enquanto nenhuma data cai estritamente entre a mais antiga e a mais recente de outro arco; coluna nova só nesse caso, ou quando duas sessões de arcos diferentes têm a mesma data. A coluna que continua liga as suas sessões na vertical mesmo com uma data intermédia de outro arco. A coluna da bifurcação liga-se por uma curva, descrita no resultado do layout (pontos de saída e chegada alinhados às colunas, sem segmento horizontal de cotovelo), na altura da sessão que delimita o encontro. A transição não duplica a sessão. O filtro recalcula colunas e ligações; um arco oculto não entra no traço. Um intervalo de mais de 12 meses marca a ligação como tracejada e expõe anos e meses; sem data numa ponta, o traço fica contínuo e sem rótulo. Verificar com um teste `node:test` ao lado do módulo, corrido com `node --experimental-strip-types`, cobrindo ordem, história linear de vários arcos na mesma coluna, bifurcação intercalada, mesma data em colunas diferentes, proibição de substituir a vertical do arco que continua, transição, filtro que fecha a coluna extra e o limiar de 12 meses.

## 2. Desenho e copy

- [x] 2.1 Desenhar as ligações de `ArcosTimelineView` em SVG, nas mesmas coordenadas dos pontos: vertical na mesma coluna e bézier cúbico na bifurcação, com saída e chegada alinhadas às colunas e a cor do arco que bifurca. O rótulo de intervalo continua a ser o tempo entre as datas, em pt-BR e en. Verificar com `npm run build` em `frontend/`.

## 3. Verificação na tela

- [x] 3.1 Na Linha do Tempo, modo Por arcos, confirmar com sessões temporárias que uma sequência de arcos diferentes sem datas intercaladas fica numa única vertical, e que uma sessão cuja data cai entre duas de outro arco abre outra coluna com curva até à altura desse encontro. O modo cronológico permanece a lista por data. Apagar as sessões e os eventos temporários antes de terminar, sem deixar dados de teste na campanha.

## 4. Cor sugerida na criação

- [x] 4.1 Extrair uma função pura que, dada a lista de cores já gravadas e um gerador aleatório, devolve um hex da paleta fixa ainda não usado (comparação em minúsculas); se a paleta estiver esgotada, devolve uma cor da paleta mesmo repetida. Verificar com um teste `node:test` corrido com `node --experimental-strip-types`, cobrindo exclusão das cores em uso, sorteio dentro do conjunto livre e o caso esgotado.
- [x] 4.2 Usar essa função ao abrir a criação manual e ao aplicar uma proposta de IA, e manter a cor gravada ao editar. Verificar no browser que dois arcos novos na mesma campanha abrem com cores diferentes enquanto a paleta tiver cores livres, e que editar um arco existente não troca a cor sozinho. Não deixar arcos de teste gravados.
