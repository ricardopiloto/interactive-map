# Design

## Context

Ver `proposal.md` para a motivação. Hoje `coletar_registros` em `motor_ia_arcos.py` monta um item de contexto para cada sessão da campanha, com o resumo já gravado e as linhas de local e personagem daquela sessão. `propor_arcos` só chama o provedor quando o contexto visível tem pelo menos duas sessões. `_sanear_uma` já descarta da lista de membros uma sessão com `arco_id`, e ainda aceita essa sessão se o modelo a devolver só como `sessao_transicao`.

## Goals / Non-Goals

**Goals:**

- O texto que o provedor resume contém só sessões com `arco_id` nulo e as associações dessas sessões.
- A contagem do mínimo de sessões usa esse mesmo recorte, depois do filtro de visibilidade já existente.
- O prompt padrão deixa explícito que os dados seguintes são só sessões sem arco.

**Non-Goals:**

- Não alterar `Sessao.resumo` gravado, o contrato HTTP de propor arcos, nem o fluxo de aceitar a proposta.
- Não remover a exceção de transição no saneamento. Se o modelo ainda citar o número de uma sessão ocupada como transição, a regra atual continua a valer. O modelo deixa de receber o texto dessa sessão.

## Decisions

1. **Filtrar na coleta, antes de montar o contexto.** Em `coletar_registros`, saltar a sessão quando `arco_id` não é nulo, e não emitir as linhas de local e personagem dessa sessão. `completar` recebe os mesmos `registros` que alimentam `montar_contexto`, então filtrar só depois da montagem deixaria a sessão ocupada na chamada. Alternativa rejeitada: pedir ao modelo para ignorar sessões ocupadas mantendo-as no prompt. O resumo continuaria a ser escrito com essa história.

2. **O mínimo de duas sessões não muda de número.** Depois do filtro, `propor_arcos` continua a contar itens `tipo == "sessao"` no contexto visível. Campanha com muitas sessões já encaixadas num arco e menos de duas livres responde `sessoes_insuficientes` e não chama o provedor.

3. **Uma frase no `PROMPT_PADRAO`, sem trocar o formato JSON.** Acrescentar que a lista abaixo traz apenas sessões que ainda não pertencem a um arco. As cinco regras já verificadas por `prompt_tem_regras_obrigatorias` permanecem. O teste das duas campanhas com o mesmo prompt continua válido porque o texto fixo não depende da campanha.

4. **Saneamento de saída fica como está.** A omissão é na entrada. O teste que devolve uma sessão ocupada como transição continua a descrever o saneamento; um teste novo confirma que o pedido ao provedor não contém o título nem o resumo dessa sessão.

## Risks / Trade-offs

- [O modelo deixa de ver a sessão ocupada e perde contexto para sugerir uma transição] → A exceção de transição no saneamento permanece, mas a sugestão deixa de ser informada por esse texto. É o recorte pedido: a IA não resume sessão que já tem arco.
- [Local ou personagem ligado só a uma sessão ocupada some do contexto] → Continua disponível se também estiver ligado a uma sessão sem arco, porque a linha é emitida a partir da sessão livre.

## Migration Plan

Sem migração. Rollback é reverter o filtro na coleta e a frase do prompt.

## Open Questions

Nenhuma.
