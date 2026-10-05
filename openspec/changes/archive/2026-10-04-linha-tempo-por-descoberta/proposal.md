# Proposal

## Why

Hoje não há forma de ver quando cada personagem, local, facção ou item entrou na história da campanha — essa informação existe espalhada em sessões e eventos, mas não é apresentada agrupada por "primeira aparição". Esta proposta formaliza como spec OpenSpec a feature já desenhada e validada em [BKLG-039](../../../docs/backlog/backlog.md#bklg-039-produto--linha-do-tempo-por-arcos-e-por-descoberta) — decisão de produto e protótipo navegável já aprovados, incluindo a decisão de incluir Itens nesta fase — para que a implementação siga o fluxo `apply` deste repositório.

## What Changes

- Novo modo **"Por descoberta"** na Linha do Tempo, que agrupa personagens, locais, facções e itens pela sessão/evento em que surgiram pela primeira vez, ao lado dos modos cronológico e por arcos.
- O modo é **opt-in por campanha**: só aparece no seletor depois que um mestre autorizado o habilitar numa tela de configuração da campanha; por padrão, fica indisponível.
- Nova entidade **Item**: cadastro pelo mestre (nome obrigatório, descrição opcional, visibilidade configurável), associável a zero ou mais sessões e eventos existentes. Não existe hoje em nenhuma parte do sistema.
- Cálculo de **primeira aparição** e **reaparições** de personagens, locais e itens a partir das associações já existentes com `Sessao`/`Evento` (sem necessidade de nova migração para personagens/locais — o dado já existe).
- **Facções** derivadas do campo de texto livre `Personagem.faccao`, agrupadas com normalização (trim + case-insensitive) para reduzir fragmentação por variação de grafia.
- Filtro por tipo de entidade (Personagens/Locais/Facções/Itens ou Todos).
- Regras de visibilidade: conteúdo oculto (`visivel_para_todos=false`) nunca é revelado ao jogador, nem conta como aparição/primeira aparição/reaparição na perspectiva do jogador; conta normalmente na perspectiva do mestre.
- Alerta ao mestre (não bloqueante, sem ação automática) quando um personagem aparece numa sessão visível e também numa sessão anterior oculta com o mesmo personagem — a decisão sobre a sessão oculta permanece do mestre.
- Toda copy nova em pt-BR e en.

## Capabilities

### New Capabilities
- `linha-tempo-por-descoberta`: modo "Por descoberta" da Linha do Tempo — agrupamento por primeira aparição/reaparição de personagens, locais, facções e itens; cadastro e associação de Itens; regras de visibilidade e alerta de inconsistência de sessão oculta.

### Modified Capabilities
(nenhuma — não existem capabilities OpenSpec registadas em `openspec/specs/` ainda; este é o primeiro corte de specs feito neste modelo para a Linha do Tempo. Esta capability é independente da capability `linha-tempo-por-arcos`: ambas dependem apenas do modo cronológico já existente, não uma da outra.)

## Impact

- **Backend**: nova entidade `Item` completa — model, schema, migrações, router admin+público, tabelas de vínculo equivalentes a `EventoNpcLink`/`EventoLocalLink` (ex. `ItemLocalLink`/`ItemNpcLink`-equivalente para sessão e evento) — comparável em tamanho ao trabalho feito para `Evento` na spec 141. Para personagens/locais, nenhuma migração: agregação sobre `SessaoLocalLink`/`SessaoNpcLink`/`EventoLocalLink`/`EventoNpcLink` já existentes. Novo valor em `Campanha.modulos_ativos` (ex. `"linha_tempo_descoberta"`) para o opt-in deste modo — mesmo campo JSON já existente, sem migração adicional; novo setter de serviço (mesmo padrão de `set_visibilidade`/`set_unidade_distancia` em `backend/app/services/campanha_admin.py`) pra alternar esse módulo.
- **Frontend**: novo modo de visualização agrupada por tipo com filtro; CRUD de Item no admin (reaproveitando os padrões já usados para `Evento`); novo toggle de habilitação na tela de configuração da campanha (reaproveita o padrão de toggle já usado em `PainelPage.tsx` pra `visibilidade`/`unidade_distancia`); i18n (`pt-BR`/`en`).
- **Maior bloco de esforço**: a entidade Item é o único item desta lista sem dado nem schema existente hoje — ver análise completa de risco e estimativa em `docs/v2/tr-timeline-arcos-descoberta.md` e nesta mudança em [`design.md`](design.md).
