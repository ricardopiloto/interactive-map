# Feature Specification: Migração das instâncias legadas e corte

**Feature Branch**: `099-migracao-legado-corte`

**Created**: 2026-09-20

**Status**: Implemented

**Input**: User description: "Migração das instâncias legadas e corte para o Campaign Codex. Script para o super-admin importar uma instância legada (WFRP e WoD): copia mapa.db e uploads para a pasta da campanha, aplica a ponte _migrate_sqlite, carimba o Alembic e reescreve as URLs de imagem. Ensaio obrigatório numa cópia, com relatório de verificação (contagem de registros por tabela e de arquivos, antes e depois). Runbook de corte: publicar campaign-codex.1nodado.com.br (imprimir os trechos de Caddy e Cloudflare Tunnel para colar, como faz a spec 078, sem editar a configuração do host), janela combinada com os jogadores, plano de retorno com as instâncias antigas paradas e intactas por 2 semanas (a confirmar). Aposentar nova-campanha.sh, migrar-wfrp.sh e o hub estático; atualizar README, manuais e runbooks. Sem redirecionamento dos domínios antigos. Fora de escopo: novas features. Depende de: 098. Critério-chave: contagens idênticas antes e depois em ambas as campanhas; a instância antiga pode ser religada e funcionar sem alteração."

**Depends on**: [098-home-painel-mestre](../098-home-painel-mestre/spec.md); [097-exportar-importar](../097-exportar-importar/spec.md); [096-uploads-cota](../096-uploads-cota/spec.md); [095-contas-sessao-permissoes](../095-contas-sessao-permissoes/spec.md); [093-controle-alembic-sqlite](../093-controle-alembic-sqlite/spec.md); [078-multideploy-hub](../078-multideploy-hub/spec.md) (padrão de snippets; scripts a aposentar); constituição v1.0.0 (I, II, III, IV, V, VI); Campaign Codex brief ([docs/v2/product-brief-campaign-codex.md](../../docs/v2/product-brief-campaign-codex.md) fase 099)

## Clarifications

### Session 2026-09-20

- Q: Duração da janela de retorno após o corte? → A: 14 dias (depois o runbook fecha o retorno; pastas antigas não se apagam durante a janela)
- Q: Ordem no momento do corte? → A: Publicar e verificar o Codex primeiro; depois parar as instâncias antigas na janela combinada
- Q: Slugs de produção de WFRP e WoD? → A: Runbook e docs usam `wfrp` e `wod`; o CLI continua a receber slug
- Q: Como aposentar `nova-campanha.sh`, `migrar-wfrp.sh` e o hub? → A: Ficheiros ficam no git; scripts avisam e recusam criar/migrar; docs activas não os recomendam
- Q: Cota no import legado se a cópia de produção exceder 10 GB? → A: Omissão 10 GB; o CLI do import legado aceita `cota_bytes` maior; depois vale 096

## Constitution

- Isolamento (I): cada instância legada MUST virar **uma** campanha no sítio UUID próprio. WFRP MUST NOT misturar linhas ou ficheiros com WoD. A origem (`/opt/codex-*` ou equivalente) MUST NOT ser o destino da escrita.
- Testes primeiro (II): importar legado (cópia + ponte + carimbo + reescrita de URLs), relatório de contagens e «origem intacta» MUST ter testes a falhar **antes** da implementação correspondente. Import zip 097 **não** substitui este caminho (ficheiros `mapa.db` de operador, não zip de utilizador).
- Produção legada (III): esta é a spec de **corte**. Até o ensaio passar, MUST NOT exigir `git pull` nem alteração **dentro** das pastas das instâncias antigas. O corte publica um **novo** sítio Campaign Codex; as pastas antigas ficam paradas e intactas na janela de retorno.
- Simplicidade (IV): reutilizar criar campanha (093), ponte `_migrate_sqlite` + stamp (093), mídia/cota (096), dono (095). MUST NOT inventar um segundo formato de pacote. Snippets Caddy/Tunnel no estilo 078 (imprimir, não editar o host).
- i18n (V): copy nova de UI MUST NOT ser o foco (sem features novas). Relatório/CLI: códigos ou texto operacional para o super-admin; manuais actualizados em pt-BR (e en se o manual correspondente já existir).
- Migrações (VI): legado → ponte `_migrate_sqlite` **só** no ficheiro **copiado** para o sítio novo → carimbo Alembic na revisão de conteúdo corrente. MUST NOT correr a ponte nas pastas antigas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Super-admin importa uma instância legada para uma campanha (Priority: P1)

O operador corre um comando/script de **importar legado** contra uma pasta de instância (WFRP ou WoD): copia `mapa.db` e `uploads/` para o sítio da campanha nova, aplica a ponte de schema, carimba Alembic, reescreve URLs de imagem para o endpoint de mídia do slug novo (096), reconcilia cota/`mapa_arquivo`, e atribui dono. A pasta de origem **não** é modificada.

**Why this priority**: Sem isto não há WFRP/WoD de produção no Campaign Codex; 093 só ensaiou fixture.

**Independent Test**: Fixture estilo `mapa.db` + uploads com contagens conhecidas. Correr import para um `DATA_DIR` de teste. Origem byte-a-byte intacta. Destino: mesmas contagens de tabelas e de ficheiros; revisão Alembic corrente; URLs de mídia no slug novo.

**Acceptance Scenarios**:

1. **Given** uma pasta de instância legada (cópia de teste) com `mapa.db` e uploads, **When** o super-admin importa com slug livre, sistema correcto e dono existente, **Then** existe uma campanha nova nesse slug, o conteúdo está no sítio UUID, a ponte+carimbo correram no **destino**, e as URLs de imagem apontam ao endpoint de mídia desse slug.
2. **Given** o mesmo import, **When** se compara a pasta de origem, **Then** `mapa.db`, uploads e configs da origem estão inalterados.
3. **Given** um `.db` / zip enviado como na 097, **When** se usa **este** comando, **Then** não é o caminho: este script só copia de uma **árvore de instância** conhecida (não adopta um ficheiro solto de utilizador na API).
4. **Given** uploads cuja soma excede 10×1024³, **When** o operador passa `cota_bytes` ≥ essa soma, **Then** o import conclui, `cota_bytes` e `bytes_usados` ficam no destino, e uploads posteriores seguem 096. Sem esse parâmetro (ou com tecto abaixo da soma), o import recusa e reverte o destino.

---

### User Story 2 - WFRP e WoD: contagens idênticas antes e depois (Priority: P1)

O operador importa **as duas** campanhas de produção (ensaio em cópias). Para cada uma, o relatório mostra contagens **por tabela** e **de ficheiros** na origem (antes) e no destino (depois). Os números coincidem. IDs internos preservados (093). As duas mesas ficam isoladas no Codex.

**Why this priority**: Critério-chave de fidelidade; falha aqui bloqueia o corte.

**Independent Test**: Duas fixtures (wfrp + wod) com N/M distintos. Import ambas. Relatório: para cada tabela de conteúdo presente e para o número de ficheiros em uploads, antes = depois. Abrir A não mostra dados de B.

**Acceptance Scenarios**:

1. **Given** cópias de WFRP e WoD com contagens conhecidas, **When** ambas são importadas, **Then** cada relatório mostra igualdade antes/depois por tabela e por número de ficheiros.
2. **Given** as duas campanhas no mesmo `control.db`, **When** se lista conteúdo de cada slug, **Then** não há cruzamento de registos nem de imagens.
3. **Given** o relatório, **When** alguma contagem diverge, **Then** o import dessa campanha é tratado como falha (não se segue para o corte).

---

### User Story 3 - Ensaio obrigatório numa cópia, com relatório (Priority: P1)

Antes de qualquer corte, o operador **tem** de correr o import contra **cópias** das instâncias (não contra as pastas vivas como destino, e sem escrever na origem). O comando emite um **relatório de verificação** (contagens por tabela e de ficheiros, antes e depois). Só com relatório limpo nas duas mesas o runbook autoriza a janela de corte.

**Why this priority**: Constituição III e o brief: a mesa em produção não pode ser a primeira vítima.

**Independent Test**: Documentar/automatizar: copiar fixture → import → relatório PASS. Tentativa de usar a origem como destino recusada ou claramente fora do ensaio. Teste: origem intacta após ensaio.

**Acceptance Scenarios**:

1. **Given** cópias de trabalho das duas instâncias, **When** corre o ensaio, **Then** o relatório é gravado/impresso com antes e depois por tabela e por ficheiros, e o resultado é PASS só se forem iguais.
2. **Given** o ensaio, **When** termina, **Then** as pastas originais de produção (ou o fixture marcado como origem) não foram escritas.
3. **Given** relatório FAIL, **When** o runbook de corte é seguido, **Then** o corte MUST NOT ser o próximo passo.

---

### User Story 4 - Runbook de corte: snippets para colar, sem tocar no host (Priority: P1)

Na janela combinada com os jogadores, o operador **primeiro** publica e **verifica** o Campaign Codex em **campaign-codex.1nodado.com.br** (as instâncias antigas ainda podem estar a servir). Só depois dessa verificação **para** as instâncias antigas. O procedimento **imprime** trechos de **Caddy** e **Cloudflare Tunnel** prontos a colar (mesmo espírito da 078) e **não** edita Caddyfile, `config.yml` do tunnel, nem as pastas `/opt/codex-*`. **Não** há redireccionamento dos **domínios antigos** para o novo host.

**Why this priority**: Corte operacional sem o script corromper o proxy; 078 já ensinou este padrão.

**Independent Test**: Comando/docs de publicação do Codex imprime blocos Caddy + tunnel com o hostname novo; um teste garante que **não** escreve Caddyfile/hub/`codex-*`. Runbook afirma: sem 301/302 dos hosts antigos.

**Acceptance Scenarios**:

1. **Given** o runbook de corte, **When** o operador gera os snippets, **Then** vê blocos Caddy e Cloudflare Tunnel para `campaign-codex.1nodado.com.br` para colar à mão.
2. **Given** esses comandos, **When** se verifica o disco do host de proxy/instâncias antigas, **Then** Caddyfile, config de tunnel e pastas das instâncias antigas **não** foram editados pelo script.
3. **Given** jogadores com bookmarks nos **domínios antigos**, **When** o corte está feito, **Then** esses hosts **não** redireccionam para o Codex (ficam parados ou inactivos; o URL novo é comunicado à parte).
4. **Given** a janela de corte, **When** o operador segue o runbook, **Then** o Codex está publicado e verificado **antes** de parar as instâncias antigas (não há intervalo em que nenhum dos dois sirva por ter parado as antigas primeiro).

---

### User Story 5 - Retorno: instâncias antigas paradas e intactas (Priority: P1)

Durante **14 dias** após o corte, as instâncias antigas permanecem **paradas** e **intactas**. Se for preciso voltar atrás, o operador **religa** essas instâncias **sem as alterar**: voltam a servir como antes do corte. O Codex pode ser desligado; os dados antigos não dependem dele.

**Why this priority**: Critério-chave de reversibilidade; a WFRP em produção não pode ficar refém de um corte falhado.

**Independent Test**: Após import de teste, «ligar» a origem (servir o `mapa.db` original) ainda funciona; hashes/contagens da origem iguais às do pré-import. Runbook descreve: stop, não delete; religar; não aplicar git pull nas pastas antigas na janela.

**Acceptance Scenarios**:

1. **Given** corte feito e origem só parada, **When** o operador volta a subir a instância antiga **sem** modificar ficheiros, **Then** a mesa antiga abre com o mesmo conteúdo de antes do corte.
2. **Given** a janela de retorno, **When** se inspecciona `/opt/codex-*` (ou o root documentado), **Then** não houve `git pull` obrigatório nem reescrita de `mapa.db`/uploads pelo processo 099.
3. **Given** o fim dos **14 dias**, **When** o runbook fecha o retorno, **Then** está documentado o que fazer às pastas antigas (arquivar/desligar) — **sem** apagar durante a janela.

---

### User Story 6 - Aposentar o modelo multi-instância e actualizar docs (Priority: P2)

`nova-campanha.sh`, `migrar-wfrp.sh` e o **hub estático** deixam de ser o caminho para campanhas novas: os ficheiros **permanecem no git**, mas os scripts **avisam e recusam** o fluxo antigo (exit de erro). README, manuais e runbooks passam a apontar ao Campaign Codex (uma instância, `/`, `/painel`, `/c/<slug>`). Sem features novas de produto.

**Why this priority**: Evitar dois modelos de deploy vivos; o hub 078 fica histórico.

**Independent Test**: Docs do repo já não instruem a criar `codex-<nome>` nem a editar `hub/campanhas.json` como procedimento corrente. Correr `nova-campanha.sh` / `migrar-wfrp.sh` imprime aviso de aposentadoria e sai com erro (não cria instância).

**Acceptance Scenarios**:

1. **Given** README e runbooks actualizados, **When** um operador segue «como publicar», **Then** o caminho é Campaign Codex + snippets 099, não `nova-campanha.sh`. Os URLs de jogador das mesas migradas são `/c/wfrp` e `/c/wod` no host Codex.
2. **Given** `nova-campanha.sh` / `migrar-wfrp.sh`, **When** um operador os executa após o corte documentado, **Then** imprimem aviso de aposentadoria e **recusam** criar/migrar (MUST NOT ser o procedimento de campanha nova). O hub estático permanece no git mas a doc activa não o recomenda.
3. **Given** manuais de jogador/mestre, **When** mencionam URL, **Then** usam o host Codex e caminhos `/c/wfrp` e `/c/wod` — sem mandar redireccionar os domínios antigos.

---

### Edge Cases

- Origem sem `mapa.db` ou sem `uploads/`: recusa clara; sem campanha pela metade.
- Slug ocupado/reservado/inválido: recusa; origem intacta.
- Dono (email) inexistente: recusa (095); MUST exigir dono no import.
- Disco cheio a meio da cópia: rollback do sítio UUID e da linha de Campanha (como criar 093).
- URLs de imagem já no formato 096: reescrita idempotente (não corromper).
- `campaign-map.*` legado: stamp `mapa_arquivo` (096); `bytes_usados` reconciliado.
- Visibilidade: omissão `listada` (descoberta na home 098), salvo o operador indicar `so_link`.
- Ensaio vs corte: o mesmo import; o corte é **só** runbook (subir compose novo, colar snippets, **verificar** o Codex, **depois** parar instâncias antigas) — MUST NOT copiar por cima das pastas antigas nem parar as antigas antes do Codex estar no ar.
- Janela de retorno: **14 dias** após o corte; a **data de início** do corte combina-se com os jogadores, a duração da janela não.
- 097 zip: continua para backups portáteis; **não** é o import WFRP/WoD de produção (`mapa.db` de instância).
- Sem 301 dos hosts antigos mesmo que o DNS ainda aponte para o servidor.
- Cota no import legado: omissão **10×1024³** bytes (096). O CLI MAY receber `cota_bytes` maior. Se a soma dos ficheiros copiados exceder o tecto escolhido, recusa e rollback do destino; origem intacta.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST existir comando/script de super-admin para **importar instância legada** (WFRP e WoD): copiar `mapa.db` → `campanha.db` do sítio novo e copiar `uploads/` para a pasta de uploads desse sítio.
- **FR-002**: No **destino**, MUST correr a ponte `_migrate_sqlite` e o **carimbo** Alembic de conteúdo até à revisão corrente (093). MUST NOT correr ponte nem stamp **na origem**.
- **FR-003**: MUST reescrever referências de imagem no conteúdo importado para o endpoint de mídia do **slug novo** (096), preservando categoria e nome de ficheiro. MUST actualizar `mapa_arquivo` e `bytes_usados` (096).
- **FR-004**: MUST exigir slug livre (093), sistema da instância (wfrp4e / wod), e **dono** existente (email). MUST NOT alterar a origem. O runbook de corte das mesas de produção MUST usar os slugs **`wfrp`** e **`wod`** (o CLI continua a receber o parâmetro; não adivinha).
- **FR-005**: MUST emitir **relatório de verificação** com contagens **por tabela de conteúdo** e **número de ficheiros** de uploads, **antes** (origem) e **depois** (destino). PASS se forem idênticas; FAIL aborta o corte.
- **FR-006**: MUST existir ensaio obrigatório documentado **sobre cópias**. Testes automatizados com fixtures WFRP-like e WoD-like MUST demonstrar FR-005 e origem intacta.
- **FR-007**: Runbook de corte MUST: (1) publicar o Codex em `campaign-codex.1nodado.com.br`; (2) **imprimir** snippets Caddy e Cloudflare Tunnel para colar (078); (3) **verificar** o sítio novo; (4) **só então** parar as instâncias antigas. MUST NOT editar Caddyfile, config de tunnel, `hub/campanhas.json` nem `/opt/codex-*`. MUST NOT configurar redireccionamento dos domínios antigos. MUST NOT parar as antigas antes do Codex estar publicado e verificado.
- **FR-008**: Plano de retorno MUST manter instâncias antigas **paradas e intactas** durante **14 dias** após o corte. Depois disso o runbook fecha o retorno (arquivar/desligar; MUST NOT apagar durante a janela). Religar a instância antiga **sem alteração** MUST restaurar o serviço antigo.
- **FR-009**: MUST aposentar `scripts/nova-campanha.sh`, `scripts/migrar-wfrp.sh` e o hub estático como procedimento de campanhas novas: os ficheiros **ficam no git**; os dois scripts MUST imprimir aviso e **sair com erro** (não criar/migrar). MUST actualizar README, manuais e runbooks para o Codex (não recomendar scripts 078 nem hub JSON).
- **FR-010**: MUST NOT entregar features de produto novas (home, auth, mapa, relações, cota, zip) nesta fase — só migração, corte, docs e aposentadoria.
- **FR-011**: Isolamento: campanha importada de WFRP MUST NOT conter dados/ficheiros da WoD (e o inverso).
- **FR-012**: MUST NOT exigir alteração das pastas das instâncias antigas para o Codex funcionar; o critério de religar a antiga aplica-se **sem** as ter modificado.
- **FR-013**: O import legado MUST aplicar cota 096 no destino: omissão **10×1024³** bytes; o CLI MUST aceitar `cota_bytes` maior. MUST recusar e reverter o destino se a cópia exceder o tecto escolhido. Depois do import, avisos/bloqueio de upload seguem 096. MUST NOT exigir apagar ficheiros na origem para caber na omissão.

### Out of Scope

- Features novas de produto (qualquer capacidade que não seja importar legado, cortar, reverter ou documentar).
- Redireccionamento DNS/Caddy dos hosts antigos para o Codex.
- Editar automaticamente Caddyfile ou Cloudflare no host.
- Apagar `/opt/codex-*` durante a janela de retorno.
- Substituir este fluxo pelo zip 097 para as mesas de produção.
- UI de importar legado (CLI/script só).

### Key Entities

- **Instância legada**: pasta com `mapa.db` + `uploads/` (+ compose/.env); WFRP e WoD em produção.
- **Campanha Codex**: sítio UUID + `control.db`; dono 095; mídia 096.
- **Relatório de verificação**: antes/depois por tabela e por ficheiros; PASS/FAIL.
- **Snippets de corte**: Caddy + Cloudflare Tunnel para `campaign-codex.1nodado.com.br`, só stdout.
- **Janela de retorno**: instâncias antigas paradas e intactas durante **14 dias** após o corte.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos ensaios de teste (WFRP e WoD), as contagens por tabela de conteúdo e o número de ficheiros de imagem **antes** (origem) e **depois** (destino) são idênticos.
- **SC-002**: Após o import de teste, 100% dos bytes/ficheiros da origem marcada permanecem iguais; a origem pode ser «ligada» de novo e serve o conteúdo antigo.
- **SC-003**: O operador completa o ensaio das duas campanhas (cópia → import → relatório PASS) com o runbook, sem editar Caddyfile nem pastas `codex-*` de produção. No corte, o Codex está no ar **antes** das instâncias antigas pararem.
- **SC-004**: Na janela de retorno, religar uma instância antiga **sem** a alterar restaura o serviço antigo (verificado pelo menos numa das duas no ensaio).
- **SC-005**: Docs activas já não prescrevem `nova-campanha.sh` / hub JSON como forma de campanha nova; o host comunicado aos jogadores é o Codex com `/c/wfrp` e `/c/wod`, **sem** redirect dos URLs antigos.

## Assumptions

- Duas instâncias de produção: WFRP e WoD (pastas estilo `/opt/codex-*` ou as documentadas no runbook 078). Slug, sistema e dono são **parâmetros** do import (não adivinhados em silêncio). Para o corte de produção, slugs canónicos: **`wfrp`** e **`wod`**.
- Este import é **confiança de operador** (cópia de `mapa.db` que o Ricardo controla). Distinto do zip 097 (nunca abrir `.db` de utilizador na API).
- Visibilidade omissão `listada` para aparecer na home 098; operador MAY passar `so_link`.
- Reescrita de URLs: `/uploads/…` e `/uploads/c/…` → `/api/c/{slug}/media/…` (096); nomes de ficheiro iguais.
- Janela de retorno **14 dias** no runbook; a data de início do corte combina-se com os jogadores. Origem intacta durante toda a janela.
- Publicar Codex = um compose/deploy novo; snippets 078-like; colar à mão; verificar; **depois** parar as instâncias antigas.
- Aposentar scripts: **permanecem no git**; MUST recusar o fluxo antigo com aviso. README/runbook MUST NOT os recomendar.
- Sem schema novo além do que 093–098 já exigem no destino.
- Sem tradução de lore; manuais já bilingues actualizam o URL se existirem em en.
- Cota no import legado: omissão 10×1024³; `cota_bytes` opcional no CLI para mesas que já ultrapassem esse tecto.

## Notes

- Fixture de ensaio pode reutilizar o legado 093 + um segundo sistema (wod) mínimo.
- CHANGELOG: corte / depreciação do hub e scripts 078; bump SemVer major se o plano de produto 2.0 o exigir.
- Fim da série 092–099: após isto o Codex é o deploy de campanhas novas; 078 fica histórico.
