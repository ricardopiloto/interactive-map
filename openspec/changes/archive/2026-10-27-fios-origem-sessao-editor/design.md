## Context

`FiosReview` (editor de sessão) grava os fios aceitos com `sessao_origem_id` igual à sessão correspondente ao `sessao_numero` citado pela IA (`sessoes.find(...)`), ou `null` quando a IA não cita nenhuma (caso dos fios da sessão 29 de teste). O bloco «Fios Narrativos» da leitura consulta `GET /fios?sessao_origem_id=<sessão>`. O prompt de `resumo_sessao` termina com «Termine com o estado do grupo e fios abertos», mas o contexto do Resumo não tem fios.

## Goals / Non-Goals

**Goals:** o bloco da sessão mostrar os fios aceitos a partir do seu editor; o Resumo não inventar fios abertos.
**Non-Goals:** mudar a regra do bloco, criar vínculo sessão↔fio novo (tabela), retroagir fios existentes, enviar fios ao Resumo (opção descartada pelo produto).

## Decisions

1. **Origem = sessão do editor.** Em `FiosReview.add`, `sessao_origem_id = sessaoId ?? sessão citada pela IA ?? null`, nesta ordem (editor sem sessão salva cai na sessão citada e, sem ela, em `null`). O `sessaoId` já é recebido pelo componente (`draft.id`). *Alternativa:* guardar a sessão citada pela IA em outro campo; rejeitada, sem consumidor e exigiria migração.
2. **Prompt do Resumo.** Trocar o final por «Termine com o estado do grupo.» sem mencionar fios. O restante do prompt (só fatos, não copiar combates) não muda. *Alternativa rejeitada pelo produto:* enviar os fios em aberto ao Resumo para listá-los corretamente; o Resumo é texto público da sessão e os fios são privados do mestre, então eles ficam só no bloco e na lista.

## Risks / Trade-offs

- A sessão citada pela IA deixa de ser gravada quando há sessão salva (informação de origem narrativa perdida; nos dados de teste ela já vinha vazia). Aceito: o significado passa a ser «criado nesta sessão», que é o que o bloco mostra.
- Fios existentes não mudam; os criados antes continuam fora do bloco da sessão.

## Migration Plan

Deploy único; sem migração. Rollback: reverter o código.

## Open Questions

- Fios criados à mão na lista da página continuam sem sessão de origem e nunca aparecem no bloco de uma sessão; follow-up em change própria: escolher a sessão ao criar o fio.
