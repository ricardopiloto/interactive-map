# Design

## Context

O backend é FastAPI + SQLModel, com um banco `control.db` (campanhas) e um banco por campanha (`campaign.db`, migrado por `alembic_campaign`). Cada entidade de campanha segue o mesmo padrão: `models/<entidade>.py` (tabela SQLModel) → `schemas/<entidade>.py` (Create/Update/Read Pydantic) → `services/<entidade>_service.py` (regras) → `routers/admin/<entidade>.py` (CRUD autenticado) + `routers/public/<entidade>.py` (leitura com regra de visibilidade). `Arco` e `Sessao` já existem nesse formato (ver `models/arco.py`, `models/sessao.py`, `routers/admin/sessoes.py`). Extensões mecânicas por NPC já existem via `NPC.extensoes_mecanica` (JSON) validado por `services/mecanica.py`, mas esse mecanismo é pensado para trackers pequenos por módulo ativo (ex. fadiga 0–6), não para uma ficha completa variável por sistema de jogo. `Campanha.sistema` (`control.db`) já identifica o sistema de cada campanha (`wfrp`, `wod` em produção).

Ver `proposal.md` para a motivação (preparar o terreno de dados para uma futura exportação a ferramentas externas, sem incluir essa exportação nesta mudança).

## Goals / Non-Goals

**Goals:**
- Modelo de dados e CRUD de `Capitulo` seguindo exatamente o padrão arquitetural já usado por `Arco`/`Sessao`.
- Um registro de stat blocks por sistema, extensível para adicionar um terceiro sistema no futuro sem alterar o modelo de `NPC` ou os endpoints existentes — só adicionar um novo arquivo de template.
- UI mínima funcional no `frontend/` (não `frontend-next/`, que é protótipo de design 100% desconectado do backend) para o mestre usar as duas capabilities de ponta a ponta.

**Non-Goals:**
- Qualquer formato de exportação (Foundry ou outro) — o `stat_block` e o `corpo_markdown` são desenhados para serem renderizáveis em markdown, o que facilita uma exportação futura, mas nenhum endpoint ou formato de exportação é criado aqui.
- Wikilinks / resolução de `[[Nome]]` dentro de `corpo_markdown` ou `descricao` — texto plano por enquanto (ver "Backlog" abaixo).
- Suporte a sistemas além de `wfrp` e `wod`.
- Edição colaborativa em tempo real ou histórico de versões do `corpo_markdown`.

## Decisions

### Capítulo como entidade própria, corpo em markdown único
Em vez de colunas separadas para Objetivo/Cenário/Desenvolvimento/Conflito (considerado numa iteração anterior deste desenho), `Capitulo.corpo_markdown` é um único campo de texto, no mesmo espírito de `Sessao.resumo` (hoje `max_length=50000`). Razão: o próprio mestre já escreve aventuras assim (seções em markdown dentro de um documento único, com callouts para combate/handout inline) — forçar uma estrutura relacional por seção não refletiria como o conteúdo é realmente produzido e tornaria a edição mais rígida sem benefício atual. `corpo_markdown` usa o mesmo limite de 50000 caracteres de `Sessao.resumo` por consistência.

Alternativa considerada e descartada: `Encontro` como entidade N:N (Capítulo × NPC × quantidade). Descartada porque, na prática observada nos módulos já escritos, o encontro é citado por arquétipo/quantidade em prosa (ex. "Clanrats (4–6) — bestiário Skaven"), não por referência a um NPC cadastrado — criar a relação exigiria disciplina de cadastro que o fluxo atual do mestre não tem, sem ganho imediato.

### `Sessao.capitulo_id` é a FK (N:1 Sessão → Capítulo) — decisão revisada
A primeira versão deste desenho colocava a FK em `Capitulo` (`sessao_id`, nullable, `unique=True`, 1:1). Essa versão chegou a ser implementada, mas foi revisada depois que o mestre notou, já vendo o resultado, que um Capítulo pode ser jogado ao longo de **várias** sessões de mesa — a relação é N:1 (Sessão → Capítulo), não 1:1. A FK precisa ficar do lado "N": `Sessao.capitulo_id`, nullable, **sem** `unique`, `ondelete="SET NULL"` (apagar um Capítulo desfaz o vínculo das Sessões que o referenciavam, sem apagá-las). A razão original para `Sessao` não precisar "saber" de `Capitulo` continua válida apenas parcialmente: `Sessao` ganha um campo a mais, mas seu comportamento sem Capítulo não muda em nada.

### `Capitulo.arco_id` é opcional — decisão revisada
Também revisado: `arco_id` deixa de ser obrigatório. O mestre pode preparar um Capítulo avulso, sem Arco. Isso reflete a hierarquia correta percebida depois da primeira implementação: **Arco (opcional) 1:N Capítulo 1:N Sessão** — nenhum nível exige o nível acima para existir.

### Remoção em cascata de Arco → Capítulo
`Capitulo.arco_id` usa `ondelete="CASCADE"`, espelhando a relação já existente `Local.arco_id` (nullable hoje, mas o mesmo princípio de "filho pertence ao pai, quando há pai"). Apagar um Arco inteiro (aventura) apagando seus Capítulos vinculados a ele é o comportamento esperado pelo mestre; Capítulos sem Arco não são afetados por nenhuma remoção de Arco. A chance de apagar um Arco por engano e querer recuperar só os Capítulos é baixa o suficiente para não justificar soft-delete nesta iteração.

### Arco de uma Sessão vinculada a Capítulo é denormalizado e sincronizado, não derivado em tempo real
`Sessao.arco_id` já existe e é lido diretamente pela capability já arquivada `linha-tempo-por-arcos` (raias da timeline). Para não alterar essa leitura (nem suas queries), `Sessao.arco_id` continua sendo a coluna que a timeline consulta. Mas agora pode haver duas origens para o arco de uma sessão — direta (`Sessao.arco_id`) e indireta (`Sessao.capitulo_id` → `Capitulo.arco_id`) — o que criaria duas fontes de verdade conflitantes. A correção: sempre que uma Sessão tem `capitulo_id` definido, o serviço grava automaticamente `Sessao.arco_id = Capitulo.arco_id` (inclusive `None`) a cada escrita relevante — ao vincular, ao mudar de Capítulo, e ao editar o `arco_id` do próprio Capítulo (propagação para todas as Sessões que o referenciam). Uma tentativa de escrever um `arco_id` diferente do sincronizado, nessas condições, é rejeitada.

Alternativa considerada: resolver o arco "efetivo" em tempo real via JOIN na query da timeline, sem gravar nada em `Sessao.arco_id` quando há Capítulo (opção "mutuamente exclusivo", descartada pelo usuário). Teria zero risco de dessincronização, mas exigiria alterar a query já shippada de `linha-tempo-por-arcos`. A opção escolhida (denormalizado e sincronizado) mantém essa capability intocada, ao custo de ser o serviço de Capítulo/Sessão quem precisa manter a cópia atualizada em todo write relevante — ver spec delta de `linha-tempo-por-arcos` nesta mudança para a exceção de comportamento (associação direta de arco fica bloqueada enquanto há Capítulo vinculado).

### Stat block: campo JSON + registro de templates por sistema, não colunas por sistema
`NPC.stat_block: dict[str, Any]` (JSON), análogo a `extensoes_mecanica`. Um novo pacote `services/stat_blocks/` define, por sistema:
- `FIELDS`: lista de campos (`nome`, `rotulo`, `tipo` — `int`, `str`, `list[str]`, etc.) usada tanto para validar a escrita quanto para a API expor o schema à UI.
- `validate(payload: dict) -> dict`: valida tipos e rejeita chaves fora de `FIELDS`.
- `render_markdown(payload: dict) -> str`: converte o dict num bloco markdown (tabela de características + listas, no caso de WFRP).

Um `registry.py` mapeia `sistema -> módulo de template` (`{"wfrp": wfrp, "wod": wod}`), usado pelo `npc_service` para escolher o template a partir de `Campanha.sistema` do NPC. Sistema sem entrada no registro → erro estruturado `STAT_BLOCK_SISTEMA_DESCONHECIDO` (mesmo padrão de `raise_api_error` já usado em `services/mecanica.py` para `MODULO_MECANICA_DESCONHECIDO`).

Alternativa considerada: reaproveitar `extensoes_mecanica` para também guardar o stat block. Descartada porque `extensoes_mecanica` é validado por módulo ativo da campanha (`modulos_ativos`), um conceito ortogonal (features mecânicas opcionais, ex. fadiga) ao de "a ficha do NPC neste sistema", que não é opcional nem por módulo — é sempre determinado pelo sistema da campanha. Misturar os dois acoplaria dois conceitos diferentes no mesmo campo.

### Atributos numéricos como tabela única (edição, visualização e markdown) — correção pós-aplicação
A v1 implementada apresentava cada campo `int` do stat block como um campo isolado empilhado (`StatBlockFields`, um `<input>` por característica) e, na visualização, como um grid de definição `<dl>` (`StatBlockSummary`) — nenhum dos dois reproduz a tabela única que o mestre já usa no Obsidian (`| CA | HPr | FOR | ... |`). Corrigido para: os campos `tipo == "int"` de um sistema (hoje, em `wfrp.py` e `wod.py`, são exatamente as características de combate) são sempre agrupados numa única tabela HTML, tanto no editor quanto na visualização, na mesma ordem em que aparecem no schema (`StatBlockField[]` retornado por `GET` do schema). Não foi necessário adicionar um conceito novo ao schema (`StatField` não ganha um campo `grupo`/`layout`): o próprio `tipo == "int"` já serve como esse agrupador, porque hoje nenhum sistema mistura características com outros campos numéricos soltos.

O backend já gerava uma tabela markdown para esses campos (`render_characteristics`, em `services/stat_blocks/base.py`) — só o separador muda, de `---` (neutro) para `:-:` (centralizado), para bater exatamente com o que já existe em `NPCs/*.md` no vault Obsidian do mestre (`|:---:|:---:|...`).

### Stat block nunca visível a jogadores
A API pública de NPC (`routers/public/npcs.py`) nunca inclui `stat_block` no schema de resposta pública, independentemente de `visivel_para_todos`. Isso é uma decisão de design assumida (não veio explicitamente do pedido original) porque um stat block é, por natureza, informação de mestre (ex. valores de combate de um antagonista) — expô-la ao jogador quebraria o uso normal de uma mesa. `descricao` continua seguindo a regra de visibilidade existente, sem mudança.

### Onde a UI entra: `frontend/`, não `frontend-next/`
`frontend-next/` é um protótipo navegável com dados mocados, "100% desconectado do backend real" (ver seu README), usado para validar direção de design antes de specs `UX-*`. Como esta mudança precisa funcionar de ponta a ponta contra o backend real, a UI entra em `frontend/`: uma tela/seção de Capítulos dentro da gestão de Arco (reaproveitando o padrão de `ArcoFormDialog.tsx`/`ArcoAdminList.tsx`) e um editor de stat block dirigido por schema dentro de `NpcFormDialog.tsx`, substituindo nessa tela o uso de texto livre para dados mecânicos.

## Risks / Trade-offs

- **[Risco] A v1 deste modelo já foi aplicada (migração, código e UI existem) com `Capitulo.arco_id` obrigatório e `Capitulo.sessao_id` 1:1.** Campanhas reais podem já ter linhas nessas colunas. → Mitigação: a migração de correção SHALL fazer `arco_id` nullable, adicionar `Sessao.capitulo_id`, copiar os valores existentes de `Capitulo.sessao_id` para a `Sessao` correspondente antes de remover a coluna antiga, e só então dropar `Capitulo.sessao_id` e seu índice único. Em SQLite isso exige `batch_alter_table` (recriação de tabela) — verificar a versão do SQLite em uso suporta `DROP COLUMN` direto (≥ 3.35) ou se o Alembic precisa do modo batch completo.
- **[Risco] Sincronizar `Sessao.arco_id` a partir do Capítulo é escrita em cascata (um Capítulo pode ter N Sessões).** → Mitigação: é um UPDATE em lote simples (um `arco_id` por N linhas de `Sessao`), sem laços externos; aceitável no volume de dados de uma campanha de mesa (dezenas de sessões, não milhares).
- **[Risco] Corpo de markdown único dificulta automação futura (ex. extrair só o "encontro" de um capítulo para pré-popular algo).** → Mitigação: aceito nesta iteração porque não há consumidor automatizado ainda; se/quando a exportação ao Foundry for desenhada, decide-se então se vale introduzir marcação leve (ex. um heading convencionado) sem reestruturar o modelo de dados.
- **[Risco] Registro de stat block por sistema cresce de forma ad-hoc conforme sistemas são adicionados, sem um schema genérico formal.** → Mitigação: aceitável com 2 sistemas; se um terceiro sistema aparecer, reavaliar se vale um formato de definição mais declarativo (ex. JSON Schema) em vez de módulos Python por sistema.
- **[Risco] `corpo_markdown` de 50000 caracteres pode não bastar para aventuras muito longas (a aventura 12 do vault do usuário tem ~54KB em texto, incluindo imagens/links).** → Mitigação: usar o mesmo limite já validado em produção para `Sessao.resumo`; se se mostrar insuficiente na prática, é uma migração simples de ampliar o `max_length`.
- **[Trade-off] Stat block sempre oculto a jogadores é uma regra rígida (não configurável).** → Aceito por ora; se o mestre quiser mostrar um stat block a jogadores (ex. referência de regra pública), pode continuar colando esse conteúdo em `descricao`, que já segue `visivel_para_todos`.

## Backlog — não incluído nesta mudança

- **Wikilinks**: suporte a `[[Nome]]` dentro de `corpo_markdown` (Capítulo) e `descricao`/`stat_block` (NPC), resolvendo para outra entidade da campanha (NPC, Local, Arco, Capítulo) por nome, com desambiguação quando houver nomes repetidos, renderização como link navegável na UI do Codex, e backlinks (quais entidades referenciam esta). Deliberadamente deixado de fora desta proposta a pedido explícito do usuário — é uma feature própria (parser + resolução + desambiguação + backlinks), não um campo a mais nesta mudança. Também é a peça que, no futuro, permitiria gerar `@UUID[...]` ao exportar conteúdo para um sistema externo como o Foundry VTT, em vez de texto puro.
