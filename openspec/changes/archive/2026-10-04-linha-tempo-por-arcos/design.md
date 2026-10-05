# Design

## Context

Levantamento técnico completo em `docs/v2/tr-timeline-arcos-descoberta.md`. Hoje `Arco` (`backend/app/models/arco.py`) só relaciona `Local`: `id, titulo, resumo, ordem, visivel_para_todos, locais`. Não há campo `cor` nem vínculo com `Sessao`/`Evento`. `ArcoCreate`/`ArcoUpdate`/`ArcoRead` espelham o model 1:1; o CRUD em produção (`ArcoAdminList.tsx`/`ArcoFormDialog.tsx`) só edita título/resumo/ordem/visibilidade. O padrão equivalente já existe e está comprovado em `Local.arco_id`/`Local.cor_pin` — este design reaproveita exatamente esse padrão para `Sessao` em vez de inventar um novo. Ver proposal.md - Why/What Changes para motivação e escopo funcional.

## Goals / Non-Goals

**Goals:**
- Adicionar a `Arco` o mínimo de schema necessário (cor + vínculo com sessão) para sustentar o modo "Por arcos" descrito na spec.
- Reaproveitar, sem adaptação estrutural, os padrões já validados do produto: FK opcional (`Local.arco_id`), color picker (`Local.cor_pin`), chips de filtro (Relações), posicionamento calculado em `<div>`s absolutos (`GraphStage.tsx`/`graphLayout.ts`), e o flag de módulo em `Campanha.modulos_ativos` (já usado para "fadiga") para o gancho de IA.

**Non-Goals:**
- Desenhar ou implementar o motor de IA que analisa sessões e propõe arcos — está fora de escopo tanto do BKLG-039/PRD quanto deste design; esta mudança só entrega o gancho (flag + toggle + estado desabilitado).
- Alterar o modo cronológico existente (`Evento`/`LinhaTempoPage.tsx`) ou seu schema.
- Resolver fragmentação de texto livre em outros campos fora do escopo desta capability (não aplicável aqui — ver a capability `linha-tempo-por-descoberta` para o caso de `Personagem.faccao`).

## Decisions

- **Uma sessão pertence a no máximo um arco via `Sessao.arco_id` opcional (FK simples), não uma tabela de vínculo N:N.** Alternativa considerada: tabela de vínculo N:N (permitiria uma sessão em múltiplos arcos simultâneos). Rejeitada porque o TR já havia identificado essa pergunta como decisão de produto em aberto, e o `Input` da spec 153 original já a resolveu explicitamente: "cada sessão pertence a um arco, com a excessão de uma sessão que pode fechar um arco e iniciar o seguinte" — ou seja, no máximo um arco por sessão, com uma exceção pontual (sessão de transição), não N arcos arbitrários. FK simples espelha exatamente `Local.arco_id`, já em produção.
- **A sessão de transição é modelada como um caso especial sobre a mesma FK (ex.: `Sessao.arco_transicao_id` opcional, ou um flag + segundo FK), não como uma segunda linha de vínculo.** Isto evita duplicar o registo de sessão nos dados da crónica (requisito explícito: "A exceção não duplica nem cria outra sessão"). A forma exata do campo (segundo FK nulo vs. tabela de exceção de 1 linha por sessão de transição) fica para o `tasks.md`/implementação, guiada por este princípio: a raia "ganha" a sessão de transição via leitura, nunca via escrita duplicada.
- **Cor de arco usa o mesmo formato já usado em `Local.cor_pin`** (string hex), evitando introduzir um segundo formato de cor no produto. Cor inválida ou ausente cai para uma cor padrão legível (requisito da spec), tratado na camada de apresentação, não no schema.
- **Layout de raias verticais por arco é componente novo, não reaproveita o `<ol>` do modo cronológico.** Reaproveita a classe de técnica já validada em `GraphStage.tsx` (posicionamento calculado em `<div>`s absolutos dentro de um container com coordenadas conhecidas), mas os cálculos de posição-por-data-real e de raia-por-arco são específicos deste modo. Atenção: o protótipo navegável (BKLG-039) já expôs um bug de coordenadas nesse tipo de layout — pontos posicionados num sistema de coordenadas aninhado diferente do das linhas de raia ficam visualmente desconectados; a implementação deve derivar a posição dos pontos e das linhas de raia a partir da mesma origem de coordenadas (mesmo padrão usado na correção do protótipo).
- **Gancho de IA reaproveita `Campanha.modulos_ativos` (JSON existente)** com um novo valor possível (ex. `"ia_arcos"`), em vez de um campo booleano novo — mesmo mecanismo já usado para o módulo "fadiga" em campanhas WFRP. Sem migração de schema adicional para este ponto.
- **O opt-in do próprio modo "Por arcos" reaproveita o mesmo mecanismo de `Campanha.modulos_ativos`, com um segundo valor independente (ex. `"linha_tempo_arcos"`), não o mesmo valor do gancho de IA.** São duas decisões independentes do mestre: habilitar o modo de visualização "Por arcos" é uma coisa; habilitar a IA para criar arcos é outra (uma campanha pode querer o modo sem a IA). Alternativa considerada: um único flag cobrindo os dois. Rejeitada porque misturaria uma decisão de UI (quero essa visualização?) com uma decisão de uso de IA/custo (quero que sessões sejam enviadas a um provedor externo?) — a segunda já tem motivo próprio documentado em `backend-ia-deepseek`.
- **A tela de configuração onde o mestre habilita o modo reaproveita o padrão de toggle já em produção em `PainelPage.tsx`** (`set_visibilidade`/`set_unidade_distancia` em `backend/app/services/campanha_admin.py`, cada um com seu próprio endpoint e botão de toggle no painel da campanha) — não é uma tela nova do zero, é mais um toggle nesse mesmo padrão já validado. Alternativa considerada: uma tela de "configurações avançadas"/"módulos" dedicada e separada. Não descartada, mas não é necessária só para este opt-in — pode ser revisitada se o número de módulos opcionais crescer o suficiente para justificar agrupá-los numa tela própria; essa decisão de agrupamento fica para o `tasks.md` da implementação, sem impacto no comportamento observável já especificado.

## Risks / Trade-offs

- **N raias de arco sem limite numa campanha longa pode deixar a tela ilegível** → mitigado pelos chips de filtro (mesmo padrão já usado no filtro de tipo de vínculo em Relações); não há teto artificial de seleção por decisão de produto já tomada na spec, mas a UI deve suportar bem o caso de muitos arcos (ex. scroll horizontal entre raias).
- **Ambiguidade residual sobre a representação exata da sessão de transição no schema** → não bloqueia a spec (o comportamento observável já está definido: aparece nas duas raias, sem duplicar), mas exige uma decisão de modelagem concreta no `tasks.md` antes da migração.
- **Risco de regressão no modo cronológico ao estender `Arco`/`Sessao`** → mitigado por FK opcional (não quebra sessões/arcos existentes sem associação) e por não haver alteração nos modelos `Evento`/`LinhaTempoPage.tsx`.
- **Reexecução do bug de coordenadas já visto no protótipo** (pontos desconectados das linhas de raia) → mitigado explicitamente na decisão de layout acima; vale um teste manual dedicado no quickstart para confirmar alinhamento visual entre pontos e raias em diferentes contagens de sessões/arcos.

## Migration Plan

1. Migração de schema: `Arco.cor` (coluna nova, nullable) e `Sessao.arco_id` + representação da sessão de transição (coluna(s) nova(s), nullable) — não exige alteração em dados existentes, todas as colunas novas são opcionais.
2. Novo valor em `Campanha.modulos_ativos` não exige migração de schema (campo JSON já existe); apenas documentação do valor aceito.
3. Rollback: como todas as colunas novas são opcionais e não há alteração em colunas existentes, a reversão é uma migração reversa padrão (remover as colunas), sem necessidade de script de backfill ou de coordenação com dados legados.
