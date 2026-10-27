# Review — Arquiteto de Soluções

**Change:** separacao-visual-sessoes
**Data:** 2026-10-26
**Veredito geral:** Aprovado com ressalvas (nenhum bloqueante; 3 ajustes recomendados antes de implementar)

Base: leitura dos 4 artefatos, de `routes/sessoes.tsx`, `auth/EditModeContext.tsx`, `api/sessoes.ts`, `components/codex/FiosList.tsx`, `routers/admin/fios.py`, `models/fio_narrativo.py`, `routers/public/sessoes.py`, `schemas/sessao.py`, `tests/test_sessoes_visibility.py`, `deps/auth.py` e dos specs principais `sessao-notas-preparo` e `fios-narrativos`. Não há documento de arquitetura dedicado em `docs/`; o `design.md` das changes é o ADR do projeto.

## 1. Definição da arquitetura técnica
Veredito: OK
- Stack coerente e sem tecnologia nova: um componente de apresentação no `frontend-v2` e um parâmetro de filtro opcional no router de fios. Escopo proporcional ao problema. OK.
- Carga irrelevante (uma consulta leve por sessão lida, só para o dono em Modo GM); a change não precisa declarar escala. OK.
- **O mecanismo de privacidade real é mais forte que o descrito.** `sessoes.tsx` busca `admin/sessoes` apenas quando `enabled` (Modo GM) e `sessoes` público nos demais casos (`api/sessoes.ts:86-88`), e `SessaoPublic` não tem `notas_preparo`. Ou seja, para jogador, visitante e Modo GM desligado as notas nem chegam ao navegador. A Decisão 5 fala em "o componente não monta os blocos"; o ADR deveria registrar que a barreira primária é o endpoint escolhido e que o componente é a segunda camada. — Ajustar o texto da Decisão 5 e manter o teste de regressão da task 1.2.

## 2. Integração com a infraestrutura existente
Veredito: Atenção (1 achado)
- Sem migração, processo, porta ou variável nova; deploy conjunto; o filtro é opcional e retrocompatível. OK.
- `FioNarrativo.sessao_origem_id` já tem `index=True`, então o filtro novo é barato. OK.
- **Rate limit.** `GET /fios` tem `30/minute` (`routers/admin/fios.py`). Cada troca de sessão na leitura dispara uma consulta, além da carga da `FiosList`; um mestre percorrendo sessões rapidamente pode receber 429 e ver o bloco em erro. — Aceitar explicitamente no design (o erro fica contido no bloco, como previsto) ou carregar os fios da sessão só após uma pequena pausa na seleção; registrar a escolha em "Risks".
- `docs/api-contracts.md` não contém nenhuma rota `admin/fios` (defasado desde a change anterior). Não é bloqueio nem responsabilidade desta change; só não prometer atualizá-lo nas tasks, ou tratar numa limpeza separada.

## 3. Qualidade de arquitetura e trade-offs
Veredito: Atenção (2 achados)
- Segurança: nenhuma regra de visibilidade muda; fios seguem só em rotas `admin` com `require_dono`; `SessaoPublic` não ganha campos. O teste de regressão proposto (task 1.2) cobre lista e detalhe e o de DOM do jogador cobre a apresentação. OK.
- **Inconsistência com a `FiosList` da página.** `sessoes.tsx:337` renderiza `{isDono && <FiosList/>}` sem exigir `enabled`. O cenário "Modo GM desligado → leitura igual à de um jogador" é verdadeiro para o painel da sessão, mas o dono ainda vê a seção "Fios em aberto" na mesma página com o Modo GM desligado. Quem projeta a tela para a mesa com o Modo GM desligado continua expondo os fios. — Delimitar o requirement ao painel de leitura da sessão e decidir de forma explícita: registrar como não-objetivo (comportamento já entregue na `fios-narrativos-lista`) ou incluir uma task para condicionar a `FiosList` a `enabled`. Isso é decisão de produto, não técnica; recomendo a segunda opção por coerência com o objetivo da change.
- **Duas fontes do mesmo dado.** O bloco da sessão e a `FiosList` carregam fios por conta própria. Resolver ou remover um fio na lista deixa o bloco desatualizado até trocar de sessão (já existe `fiosRevision` no pai, mas só é incrementado ao aceitar propostas). — Fazer a `FiosList` notificar o pai a cada mutação e usar o mesmo contador como chave de recarga do bloco; acrescentar o caso ao teste 2.6.
- Performance: sem gargalo previsível. Descartar resposta tardia por id de sessão está previsto. OK.
- Manutenibilidade: um componente e um parâmetro; simples. OK.

## 4. Documentação e decisões (ADRs)
Veredito: OK
- `design.md` traz as alternativas rejeitadas (abas, rótulo também para jogadores, filtro no cliente), riscos, plano de rollback e questões em aberto, no padrão das changes anteriores. OK.
- Diagrama: não exigido (leitura linear: página → componente → API).
- Observação: a lista "Open Questions" (descrição do fio no bloco, tooltip do selo) é boa; o ponto de partida proposto (título e descrição recolhida em telas estreitas) é razoável.

## 5. Ponte entre produto e técnico
Veredito: OK
- Os pedidos do usuário (três blocos rotulados para o mestre, jogador vê só o Resumo, Resumo sem fios nem notas, fios da própria sessão com link para a lista) estão traduzidos em requirements e tasks testáveis.
- Registrar no `design.md` a decisão de produto sobre o escopo dos fios no bloco: o usuário pediu "fios narrativos" e a escolha confirmada foi mostrar os criados na sessão (em qualquer estado), e não só os em aberto; está no spec, falta só uma linha de justificativa no design.
- "Editor que não é dono" é tratado como cenário, mas o código só distingue `papel == "dono"` em `deps/auth.py` e o `canEdit` vem de qualquer sessão administrativa; confirmar na implementação que o cenário é alcançável (se não for, vira apenas teste de unidade do componente).

## Bloqueantes antes de implementar
- Nenhum.

## Ajustes recomendados antes de implementar
1. Registrar na Decisão 5 que a barreira primária de privacidade é a escolha do endpoint (admin só em Modo GM) e que o componente é a segunda camada.
2. Decidir o escopo do "Modo GM desligado" frente à `FiosList` da página (delimitar o requirement ao painel da sessão e escolher entre não-objetivo ou nova task).
3. Sincronizar bloco e `FiosList` após mutações (contador de revisão compartilhado) e registrar o risco de 429 do `GET /fios` (30/minuto) nos riscos do design.
