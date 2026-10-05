# Design

## Context

Esta capability fecha a lacuna identificada ao validar `linha-tempo-por-arcos`: o Requirement "Escolha entre criação manual ou por IA de um arco" só define o caminho manual e o caminho "IA sem módulo habilitado" — nunca o que acontece quando o mestre escolhe IA **com** o módulo habilitado. `backend-ia-deepseek` já resolve toda a infraestrutura genérica (checagem de módulo, isolamento por campanha, exclusão de dados ocultos, autorização de mestre, tratamento de falha do provedor) — este motor é a primeira lógica de negócio real a consumi-la. Ver proposal.md - Why/What Changes.

Dado real relevante (de `docs/v2/tr-timeline-arcos-descoberta.md`): o contexto que alimenta a proposta vem de `Sessao.resumo` (texto já preenchido pelo mestre) mais as associações já existentes em `SessaoNpcLink`/`SessaoLocalLink` — nenhum dado novo precisa ser criado só para a IA ter contexto.

## Goals / Non-Goals

**Goals:**
- Preencher exatamente a lacuna deixada por `linha-tempo-por-arcos` (proposta de arco quando IA está habilitada), sem reabrir ou duplicar nenhum requisito já definido ali ou em `backend-ia-deepseek`.
- Garantir que uma proposta de IA nunca vira dado persistido sem revisão do mestre, e nunca referencia uma sessão/local que não existe.

**Non-Goals:**
- Reimplementar qualquer regra já coberta por `backend-ia-deepseek` (isolamento, privacidade, autorização, configuração de credencial) — este motor as consome, não as redefine.
- Alterar o schema ou a UI de gestão de arco já especificados em `linha-tempo-por-arcos` — a proposta entra pelo mesmo formulário/fluxo de criação manual já existente, só pré-preenchido.
- Aprendizado contínuo, ajuste fino ou histórico de propostas anteriores — cada proposta é gerada do zero a partir do estado atual das sessões, sem memória entre chamadas.

## Decisions

- **A proposta é um objeto transitório em memória/resposta de API, nunca uma linha em `Arco` ou tabela própria.** Alternativa considerada: persistir a proposta como um `Arco` com um estado "rascunho" (ex. `status=proposto`). Rejeitada porque introduziria um estado novo no schema de `Arco` só pra um caso de uso de revisão, quando o mesmo resultado (mestre edita antes de salvar) é alcançado reaproveitando o formulário manual já existente sem tocar no schema de `Arco` definido em `linha-tempo-por-arcos`.
- **Validação de "a sessão/local existe de fato" acontece depois da resposta do provedor, antes de qualquer apresentação ao mestre** — o motor cruza cada referência da proposta com os registos reais da campanha e descarta o que não existir. Alternativa considerada: confiar na resposta da IA e deixar a validação para o momento de salvar (mesma validação do formulário manual). Rejeitada porque apresentar ao mestre uma proposta com uma sessão inexistente antes mesmo da tentativa de salvar seria uma experiência confusa (o mestre revisaria algo que nunca poderia ser salvo) e dificultaria distinguir "a IA alucinou" de "o mestre editou errado".
- **O motor não implementa paginação/histórico de propostas — cada solicitação do mestre gera uma análise nova.** Simplicidade deliberada: sem armazenamento de propostas anteriores, não há necessidade de lidar com propostas desatualizadas depois que novas sessões são adicionadas.
- **Falha do motor reaproveita o mesmo estado de falha explícito já definido em `backend-ia-deepseek`** (não inventa um segundo formato de erro) — o motor só traduz esse estado para a mensagem específica "não foi possível gerar proposta, use a criação manual".
- **Todo chamada ao provedor usa um prompt padrão fixo, versionado no código, enviado antes do contexto específico da campanha** — não é gerado dinamicamente nem editável pelo mestre. Alternativa considerada: montar o prompt de instrução dinamicamente a cada chamada (ex. interpolando regras condicionais). Rejeitada por agora — um prompt fixo é mais simples de revisar, testar e versionar, e todas as regras de negócio relevantes (não inventar dados, respeitar uma sessão por arco, formato de saída) já são fixas na spec, não variam por campanha. O prompt padrão:

  ```
  Você é um assistente que ajuda mestres de RPG de mesa a identificar arcos
  narrativos dentro de uma campanha.

  Sua tarefa: ler os resumos de sessão fornecidos a seguir (com os locais e
  personagens associados a cada uma) e propor um ou mais arcos narrativos
  candidatos — agrupamentos de sessões que formam um fio de história coerente.

  Regras obrigatórias:
  1. Use apenas as sessões, locais e personagens fornecidos nos dados abaixo.
     Nunca invente ou presuma uma sessão, local, personagem ou evento que não
     esteja explicitamente na lista fornecida.
  2. Cada sessão pertence a no máximo um arco proposto, exceto quando você
     identificar uma sessão de transição (encerra um arco e inicia o
     seguinte) — nesse caso, identifique-a explicitamente como transição.
  3. Se não houver sinal narrativo suficiente para propor um arco coerente,
     responda com uma lista vazia em vez de forçar um agrupamento artificial.
  4. Para cada arco proposto, retorne: título curto, resumo de 1 a 3 frases,
     a lista de números de sessão incluídos, e os locais sugeridos (apenas
     entre os fornecidos).
  5. Responda apenas no formato estruturado solicitado, sem texto
     explicativo fora dessa estrutura.

  Os dados da campanha (sessões, resumos e associações) seguem abaixo.
  ```

  Este texto é o ponto de partida; o formato estruturado exato de saída (ex. esquema JSON) e o texto final enviado em produção ficam fechados no `tasks.md`, mas as 5 regras acima são normativas e não devem ser removidas nem contradizidas por uma implementação futura, já que sustentam diretamente os Requirements "Proposta referencia apenas dados reais da campanha" e "Proposta respeita a regra de uma sessão por arco".

## Risks / Trade-offs

- **Alucinação da IA (sessão/local inventado, ou associação que não reflete o texto real das sessões)** → mitigado pela validação de existência real (Decisions) para o caso "entidade inexistente"; para o caso "associação existe mas não faz sentido narrativo", a mitigação é de produto, não técnica: a proposta é sempre revisável e editável antes de salvar, nunca uma verdade assumida.
- **Custo e latência de analisar todas as sessões da campanha a cada solicitação** → aceito nesta fase (ver Non-Goals de `backend-ia-deepseek` sobre controle de custo); se o volume de sessões crescer muito, uma change futura pode introduzir paginação/resumo incremental sem mudar o contrato desta spec (o comportamento observável — propor arcos a partir das sessões — continua o mesmo).
- **Mestre pode não entender por que uma sessão esperada não apareceu na proposta** (ex. porque já pertence a outro arco) → mitigado pelo Requirement "Proposta respeita a regra de uma sessão por arco", que torna esse comportamento uma regra documentada, não um efeito colateral silencioso.

## Migration Plan

Nenhuma migração de schema — esta capability não introduz entidade, coluna ou tabela própria; consome exclusivamente o que já existe (`Sessao`, `SessaoNpcLink`, `SessaoLocalLink`) e o que já foi especificado em `linha-tempo-por-arcos` (`Arco.cor`, `Sessao.arco_id`) e `backend-ia-deepseek` (infraestrutura de IA). Rollback: remover a lógica de serviço do motor e o estado de UI associado; nenhum dado persistido depende dela, já que propostas nunca são persistidas automaticamente.
