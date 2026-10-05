# Design

## Context

Levantamento técnico completo em `docs/v2/tr-timeline-arcos-descoberta.md`. Para Personagens e Locais, o dado de "primeira aparição" já existe hoje sem nenhuma migração: `SessaoLocalLink`, `SessaoNpcLink`, `EventoLocalLink`, `EventoNpcLink` (`backend/app/models/links.py`) já ligam essas entidades a `Sessao`/`Evento`, e `Sessao.numero` já é único e ordenado. "Primeira aparição" é hoje uma agregação (`MIN(sessao.numero)`/data de evento entre os registos onde a entidade está linkada), não uma coluna nova. Para Facções, `Personagem.faccao` é texto livre (`Optional[str]`) — não existe entidade "Facção". **Para Itens, não existe nada no sistema hoje**: nenhum model, nenhum campo solto, nenhuma menção no schema do backend — construir essa entidade é comparável em tamanho ao trabalho feito para `Evento` na spec 141 (model + schema + migrações + router admin/público + tabelas de vínculo). Ver proposal.md - Why/What Changes para motivação e escopo funcional.

## Goals / Non-Goals

**Goals:**
- Entregar a agregação de primeira aparição/reaparição para Personagens e Locais reaproveitando 100% dos dados e tabelas de vínculo já existentes, sem nenhuma migração para esse pedaço.
- Desenhar a entidade `Item` com o mínimo necessário para sustentar a spec (nome, descrição opcional, visibilidade, vínculos com `Sessao`/`Evento`), seguindo o mesmo padrão arquitetural já usado para `Evento`.
- Normalizar a agregação de facções (trim + case-insensitive) sem transformar `Personagem.faccao` num cadastro fechado.

**Non-Goals:**
- Criar um cadastro estruturado de Facções (catálogo editável, campos próprios) — fora de escopo desta fase; a facção continua derivada do texto livre já existente.
- Campos adicionais de Item como raridade, quantidade, proprietário, categoria, inventário ou relações entre itens — fora de escopo desta versão (ver proposal.md).
- Qualquer alteração aos modos cronológico ou por arcos — ver a capability `linha-tempo-por-arcos` para esse modo; as duas capabilities não dependem uma da outra, só do cronológico já existente.

## Decisions

- **Item é uma entidade de primeira classe (model + schema + router admin/público + tabelas de vínculo), não um campo solto em outra entidade.** Alternativa considerada: representar itens como texto livre dentro de `Sessao`/`Evento` (zero schema novo). Rejeitada porque a spec exige CRUD completo, visibilidade configurável por item e associação explícita e consultável a sessões/eventos (FR-007/FR-008) — o mesmo requisito que levou `Evento` a ser uma entidade própria na spec 141, não um campo de texto.
- **Vínculos de Item seguem o padrão já usado por `Evento`**: tabelas equivalentes a `EventoLocalLink`/`EventoNpcLink`, agora `Item↔Sessao` e `Item↔Evento`. Evita inventar um mecanismo de associação novo quando o produto já tem um padrão comprovado para "entidade ligada a várias sessões/eventos".
- **Primeira aparição/reaparição de Personagens e Locais é calculada por agregação (client-side ou endpoint dedicado) sobre os dados já carregados, não uma coluna persistida.** Alternativa considerada: persistir "data de primeira aparição" como coluna desnormalizada em cada entidade. Rejeitada porque exigiria recalcular e manter essa coluna sincronizada a cada nova associação de sessão/evento (incluindo edições e exclusões retroativas), introduzindo uma fonte de verdade duplicada; a agregação sob demanda usa diretamente os vínculos já existentes como única fonte de verdade.
- **Visibilidade "oculto nunca conta como aparição pro jogador" é aplicada no cálculo de agregação, filtrando por `visivel_para_todos` antes de determinar MIN/reaparições para a perspectiva do jogador** — não é um filtro aplicado só na apresentação depois do cálculo, porque isso arriscaria calcular a primeira aparição "real" (incluindo a oculta) e só escondê-la visualmente, o que poderia vazar informação indireta (ex. no intervalo entre aparições). A perspectiva do mestre usa a mesma agregação sem esse filtro.
- **Alerta de inconsistência (FR-014) é computado, não armazenado**: toda vez que o mestre gerencia uma sessão ou abre o modo "Por descoberta" em perspectiva de mestre, o sistema recalcula se existe uma sessão oculta anterior com o mesmo personagem antes de uma sessão visível — não há necessidade de uma tabela de "alertas pendentes", já que a condição é derivável das mesmas associações usadas no resto da feature.
- **Facções: normalização (trim + lowercase para comparação, mantendo a grafia mais legível para exibição) acontece na agregação, não no campo `Personagem.faccao`.** Mantém o campo como está hoje (sem migração) e resolve o risco de fragmentação identificado no TR sem exigir que o mestre padronize dados retroativamente.
- **O opt-in do modo "Por descoberta" reaproveita `Campanha.modulos_ativos`, com um valor independente (ex. `"linha_tempo_descoberta"`) do opt-in de `linha-tempo-por-arcos` (`"linha_tempo_arcos"`) e do gancho de IA (`"ia_arcos"`).** As três são decisões independentes do mestre — habilitar esta visualização não implica habilitar a outra nem a IA. A tela de habilitação reaproveita o mesmo padrão de toggle já em produção em `PainelPage.tsx` (`set_visibilidade`/`set_unidade_distancia`), o mesmo padrão descrito em `linha-tempo-por-arcos` - design.md; não é uma tela nova por capability, é mais um toggle no mesmo lugar.

## Risks / Trade-offs

- **Subestimar Itens por parecer "só mais um tipo na lista"** → já isolado neste design como o maior bloco de esforço (comparável à spec 141 inteira); o planejamento de tasks deve tratá-lo como uma sub-feature própria, não como um item incremental da lista Personagens/Locais/Facções/Itens.
- **Fragmentação silenciosa de facções por variação de grafia não capturada pela normalização trim/case-insensitive** (ex. sinônimos diferentes para a mesma facção) → fora do alcance de uma normalização automática; mitigação é informativa (ver proposal), não há correção automática nesta fase.
- **Cálculo de agregação sob demanda pode ficar custoso em campanhas com muitas sessões/eventos/entidades** → mitigado por reaproveitar os dados já carregados na tela hoje (a própria Linha do Tempo cronológica já carrega sessões/eventos); se a agregação client-side não escalar, a alternativa é um endpoint dedicado com a mesma lógica no backend — decisão de implementação, não de comportamento observável, portanto não muda a spec.
- **Alerta de inconsistência mal calibrado pode gerar ruído** (ex. alertar em casos que o mestre já resolveu intencionalmente) → a spec já define que o alerta é informativo e não bloqueante; o mestre pode ignorá-lo, não há agravamento de risco de produto.

## Migration Plan

1. Migração de schema: nova entidade `Item` (tabela própria) e tabelas de vínculo `Item↔Sessao`/`Item↔Evento` — não exige alteração em dados existentes, é uma adição pura.
2. Nenhuma migração para a agregação de Personagens/Locais/Facções — é lógica de leitura sobre dados já existentes.
3. Rollback: como a mudança de schema é inteiramente nova (tabelas novas, sem alteração de colunas existentes), a reversão é a remoção dessas tabelas, sem necessidade de backfill ou coordenação com dados legados.
