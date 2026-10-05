# Proposal

## Why

Na criação de arco por IA, o motor ainda envia ao provedor todas as sessões da campanha, inclusive as que já pertencem a um arco. O resumo da proposta acaba tratando história que já foi agrupada. A IA deve resumir e propor arcos só a partir das sessões que ainda não têm arco.

## What Changes

- O contexto enviado ao provedor na proposta de arco inclui apenas sessões sem arco associado, com os locais e personagens ligados a essas sessões.
- Sessões que já têm arco deixam de entrar no texto que a IA resume. O resumo de cada proposta passa a ser gerado só com esse recorte.
- A contagem de "sessões suficientes" usa só as sessões sem arco que de fato seguem para o provedor. Se restarem menos do que o mínimo, o motor informa a limitação e não chama o provedor.
- A regra já existente de não sugerir uma sessão ocupada como membro de outro arco, salvo a exceção explícita de transição, permanece. Esta change não reescreve o resumo gravado da sessão nem persiste a proposta sozinha.

## Capabilities

### New Capabilities

- Nenhuma.

### Modified Capabilities

- `motor-ia-arcos`: a proposta de arco passa a analisar e resumir apenas sessões sem arco associado; o prompt e o contexto da campanha deixam de tratar sessões que já pertencem a um arco.

## Impact

- `backend/app/services/motor_ia_arcos.py`: filtro em `coletar_registros` (ou equivalente) e, se necessário, uma frase no prompt padrão dizendo que os dados abaixo são só sessões sem arco.
- `backend/tests/test_motor_ia_arcos.py`: o contexto deixa de conter a sessão ocupada; o mínimo de sessões ignora as que já têm arco.
- Sem mudança de API, esquema ou interface. O fluxo de revisão e gravação manual do arco continua o mesmo.
