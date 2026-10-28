# Contratos da API

Rotas, contratos, esquemas e códigos de erro da API do Codex da Campanha (versão 1.6.0). A API é **JSON sobre HTTP** e fica sob `/api`.

- **Fonte normativa:** o OpenAPI em execução (`/api/openapi.json`, interface em `/api/docs`). Esta página é o inventário legível para revisão humana, gerado a partir de `app.main:app`.
- **Visão geral da aplicação:** [`README.md`](../README.md).

## Sumário

1. [Convenções](#convenções)
2. [Rotas](#rotas)
3. [Contratos principais](#contratos-principais)
4. [Catálogo de códigos de erro](#catálogo-de-códigos-de-erro)
5. [Esquemas](#esquemas-campos-de-cada-contrato)

## Convenções

- **Identificador da campanha:** `{slug}` aceita o **slug** (`wfrp`) ou o **id numérico** (`1`). O endereço canônico do frontend é `/c/{id}/{slug}/…`.
- **Autenticação:** cookie de sessão `codex_session`, criado por `POST /api/auth/login` (ou ao aceitar um convite). Sem cookie válido, as rotas protegidas respondem `401 AUTENTICACAO_NECESSARIA`.
- **Níveis de acesso** (coluna *Acesso*): **Público**, **Público (respeita a visibilidade)**, **Sessão** (qualquer conta ativa), **Membro da campanha**, **Dono da campanha** e **Admin da plataforma**. Falta de papel responde `403` (`NAO_MEMBRO`, `NAO_DONO`, `NAO_ADMINISTRADOR`).
- **Erros estruturados:** `{"detail": {"erro": "CODIGO", "detalhes": {…}}}`; `detalhes` é opcional. O frontend traduz o código; o catálogo de códigos está abaixo. Erros de validação do corpo (`422`) seguem o formato padrão do FastAPI.
- **Limite de taxa:** `429` com `LIMITE_PEDIDOS` (geral), `LIMITE_REGISTO` (registo) ou `LIMITE_CONTATO_DIARIO` (teto diário do contato).
- **Respostas genéricas:** `POST /api/auth/registo` e `POST /api/auth/reset/pedir` devolvem sempre `202 {"ok": true}`, para não revelar se um e-mail tem conta.
- **Uploads e mídia:** `POST …/admin/uploads` (multipart) valida tipo, tamanho e cota; a mídia é servida por `GET /api/c/{slug}/media/{categoria}/{arquivo}`. Os caminhos antigos `/uploads/…` respondem `410 Gone`.

## Rotas

Total: **121 operações**. Em *Rota*, as áreas de campanha omitem o prefixo (`/api/c/{slug}` ou `/api/c/{slug}/admin`). *Consulta* lista os parâmetros de query (`*` = obrigatório). *Corpo → Resposta* mostra o esquema do corpo e o status/esquema da resposta de sucesso.

### 1. Autenticação, registo e recuperação de senha (`/api/auth`)

| Método | Rota | Acesso | Limite | Descrição | Consulta (query) | Corpo → Resposta |
|---|---|---|---|---|---|---|
| POST | `/api/auth/convite/aceitar` | Público | — | Define a senha a partir de um convite ou link de verificação e inicia a sessão | — | TokenPasswordBody → 200 objeto |
| POST | `/api/auth/login` | Público | — | Inicia a sessão (cookie HttpOnly) | — | LoginBody → 200 objeto |
| POST | `/api/auth/logout` | Público | — | Encerra a sessão e apaga o cookie | — | 204 |
| GET | `/api/auth/me` | Sessão | — | Dados da conta autenticada | — | 200 objeto |
| POST | `/api/auth/registo` | Público | 5/h | Pede a criação de conta (resposta sempre igual; e-mail de verificação em background) | — | RegistoBody → 202 objeto |
| GET | `/api/auth/registo/config` | Público | — | Modo do registo (aberto/fechado) e chave pública do Turnstile | — | 200 objeto |
| GET | `/api/auth/reset/config` | Público | — | Disponibilidade da recuperação e chave pública do Turnstile | — | 200 objeto |
| POST | `/api/auth/reset/confirmar` | Público | — | Redefine a senha com o link de reset e revoga as sessões | — | TokenPasswordBody → 200 objeto |
| POST | `/api/auth/reset/pedir` | Público | 5/h | Pede a recuperação de senha (resposta sempre igual; só contas ativas recebem o link) | — | ResetPedidoBody → 202 objeto |

### 2. Contato público (`/api/contato`)

| Método | Rota | Acesso | Limite | Descrição | Consulta (query) | Corpo → Resposta |
|---|---|---|---|---|---|---|
| POST | `/api/contato` | Público | 5/h | Envia a mensagem de contato por e-mail ao administrador | — | ContatoBody → 202 objeto |
| GET | `/api/contato/config` | Público | — | Disponibilidade do contato e chave pública do Turnstile | — | 200 objeto |

### 3. Campanhas do usuário e catálogo (`/api/campanhas`)

| Método | Rota | Acesso | Limite | Descrição | Consulta (query) | Corpo → Resposta |
|---|---|---|---|---|---|---|
| POST | `/api/campanhas` | Sessão | — | Cria uma campanha (cota padrão 300 MB) | — | CriarCampanhaRequest → 201 CriarCampanhaResponse |
| GET | `/api/campanhas/catalogo` | Público | — | Catálogo público de campanhas listadas | — | 200 CatalogoResponse |
| POST | `/api/campanhas/import` | Sessão | — | Importa um pacote ZIP exportado | — | Body_import_campaign_api_campanhas_import_post → 201 objeto |
| GET | `/api/campanhas/minhas` | Sessão | — | Campanhas do usuário autenticado | — | 200 MinhasResponse |
| PATCH | `/api/campanhas/{slug}/indexacao` | Dono da campanha | — | Liga ou desliga a indexação da campanha | — | IndexacaoRequest → 200 IndexacaoResponse |
| PATCH | `/api/campanhas/{slug}/capa` | Dono da campanha | — | Define ou limpa a capa | — | CapaRequest → 200 CapaResponse |
| PATCH | `/api/campanhas/{slug}/modulos` | Dono da campanha | — | Liga ou desliga um módulo (ex.: fadiga, IA) | — | ModuloToggleRequest → 200 ModuloToggleResponse |
| PATCH | `/api/campanhas/{slug}/unidade-distancia` | Dono da campanha | — | Altera a unidade de distância do mapa | — | UnidadeDistanciaRequest → 200 UnidadeDistanciaResponse |
| PATCH | `/api/campanhas/{slug}/visibilidade` | Dono da campanha | — | Altera a visibilidade (listada / só com link) | — | VisibilidadeRequest → 200 VisibilidadeResponse |

### Sitemap (raiz do site)

| Método | Rota | Acesso | Limite | Descrição | Consulta (query) | Corpo → Resposta |
|---|---|---|---|---|---|---|
| GET | `/sitemap.xml` | Público | — | Páginas institucionais e campanhas indexáveis | — | 200 application/xml |

### 4. Administração da plataforma (`/api/admin`)

| Método | Rota | Acesso | Limite | Descrição | Consulta (query) | Corpo → Resposta |
|---|---|---|---|---|---|---|
| GET | `/api/admin/campanhas` | Admin da plataforma | — | Lista campanhas da plataforma (filtros: q, estado) | `q`, `estado` | 200 AdminCampaignsResponse |
| DELETE | `/api/admin/campanhas/{campaign_id}` | Admin da plataforma | — | Remove a campanha (exclusão recuperável) | — | 204 |
| PATCH | `/api/admin/campanhas/{campaign_id}/estado` | Admin da plataforma | — | Ativa ou desativa a campanha | — | CampaignStateRequest → 200 objeto |
| PATCH | `/api/admin/campanhas/{campaign_id}/proprietario` | Admin da plataforma | — | Troca o dono da campanha | — | CampaignOwnerRequest → 200 objeto |
| POST | `/api/admin/convites` | Admin da plataforma | 30/min | Cria um usuário pendente e o convite (link; opcionalmente enviado por e-mail) | — | CriarConviteRequest → 201 CriarConviteResponse |
| GET | `/api/admin/convites/config` | Admin da plataforma | — | Indica se o convite pode ser enviado por e-mail | — | 200 objeto |
| GET | `/api/admin/usuarios` | Admin da plataforma | — | Lista usuários (filtros: e-mail, estado) | `email`, `estado` | 200 AdminUsersResponse |
| DELETE | `/api/admin/usuarios/{user_id}` | Admin da plataforma | — | Remove o usuário (recusa se for dono de campanhas ou o último admin) | — | 204 |
| PATCH | `/api/admin/usuarios/{user_id}/estado` | Admin da plataforma | — | Ativa ou desativa o usuário (revoga sessões ao desativar) | — | UserStateRequest → 200 objeto |
| POST | `/api/admin/usuarios/{user_id}/reset` | Admin da plataforma | — | Gera um link de reset de senha (72 h) | — | 201 ResetLinkResponse |

### 5. Campanha — leitura (`/api/c/{slug}`)

| Método | Rota | Acesso | Limite | Descrição | Consulta (query) | Corpo → Resposta |
|---|---|---|---|---|---|---|
| GET | `/arcos` | Público (respeita a visibilidade) | — | Lista arcos visíveis | — | 200 [ArcoRead] |
| GET | `/arcos/{arco_id}` | Público (respeita a visibilidade) | — | Detalha arco | — | 200 ArcoRead |
| GET | `/config` | Público (respeita a visibilidade) | — | Configuração pública da campanha (nome, sistema, módulos, mapa, unidade) | — | 200 InstanceConfigRead |
| GET | `/descoberta` | Público (respeita a visibilidade) | — | Primeira aparição de personagens, locais, facções e itens | — | 200 DescobertaPublic |
| GET | `/eventos` | Público (respeita a visibilidade) | — | Lista eventos visíveis | — | 200 EventoListPublic |
| GET | `/eventos/{evento_id}` | Público (respeita a visibilidade) | — | Detalha evento | — | 200 EventoPublic |
| GET | `/grupo` | Público (respeita a visibilidade) | — | Posição do grupo no mapa | — | 200 GrupoPosicaoRead |
| GET | `/itens` | Público (respeita a visibilidade) | — | Lista itens visíveis | — | 200 ItemListPublic |
| GET | `/itens/{item_id}` | Público (respeita a visibilidade) | — | Detalha item | — | 200 ItemPublic |
| GET | `/locais` | Público (respeita a visibilidade) | — | Lista locais visíveis | `q` | 200 [LocalRead] |
| GET | `/locais/{local_id}` | Público (respeita a visibilidade) | — | Detalha local | — | 200 LocalRead |
| GET | `/media/{categoria}/{arquivo}` | Público (respeita a visibilidade) | — | Serve uma mídia da campanha, respeitando a ACL de visibilidade | — | 200 |
| GET | `/npcs` | Público (respeita a visibilidade) | — | Lista NPCs visíveis | `q` | 200 [NPCRead] |
| GET | `/npcs/{npc_id}` | Público (respeita a visibilidade) | — | Detalha NPC | — | 200 NPCRead |
| GET | `/personagens` | Público (respeita a visibilidade) | — | Lista personagens visíveis | `q` | 200 [PersonagemRead] |
| GET | `/personagens/{personagem_id}` | Público (respeita a visibilidade) | — | Detalha personagem | — | 200 PersonagemRead |
| GET | `/routes/plan` | Público (respeita a visibilidade) | — | Calcula rotas entre dois nós (alternativas, pernoite, fadiga) | `origem_waypoint_id*`, `destino_waypoint_id*`, `ritmo*`, `velocidade_media_mph`, `ordenacao`, `modo_transporte`, `preferencia_via` | 200 RoutePlanResponse |
| GET | `/sessoes` | Público (respeita a visibilidade) | — | Lista sessões visíveis | — | 200 SessaoListPublic |
| GET | `/sessoes/{sessao_id}` | Público (respeita a visibilidade) | — | Detalha sessão | — | 200 SessaoPublic |
| GET | `/vinculos` | Público (respeita a visibilidade) | — | Vínculos públicos entre personagens | — | 200 [VinculoRead] |
| GET | `/waypoints` | Público (respeita a visibilidade) | — | Nós da rede de rotas visíveis | `linked_only` | 200 [WaypointRead] |

### 6. Campanha — escrita do mestre (`/api/c/{slug}/admin`)

| Método | Rota | Acesso | Limite | Descrição | Consulta (query) | Corpo → Resposta |
|---|---|---|---|---|---|---|
| GET | `/arcos` | Membro da campanha | — | Lista arcos (visão do mestre, inclui ocultos) | — | 200 [ArcoRead] |
| POST | `/arcos` | Membro da campanha | 30/min | Cria arco | — | ArcoCreate → 201 ArcoRead |
| POST | `/arcos/propor` | Dono da campanha | 10/min | IA propõe arcos para as sessões (revisão do mestre antes de salvar) | — | 200 ProporArcosResponse |
| GET | `/arcos/{arco_id}` | Membro da campanha | — | Detalha arco (visão do mestre) | — | 200 ArcoRead |
| PUT | `/arcos/{arco_id}` | Membro da campanha | 30/min | Atualiza arco | — | ArcoUpdate → 200 ArcoRead |
| DELETE | `/arcos/{arco_id}` | Membro da campanha | 30/min | Remove arco | — | 204 |
| GET | `/descoberta` | Dono da campanha | — | Descoberta incluindo conteúdo oculto | — | 200 DescobertaAdmin |
| GET | `/eventos` | Membro da campanha | — | Lista eventos (visão do mestre, inclui ocultos) | — | 200 EventoListAdmin |
| POST | `/eventos` | Membro da campanha | 30/min | Cria evento | — | EventoCreate → 201 EventoAdmin |
| POST | `/eventos/sugerir-associacoes` | Dono da campanha | 10/min | IA sugere associações de um evento (revisão do mestre) | — | SugestaoAssociacoesEventoRequest → 200 SugestaoAssociacoesEventoResponse |
| GET | `/eventos/{evento_id}` | Membro da campanha | — | Detalha evento (visão do mestre) | — | 200 EventoAdmin |
| PATCH | `/eventos/{evento_id}` | Membro da campanha | 30/min | Atualiza evento | — | EventoUpdate → 200 EventoAdmin |
| DELETE | `/eventos/{evento_id}` | Membro da campanha | 30/min | Remove evento | — | 204 |
| GET | `/export` | Dono da campanha | — | Exporta a campanha num pacote ZIP | — | 200 |
| GET | `/fios` | Dono da campanha | 30/min | Lista fios narrativos (visão do mestre, inclui ocultos) | `estado`, `sessao_origem_id` | 200 [FioRead] |
| POST | `/fios` | Dono da campanha | 30/min | Cria fio narrativo | — | FioCreate → 201 FioRead |
| POST | `/fios/lote` | Dono da campanha | 30/min | Cria vários fios de uma vez (aceite de proposta da IA) | — | FioLote → 201 [FioRead] |
| PUT | `/fios/ordem` | Dono da campanha | 30/min | Reordena os fios | — | FioOrdem → 200 [FioRead] |
| POST | `/fios/propor` | Dono da campanha | 10/min | IA propõe fios narrativos (revisão do mestre) | — | ProporFiosRequest → 200 |
| PATCH | `/fios/{fio_id}` | Dono da campanha | 30/min | Atualiza fio narrativo | — | FioUpdate → 200 FioRead |
| DELETE | `/fios/{fio_id}` | Dono da campanha | 30/min | Remove fio narrativo | — | 204 |
| POST | `/geradores/{tipo}` | Membro da campanha | — | Sorteia um gerador de apoio (nome, rumor, clima, item) | `lang` | 200 GeradorResultado |
| PUT | `/grupo` | Dono da campanha | 30/min | Move o grupo no mapa / troca o formato do marcador | — | GrupoPosicaoUpdate → 200 GrupoPosicaoRead |
| POST | `/ia/assistir` | Dono da campanha | 10/min | Assistente de IA para campos de texto livre (nada é gravado) | — | AssistirRequest → 200 AssistirResponse |
| GET | `/ia/indice` | Dono da campanha | — | Estado do índice de busca da campanha para a IA | — | 200 IndiceResponse |
| POST | `/ia/indice/reindexar` | Dono da campanha | 3/min | Reconstrói o índice de busca da IA | — | 200 IndiceResponse |
| GET | `/itens` | Dono da campanha | — | Lista itens (visão do mestre, inclui ocultos) | — | 200 ItemListAdmin |
| POST | `/itens` | Dono da campanha | 30/min | Cria item | — | ItemCreate → 201 ItemAdmin |
| GET | `/itens/{item_id}` | Dono da campanha | — | Detalha item (visão do mestre) | — | 200 ItemAdmin |
| PATCH | `/itens/{item_id}` | Dono da campanha | 30/min | Atualiza item | — | ItemUpdate → 200 ItemAdmin |
| DELETE | `/itens/{item_id}` | Dono da campanha | 30/min | Remove item | — | 204 |
| GET | `/locais` | Membro da campanha | — | Lista locais (visão do mestre, inclui ocultos) | — | 200 [LocalRead] |
| POST | `/locais` | Membro da campanha | 30/min | Cria local | — | LocalCreate → 201 LocalRead |
| PUT | `/locais/{local_id}` | Membro da campanha | 30/min | Atualiza local | — | LocalUpdate → 200 LocalRead |
| DELETE | `/locais/{local_id}` | Membro da campanha | 30/min | Remove local | — | 204 |
| GET | `/map-scale` | Membro da campanha | — | Escala do mapa (unidades por milha) | — | 200 MapScaleRead |
| PUT | `/map-scale` | Membro da campanha | 30/min | Atualiza a escala do mapa | — | MapScaleUpdate → 200 MapScaleRead |
| GET | `/npcs` | Membro da campanha | — | Lista NPCs (visão do mestre, inclui ocultos) | — | 200 [NPCRead] |
| POST | `/npcs` | Membro da campanha | 30/min | Cria NPC | — | NPCCreate → 201 NPCRead |
| PUT | `/npcs/{npc_id}` | Membro da campanha | 30/min | Atualiza NPC | — | NPCUpdate → 200 NPCRead |
| DELETE | `/npcs/{npc_id}` | Membro da campanha | 30/min | Remove NPC | — | 204 |
| GET | `/personagens` | Membro da campanha | — | Lista personagens (visão do mestre, inclui ocultos) | — | 200 [PersonagemRead] |
| POST | `/personagens` | Membro da campanha | 30/min | Cria personagem | — | PersonagemCreate → 201 PersonagemRead |
| PUT | `/personagens/{personagem_id}` | Membro da campanha | 30/min | Atualiza personagem | — | PersonagemUpdate → 200 PersonagemRead |
| DELETE | `/personagens/{personagem_id}` | Membro da campanha | 30/min | Remove personagem | — | 204 |
| GET | `/route-segments` | Membro da campanha | — | Lista segmentos de rota (visão do mestre, inclui ocultos) | — | 200 [RouteSegmentRead] |
| POST | `/route-segments` | Membro da campanha | 30/min | Cria segmento de rota | — | RouteSegmentCreate → 201 RouteSegmentRead |
| PUT | `/route-segments/{segment_id}` | Membro da campanha | 30/min | Atualiza segmento de rota | — | RouteSegmentUpdate → 200 RouteSegmentRead |
| DELETE | `/route-segments/{segment_id}` | Membro da campanha | 30/min | Remove segmento de rota | — | 204 |
| GET | `/session` | Membro da campanha | — | Confirma a sessão de mestre na campanha | — | 200 objeto |
| GET | `/sessoes` | Membro da campanha | — | Lista sessões (visão do mestre, inclui ocultos) | — | 200 SessaoListAdmin |
| POST | `/sessoes` | Membro da campanha | 30/min | Cria sessão | — | SessaoCreate → 201 SessaoAdmin |
| GET | `/sessoes/proximo-numero` | Membro da campanha | — | Sugere o número da próxima sessão | — | 200 ProximoNumeroResponse |
| POST | `/sessoes/sugerir-associacoes` | Dono da campanha | 10/min | IA sugere associações de uma sessão (revisão do mestre) | — | SugestaoAssociacoesRequest → 200 SugestaoAssociacoesResponse |
| GET | `/sessoes/{sessao_id}` | Membro da campanha | — | Detalha sessão (visão do mestre) | — | 200 SessaoAdmin |
| PATCH | `/sessoes/{sessao_id}` | Membro da campanha | 30/min | Atualiza sessão | — | SessaoUpdate → 200 SessaoAdmin |
| DELETE | `/sessoes/{sessao_id}` | Membro da campanha | 30/min | Remove sessão | — | 204 |
| POST | `/uploads` | Membro da campanha | 20/min | Envia uma imagem (valida tipo, tamanho e cota) | — | Body_upload_image_api_c__slug__admin_uploads_post → 200 objeto |
| GET | `/vinculos` | Membro da campanha | — | Lista vínculos (visão do mestre, inclui ocultos) | — | 200 [VinculoRead] |
| POST | `/vinculos` | Membro da campanha | 30/min | Cria vínculo | — | VinculoCreate → 201 VinculoRead |
| PUT | `/vinculos/{vinculo_id}` | Membro da campanha | 30/min | Atualiza vínculo | — | VinculoUpdate → 200 VinculoRead |
| DELETE | `/vinculos/{vinculo_id}` | Membro da campanha | 30/min | Remove vínculo | — | 204 |
| GET | `/waypoints` | Membro da campanha | — | Lista waypoints (visão do mestre, inclui ocultos) | — | 200 [WaypointRead] |
| POST | `/waypoints` | Membro da campanha | 30/min | Cria waypoint | — | WaypointCreate → 201 WaypointRead |
| PUT | `/waypoints/{waypoint_id}` | Membro da campanha | 30/min | Atualiza waypoint | — | WaypointUpdate → 200 WaypointRead |
| DELETE | `/waypoints/{waypoint_id}` | Membro da campanha | 30/min | Remove waypoint | — | 204 |

### 7. Saúde e caminhos legados

| Método | Rota | Acesso | Limite | Descrição | Consulta (query) | Corpo → Resposta |
|---|---|---|---|---|---|---|
| GET | `/api/health` | Público | — | Verificação de saúde | — | 200 objeto |
| GET | `/uploads/c/{slug}/{file_path}` | Público | — | Caminho legado de uploads (responde 410 Gone) | — | 200 |
| GET | `/uploads/{file_path}` | Público | — | Caminho legado de uploads (responde 410 Gone) | — | 200 |

## Contratos principais

**Sessão e conta**

```jsonc
// POST /api/auth/login
{ "email": "mestre@exemplo.com", "password": "********" }          // 200 → { "email": "mestre@exemplo.com" } + cookie
// GET /api/auth/me                                                   // 200
{ "email": "mestre@exemplo.com", "id": 7, "is_admin": false }
// POST /api/auth/convite/aceitar  (convite do admin OU link de verificação do registo)
{ "token": "…", "password": "********" }                           // 200 → { "email": "…" } + cookie
```

**Registo e recuperação de senha** (respostas sempre `202 {"ok": true}`)

```jsonc
// GET /api/auth/registo/config   → { "modo": "aberto" | "fechado", "turnstile_site_key": "…" | null }
// POST /api/auth/registo
{ "email": "pessoa@exemplo.com", "termos_aceitos": true, "idioma": "pt-BR",
  "captcha_token": null, "campo_auxiliar": "" }                   // campo_auxiliar = honeypot (deve ir vazio)
// GET /api/auth/reset/config     → { "disponivel": true, "turnstile_site_key": null }
// POST /api/auth/reset/pedir
{ "email": "pessoa@exemplo.com", "idioma": "pt-BR", "captcha_token": null, "campo_auxiliar": "" }
// POST /api/auth/reset/confirmar                                  // 200 → { "email": "…" }
{ "token": "…", "password": "********" }
```

Erros relevantes: `REGISTO_FECHADO` (403), `TERMOS_NAO_ACEITOS`, `EMAIL_INVALIDO`, `EMAIL_DESCARTAVEL`, `IDIOMA_INVALIDO` (400), `CAPTCHA_INVALIDO` (400), `CAPTCHA_INDISPONIVEL` (503), `RESET_INDISPONIVEL` (503), `LIMITE_REGISTO`/`LIMITE_PEDIDOS` (429); na confirmação, `CONVITE_EXPIRADO` (com `detalhes.tipo`), `CONVITE_JA_USADO` e `CONVITE_INVALIDO` (400).

**Contato**

```jsonc
// GET /api/contato/config  → { "disponivel": true, "turnstile_site_key": null }
// POST /api/contato        → 202 { "ok": true }
{ "nome": "Ana", "email": "ana@exemplo.com",
  "assunto": "duvida" | "privacidade" | "problema" | "sugestao" | "outro",
  "mensagem": "10 a 4000 caracteres, no máximo 2 links",
  "idioma": "pt-BR", "captcha_token": null, "campo_auxiliar": "" }
```

Erros: `NOME_INVALIDO`, `EMAIL_INVALIDO`, `ASSUNTO_INVALIDO`, `MENSAGEM_INVALIDA` (400), `CONTATO_INDISPONIVEL` (503), `CONTATO_ENVIO_FALHOU` (502), `LIMITE_PEDIDOS`/`LIMITE_CONTATO_DIARIO` (429).

**Campanhas**

```jsonc
// POST /api/campanhas  → 201
{ "nome": "Crônicas de Saphyr", "slug": "cronicas-de-saphyr", "sistema": "wfrp4e", "visibilidade": "listada" }
// resposta: { "id": 3, "slug": "…", "nome": "…", "sistema": "…", "visibilidade": "listada" }
// GET /api/campanhas/catalogo | /minhas → { "campanhas": [ { "id", "slug", "nome", "sistema", "capa_url", … } ] }
// PATCH /api/campanhas/{slug}/modulos          { "modulo": "ia", "ativo": true }
// PATCH /api/campanhas/{slug}/visibilidade     { "visibilidade": "listada" | "so_link" }
// PATCH /api/campanhas/{slug}/unidade-distancia { "unidade_distancia": "mi" | "km" }
// PATCH /api/campanhas/{slug}/capa             { "capa_arquivo": "…" | null, "limpar_capa": false }
// GET /api/c/{slug}/config  → InstanceConfigRead
{ "id": 1, "slug": "wfrp", "nome": "…", "sistema": "wfrp4e", "modulos_ativos": ["fadiga"],
  "has_map_image": true, "mapa_arquivo": "…", "map_url": "…", "unidade_distancia": "mi", "capa_url": null }
```

**Uploads e cota**

```jsonc
// POST /api/c/{slug}/admin/uploads (multipart: category = map | portraits | locals, file) → 200
{ "url": "/api/c/wfrp/media/locals/….webp", "aviso_cota": false, "bytes_usados": 1048576, "cota_bytes": 314572800 }
// Erro de cota → 413
{ "detail": { "erro": "COTA_EXCEDIDA",
  "detalhes": { "bytes_usados": 314000000, "cota_bytes": 314572800, "tamanho": 900000, "bytes_resultantes": 314900000 } } }
```

**Administração de convites**

```jsonc
// POST /api/admin/convites → 201
{ "email": "novo@exemplo.com", "enviar_email": true }             // resposta: { "email": "…", "link": "https://…/convite/<token>" }
// GET /api/admin/convites/config → { "envio_email_disponivel": true }
```

**Erro padrão**

```json
{ "detail": { "erro": "NAO_MEMBRO" } }
```

## Catálogo de códigos de erro

| Código | Mensagem (pt-BR) |
|---|---|
| `AUTENTICACAO_NECESSARIA` | Autenticação necessária |
| `NAO_ADMINISTRADOR` | Apenas o administrador pode fazer esta ação |
| `EMAIL_DUPLICADO` | Já existe uma conta com este e-mail |
| `EMAIL_INVALIDO` | E-mail inválido. |
| `USUARIO_NAO_ENCONTRADO` | Usuário não encontrado |
| `USUARIO_PENDENTE` | A conta ainda aguarda ativação. |
| `USUARIO_INACTIVO` | Usuário inativo |
| `ULTIMO_ADMINISTRADOR` | A operação manteria a aplicação sem administrador ativo. |
| `PROPRIETARIO_COM_MESAS` | Transfira ou exclua primeiro as mesas desta conta: {{campanhas}}. |
| `CAMPANHA_NAO_ENCONTRADA` | Campanha não encontrada |
| `CAMINHO_CAMPANHA_INVALIDO` | O armazenamento desta mesa não passou pela validação de segurança. |
| `EXCLUSAO_EM_RECUPERACAO` | A exclusão desta mesa precisa ser recuperada antes de uma nova tentativa. |
| `FALHA_EXCLUSAO_CAMPANHA` | Não foi possível concluir a exclusão da mesa. Ela foi mantida para recuperação segura. |
| `FILTRO_ESTADO_INVALIDO` | O filtro de estado informado é inválido. |
| `CREDENCIAIS_INVALIDAS` | Credenciais inválidas |
| `COTA_EXCEDIDA` | Cota de armazenamento excedida ({{bytes_usados}} / {{cota_bytes}} bytes) |
| `CATEGORIA_UPLOAD_INVALIDA` | Categoria inválida. Use: {{categorias}} |
| `TIPO_ARQUIVO_NAO_PERMITIDO` | Tipo de arquivo não permitido: {{content_type}} |
| `ARQUIVO_EXCEDE_TAMANHO_MAXIMO` | Arquivo excede o limite de {{limite_bytes}} bytes |
| `FADIGA_INVALIDA` | Fadiga deve ser um número inteiro |
| `FADIGA_FORA_INTERVALO` | Fadiga deve estar entre {{min}} e {{max}} |
| `MODULO_MECANICA_DESCONHECIDO` | Módulo de mecânica desconhecido: {{modulo}} |
| `PERSONAGEM_NAO_ENCONTRADO` | Personagem não encontrado |
| `VINCULO_NAO_ENCONTRADO` | Vínculo não encontrado |
| `VINCULO_JA_EXISTE` | Vínculo já existe |
| `VINCULO_MESMO_PERSONAGEM` | Vínculo não pode ligar um personagem a si mesmo |
| `PERSONAGEM_INVALIDO` | Personagem inválido |
| `LOCAL_NAO_ENCONTRADO` | Local não encontrado |
| `LOCAL_SEM_ID` | Local sem id para sincronizar saídas |
| `LOCAL_SAIDA_PARA_SI` | Local não pode ter saída para si mesmo |
| `NPCS_NAO_ENCONTRADOS` | NPCs não encontrados: {{ids}} |
| `LOCAIS_DESTINO_NAO_ENCONTRADOS` | Locais destino não encontrados: {{ids}} |
| `NPC_NAO_ENCONTRADO` | NPC não encontrado |
| `ARCO_NAO_ENCONTRADO` | Arco não encontrado |
| `WAYPOINT_NAO_ENCONTRADO` | Waypoint não encontrado |
| `WAYPOINT_INVALIDO` | Waypoint inválido |
| `SEGMENTO_NAO_ENCONTRADO` | Segmento não encontrado |
| `SEGMENTO_SELF_LOOP_INVALIDO` | Self-loop inválido |
| `LOCAL_JA_VINCULADO_WAYPOINT` | Local já vinculado a outro waypoint |
| `WAYPOINT_JA_VINCULADO_LOCAL` | Waypoint já vinculado a outro local |
| `ROTA_ORIGEM_DESTINO_IGUAIS` | Origem e destino devem ser diferentes |
| `ROTA_ORIGEM_INVALIDA` | Origem inválida (nó não encontrado) |
| `ROTA_DESTINO_INVALIDO` | Destino inválido (nó não encontrado) |
| `ROTA_CALCULO_FALHOU` | Falha ao calcular rota |
| `SLUG_INVALIDO` | Slug inválido |
| `SLUG_RESERVADO` | Slug reservado |
| `SLUG_DUPLICADO` | Slug já em uso |
| `SLUG_OCUPADO` | Slug já em uso |
| `VISIBILIDADE_INVALIDA` | Visibilidade inválida |
| `NAO_DONO` | Apenas o dono pode fazer esta acção |
| `NAO_MEMBRO` | Sem acesso a esta campanha |
| `PACOTE_INVALIDO` | Pacote inválido |
| `ENTRADA_PROIBIDA` | Pacote contém entradas não permitidas |
| `CONTEUDO_INVALIDO` | Conteúdo do pacote inválido |
| `SCHEMA_FUTURO` | Versão de schema do pacote não suportada |
| `MANIFESTO_INVALIDO` | Manifesto do pacote inválido |
| `NUMERO_DUPLICADO` | Já existe uma sessão com este número |
| `SESSAO_NAO_ENCONTRADA` | Sessão não encontrada |
| `SESSAO_TRANSICAO_SEM_ARCO` | A sessão de transição precisa pertencer a um arco |
| `SESSAO_TRANSICAO_ARCO_IGUAL` | A sessão de transição não pode apontar para o mesmo arco |
| `SESSOES_NAO_ENCONTRADAS` | Sessões não encontradas: {{ids}} |
| `EVENTO_NAO_ENCONTRADO` | Evento não encontrado |
| `REGISTO_FECHADO` | O registo está fechado. |
| `EMAIL_DESCARTAVEL` | Use um e-mail não descartável. |
| `LIMITE_REGISTO` | Muitos pedidos de registo. Tente mais tarde. |
| `LIMITE_PEDIDOS` | Muitos pedidos. Tente mais tarde. |
| `CAPTCHA_INVALIDO` | A verificação de segurança falhou. Tente de novo. |
| `CAPTCHA_INDISPONIVEL` | A verificação de segurança está indisponível. Tente mais tarde. |
| `TERMOS_NAO_ACEITOS` | É preciso aceitar os termos e a política de privacidade. |
| `IDIOMA_INVALIDO` | Idioma inválido. |
| `CONVITE_EXPIRADO` | O link expirou. |
| `CONTATO_INDISPONIVEL` | O contato não está disponível nesta instância. |
| `CONTATO_ENVIO_FALHOU` | Não foi possível enviar a mensagem. Tente novamente mais tarde. |
| `LIMITE_CONTATO_DIARIO` | O limite diário de mensagens foi atingido. Tente novamente mais tarde. |
| `ASSUNTO_INVALIDO` | Selecione um assunto válido. |
| `MENSAGEM_INVALIDA` | A mensagem deve ter de 10 a 4000 caracteres e no máximo 2 links. |
| `NOME_INVALIDO` | Informe um nome com até 100 caracteres. |
| `RESET_INDISPONIVEL` | A recuperação de senha não está disponível nesta instância. |
| `CONVITE_JA_USADO` | Este link já foi usado. |
| `CONVITE_INVALIDO` | Este link é inválido. |

## Esquemas (campos de cada contrato)

Campos obrigatórios marcados com `*`. Os esquemas estão agrupados pela área da API que os usa; a fonte normativa é o OpenAPI.

<details>
<summary><strong>administrador</strong> (12 esquemas)</summary>

- **AdminCampaignView** — id*: inteiro, nome*: texto, slug*: texto, sistema*: texto, proprietario*: CampaignOwnerView, activa*: booleano, visibilidade*: texto, criado_em*: texto, modificado_em*: texto, ultima_alteracao_em*: texto
- **AdminCampaignsResponse** — campanhas*: [AdminCampaignView]
- **AdminUserView** — id*: inteiro, email*: texto, estado*: ativa|pendente|inativa, is_admin*: booleano, criado_em*: texto, mesas_proprietarias*: [OwnedCampaignView]
- **AdminUsersResponse** — usuarios*: [AdminUserView]
- **CampaignOwnerRequest** — email*: texto
- **CampaignOwnerView** — id*: inteiro, email*: texto
- **CampaignStateRequest** — activa*: booleano
- **CriarConviteRequest** — email*: texto, enviar_email: booleano
- **CriarConviteResponse** — email*: texto, link*: texto
- **OwnedCampaignView** — id*: inteiro, slug*: texto, nome*: texto, activa*: booleano
- **ResetLinkResponse** — email*: texto, link*: texto
- **UserStateRequest** — activo*: booleano

</details>

<details>
<summary><strong>arcos</strong> (5 esquemas)</summary>

- **ArcoCreate** — titulo*: texto, resumo: texto, ordem: inteiro, visivel_para_todos: booleano, cor: texto, sessao_ids: [inteiro], sessao_transicao_id: inteiro
- **ArcoRead** — id*: inteiro, titulo*: texto, resumo*: texto, ordem*: inteiro, visivel_para_todos: booleano, cor: texto, sessao_ids: [inteiro], sessao_transicao_id: inteiro
- **ArcoUpdate** — titulo: texto, resumo: texto, ordem: inteiro, visivel_para_todos: booleano, cor: texto, sessao_ids: [inteiro], sessao_transicao_id: inteiro
- **ProporArcosResponse** — estado*: propostas|sessoes_insuficientes|falha, mensagem: texto, propostas: [PropostaArcoRead]
- **PropostaArcoRead** — titulo*: texto, resumo: texto, sessao_ids: [inteiro], sessao_transicao_id: inteiro, local_ids: [inteiro]

</details>

<details>
<summary><strong>auth</strong> (4 esquemas)</summary>

- **LoginBody** — email*: texto, password*: texto
- **RegistoBody** — email*: texto, termos_aceitos: booleano, idioma: texto, captcha_token: texto, campo_auxiliar: texto
- **ResetPedidoBody** — email*: texto, idioma: texto, captcha_token: texto, campo_auxiliar: texto
- **TokenPasswordBody** — token*: texto, password*: texto

</details>

<details>
<summary><strong>campanhas</strong> (17 esquemas)</summary>

- **Body_import_campaign_api_campanhas_import_post** — file*: texto, slug: texto
- **CapaRequest** — capa_arquivo: texto, limpar_capa: booleano
- **CapaResponse** — slug*: texto, capa_arquivo: texto, capa_url: texto
- **CatalogoItem** — id*: inteiro, slug*: texto, nome*: texto, sistema*: texto, capa_url: texto
- **CatalogoResponse** — campanhas*: [CatalogoItem]
- **CriarCampanhaRequest** — nome*: texto, slug*: texto, sistema*: texto, visibilidade: listada|so_link
- **CriarCampanhaResponse** — slug*: texto, id*: inteiro, nome*: texto, sistema*: texto, visibilidade*: texto
- **IndexacaoRequest** — indexavel*: booleano
- **IndexacaoResponse** — slug*: texto, indexavel*: booleano
- **MinhasResponse** — campanhas*: [PainelItem]
- **ModuloToggleRequest** — modulo*: texto, ativo*: booleano
- **ModuloToggleResponse** — slug*: texto, modulos_ativos*: [texto]
- **PainelItem** — id*: inteiro, slug*: texto, nome*: texto, sistema*: texto, visibilidade*: texto, indexavel*: booleano (escolha guardada), unidade_distancia: texto, capa_url: texto, bytes_usados*: inteiro, cota_bytes*: inteiro, aviso_cota*: booleano, modulos_ativos: [texto]
- **UnidadeDistanciaRequest** — unidade_distancia*: mi|km
- **UnidadeDistanciaResponse** — slug*: texto, unidade_distancia*: texto
- **VisibilidadeRequest** — visibilidade*: listada|so_link
- **VisibilidadeResponse** — slug*: texto, visibilidade*: texto

</details>

<details>
<summary><strong>config</strong> (1 esquemas)</summary>

- **InstanceConfigRead** — id*: inteiro, slug*: texto, nome*: texto, sistema*: texto, indexavel*: booleano (efetivo), modulos_ativos: [texto], has_map_image*: booleano, mapa_arquivo: texto, map_url: texto, unidade_distancia: texto, capa_url: texto

</details>

<details>
<summary><strong>contato</strong> (1 esquemas)</summary>

- **ContatoBody** — nome*: texto, email*: texto, assunto*: texto, mensagem*: texto, idioma: texto, captcha_token: texto, campo_auxiliar: texto

</details>

<details>
<summary><strong>descoberta</strong> (8 esquemas)</summary>

- **AlertaInconsistencia** — personagem_id*: inteiro, personagem_nome*: texto, sessao_visivel_id*: inteiro, sessao_visivel_numero*: inteiro, sessao_oculta_id*: inteiro, sessao_oculta_numero*: inteiro, sessao_oculta_titulo*: texto
- **AparicaoAdmin** — origem*: sessao|evento, id*: inteiro, titulo*: texto, numero: inteiro, ano: inteiro, mes: inteiro, reaparicao: booleano, intervalo: IntervaloAparicao, visivel_para_todos: booleano
- **AparicaoPublic** — origem*: sessao|evento, id*: inteiro, titulo*: texto, numero: inteiro, ano: inteiro, mes: inteiro, reaparicao: booleano, intervalo: IntervaloAparicao
- **DescobertaAdmin** — entidades*: [EntidadeDescobertaAdmin], alertas: [AlertaInconsistencia]
- **DescobertaPublic** — entidades*: [EntidadeDescobertaPublic]
- **EntidadeDescobertaAdmin** — tipo*: personagem|local|faccao|item, id: inteiro, nome*: texto, descricao: texto, aparicoes: [AparicaoAdmin]
- **EntidadeDescobertaPublic** — tipo*: personagem|local|faccao|item, id: inteiro, nome*: texto, descricao: texto, aparicoes: [AparicaoPublic]
- **IntervaloAparicao** — anos: inteiro, meses: inteiro, sessoes: inteiro

</details>

<details>
<summary><strong>eventos</strong> (10 esquemas)</summary>

- **EventoAdmin** — id*: inteiro, titulo*: texto, ano*: inteiro, mes: inteiro, rotulo_era: texto, descricao: texto, sessao_id: inteiro, locais: [EventoRefLocal], personagens: [EventoRefPersonagem], visivel_para_todos: booleano
- **EventoCreate** — titulo*: texto, ano*: inteiro, mes: inteiro, rotulo_era: texto, descricao: texto, visivel_para_todos: booleano, sessao_id: inteiro, local_ids: [inteiro], personagem_ids: [inteiro]
- **EventoListAdmin** — eventos*: [EventoAdmin]
- **EventoListPublic** — eventos*: [EventoPublic]
- **EventoPublic** — id*: inteiro, titulo*: texto, ano*: inteiro, mes: inteiro, rotulo_era: texto, descricao: texto, sessao_id: inteiro, locais: [EventoRefLocal], personagens: [EventoRefPersonagem]
- **EventoRefLocal** — id*: inteiro, nome*: texto
- **EventoRefPersonagem** — id*: inteiro, nome*: texto, tipo*: texto, retrato_url: texto
- **EventoUpdate** — titulo: texto, ano: inteiro, mes: inteiro, rotulo_era: texto, descricao: texto, visivel_para_todos: booleano, sessao_id: inteiro, local_ids: [inteiro], personagem_ids: [inteiro]
- **SugestaoAssociacoesEventoRequest** — descricao*: texto
- **SugestaoAssociacoesEventoResponse** — estado*: sugestoes|vazio|falha, mensagem: texto, local_ids: [inteiro], personagem_ids: [inteiro]

</details>

<details>
<summary><strong>fios</strong> (6 esquemas)</summary>

- **FioCreate** — titulo*: texto, descricao: texto, origem: manual|ia, sessao_origem_id: inteiro
- **FioLote** — fios*: [FioCreate]
- **FioOrdem** — ids*: [inteiro]
- **FioRead** — id*: inteiro, titulo*: texto, descricao*: texto, estado*: aberto|resolvido, origem*: manual|ia, sessao_origem_id*: inteiro, ordem*: inteiro, criado_em*: texto
- **FioUpdate** — titulo: texto, descricao: texto, estado: aberto|resolvido, sessao_origem_id: inteiro
- **ProporFiosRequest** — sessao_id: inteiro

</details>

<details>
<summary><strong>geradores</strong> (1 esquemas)</summary>

- **GeradorResultado** — tipo*: texto, resultado*: texto, sistema_usado*: texto, fallback: booleano

</details>

<details>
<summary><strong>grupo</strong> (2 esquemas)</summary>

- **GrupoPosicaoRead** — x*: número, y*: número, formato: bandeira|brasao, atualizado_em*: texto
- **GrupoPosicaoUpdate** — x*: número, y*: número, formato: bandeira|brasao

</details>

<details>
<summary><strong>ia</strong> (3 esquemas)</summary>

- **AssistirRequest** — tipo*: rascunho_sessao|resumo_sessao|descricao_personagem|descricao_local, texto_atual: texto, instrucao: texto, alvo_id: inteiro, campo_publico: booleano
- **AssistirResponse** — estado*: sugestao|vazio|falha, texto: texto, mensagem: texto, usou_conteudo_oculto: booleano, truncado: booleano, limite_caracteres*: inteiro, campo_destino*: texto
- **IndiceResponse** — estado*: ausente|ok|desatualizado|indisponivel, registros*: inteiro, trechos*: inteiro, atualizado_em*: texto

</details>

<details>
<summary><strong>itens</strong> (8 esquemas)</summary>

- **ItemAdmin** — id*: inteiro, nome*: texto, descricao: texto, sessoes: [ItemRefSessao], eventos: [ItemRefEvento], visivel_para_todos: booleano
- **ItemCreate** — nome*: texto, descricao: texto, visivel_para_todos: booleano, sessao_ids: [inteiro], evento_ids: [inteiro]
- **ItemListAdmin** — itens*: [ItemAdmin]
- **ItemListPublic** — itens*: [ItemPublic]
- **ItemPublic** — id*: inteiro, nome*: texto, descricao: texto, sessoes: [ItemRefSessao], eventos: [ItemRefEvento]
- **ItemRefEvento** — id*: inteiro, titulo*: texto, ano*: inteiro, mes: inteiro
- **ItemRefSessao** — id*: inteiro, numero*: inteiro, titulo*: texto
- **ItemUpdate** — nome: texto, descricao: texto, visivel_para_todos: booleano, sessao_ids: [inteiro], evento_ids: [inteiro]

</details>

<details>
<summary><strong>locais</strong> (3 esquemas)</summary>

- **LocalCreate** — nome*: texto, descricao: texto, x*: número, y*: número, imagem_url: texto, data_sessao: texto, estado_exploracao: conhecido|visitado, arco_id: inteiro, npc_ids: [inteiro], saida_ids: [inteiro], cor_pin*: texto, waypoint_id: inteiro, visivel_para_todos: booleano
- **LocalRead** — id*: inteiro, nome*: texto, descricao*: texto, x*: número, y*: número, imagem_url*: texto, data_sessao*: texto, estado_exploracao: conhecido|visitado, arco_id*: inteiro, npc_ids: [inteiro], saida_ids: [inteiro], cor_pin*: texto, waypoint_id: inteiro, visivel_para_todos: booleano
- **LocalUpdate** — nome: texto, descricao: texto, x: número, y: número, imagem_url: texto, data_sessao: texto, estado_exploracao: conhecido|visitado, arco_id: inteiro, npc_ids: [inteiro], saida_ids: [inteiro], cor_pin: texto, waypoint_id: inteiro, visivel_para_todos: booleano

</details>

<details>
<summary><strong>map-scale</strong> (2 esquemas)</summary>

- **MapScaleRead** — id*: inteiro, miles_per_map_unit*: número, notas*: texto
- **MapScaleUpdate** — miles_per_map_unit*: número, notas: texto

</details>

<details>
<summary><strong>npcs</strong> (5 esquemas)</summary>

- **NPCCreate** — nome*: texto, tipo: PersonagemTipo, papel: texto, descricao: texto, faccao: texto, status: NPCStatus, retrato_url: texto, visivel_para_todos: booleano
- **NPCRead** — id*: inteiro, nome*: texto, tipo: PersonagemTipo, papel: texto, descricao*: texto, faccao*: texto, status*: NPCStatus, retrato_url*: texto, visivel_para_todos: booleano, local_ids: [inteiro]
- **NPCStatus** — vivo|morto|desaparecido|desconhecido
- **NPCUpdate** — nome: texto, tipo: PersonagemTipo, papel: texto, descricao: texto, faccao: texto, status: NPCStatus, retrato_url: texto, visivel_para_todos: booleano
- **PersonagemTipo** — pj|npc

</details>

<details>
<summary><strong>personagens</strong> (3 esquemas)</summary>

- **PersonagemCreate** — nome*: texto, tipo: PersonagemTipo, papel: texto, descricao: texto, notas_mecanicas: texto, faccao: texto, status: NPCStatus, retrato_url: texto, visivel_para_todos: booleano, extensoes_mecanica: objeto
- **PersonagemRead** — id*: inteiro, nome*: texto, tipo*: PersonagemTipo, papel*: texto, descricao*: texto, notas_mecanicas: texto, faccao*: texto, status*: NPCStatus, retrato_url*: texto, visivel_para_todos: booleano, extensoes_mecanica: objeto, local_ids: [inteiro]
- **PersonagemUpdate** — nome: texto, tipo: PersonagemTipo, papel: texto, descricao: texto, notas_mecanicas: texto, faccao: texto, status: NPCStatus, retrato_url: texto, visivel_para_todos: booleano, extensoes_mecanica: objeto

</details>

<details>
<summary><strong>route-segments</strong> (5 esquemas)</summary>

- **Point** — x*: número, y*: número
- **RouteSegmentCreate** — waypoint_a_id*: inteiro, waypoint_b_id*: inteiro, tipo: RouteTipo, pontos_intermediarios: [Point], modificador_velocidade: número
- **RouteSegmentRead** — id*: inteiro, waypoint_a_id*: inteiro, waypoint_b_id*: inteiro, tipo*: RouteTipo, pontos_intermediarios*: [Point], distancia_milhas*: número, modificador_velocidade*: número
- **RouteSegmentUpdate** — waypoint_a_id: inteiro, waypoint_b_id: inteiro, tipo: RouteTipo, pontos_intermediarios: [Point], modificador_velocidade: número
- **RouteTipo** — estrada|rio|trilha

</details>

<details>
<summary><strong>routes</strong> (5 esquemas)</summary>

- **DiaVisual** — dia*: inteiro, residual: booleano, fadiga_apos: inteiro, geometria: [Point]
- **Pernoite** — dia*: inteiro, tipo*: PernoiteTipo, local_id: inteiro, nome: texto, x*: número, y*: número
- **PernoiteTipo** — local|relento
- **RoutePlanItem** — waypoint_ids*: [inteiro], distancia_milhas*: número, tempo_horas*: número, tempo_dias: inteiro, tempo_horas_resto: número, tempo_texto: texto, tipos*: [texto], geometria*: [Point], custo_dentro_bp: número, custo_fora_bp: número, pernoites: [Pernoite], fadiga_saldo: inteiro, fadiga_pico: inteiro, fadiga_aviso: booleano, fadiga_morte: booleano, dias_visuais: [DiaVisual]
- **RoutePlanResponse** — rotas*: [RoutePlanItem]

</details>

<details>
<summary><strong>sessoes</strong> (11 esquemas)</summary>

- **ProximoNumeroResponse** — numero*: inteiro
- **SessaoAdmin** — id*: inteiro, numero*: inteiro, titulo*: texto, data_rotulo: texto, resumo: texto, locais: [SessaoRefLocal], personagens: [SessaoRefPersonagem], arco_id: inteiro, arco_transicao_id: inteiro, visivel_para_todos: booleano, notas_preparo: texto, alertas_inconsistencia: [AlertaInconsistencia]
- **SessaoCreate** — numero*: inteiro, titulo*: texto, data_rotulo: texto, resumo: texto, notas_preparo: texto, visivel_para_todos: booleano, local_ids: [inteiro], personagem_ids: [inteiro], arco_id: inteiro, arco_transicao_id: inteiro
- **SessaoListAdmin** — sessoes*: [SessaoAdmin]
- **SessaoListPublic** — sessoes*: [SessaoPublic]
- **SessaoPublic** — id*: inteiro, numero*: inteiro, titulo*: texto, data_rotulo: texto, resumo: texto, locais: [SessaoRefLocal], personagens: [SessaoRefPersonagem], arco_id: inteiro, arco_transicao_id: inteiro
- **SessaoRefLocal** — id*: inteiro, nome*: texto
- **SessaoRefPersonagem** — id*: inteiro, nome*: texto, tipo*: texto
- **SessaoUpdate** — numero: inteiro, titulo: texto, data_rotulo: texto, resumo: texto, notas_preparo: texto, visivel_para_todos: booleano, local_ids: [inteiro], personagem_ids: [inteiro], arco_id: inteiro, arco_transicao_id: inteiro
- **SugestaoAssociacoesRequest** — resumo*: texto
- **SugestaoAssociacoesResponse** — estado*: sugestoes|vazio|falha, mensagem: texto, local_ids: [inteiro], personagem_ids: [inteiro]

</details>

<details>
<summary><strong>uploads</strong> (1 esquemas)</summary>

- **Body_upload_image_api_c__slug__admin_uploads_post** — category*: texto, file*: texto

</details>

<details>
<summary><strong>vinculos</strong> (5 esquemas)</summary>

- **VinculoCreate** — personagem_a_id*: inteiro, personagem_b_id*: inteiro, tipo_ab*: VinculoTipo, tipo_ba: VinculoTipo, nota_ab: texto, nota_ba: texto, publico: booleano, conhecido_ab: booleano, conhecido_ba: booleano, qualificador_ab: texto, qualificador_ba: texto, direcao: VinculoDirecao
- **VinculoDirecao** — a_para_b|b_para_a
- **VinculoRead** — id*: inteiro, personagem_a_id*: inteiro, personagem_b_id*: inteiro, tipo_ab: VinculoTipo, tipo_ba: VinculoTipo, nota_ab: texto, nota_ba: texto, publico*: booleano, conhecido_ab: booleano, conhecido_ba: booleano, qualificador_ab: texto, qualificador_ba: texto, direcao: VinculoDirecao
- **VinculoTipo** — aliado|vinculo_sangue|amizade|inimizade|adversario|romance|familia|conhecido
- **VinculoUpdate** — personagem_a_id: inteiro, personagem_b_id: inteiro, tipo_ab: VinculoTipo, tipo_ba: VinculoTipo, nota_ab: texto, nota_ba: texto, publico: booleano, conhecido_ab: booleano, conhecido_ba: booleano, qualificador_ab: texto, qualificador_ba: texto, direcao: VinculoDirecao

</details>

<details>
<summary><strong>waypoints</strong> (3 esquemas)</summary>

- **WaypointCreate** — nome: texto, x*: número, y*: número, local_id: inteiro
- **WaypointRead** — id*: inteiro, nome*: texto, x*: número, y*: número, local_id*: inteiro
- **WaypointUpdate** — nome: texto, x: número, y: número, local_id: inteiro

</details>
