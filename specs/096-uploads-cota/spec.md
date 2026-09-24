# Feature Specification: Uploads com acesso controlado e cota por campanha

**Feature Branch**: `096-uploads-cota`

**Created**: 2026-09-20

**Status**: Implemented

**Input**: User description: "Uploads com acesso controlado e cota por campanha. Uploads em data/campanhas/<uuid>/uploads. Endpoint /api/c/{slug}/media/{categoria}/{arquivo}: dono ou co-mestre sempre acessa; retrato só é servido se existir NPC da campanha com esse retrato_url e visivel_para_todos; mapa e imagens de locais são públicos. O mapa passa a ter nome versionado guardado em Campanha.mapa_arquivo (remove a varredura de arquivo em has_map_image). Cabeçalhos de cache: imutável para públicos versionados, privado para controlados. Cota de 10 GB por campanha com contador bytes_usados, reconciliação por varredura, aviso em 90% e bloqueio de novos uploads em 100%. O frontend passa a usar as URLs do endpoint. Fora de escopo: exportar/importar, otimização de entrega via proxy. Depende de: 095. Critério-chave: retrato de personagem oculto retorna 404 para anônimo e 200 para o dono; upload acima da cota é recusado com erro estruturado."

**Depends on**: [095-contas-sessao-permissoes](../095-contas-sessao-permissoes/spec.md) (Implemented); [094-roteamento-campanha](../094-roteamento-campanha/spec.md) (Implemented); [093-controle-alembic-sqlite](../093-controle-alembic-sqlite/spec.md) (Implemented); visibilidade de personagem ([084-personagem-visibility](../084-personagem-visibility/spec.md)); Campaign Codex brief ([docs/v2/product-brief-campaign-codex.md](../../docs/v2/product-brief-campaign-codex.md) fase 096); constituição v1.0.0 (I, II, III, IV, V, VI)

## Constitution

- Isolamento (I): a superfície nova de mídia (`/api/c/{slug}/media/…`) MUST entrar na matriz A/B: pedido sob o slug A MUST NOT devolver ficheiro da campanha B (anónimo e membro). A autorização de retrato MUST consultar só personagens **dessa** campanha. Sem `campanha_id` nas tabelas de conteúdo.
- Testes primeiro (II): ACL de mídia (retrato oculto / público / membro / anónimo), recusa de cota e reconciliação MUST ter testes a falhar **antes** da implementação correspondente. A matriz de isolamento da 094 MUST ser actualizada do caminho antigo de uploads estáticos para o endpoint de mídia.
- Produção legada (III): MUST NOT exigir alteração das instâncias WFRP/WoD nem `git pull` em `/opt/codex-*` até 099.
- Simplicidade (IV): reutilizar o sítio de uploads por UUID da 093, a sessão/membership da 095 e os campos `mapa_arquivo` / `cota_bytes` / `bytes_usados` já no registo Campanha. Sem CDN, proxy de mídia, nem serviço de object storage.
- i18n (V): aviso de cota, recusa de cota e copy nova de armazenamento MUST ter chaves pt-BR e en. Erros de API MUST usar códigos mapeáveis. Lore do mestre não é traduzido.
- Migrações (VI): N/A se esta fase só **passar a usar** colunas já criadas na 093. Qualquer coluna ou tabela nova MUST ser revisão Alembic (`render_as_batch`).

## Clarifications

### Session 2026-09-20

- Q: Compatibilidade com mídia da 094 (`campaign-map.*` e URLs `/uploads/c/…`) → A: Ponte única de mapa (gravar `mapa_arquivo` a partir de `campaign-map.*`) + API/cliente só expõem URLs de mídia (referências antigas reescritas na leitura); `/uploads` continua 404
- Q: Retrato já visto pelo jogador depois de ocultar o personagem → A: Cache privada sem guardar (`private, no-store`); o pedido seguinte vai sempre ao servidor
- Q: Onde o mestre vê o aviso aos 90% da cota → A: Só no fluxo de upload (resposta estruturada + mensagem na UI do slot); sem banner permanente na mesa
- Q: Substituir o mapa quando a cota já está cheia → A: Aceitar se o uso líquido (novo − anterior) não ultrapassar o teto

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Retrato oculto não vaza ao jogador; o mestre continua a vê-lo (Priority: P1)

Um jogador (sem conta) abre a mesa pelo slug. Personagens marcados como visíveis para todos mostram o retrato. Um personagem **oculto** não aparece nas vistas de jogador (084) **e** o ficheiro do retrato também não é obtido se alguém souber ou adivinhar o endereço: a resposta é a mesma que «ficheiro inexistente». O dono (e o co-mestre, membro da campanha) obtém o retrato com a sessão, para continuar a editar e a ver a rede em modo mestre.

**Why this priority**: Critério-chave de privacidade; hoje os uploads sob o slug são públicos e um URL de retrato fura o ocultamento da 084.

**Independent Test**: Campanha com um personagem oculto (retrato no disco + `retrato_url` + não visível para todos) e um visível. Pedido anónimo ao retrato oculto → não encontrado; pedido do dono autenticado → sucesso; retrato do visível → sucesso anónimo. Membro de outra campanha tratado como anónimo.

**Acceptance Scenarios**:

1. **Given** um personagem da campanha A com retrato, **não** visível para todos, **When** um anónimo pede esse ficheiro no endpoint de mídia de A, **Then** recebe **não encontrado** (404 opaco; sem o ficheiro).
2. **Given** o mesmo personagem, **When** o **dono** (sessão de membro da campanha A) pede o mesmo ficheiro, **Then** recebe o retrato (200).
3. **Given** um personagem da mesma campanha **visível para todos** com retrato, **When** um anónimo pede esse ficheiro, **Then** recebe o retrato (200).
4. **Given** um co-mestre (membro activo) de A, **When** pede o retrato do personagem oculto de A, **Then** recebe o retrato (mesmo tratamento que o dono).
5. **Given** um mestre membro só de B, **When** pede o retrato oculto (ou qualquer ficheiro) sob o slug A, **Then** não obtém o ficheiro de A (não encontrado / recusa; sem fuga).

---

### User Story 2 - Mapa e imagens de locais continuam públicos; o mapa deixa de ser adivinhado por varredura (Priority: P1)

Jogadores continuam a ver o mapa da mesa e as imagens dos locais sem login. O nome do ficheiro de mapa passa a ser **versionado** e fica registado em `Campanha.mapa_arquivo`. A indicação «há mapa» deixa de vasculhar a pasta à procura de `campaign-map.*`: lê o nome guardado. O cliente usa o endereço de mídia (não o caminho estático antigo).

**Why this priority**: Sem mapa público a mesa quebra; sem nome guardado o cliente e a config continuam a varrer o disco e a URL antiga fura a ACL.

**Independent Test**: Upload de mapa → `mapa_arquivo` preenchido com nome versionado; config `has_map_image` verdadeiro **sem** existir `campaign-map.*`. Leftover 094 (`campaign-map.*` + campo vazio) → stamp único e mapa visível. Anónimo obtém mapa e imagem de local; pedido sob slug B não obtém os ficheiros de A. Caminho antigo `/uploads/c/{slug}/…` não serve; listagens devolvem URLs de mídia mesmo se a base ainda tiver `/uploads/c/…`.

**Acceptance Scenarios**:

1. **Given** a campanha A com mapa carregado, **When** um anónimo pede o ficheiro de mapa no endpoint de mídia de A, **Then** recebe a imagem.
2. **Given** um local de A com imagem, **When** um anónimo pede essa imagem no endpoint de mídia de A, **Then** recebe a imagem.
3. **Given** um mapa novo enviado pelo mestre, **When** o upload conclui, **Then** `Campanha.mapa_arquivo` guarda o nome versionado desse ficheiro e a config da mesa indica que há mapa **a partir desse campo** (não por listar a pasta).
4. **Given** `mapa_arquivo` vazio, **When** se pede a config da mesa, **Then** indica que não há mapa — mesmo que existam ficheiros órfãos na pasta `map/`.
5. **Given** o cliente da mesa A, **When** mostra mapa, retratos e imagens de locais, **Then** os endereços pedidos são os do endpoint de mídia `/api/c/{slug}/media/{categoria}/{arquivo}` (não `/uploads/c/…`).
6. **Given** uma campanha da 094 com `campaign-map.*` no disco e `mapa_arquivo` vazio, **When** se lê a config ou se serve a mesa, **Then** `mapa_arquivo` fica preenchido com esse nome (ponte única) e o jogador vê o mapa pelo endpoint de mídia.

---

### User Story 3 - Cota de 10 GB: aviso aos 90% e recusa aos 100% (Priority: P1)

Cada campanha tem teto de **10 GB** de mídia. O sistema mantém um contador `bytes_usados`. Aos **90%** o mestre vê um aviso **no fluxo de upload** (ainda pode carregar). Aos **100%** um ficheiro **adicional** é recusado com erro estruturado (código mapeável; UI em pt-BR e en); substituir o mapa MUST ser aceite se o uso **líquido** não ultrapassar o teto. Nada do ficheiro recusado fica gravado; o contador não sobe. Uma varredura da pasta de uploads da campanha pode reconciliar o contador com o disco.

**Why this priority**: Critério-chave de cota; sem teto uma mesa enche o disco da instância.

**Independent Test**: Campanha com contador e teto conhecidos (em teste, teto pequeno). Upload que cabe → sucesso e contador sobe. Upload que ultrapassaria → recusa estruturada, disco e contador inalterados. Uso ≥ 90% e ainda abaixo de 100% → aviso no slot/resposta de upload, ficheiro aceite. Campanha no teto + ficheiro adicional → recusa; substituição de mapa com uso líquido ≤ teto → aceite. Varredura → `bytes_usados` igual à soma dos ficheiros da pasta dessa campanha.

**Acceptance Scenarios**:

1. **Given** uma campanha abaixo da cota, **When** o mestre envia um ficheiro que cabe no teto, **Then** o ficheiro é gravado na pasta de uploads **dessa** campanha (`data/campanhas/<uuid>/uploads/…`) e `bytes_usados` aumenta pelo tamanho gravado.
2. **Given** uma campanha em que o uso **resultante** (retrato/local: actual + novo; mapa: actual − anterior + novo) **excede** `cota_bytes`, **When** o mestre tenta o upload, **Then** a operação é recusada com erro estruturado (código mapeável, não uma frase num único idioma); o ficheiro **não** é gravado; `bytes_usados` **não** muda.
3. **Given** uso ≥ 90% e ainda abaixo de 100% (e o ficheiro novo ainda cabe), **When** o mestre conclui um upload, **Then** a resposta e a UI do slot mostram aviso de cota quase cheia (pt-BR e en) e o ficheiro **é** aceite. MUST NOT haver banner permanente na mesa só por causa da cota.
4. **Given** `bytes_usados` desencontrado do disco (ficheiro apagado à mão, órfão, falha a meio), **When** corre a reconciliação por varredura dessa campanha, **Then** `bytes_usados` passa a ser a soma dos tamanhos reais na pasta de uploads dessa campanha (não da pasta de outra mesa).
5. **Given** a campanha já em 100%, **When** o mestre tenta um **novo** ficheiro adicional (retrato ou local, ou mapa sem ficheiro anterior a remover), **Then** é recusado (mesmo erro de cota); nada é gravado.
6. **Given** a campanha já em 100% com um mapa cujo ficheiro anterior tem tamanho S, **When** o mestre envia um mapa novo de tamanho ≤ S, **Then** a substituição é aceite, o ficheiro anterior é removido, `mapa_arquivo` aponta ao nome versionado novo e `bytes_usados` reflecte o uso líquido (não excede o teto).
7. **Given** a campanha já em 100% com mapa de tamanho S, **When** o mestre envia um mapa novo maior que S (uso líquido excederia o teto), **Then** a substituição é recusada com o mesmo erro de cota; o mapa anterior permanece.

---

### User Story 4 - Cache público só no que é público; retratos não ficam em cache partilhada (Priority: P2)

Mapa e imagens de locais (públicos, nomes únicos/versionados) podem ser guardados de forma **imutável** por quem entrega a página (browser). Retratos (acesso controlado: a visibilidade pode mudar) MUST ser **privados e não guardados** em cache HTTP (`private, no-store`) — o pedido seguinte vai sempre ao servidor, para um jogador que já viu o retrato não o continuar a ver depois de o mestre ocultar o personagem.

**Why this priority**: Sem isto, um retrato público hoje pode vazar amanhã mesmo com ACL correcta no pedido seguinte.

**Independent Test**: Resposta de mapa/local inclui política de cache pública imutável; resposta de retrato inclui `private, no-store`. Depois de ocultar um personagem que era visível, o pedido anónimo seguinte a esse ficheiro é não encontrado (o browser não reutiliza uma cópia guardada).

**Acceptance Scenarios**:

1. **Given** um mapa ou imagem de local servido com sucesso, **When** se inspecciona a resposta, **Then** a política de cache é pública e imutável (ficheiro versionado).
2. **Given** um retrato servido (anónimo ou membro), **When** se inspecciona a resposta, **Then** a política de cache é privada **sem armazenar** (`private, no-store`).
3. **Given** um personagem visível cujo retrato já foi pedido, **When** o mestre o passa a oculto, **Then** o pedido anónimo seguinte a esse ficheiro é não encontrado (sem cópia HTTP reutilizável no cliente).

---

### Edge Cases

- Slug desconhecido ou campanha inactiva: o endpoint de mídia responde **não encontrado** opaco (mesmo padrão da 094); sem vazar se o ficheiro existiria.
- Categoria inválida, path com `..`, ou ficheiro fora da pasta da campanha: não encontrado / recusa; MUST NOT sair do sítio dessa campanha.
- Retrato no disco **sem** nenhum personagem da **mesma** campanha a referenciá-lo: anónimo → não encontrado; membro da campanha → 200 (dono/co-mestre sempre acede).
- Retrato referenciado só por personagem oculto: anónimo → não encontrado; membro → 200.
- Retrato referenciado por um personagem oculto **e** por outro visível da mesma campanha: anónimo → 200 (existe pelo menos um visível com esse `retrato_url`).
- O mesmo nome de ficheiro noutra campanha **não** autoriza o pedido: a regra usa só os personagens do slug do pedido.
- Membro de outra campanha = anónimo para mídia controlada desta.
- Jogador não tem conta; «anónimo» é a vista jogador.
- `mapa_arquivo` vazio **e** existe leftover `campaign-map.*` no sítio dessa campanha: ponte **única** — persistir esse nome em `mapa_arquivo` e deixar de varrer. Se existirem várias extensões, usar a mesma ordem de preferência que a 093/094 já usava (ex. webp, jpg, jpeg, png, gif) e gravar só uma.
- `mapa_arquivo` preenchido mas o ficheiro foi apagado: config pode ainda indicar mapa; o GET de mídia é não encontrado até o mestre voltar a carregar. Sem nova varredura.
- Respostas de API (personagem, local, upload, config) cuja referência ainda seja `/uploads/c/{slug}/…`: MUST devolver o equivalente no endpoint de mídia **na leitura** (sem exigir UPDATE em massa na base). `/uploads` continua 404.
- Ficheiros órfãos (retratos/locais substituídos, mapa antigo se não for apagado na substituição) **contam** para a cota; esta fase MUST NOT fazer garbage-collection automática de órfãos (a reconciliação só actualiza o contador).
- Substituição de mapa: grava nome versionado novo, actualiza `mapa_arquivo`, remove o ficheiro anterior de mapa (se existir) e ajusta `bytes_usados`. MUST ser aceite sse o uso **líquido** (tamanho novo − tamanho do ficheiro apontado por `mapa_arquivo`, ou só o novo se não houver anterior) **não** ultrapassar `cota_bytes`. Retrato e local nesta fase **não** apagam o ficheiro anterior na troca (órfãos contam; GC fora de escopo).
- Caminho estático antigo `/uploads/c/{slug}/…` (e `/uploads/…` sem slug): MUST NOT servir mídia de campanha (404). Caso contrário a ACL é contornável.
- Cota: o teto por omissão é 10 GB (`cota_bytes` da 093). Alterar o teto por campanha na UI/CLI **não** entra nesta fase.
- Upload recusado por tipo/tamanho de ficheiro (regras já existentes) continua a recusar **antes** de gravar; não incrementa cota.
- Instâncias `/opt/codex-*` intocadas (III). Exportar/importar zip (097) e acelerar entrega via proxy/CDN: fora de escopo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Os ficheiros de mídia de cada campanha MUST viver no sítio já definido na 093: `data/campanhas/<uuid>/uploads/` (subpastas de categoria: mapa, retratos, locais). MUST NOT gravar mídia de A na pasta de B.
- **FR-002**: A leitura de mídia MUST ser feita por `GET /api/c/{slug}/media/{categoria}/{arquivo}`. O cliente (mapa, retratos, imagens de locais, URLs devolvidas no upload e campos `retrato_url` / imagem de local) MUST usar esse contrato. MUST NOT depender de `/uploads/c/{slug}/…` nem de `/uploads/…` global.
- **FR-002a**: `GET /uploads/c/{slug}/…` e `GET /uploads/…` (sem o prefixo de campanha) MUST responder 404 e MUST NOT servir ficheiros da pasta da campanha.
- **FR-002b**: Nas respostas de API, referências ainda guardadas como `/uploads/c/{slug}/…` MUST ser **reescritas na leitura** para o endpoint de mídia (mesmo slug, categoria e ficheiro). Uploads novos MUST gravar já o path de mídia. MUST NOT haver migração em massa obrigatória das linhas na base nesta fase.
- **FR-003**: Dono ou co-mestre (**membro activo** da campanha do slug, sessão da 095) MUST obter qualquer ficheiro existente dessa campanha nas categorias suportadas, incluindo retratos de personagens ocultos e ficheiros ainda não referenciados por um personagem.
- **FR-004**: Pedido **sem** membership da campanha (anónimo ou mestre de outra mesa) a um **retrato** MUST suceder **só** se existir pelo menos um personagem **dessa** campanha cujo `retrato_url` aponte para esse ficheiro **e** que esteja `visivel_para_todos`. Caso contrário MUST ser **não encontrado** (404 opaco — mesmo código que ficheiro inexistente; MUST NOT revelar que o ficheiro existe).
- **FR-005**: Mapa e imagens de locais MUST ser públicos no endpoint de mídia do slug (anónimo 200 se o ficheiro existe nessa campanha). Pedido sob o slug B MUST NOT ler a pasta de A.
- **FR-006**: Upload de mapa MUST gravar um **nome versionado** (único por envio) e persistir esse nome em `Campanha.mapa_arquivo`. MUST remover o ficheiro de mapa anteriormente apontado por `mapa_arquivo` (se houver). `has_map_image` (config da mesa) MUST ser verdadeiro sse `mapa_arquivo` não está vazio — MUST NOT varrer a pasta em cada leitura **depois** do campo estar definido.
- **FR-006b**: Se `mapa_arquivo` está vazio e existe leftover `campaign-map.*` na pasta de mapa **dessa** campanha, MUST persistir esse nome em `mapa_arquivo` **uma vez** (ponte 094). Depois MUST seguir só o campo. MUST NOT manter varredura contínua nem fallback silencioso em cada `has_map_image`.
- **FR-006a**: A config da mesa MUST expor o que o cliente precisa para pedir o mapa no endpoint de mídia (indicação de presença + nome ou URL do ficheiro corrente), sem o cliente adivinhar o nome.
- **FR-007**: Respostas de mapa e de imagens de locais servidas com sucesso MUST usar cache **pública imutável**. Respostas de retrato (mesmo quando públicas por visibilidade) MUST usar cache **privada sem guardar** (`private, no-store`) — MUST NOT permitir reutilizar o ficheiro sem novo pedido ao servidor.
- **FR-008**: Cada campanha MUST ter teto `cota_bytes` (omissão **10 GB**, campo da 093). `bytes_usados` MUST subir pelo tamanho gravado em upload aceite e MUST descer pelo tamanho removido na substituição de mapa.
- **FR-009**: Se o uso **resultante** ultrapassaria `cota_bytes`, o upload MUST ser recusado com **erro estruturado** (código mapeável, p.ex. cota excedida) **antes** de gravar. Para mapa, o uso resultante MUST ser `bytes_usados - tamanho_do_mapa_anterior + tamanho_novo` (tamanho anterior = 0 se `mapa_arquivo` vazio ou ficheiro em falta). Para retrato e local, o uso resultante MUST ser `bytes_usados + tamanho_novo` (sem descontar órfãos). Substituição de mapa cujo uso resultante **não** exceda o teto MUST ser aceite mesmo que `bytes_usados` já esteja a 100%.
- **FR-010**: Quando, após um upload aceite, `bytes_usados` ≥ 90% de `cota_bytes` e o teto ainda não bloqueia, a **resposta de upload** MUST incluir indicação de aviso (código/flag mapeável + uso/teto) e a UI do slot MUST mostrar a copy de cota quase cheia (pt-BR e en). Jogadores MUST NOT ver cota nem aviso. A config pública MUST NOT incluir `bytes_usados` / `cota_bytes`. MUST NOT haver banner permanente de cota no mapa ou nas relações nesta fase (painel 098).
- **FR-011**: MUST existir reconciliação por **varredura** da pasta de uploads da campanha: soma dos tamanhos no disco dessa pasta → actualiza `bytes_usados`. MUST NOT somar ficheiros de outra campanha. A reconciliação MUST estar disponível ao operador (CLI de super-admin).
- **FR-012**: Upload continua a exigir membership da campanha (095); anónimo MUST NÃO gravar. URLs devolvidas no upload MUST ser as do endpoint de mídia (FR-002).
- **FR-013**: Copy nova (aviso de cota, recusa de cota, textos de armazenamento) MUST existir em pt-BR e en. Erros de API MUST usar códigos mapeáveis a chaves.
- **FR-014**: MUST existir testes automatizados do critério-chave: retrato oculto → 404 anónimo e 200 dono; upload que excederia a cota → recusa estruturada, sem gravar. MUST actualizar a matriz de isolamento (094) para o endpoint de mídia.
- **FR-015**: MUST NOT introduzir exportar/importar, painel de cota na home, banner permanente de cota na mesa, alteração de teto na UI, garbage-collection de órfãos, nem camada de proxy/CDN para acelerar entrega.
- **FR-016**: MUST NOT exigir alteração das instâncias legadas.

### Out of Scope

- Exportar / importar zip ou pacote de campanha (097).
- Otimização de entrega (proxy, CDN, thumbnails, transcoding).
- Garbage-collection automática de retratos/locais não referenciados.
- Alterar `cota_bytes` por campanha na UI ou CLI (o campo existe; o teto desta fase é o default 10 GB).
- Contas de jogador; audiências intermédias de retrato («só alguns jogadores»).
- Página inicial / painel de armazenamento na home (098); banner permanente de cota no mapa/relações.
- Corte das instâncias legadas (099).

### Key Entities

- **Campanha** (093): `mapa_arquivo` (nome versionado do mapa corrente, vazio = sem mapa), `cota_bytes` (teto; omissão 10 GB), `bytes_usados` (contador; corrigível por varredura).
- **Sítio de uploads**: pasta por UUID da campanha; categorias mapa / retratos / locais; nunca identificada pelo slug no disco.
- **Pedido de mídia**: slug + categoria + nome de ficheiro; autorização depende da categoria e, em retratos, dos personagens **dessa** campanha.
- **Personagem**: `retrato_url` + `visivel_para_todos` (084) — a porta pública do ficheiro de retrato.
- **Membro** (095): dono ou co-mestre activo; passa sempre na ACL de mídia da sua campanha.
- **Cota**: teto, uso, limiar de aviso (90%), bloqueio (não caber / 100%).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos casos de teste, um retrato de personagem oculto **não** é obtido por anónimo (equivalente a ficheiro inexistente) e **é** obtido pelo dono autenticado da campanha.
- **SC-002**: Em 100% dos uploads em que o uso **resultante** ultrapassaria o teto da campanha, a operação é recusada com erro estruturado; 0 bytes desse ficheiro ficam no disco; o contador de uso não aumenta. Substituição de mapa com uso líquido dentro do teto sucede mesmo com a campanha já no limite.
- **SC-003**: 100% dos pedidos de mídia sob o slug A devolvem 0 ficheiros que só existem na campanha B (anónimo e membro).
- **SC-004**: Após um upload de mapa, a mesa indica «há mapa» e o jogador vê o mapa a partir do nome guardado na campanha — **sem** o sistema vasculhar a pasta à procura de um nome fixo.
- **SC-005**: 100% das imagens de mapa, local e retrato pedidas pelo cliente da mesa usam o endereço de mídia por campanha (0 dependência do caminho estático antigo).
- **SC-006**: Com uso entre 90% e 100% (ainda com folga para um ficheiro pequeno), o mestre vê o aviso de cota **no fluxo de upload** no idioma da UI (pt-BR e en) e consegue concluir um upload que ainda cabe.
- **SC-007**: Após reconciliação, o valor de uso coincide com a soma dos ficheiros na pasta de uploads **dessa** campanha (verificado em teste com desvio introduzido de propósito).

## Assumptions

- Membership da 095 está disponível: `require_membro` (qualquer membro activo = dono ou co-mestre) é a guarda de upload e o «sempre acede» de FR-003. Sem UI extra de co-mestre (095).
- Jogadores continuam sem conta; pedido sem cookie de membro da campanha = anónimo para ACL de retrato.
- 404 opaco para retrato recusado evita enumerar ficheiros ocultos (alinhado à 094 para slug inactivo).
- Ponte 094: stamp único de `mapa_arquivo` a partir de leftover `campaign-map.*`; reescrita de URLs `/uploads/c/…` **só na leitura** da API. Produção nas pastas `/opt/codex-*` continua 099. `/uploads` não redirecciona — 404.
- Nomes versionados: mapa no upload desta fase; retratos e locais já nascem com nome único (omissão actual) — isso basta para cache imutável pública nessas categorias públicas.
- Substituição de mapa apaga o ficheiro anterior e MUST ser aceite quando o uso líquido não ultrapassa o teto (incluindo campanha já a 100% se o novo ficheiro não for maior que o anterior). Retratos e locais substituídos podem deixar órfãos (contam até reconciliação/limpeza manual; GC fora de escopo).
- Reconciliação = comando CLI de super-admin (sem UI). Upload/delete da app mantém o contador no caminho feliz; a varredura corrige deriva.
- Limiar de aviso = 90% inclusive (`bytes_usados * 100 / cota_bytes` ≥ 90), avaliado **após** o upload aceite. Superfície de aviso = resposta de upload + mensagem no slot; não a config pública nem banner na mesa.
- Recusa de cota usa o mesmo formato de erro da API (código + detalhes numéricos de uso/teto); a UI mapeia o código.
- Teto 10 GB = 10 × 1024³, já default da 093. Testes MAY usar `cota_bytes` reduzido na campanha de teste.
- Sem dependência de produto nova (sem S3, sem CDN). Cabeçalhos de cache são da própria app: mapa/locais públicos imutáveis; retratos `private, no-store`.
- Produção Campaign Codex desta fase continua no repositório; `/opt/codex-*` intocado.

## Notes

- Actualizar harness/docs: matriz 094 de GET de ficheiro aponta ao endpoint de mídia; README deixa de documentar `/uploads/c/{slug}` como leitura pública.
- CHANGELOG `[Unreleased]` na implementação; bump SemVer só se o plano da fase o exigir.
- Próximas fases: 097 (exportar/importar — mídia via no zip, fora desta spec), 098 (home/painel; cota MAY aparecer no painel depois).
