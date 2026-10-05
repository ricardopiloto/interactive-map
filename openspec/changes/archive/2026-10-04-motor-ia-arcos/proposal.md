# Proposal

## Why

O gancho de criação de arco por IA já especificado em [`linha-tempo-por-arcos`](../linha-tempo-por-arcos/specs/linha-tempo-por-arcos/spec.md) (Requirement "Escolha entre criação manual ou por IA de um arco") cobre apenas duas situações: o mestre escolhe manual (sempre disponível), ou escolhe IA sem o módulo habilitado (produto explica e oferece alternativa). **Não existe, em nenhuma spec, o que acontece quando o mestre escolhe IA e o módulo ESTÁ habilitado** — essa é exatamente a lacuna que este motor preenche: ler as sessões da campanha e propor um ou mais arcos para o mestre revisar. A infraestrutura de chamada ao provedor (DeepSeek) já foi especificada separadamente em [`backend-ia-deepseek`](../backend-ia-deepseek/proposal.md); esta proposta é a lógica de negócio que a consome.

## What Changes

- Quando o mestre escolhe criação de arco por IA numa campanha com o módulo habilitado, o sistema analisa as sessões (visíveis ao mestre) da campanha e propõe um ou mais arcos candidatos (título, resumo, sessões e locais sugeridos).
- A proposta da IA **nunca é persistida automaticamente como um `Arco` real** — ela é apresentada ao mestre como rascunho editável, usando o mesmo fluxo de criação/validação manual já especificado em `linha-tempo-por-arcos`; o mestre pode aceitar, editar ou descartar antes de salvar.
- Se o motor falhar (provedor indisponível, resposta inutilizável) ou não tiver sessões suficientes para propor algo, o sistema informa o mestre e oferece a criação manual — nunca um estado quebrado ou silencioso.
- O motor consome exclusivamente a infraestrutura já especificada em `backend-ia-deepseek` (checagem de módulo, isolamento por campanha, exclusão de dados ocultos, autorização de mestre) — não reimplementa nenhuma dessas regras.

## Capabilities

### New Capabilities
- `motor-ia-arcos`: lógica de negócio que lê as sessões de uma campanha e propõe arcos candidatos para revisão do mestre, preenchendo a lacuna deixada em aberto por `linha-tempo-por-arcos` (escolha de IA com módulo habilitado).

### Modified Capabilities
(nenhuma.) `linha-tempo-por-arcos` e `backend-ia-deepseek` não precisam de delta: o requisito de `linha-tempo-por-arcos` sobre a escolha manual/IA já está correto como está — ele descreve o caminho manual e o caminho "IA sem módulo habilitado", e permanece verdadeiro depois desta proposta; só não cobria (nem precisa cobrir ali) o caminho "IA com módulo habilitado", que é o que esta capability nova adiciona. `backend-ia-deepseek` já é infraestrutura genérica reutilizável por desenho — nenhum dos seus Requirements muda pra ter um primeiro consumidor real. As duas são **dependências** desta capability nova, não specs alteradas por ela.

## Impact

- **Backend**: nova lógica de serviço que monta o contexto a partir de `Sessao`/`SessaoNpcLink`/`SessaoLocalLink` (mesmas tabelas já identificadas em `docs/v2/tr-timeline-arcos-descoberta.md`), chama `ia-provider` (de `backend-ia-deepseek`) e devolve candidatos a arco; nenhuma escrita direta em `Arco` — a persistência continua passando pelo endpoint de criação/edição de arco já especificado em `linha-tempo-por-arcos`.
- **Frontend**: a tela de criação de arco (toggle Manual/IA já especificado em `linha-tempo-por-arcos`) ganha o estado "IA habilitada, aguardando/apresentando proposta", que pré-preenche o mesmo formulário manual em vez de abrir uma tela nova.
- **Sem migração de schema nova** além das já previstas em `linha-tempo-por-arcos` (`Arco.cor`, `Sessao.arco_id`) e `backend-ia-deepseek` (nenhuma) — este motor não introduz entidade nem coluna própria.
- Detalhes de decisão técnica (como o contexto é montado, o que acontece no aceite/descarte da proposta) em [`design.md`](design.md).
