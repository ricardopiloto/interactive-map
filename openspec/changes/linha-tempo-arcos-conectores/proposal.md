# Proposal

## Why

O modo "Por arcos" da Linha do Tempo (capability `linha-tempo-por-arcos`, já arquivada) já agrupa sessões em colunas por arco e já abre uma coluna nova quando as datas de dois arcos se intercalam (`openspec/specs/linha-tempo-por-arcos/spec.md`, Requirement "Modo 'Por arcos' na Linha do Tempo"). Dois pontos ficam visualmente incompletos hoje:

1. Quando um arco termina e outro começa sem nenhum overlap de datas (arcos sequenciais), as sessões do segundo arco simplesmente aparecem logo acima das do primeiro na mesma coluna, sem nenhuma indicação visual de que ali existe um intervalo de tempo entre duas histórias diferentes, nem de quanto tempo é esse intervalo.
2. A spec já existente ("Ligação ao ponto mais próximo no tempo") descreve que uma coluna aberta por bifurcação deve se ligar à coluna de origem por uma curva contínua — mas essa curva, no código atual (`frontend-v2/src/components/codex/ArcTimeline.tsx`), só é desenhada quando existe uma sessão de transição marcada explicitamente pelo mestre (`arco_transicao_id`). Quando a bifurcação acontece só por overlap de datas (sem nenhuma sessão de transição marcada), a coluna nova fica sem nenhuma ligação visual à coluna de onde "nasceu" — o usuário vê uma coluna solta, sem entender de onde ela veio.

## What Changes

- Quando dois arcos são sequenciais (sem overlap de datas), a ligação visual entre a sessão mais antiga do arco mais novo e a sessão mais recente do arco mais antigo passa a ser uma linha **tracejada com gradiente de cor** (da cor do arco mais novo pra cor do arco mais antigo), rotulada com o tempo decorrido entre os dois arcos — sempre, independentemente de o intervalo ser curto ou longo (diferente do limiar de 12 meses já usado para o traço tracejado dentro de um mesmo arco, que continua existindo sem mudança).
- Quando uma coluna é aberta por overlap de datas (bifurcação), a ligação em curva até a coluna de origem (já descrita na spec existente, mas hoje só desenhada via sessão de transição explícita) passa a ser desenhada **automaticamente**, ancorada na sessão do arco de origem mais próxima no tempo da sessão que causou a bifurcação — sem exigir que o mestre marque uma sessão de transição. Quando há mais de um arco candidato a origem (overlap com vários arcos ao mesmo tempo), o sistema escolhe de forma determinística o par de sessões mais próximo no tempo entre si (ver `design.md`, Decision 1). A sessão de transição explícita continua existindo e tem precedência sobre a curva automática quando coexistem para o mesmo par de arcos, para o caso narrativo de "esta sessão encerra um arco e abre o outro" (que é uma decisão do mestre, não uma inferência de datas).
- Nenhuma mudança na regra de quando uma coluna nova é aberta (já especificada e implementada) — só na parte visual de como as colunas se conectam.
- Nenhuma mudança na ordem de exibição dos outros dois modos da Linha do Tempo (Cronológico, Por descoberta) — ambos continuam do mais antigo para o mais recente, como já validado na paridade com `frontend/`.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `linha-tempo-por-arcos`: os Requirements "Tempo decorrido entre sessões da mesma raia" e "Ligação ao ponto mais próximo no tempo" passam a cobrir também a ligação entre arcos sequenciais (tracejado com gradiente) e a ligação automática de bifurcação por overlap de datas (curva sem exigir sessão de transição).

## Impact

- **Frontend `frontend-v2/`**: `frontend-v2/src/lib/timelineLayout.ts` (precisa passar a calcular, além da coluna de cada linha, de qual coluna/arco uma coluna nova "nasceu" por overlap, e o ponto de encontro entre arcos sequenciais), `frontend-v2/src/components/codex/ArcTimeline.tsx` (desenhar a curva automática de bifurcação e a linha tracejada com gradiente de cor entre arcos sequenciais, usando `<linearGradient>` SVG).
- **Backend**: nenhuma mudança — datas de arco continuam 100% derivadas de Sessão→Evento em tempo de render, sem novo campo persistido.
- **Dados/migração**: nenhuma.
- **Descontinuação**: nenhuma.
