# Design

## Context

- `contexto_ia.py` (`coletar_registros`) lê do banco da campanha todas as sessões, arcos, eventos, personagens e locais (e, no rascunho, as notas de preparo anteriores e as facções), corta cada registro em 1500 caracteres e `_orcamento` os inclui, na ordem da lista, enquanto couberem em `ia_assistente_contexto_max_chars` (48.000). Com muitas sessões, as sessões consomem o teto e arcos, eventos, personagens e locais podem ficar de fora; o que não cabe é descartado em silêncio.
- Cada campanha tem o seu SQLite (`campaign_db.py`), migrado por Alembic (`alembic_campaign`, última revisão `012`). Já existe um ouvinte `before_flush` de `Session` que marca a campanha como modificada. SQLite com FTS5 está disponível no ambiente de desenvolvimento.
- O DeepSeek não oferece embeddings; qualquer recuperação semântica exigiria um provedor novo. O produto escolheu busca por relevância (FTS5), sem IA para indexar.
- Outros motores (`motor_ia_fios`, `motor_ia_arcos`, `motor_ia_*_associacoes`) têm coletores próprios. A proposta de fios exige considerar todas as sessões (spec `fios-narrativos`), um problema de resumir tudo, não de recuperar o relevante.

## Goals / Non-Goals

**Goals:**

- Tirar do caminho da IA a leitura completa da campanha: contexto de tamanho limitado, que não cresce com o histórico, sem perder o relevante nem o recente.
- Manter o índice sempre coerente com os dados, sem tarefa em segundo plano, sem provedor novo e sem custo de IA para indexar.
- Dar ao mestre o estado e a reconstrução do índice, e nunca quebrar a IA se o índice falhar.

**Non-Goals:**

- Busca semântica (embeddings) e fichas resumidas pela IA (escolha do produto: busca por relevância).
- Mudar `motor_ia_fios`, `motor_ia_arcos` e as associações de sessão/evento: ficam com o contexto atual nesta change (fios precisa resumir todas as sessões; arcos e associações precisam de listas de candidatos).
- Mostrar ao mestre quais trechos foram usados em cada chamada, ou avisar na tela quando algo foi cortado (só contagens em log).
- Expor busca de texto ao jogador ou usar o índice fora da IA.
- Alterar as regras de conteúdo oculto, o prompt base ou o formato das sugestões.

## Decisions

1. **SQLite FTS5 no banco da campanha.**
   Migração `013_indice_ia`: tabela virtual `indice_ia` (FTS5, `tokenize='unicode61 remove_diacritics 2'`) com a coluna indexada `texto` e as colunas não indexadas `tipo`, `registro_id`, `parte` e `visivel`; e tabela comum `indice_ia_estado` (singleton: `estado` entre `ok`, `desatualizado` e `indisponivel`, `atualizado_em`, `versao_indice`). A migração testa o suporte a FTS5; sem ele, não cria a tabela, grava o estado `indisponivel` e não falha. *Alternativas:* embeddings (provedor novo), busca por `LIKE` (lenta e sem ranking), motor de busca externo (infraestrutura nova). Sem stemming: o `porter` do SQLite é para inglês; a busca é por palavra inteira, ignorando acentos e caixa.

2. **Trechos curtos, não registros inteiros.**
   Módulo `indice_ia.py` divide o texto de cada registro em trechos de até 1200 caracteres, cortando em parágrafo (e em frase se o parágrafo for maior), e prefixa cada trecho com o cabeçalho do registro («Sessão 12: Título», nome do local etc.) para que o trecho seja compreensível sozinho. Campos indexados: sessão (título, resumo, notas de preparo), arco (título, resumo), evento (título, descrição), personagem (nome, papel, facção, descrição), local (nome, descrição), item (nome, descrição). Não indexa notas mecânicas nem fios. `visivel` copia `visivel_para_todos` do registro, como o contexto atual faz (paridade; ver Questões abertas).

3. **Atualização na mesma transação, sem bloquear a gravação.**
   Um ouvinte `after_flush` em `Session`, no mesmo estilo do `before_flush` existente e **reutilizando o mesmo filtro de campanha** de `_track_campaign_writes` (ignora control.db e bancos fora de `campanhas/<id>/campanha.db`), olha os objetos novos, alterados (só quando um campo indexado mudou, via histórico do atributo) e removidos dos seis tipos e, pela mesma conexão, apaga os trechos do registro e insere os novos. As escritas no índice são SQL cru, então não reentram no ouvinte. O ouvinte não escreve quando o estado é `indisponivel` ou quando as tabelas do índice ainda não existem (nesse caso marca/mantém o estado «ausente» para a próxima reconstrução). Qualquer exceção é capturada, registrada em log (só tipo, id e erro) e marca `indice_ia_estado.estado = 'desatualizado'`; a gravação do usuário segue. Como é a mesma transação, commit e rollback valem para dados e índice juntos. Escritas fora do ORM (SQL cru) não passam pelo ouvinte: importações via ORM passam; para as demais, `campaign_import` e `legacy_import` chamam a reconstrução ao final. *Alternativa:* gatilhos SQL — rejeitados: a lógica de trechos e cabeçalhos é de aplicação.

4. **Criação preguiçosa e reconstrução idempotente.**
   `reconstruir(session)` apaga o índice e o repovoa dentro de uma transação, atualiza o estado para `ok` e `atualizado_em`, com um `Lock` por campanha para que duas reconstruções simultâneas não dupliquem (o `Lock` é em memória e basta porque o deploy usa um único processo uvicorn; com mais de um worker a defesa real passa a ser a idempotência da reconstrução: apagar e repovoar numa só transação). **A estrutura é criada de forma idempotente também pelo serviço** (`CREATE ... IF NOT EXISTS`): campanhas vindas do formato legado passam por `migrate_sqlite_legacy` + `stamp head` e não executam a `013`, então a ausência das tabelas conta como estado «ausente» e a primeira reconstrução as cria (a `013` faz o mesmo para os demais caminhos). Campanhas existentes não precisam de passo de implantação: na primeira chamada de IA, estado ausente ou `desatualizado` dispara `reconstruir`; o custo é uma leitura única do banco local (ordem de milhares de registros). A ação «Reindexar» chama a mesma função.

5. **Recuperação por relevância.**
   Os termos vêm do fim do texto atual (últimos ~2000 caracteres), da instrução do mestre e do título ou número do registro-alvo: minúsculas, sem acentos, sem palavras de menos de 3 letras e sem uma lista curta de palavras comuns em pt e en, sem repetição, no máximo 24 termos. Como não há stemming em pt-BR, termos com 5 ou mais letras usam prefixo (`"termo"*`, ainda entre aspas), de modo que «emboscada» encontre «emboscadas»; termos mais curtos casam por palavra inteira. A consulta é montada só com termos entre aspas, ligados por `OR`, nunca com texto do usuário cru (ver Riscos), ordenada por `bm25()` com desempate por `registro_id` decrescente e limitada a `ia_indice_trechos_max` (padrão 20). Sem termos, devolve vazio.

6. **Composição do contexto e teto.**
   A composição é uma **função nova** em `contexto_ia.py` (ex.: `compor_contexto`), chamada só por `motor_ia_assistente.assistir`; `coletar_registros` e `coletar_fios` ficam intactos (são usados por arcos, associações e fios, e `coletar_registros` é o caminho de recuo). A lista é montada **na ordem de prioridade explícita**, sem reaproveitar o `sorted` por id de `coletar_registros`, porque o `_orcamento` inclui na ordem da lista. O catálogo é **agregado em poucos itens** (o `_orcamento` reserializa a lista a cada candidato, custo quadrático): um item `catalogo` com os registros visíveis e um item `catalogo_oculto` com os ocultos, de modo que `montar_contexto` marque `oculto` e `usou_conteudo_oculto` continue correto. A checagem de «contexto insuficiente» (`MIN_REGISTROS`) continua contando registros reais da campanha, não os itens compostos. A montagem passa a ser: (1) texto atual e instrução (como hoje); (2) fios em aberto (rascunho); (3) as 3 sessões mais recentes e os 3 arcos mais recentes, completos (até 1500 caracteres cada, como hoje), excluindo o registro-alvo; (4) catálogo: uma linha por personagem, local, item, arco e sessão («tipo: nome (papel, facção)» / «Sessão N: título») dentro dos itens agregados `catalogo` e `catalogo_oculto`, até `ia_indice_catalogo_max_chars` (padrão 6000) no total, mais recentes primeiro; (5) os trechos recuperados que ainda não estejam em (3), em ordem de relevância. O `_orcamento` existente continua aplicando o teto de 48.000, agora sobre uma lista curta e priorizada, e o corte é determinístico (menos prioritário primeiro). Os tipos de contexto novos (`catalogo`, `trecho`) mantêm `visivel` e o marcador de oculto no mesmo mecanismo de `montar_contexto`.

7. **Recuo ao comportamento atual.**
   Se o estado for `indisponivel`, a reconstrução falhar ou a consulta lançar erro, o coletor atual (leitura completa) é usado, com o mesmo teto. O código atual permanece como caminho de recuo, não é removido. Cada chamada registra em log contagens (trechos recuperados, tamanho, índice ou recuo).

8. **Estado e reindexar para o mestre.**
   Rotas no roteador de IA existente (`routers/admin/ia.py`): `GET /ia/indice` (estado, registros e trechos indexados, `atualizado_em`) e `POST /ia/indice/reindexar`, ambas com `require_dono` e módulo de IA ativo, a segunda com limite `3/minute`. No frontend, o painel da campanha (`routes/painel.tsx`) mostra, abaixo do interruptor de IA e só quando ativo, o estado, as quantidades e o botão Reindexar (com carregamento e mensagem de erro), com cliente em `api/` e textos em `comum.json`.

9. **Privacidade e portabilidade.**
   O índice nunca é lido por rotas públicas; a exportação continua montada por tabelas explícitas (`campaign_export`), então a tabela virtual não entra no pacote; a importação reconstrói o índice ao final. O conteúdo oculto segue as regras atuais porque os trechos passam por `montar_contexto` com o mesmo `visivel`.

## Risks / Trade-offs

- **[Busca lexical não é semântica]** A IA pode não receber um trecho que fala do assunto com outras palavras. Mitigação: sempre entram os recentes e o catálogo de nomes; os termos vêm também do texto atual e do alvo; o recuo e o botão Reindexar existem para operar. Aceito pelo produto.
- **[Injeção na sintaxe de consulta do FTS5]** Texto do mestre virando operador (`NEAR`, `*`, aspas) quebra a consulta ou muda o resultado. Mitigação: só termos alfanuméricos extraídos, cada um entre aspas, ligados por `OR`; teste com entradas hostis.
- **[Índice defasado]** Gravações fora do ORM ou falha silenciosa podem deixá-lo desatualizado. Mitigação: marcação de `desatualizado` em falha, reconstrução ao final de importações e na primeira chamada, e a ação manual.
- **[Custo de gravação]** Cada gravação de registro indexado reescreve seus trechos. Aceito: textos curtos, SQLite local.
- **[Ambiente sem FTS5]** Produção com SQLite sem a extensão. Mitigação: verificação na migração, estado `indisponivel` e recuo; documentar no changelog.
- **[Concorrência]** SQLite tem um escritor por vez; a reconstrução longa pode atrasar gravações. Mitigação: transação única e curta, `Lock` por campanha, uso raro. A reconstrução da primeira chamada de IA é síncrona; o tempo é registrado em log e medido na verificação manual (meta: até cerca de 1 s para milhares de registros). Se passar disso, a reconstrução sai do caminho da requisição em uma change seguinte.
- **[Escala assumida]** A meta é campanhas de até ordem de dezenas de milhares de registros em SQLite local; acima disso a reconstrução síncrona e o `DELETE`+`INSERT` por gravação devem ser reavaliados.
- **[Backup e ferramentas SQL]** O índice entra nos backups por arquivo do `campanha.db`; ferramentas que usem `.dump` em SQLite sem FTS5 podem falhar com a tabela virtual. Documentar no changelog e confirmar FTS5 na imagem de produção antes do deploy.
- **[Mudança de comportamento do contexto]** As respostas da IA mudam, para melhor ou pior, em campanhas grandes. Mitigação: testes de composição com campanha sintética grande; o recuo mantém o comportamento antigo; foco do aviso em contagens de log para investigação.

## Migration Plan

Deploy único de backend e frontend. A migração `013` roda por campanha no primeiro acesso após o deploy (mecanismo atual de `ensure_campaign_schema`) e só cria estrutura; campanhas legadas (marcadas com `stamp head` sem migrações) não a executam e têm a estrutura criada pelo serviço na primeira reconstrução. O índice de campanhas existentes é populado na primeira chamada de IA ou pelo botão Reindexar. Antes do deploy, fazer backup dos bancos das campanhas (rotina atual). Rollback: reverter o código (o recuo ignora o índice) e, se desejado, `downgrade` da `013`, que apaga as duas tabelas sem tocar nos dados narrativos.

## Open Questions

- As notas de preparo de uma sessão visível hoje saem com a visibilidade da sessão (paridade mantida aqui), embora sejam privadas por spec; vale marcá-las sempre como ocultas numa change própria, pois muda a sinalização de conteúdo oculto.
- Valores iniciais de recentes (3 sessões, 3 arcos), trechos (20) e catálogo (6000 caracteres); ajustáveis por configuração depois de observar o uso.
- Estender o índice às propostas de fios, de arcos e às associações em uma change seguinte, com um desenho próprio para «considerar todas as sessões».
