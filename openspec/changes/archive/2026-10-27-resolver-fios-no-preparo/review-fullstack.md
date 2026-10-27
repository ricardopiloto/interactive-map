# Review — Desenvolvedor Fullstack

**Change:** resolver-fios-no-preparo
**Data:** 2026-10-27
**Veredito geral:** Aprovado com ressalvas

## 1. Desenvolvimento do backend
Veredito: OK
- Sem mudança. `PATCH /admin/fios/{id}` aceita `estado` (`FioUpdate.estado: EstadoFio | None`), responde `FioRead` e recusa `estado` nulo (`FIO_CAMPO_INVALIDO`); o roteador inteiro usa `require_dono`. Limite de 30/min por rota.

## 2. Desenvolvimento do frontend
Veredito: Atenção
- **Implementável no ponto certo.** `SessionReadBlocks.tsx` já tem `result` com chave `slug:sessao:fiosRevision` e o `useEffect` que preenche `result`. A atualização local após o PATCH deve substituir a linha do fio em `result.rows` **somente se `result.key` ainda for a chave atual**, no mesmo padrão que descarta respostas tardias. Hoje `result` não é editável; a mudança é um `setResult(prev => prev?.key === key ? {...prev, rows: prev.rows.map(...)} : prev)` (descrição para o implementador, não código final). Sem isso, trocar de sessão com um PATCH em voo escreveria na sessão errada.
- **Estado por fio.** O estado «gravando» é por id (conjunto de ids em voo), não um único booleano, para não travar o bloco inteiro nem permitir dois cliques no mesmo fio. O aviso de erro do bloco hoje é `role="alert"` só para falha de carga (`readBlocks.threadsError`); a falha de gravação precisa de mensagem e estado próprios (não reutilizar o de carga, que esconde a lista).
- **Textos.** As chaves `fios.resolve` («Resolver») e `fios.reopen` («Reabrir») já existem em `sessoes.json`; reutilizá-las. Só falta a chave de erro ao gravar e o rótulo acessível com o título do fio (ex.: «Resolver fio: {{titulo}}»), em pt-BR e en.
- **Reordenação.** O bloco ordena por `Number(estado==="resolvido")` e `ordem`; após atualizar a linha, a mesma ordenação já recalcula a lista, sem código novo.
- **Teste existente a manter.** «mostra os blocos privados na ordem…» compara `listitem.textContent` com `stringContaining`; botões nos itens não quebram. O teste de `getAllByRole("listitem")` continua válido.
- **Mobile.** Botão com área de toque adequada (`min-h-11` como o resto) e sem rolagem horizontal; o texto longo do fio já usa `break-words`.

## 3. Deploy e operação
Veredito: OK
- Sem variável, migração, container ou script. Falha de rede aparece no aviso do bloco; a API registra o PATCH como as demais.

## 4. Qualidade de código
Veredito: Atenção
- tasks.md cobre o componente, os textos e os testes (resolver, reabrir, falha, desabilitado enquanto grava, bloco ausente para jogador). Acrescentar: (a) teste de resposta tardia — PATCH em voo, a sessão muda, a resposta não altera o bloco da nova sessão; (b) teste de que a falha deixa o estado anterior **e** a lista visível; (c) dois fios resolvidos em sequência (estado por id); (d) acessibilidade: o botão tem nome com o título do fio.
- Tarefa 1.2 deve dizer que as chaves `resolve`/`reopen` são reutilizadas e só o erro e o rótulo são novos.

## 5. Execução das decisões arquiteturais
Veredito: OK
- Segue o padrão existente (`fiosApi.update`, bloco por sessão, aviso `role="alert"`). Nada reaberto. A dependência de ordem com `pagina-fios-narrativos` (mesmo requisito) está registrada no proposal e no design.

## Bloqueantes antes de implementar
- nenhum

## Limitações técnicas a reportar ao Arquiteto
- nenhuma
