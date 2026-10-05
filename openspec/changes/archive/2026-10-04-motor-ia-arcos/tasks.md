# Tasks

## 1. Montagem de contexto a partir das sessões

- [x] 1.1 Implementar a coleta do contexto de uma campanha a partir de `Sessao.resumo` + `SessaoNpcLink`/`SessaoLocalLink`, reaproveitando as mesmas tabelas já identificadas no TR; verificar com um teste confirmando que o contexto montado reflete exatamente as sessões/associações de uma campanha de exemplo
- [x] 1.2 Garantir que a montagem do contexto delega a exclusão de dados ocultos e o isolamento por campanha à infraestrutura de `backend-ia-deepseek` (não duplica essa lógica aqui); verificar com um teste confirmando que uma sessão oculta não chega a fazer parte do contexto montado para o motor

## 2. Chamada ao motor e geração da proposta

- [x] 2.0 Definir o prompt padrão de contexto (ver design.md - Decisions) como constante versionada no código, incluindo o formato estruturado exato de saída esperado da IA; verificar com um teste confirmando que a constante contém as 5 regras obrigatórias descritas em design.md
- [x] 2.1 Implementar a chamada ao provedor de IA (via `ia-provider` de `backend-ia-deepseek`) incluindo o prompt padrão (tarefa 2.0) antes do contexto montado, solicitando uma ou mais propostas de arco (título, resumo, sessões/locais sugeridos); verificar com um teste que mocka a resposta do provedor e confirma que o prompt padrão está presente na chamada, antes dos dados específicos da campanha
- [x] 2.2 Implementar a validação pós-resposta que descarta qualquer sessão/local referenciado pela IA que não exista na campanha; verificar com um teste injetando uma resposta mockada com uma referência inexistente e confirmando sua ausência na proposta final
- [x] 2.3 Implementar a verificação de que nenhuma sessão já associada a outro arco aparece numa proposta como pertencente a um arco diferente, exceto como sessão de transição explícita; verificar com um teste cobrindo esse cenário
- [x] 2.4 Implementar o caso de sessões insuficientes (nenhuma proposta útil possível), retornando um estado explícito em vez de uma proposta vazia; verificar com um teste numa campanha sem sessões ou com poucas sessões
- [x] 2.5 Tratar o estado de falha do provedor (propagado por `backend-ia-deepseek`) traduzindo para a mensagem específica deste fluxo; verificar com um teste simulando a falha do provedor e confirmando a mensagem ao mestre

## 3. Revisão e confirmação da proposta (frontend)

- [x] 3.1 Implementar a apresentação da(s) proposta(s) ao mestre, pré-preenchendo o mesmo formulário de criação manual de arco já especificado em `linha-tempo-por-arcos` (sem criar uma tela nova e separada); verificar manualmente no browser que os campos vêm preenchidos a partir da proposta
- [x] 3.2 Garantir que o mestre pode editar qualquer campo pré-preenchido antes de confirmar, e que confirmar segue exatamente a mesma validação da criação manual; verificar manualmente editando um campo da proposta antes de salvar
- [x] 3.3 Implementar o descarte da proposta sem persistir nada; verificar manualmente descartando uma proposta e confirmando que nenhum arco foi criado
- [x] 3.4 Implementar os estados de "sessões insuficientes" e "falha do provedor" na UI, sempre oferecendo o caminho de criação manual; verificar manualmente forçando os dois estados (ex. campanha nova sem sessões; backend com credencial inválida)

## 4. Internacionalização

- [x] 4.1 Adicionar todas as strings novas (apresentação da proposta, estados de erro/insuficiência) em pt-BR e en; verificar alternando o idioma da interface e confirmando ausência de chaves não traduzidas

## 5. Testes de integração

- [x] 5.1 Escrever um teste de integração ponta a ponta (provedor mockado) cobrindo: módulo habilitado → contexto montado sem dados ocultos → proposta validada contra dados reais → aceite pelo mestre → arco criado pelo mesmo caminho da criação manual; verificar que o teste passa
- [x] 5.2 Escrever um teste de integração cobrindo o caminho de falha (provedor indisponível) ponta a ponta, confirmando que o mestre recebe o caminho manual como alternativa; verificar que o teste passa
