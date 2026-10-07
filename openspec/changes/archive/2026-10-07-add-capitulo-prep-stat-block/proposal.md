# Proposal

## Why

Hoje o mestre prepara aventuras (cenário, desenvolvimento, encontros, handouts) fora do Campaign Codex — num vault Obsidian separado — porque o Codex só tem `Arco` (agrupador raso) e `Sessão` (crônica do que já foi jogado), sem um lugar para o conteúdo de pré-sessão. Da mesma forma, a ficha de NPC hoje é um único campo de texto livre (`descricao`), sem separação entre narrativa e estatísticas mecânicas, o que não escala para os múltiplos sistemas de jogo já ativos (`wfrp`, `wod`). Esta mudança fecha as duas lacunas que são pré-requisito para qualquer exportação futura de conteúdo de aventura para ferramentas externas (ex.: Foundry VTT): sem um modelo de prep estruturado e sem stat blocks por sistema, não há o que exportar.

## What Changes

- Nova entidade **Capítulo**: unidade de preparação de aventura, com corpo em markdown único (cenário, desenvolvimento, encontros e handouts ficam todos como texto dentro desse corpo, no mesmo estilo já usado pelo mestre). Vínculo com um `Arco` é **opcional** — o mestre pode preparar um Capítulo avulso, fora de qualquer Arco. Uma `Sessão` pode referenciar o Capítulo que jogou (`Sessao.capitulo_id`); um mesmo Capítulo pode ser referenciado por **várias Sessões**, quando seu conteúdo é jogado ao longo de mais de uma sessão de mesa.
- Hierarquia resultante: Arco (opcional) 1:N Capítulo 1:N Sessão — nenhum nível é obrigatório para o nível abaixo existir.
- Enquanto uma Sessão tem um Capítulo vinculado, o `arco_id` dessa Sessão (campo já existente, lido pela Linha do Tempo) passa a ser **sincronizado automaticamente** a partir do `arco_id` do Capítulo, em vez de editável livremente — evita duas fontes de verdade conflitantes para "qual arco é essa sessão". Isso é uma mudança de comportamento na capability já arquivada `linha-tempo-por-arcos` (ver "Modified Capabilities" abaixo).
- CRUD completo de Capítulo (admin, protegido por sessão de membro da campanha) e leitura pública respeitando visibilidade, seguindo o mesmo padrão de `Arco`/`Sessão` (`services/*_service.py` + `routers/admin/*.py` + `routers/public/*.py`). Listagem funciona com ou sem filtro de Arco (um Capítulo avulso precisa aparecer em algum lugar).
- UI de prep no frontend (`frontend/`) para o mestre listar, criar, editar e reordenar Capítulos (com ou sem Arco), e para vincular uma Sessão a um Capítulo existente a partir da própria Sessão.
- NPC ganha um campo estruturado `stat_block` (JSON), separado do `descricao` narrativo, cujo formato depende do `sistema` da campanha (`Campanha.sistema`).
- Novo registro de **stat blocks por sistema** (`services/stat_blocks/`) com um template por sistema (`wfrp`, `wod`) que define os campos esperados, valida o payload e sabe renderizar o `stat_block` em markdown. A API de NPC usa esse registro para validar `stat_block` na escrita e para expor um schema de campos na leitura (permitindo a UI montar o formulário certo por sistema).
- UI de NPC ganha um editor de stat block dirigido pelo schema do sistema da campanha, em vez do textarea único atual.

**Fora de escopo nesta mudança** (trabalho futuro, depois que este modelo de prep estiver validado em uso real):
- Qualquer exportação, sincronização ou integração com Foundry VTT.
- Wikilinks (`[[Nome]]` resolvendo para outra entidade, com backlinks) — registrado no backlog do projeto, ver `openspec/changes/add-capitulo-prep-stat-block/design.md` (seção "Backlog — não incluído nesta mudança").
- Suporte a sistemas além de `wfrp` e `wod`.

## Capabilities

### New Capabilities
- `capitulo-prep`: CRUD de Capítulos de preparação de aventura (corpo em markdown), opcionalmente vinculados a um Arco; uma ou mais Sessões podem referenciar o Capítulo que jogaram, com o arco da Sessão sincronizado a partir do Capítulo quando esse vínculo existe.
- `npc-stat-block`: campo estruturado de stat block por sistema de jogo no NPC, com validação e renderização dirigidas por um registro de templates por sistema.

### Modified Capabilities
- `linha-tempo-por-arcos`: a requirement "Gestão de arcos pelo mestre" ganha uma exceção — enquanto uma Sessão tem um Capítulo vinculado, sua associação a um Arco deixa de ser editável diretamente por essa gestão (passa a ser derivada do Capítulo). O restante da capability (visualização da timeline, filtros, transições entre arcos) não muda.

## Impact

- **Backend**: novo `models/capitulo.py` (`arco_id` opcional), `schemas/capitulo.py`, `services/capitulo_service.py`, `routers/admin/capitulos.py`, `routers/public/capitulos.py`; nova migração Alembic em `alembic_campaign/` (tabela `capitulo`); `models/sessao.py` e `schemas/sessao.py` ganham `capitulo_id` (FK opcional, N:1) e a lógica de sincronizar `arco_id` a partir do Capítulo referenciado; `models/npc.py` e `schemas/npc.py` ganham `stat_block`; novo pacote `services/stat_blocks/` (`base.py`, `wfrp.py`, `wod.py`, registro por `Campanha.sistema`); `routers/admin/npcs.py` e `routers/public/npcs.py` passam a validar/expor `stat_block`.
- **Backend (capability existente)**: `services/sessao_service.py` (ou equivalente) ganha a regra de sincronização/validação de `arco_id` quando `capitulo_id` está definido — é código que já serve `linha-tempo-por-arcos`, então essa capability precisa de uma spec delta (ver acima) e de testes adicionais, não só o código novo de Capítulo.
- **Frontend** (`frontend/`, não `frontend-next/` — que é só protótipo desconectado de design): nova tela/seção de Capítulos, utilizável com ou sem Arco; seletor de "Capítulo jogado" entra no formulário de Sessão (não no de Capítulo); `NpcFormDialog.tsx` ganha o editor de stat block dirigido por schema.
- **Dados existentes**: `NPC.descricao` não muda de formato; `stat_block` nasce vazio/opcional para NPCs já cadastrados (sem migração de dados obrigatória).
- **Sem mudança** em `Evento`, `Local` ou no restante das capabilities de Linha do Tempo já especificadas (cronológica, por descoberta, motores de IA).
