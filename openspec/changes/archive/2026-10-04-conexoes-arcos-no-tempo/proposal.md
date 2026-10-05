# Proposal

## Why

No modo Por arcos, cada arco ocupa uma coluna fixa e a linha muda de coluna com um cotovelo reto sempre que a sessão seguinte pertence a outro arco. No grafo de git do VS Code a história linear fica numa única coluna; uma coluna nova e uma curva só aparecem quando um ramo convive no tempo com outro.

## What Changes

- A ordem vertical das sessões no modo Por arcos segue a data do evento associado (mais recente acima), e não só o número da sessão.
- Sem intercalação de datas, todas as sessões visíveis ficam na mesma coluna vertical, qualquer que seja o arco. Trocar de arco entre sessões vizinhas no tempo não abre coluna nem desenha curva.
- Uma coluna nova só existe quando há bifurcação real: a data de uma sessão cai estritamente entre a sessão mais antiga e a mais recente de outro arco, ou duas sessões de arcos diferentes têm a mesma data.
- A coluna que continua liga as suas sessões na vertical, mesmo que a data de outra coluna caia no meio. A coluna nova junta-se à outra por uma curva contínua, sem canto reto, no estilo do Git Graph: sai a direito da coluna de origem e chega a direito na altura da sessão de encontro.
- Intervalos longos continuam tracejados e com o tempo decorrido entre as datas que a ligação une.
- Uma sessão de transição não se duplica. Se os dois arcos partilham a coluna, é um ponto; se ocupam colunas diferentes, as linhas encontram-se nessa sessão.
- Sessões sem evento datado ficam abaixo de todas as que têm data, ordenadas pelo número da sessão, na coluna partilhada. Sem evento, o sistema não inventa data.
- Ao criar um arco, a cor deixa de abrir sempre no mesmo dourado. O formulário sugere uma cor aleatória de uma paleta fixa, evitando as cores já gravadas noutros arcos da mesma campanha. O mestre pode alterá-la antes de guardar. Editar um arco não volta a sortear a cor.

## Capabilities

### New Capabilities

(nenhuma.)

### Modified Capabilities

- `linha-tempo-por-arcos`: as colunas do modo Por arcos deixam de ser uma por arco. A timeline permanece numa raia vertical e só abre outra raia quando as datas se intercalam; a saída para essa raia é uma curva contínua, como no Git Graph. Na criação, a cor do arco é sugerida ao acaso entre as cores da paleta que ainda não estão em uso na campanha.

## Impact

- **Frontend**: o cálculo de layout em `frontend/src/components/linhaTempo/arcosLayout.ts` e o desenho das ligações em `ArcosTimelineView`. A posição vertical depende da data do evento ligado à sessão (`Evento.ano` / `Evento.mes`, via `sessao_id`). A coluna depende da sobreposição desses intervalos, não do arco em si. A curva substitui o cotovelo em `border-left` / `border-top`.
- **Frontend, criação de arco**: `startManualArco` e `aplicarProposta` em `MapPage.tsx` passam a preencher `cor` com uma escolha aleatória, em vez de `''` (que o seletor mostra como `#d8aa5a`). O seletor de cor permanece para o mestre corrigir. Sem API nova e sem migração. Os modos cronológico e Por descoberta, a regra de uma sessão por arco (com a exceção de transição) e o filtro por arco permanecem.
- **Suposição da cor**: “evitar a mesma cor” compara o hex já gravado, em minúsculas. Se a paleta estiver esgotada, a criação não é bloqueada — sorteia-se na mesma uma cor da paleta, mesmo que repita. Arcos que já partilham cor não são reescritos. A identificação Sem arco continua com a cor neutra e não entra na paleta.
- **Suposição**: se uma sessão tem vários eventos, a data usada é a mais antiga (`ano`, depois `mês`). Mês ausente conta como anterior a qualquer mês desse ano. Sem evento, a sessão não ganha data inventada. O intervalo de um arco é o das suas sessões visíveis com data; uma sessão sem data não alarga esse intervalo.
