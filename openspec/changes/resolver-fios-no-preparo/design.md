## Context

`SessionReadBlocks.tsx` consulta `GET /admin/fios?sessao_origem_id=<sessão>` ao montar (e quando `fiosRevision` muda) e mostra os fios (abertos antes dos resolvidos) como lista somente leitura, com o estado em texto. `fiosApi.update(slug, id, { estado })` (`PATCH /admin/fios/{id}`) já existe e é o mesmo usado pela lista de fios.

## Goals / Non-Goals

**Goals:** resolver e reabrir os fios da sessão no próprio bloco, sem trocar de tela.
**Non-Goals:** mostrar fios de outras sessões no bloco, editar título/descrição, reordenar ou remover pelo bloco (continuam na página «Fios»); mudar API ou regras.

## Decisions

1. **Ação no bloco «Fios Narrativos», não duplicada no bloco de Notas.** O bloco de fios já lista exatamente os fios criados na sessão e fica abaixo das Notas de Preparo; acrescentar a ação ali evita duas listas iguais. *Alternativa rejeitada:* renderizar os fios dentro do bloco de Notas (duplicação e mais ruído visual).
2. **Botão por fio** («Resolver» para em aberto, «Reabrir» para resolvido; reutiliza as chaves `fios.resolve`/`fios.reopen` já existentes em `sessoes.json`), com nome acessível que inclui o título do fio, `aria-busy`/desabilitado enquanto grava. Ao concluir, o estado do fio no bloco é atualizado pela resposta do PATCH (sem recarregar a página); a ordem (abertos antes dos resolvidos) é recalculada pela mesma ordenação já usada. O estado «gravando» é **por id de fio** (conjunto de ids em voo), não um booleano do bloco, e a resposta do PATCH só atualiza `result.rows` se `result.key` (sessão e revisão) ainda for a chave atual, como o bloco já faz para respostas tardias: trocar de sessão com um PATCH em voo não pode escrever na sessão nova.
3. **Falha.** Em erro, o fio mantém o estado anterior e o bloco mostra um aviso próprio de gravação (`role="alert"`, mensagem diferente da de falha de carga, sem esconder a lista); não há estado otimista que precise de rollback. A rota tem limite de 30 pedidos por minuto: uma rajada de cliques pode esbarrar nele e cai nesse mesmo aviso.
4. **Efeito na IA.** Resolver um fio o retira dos «fios em aberto» que alimentam o próximo rascunho da IA (regra já existente em `fios-narrativos`); a ação tem, portanto, efeito além da tela.
5. **Coerência com a página «Fios».** A página consulta os fios ao montar, então mostra o novo estado ao abrir; não há sincronização em tempo real entre as duas páginas.
6. **Permissão.** O bloco já só existe para o mestre dono com o Modo GM ligado; a API exige `require_dono`.

## Risks / Trade-offs

- A lista do bloco muda de ordem ao resolver (o fio resolvido desce): pode surpreender; aceito e coerente com a regra «abertos antes dos resolvidos».
- Duas mudanças pendentes tocam o requisito «Fios da sessão no bloco de Fios Narrativos»: arquivar `pagina-fios-narrativos` antes desta.

## Migration Plan

Deploy único do frontend; sem migração. Rollback: reverter o código.

## Open Questions

- Se o mestre preferir a ação dentro do próprio bloco de Notas de Preparo (em vez do bloco de Fios), mover a lista; a lógica e os testes são os mesmos.
