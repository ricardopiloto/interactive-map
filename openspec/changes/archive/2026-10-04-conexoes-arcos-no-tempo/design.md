# Design

## Context

`computeArcosLayout` em `frontend/src/components/linhaTempo/arcosLayout.ts` ordena uma linha por sessão pela data do evento e liga cada sessão à imediatamente anterior no tempo. Se o arco muda, desenha um cotovelo: vertical na raia da mais nova e horizontal na altura da anterior. Cada arco tem coluna fixa (`lane.x`), incluindo Sem arco. `ArcosTimelineView` desenha esses segmentos com `border-left` e `border-top`. `LinhaTempoPage` já passa `eventos`. `Sessao.data_rotulo` é texto livre, não uma data ordenável. Ver proposal.md para a motivação.

## Goals / Non-Goals

**Goals:**

- Manter a ordem pela data do evento e uma linha por sessão.
- Deixar a história linear numa única coluna, mesmo quando as sessões mudam de arco.
- Abrir outra coluna só quando as datas se intercalam, e sair dessa coluna com uma curva contínua, como no Git Graph do VS Code.
- Sugerir, na criação, uma cor de arco aleatória que não repita as cores já gravadas na campanha.

**Non-Goals:**

- Espaçamento vertical proporcional ao tempo de calendário.
- Novo endpoint, migração ou alteração dos modos cronológico e Por descoberta.
- Mudar a regra de pertença da sessão ao arco.
- Uma coluna permanente por arco.

## Decisions

- **A data vem dos eventos já carregados na página, não de `data_rotulo` e não de um pedido novo.** `LinhaTempoPage` passa `eventos` a `ArcosTimelineView`. A lista pública já omite eventos ocultos para o jogador, por isso uma data secreta não entra no layout. Se a sessão tem vários eventos, a chave é a mais antiga: `ano` crescente e, no mesmo ano, `mes ?? 0` (mês ausente fica antes de qualquer mês desse ano). Sem evento com `ano`, a sessão não recebe data inventada e fica abaixo de todas as datadas, desempate por `numero` descendente. O intervalo de um arco, para decidir sobreposição, usa só as sessões visíveis com data: da mais antiga à mais recente. Uma sessão sem data não alarga o intervalo. Alternativa considerada: usar `data_rotulo`. Rejeitada porque não é comparável.
- **Uma linha por sessão visível, altura fixa `ROW_HEIGHT`, mais recente no topo.** A ordem é a data do evento, não o número da sessão. Alternativa considerada: altura do vão proporcional aos anos. Rejeitada porque o grafo de git usa um nó por linha, e o intervalo longo continua a ser o tracejado com o tempo decorrido.
- **A coluna é de concorrência, não de arco.** Percorre-se as sessões da mais recente para a mais antiga. A primeira sessão ocupa a coluna 0 e reserva essa coluna para o arco enquanto ainda houver sessão mais antiga desse arco. Uma sessão seguinte do mesmo arco reutiliza a coluna reservada. Uma sessão de outro arco ocupa uma coluna nova só enquanto alguma coluna reservada ainda tem sessão mais antiga — isto é a intercalação estrita. Quando nenhuma reserva continua, a sessão reutiliza a coluna 0. Duas sessões de arcos diferentes com a mesma data não partilham coluna. Os chips de filtro continuam um por arco; os cabeçalhos de coluna do canvas seguem as colunas ocupadas, não a lista de arcos. Alternativa considerada: manter uma coluna fixa por arco e só arredondar o cotovelo. Rejeitada porque a história linear continuaria a mudar de coluna sempre que o arco muda.
- **Dentro da coluna, a ligação é vertical entre as sessões consecutivas dessa coluna.** O arco que reservou a coluna liga as suas sessões mesmo que a data de outra coluna caia no meio. A coluna da bifurcação liga as suas próprias sessões na vertical e junta-se à coluna reservada por uma curva em cada extremo do trecho sobreposto: da sessão da bifurcação até à sessão da outra coluna que delimita o encontro. Alternativa considerada: obrigar cada sessão a ligar-se à imediatamente anterior no tempo global, saltando a vertical do arco que continua. Rejeitada porque isso volta a desenhar um desvio em toda a troca de arco.
- **A curva é um traço contínuo, sem canto reto.** Sai alinhada à coluna de origem e chega alinhada à coluna de destino, na altura da sessão de encontro. Um bézier cúbico com os controlos no eixo vertical de cada ponta produz essa saída. A cor é a do arco da coluna que bifurca. O intervalo de mais de 12 meses traceja a ligação inteira e expõe anos e meses; sem data numa ponta, o traço fica contínuo e sem rótulo. Alternativa considerada: cotovelo com cantos arredondados em `div`. Rejeitada porque o canto, mesmo suave, continua a ser vertical e depois horizontal, e não a saída do Git Graph.
- **O desenho da curva passa a SVG, no mesmo sistema de coordenadas dos pontos** (`ROW_HEIGHT`, `column.x`, `row.y`). Os segmentos verticais podem ser o mesmo `<path>`. Alternativa considerada: manter só `border-left` e `border-top`. Rejeitada porque esses bordos não descrevem a curva.
- **O filtro entra no cálculo das colunas e das ligações.** Ocultar um arco tira as sessões dele do intervalo e da lista. Se a intercalação desaparece, a coluna extra desaparece e as restantes voltam à coluna partilhada. Nenhum traço usa um arco oculto.
- **A transição junta os dois arcos na mesma sessão, sem segunda linha.** Se os dois arcos calham na mesma coluna, há um ponto. Se ocupam colunas diferentes, as curvas encontram-se nessa linha.
- **A cor sugerida é escolhida no cliente, na abertura do formulário de criação.** Uma função pura recebe as cores já gravadas e um gerador aleatório, e devolve um hex de uma paleta fixa, sorteado entre as que não estão em uso (comparação em minúsculas). A edição continua a abrir `arco.cor`. O valor segue no campo `cor` já existente. Alternativa considerada: o servidor sortear a cor quando `cor` vem vazio. Rejeitada porque o mestre tem de ver e poder corrigir a cor antes de guardar.

## Risks / Trade-offs

- **Sessões sem evento agrupam-se no fundo pela ordem do número** → aceite; o layout não inventa data. O mestre associa um evento se quiser a posição no tempo.
- **Para o jogador, um evento oculto faz a sessão parecer sem data** → a lista pública já é a fronteira de visibilidade; o layout não consulta o registo oculto.
- **Vários eventos na mesma sessão usam o mais antigo, o que pode ser um flashback** → a spec fixa a data mais antiga; não há escolha de “evento principal”.
- **A vertical do arco que continua atravessa a altura da bifurcação sem a ligar** → a sessão intercalada liga-se por curva nos extremos, não por um desvio da coluna principal.
- **O primeiro ponto não pode voltar a ficar cortado** → a curva e os rótulos de intervalo ficam dentro do canvas, alinhados ao centro da linha (`row.y + ROW_HEIGHT / 2`).
- **A paleta é finita** → com mais arcos do que cores, a sugestão pode repetir; a criação não fica bloqueada, e o mestre pode ajustar no seletor. Arcos antigos com a mesma cor não são reescritos.

## Migration Plan

Não há migração nem alteração de API. Reverter o desenho é voltar às colunas fixas por arco e aos cotovelos em `border-left` / `border-top`.
