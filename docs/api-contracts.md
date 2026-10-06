# Contratos da API

Contrato gerado a partir de app.main:app na versão documentada do projeto. A API usa OpenAPI 3.1 e fica sob o prefixo /api.

## Convenções

- GET público respeita a visibilidade da campanha; dados ocultos para jogadores não aparecem.
- Operações /api/admin/* exigem sessão de mestre; endpoints de escrita da campanha exigem autenticação de GM.
- Corpos e respostas são JSON salvo indicação contrária; uploads usam multipart/form-data ou application/octet-stream conforme o endpoint.
- A fonte normativa completa em execução é /openapi.json; esta página mantém o inventário legível para revisão humana.

## Endpoints

| Método | Rota | Tags | Parâmetros | Corpo | Respostas |
|---|---|---|---|---|---|
| **GET** | /api/admin/campanhas | administrador | query:q, query:estado | — | 200 Successful Response (AdminCampaignsResponse)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/admin/campanhas: Admin List Campaigns -->
| **DELETE** | /api/admin/campanhas/{campaign_id} | administrador | path:campaign_id* | — | 204 Successful Response<br>422 Validation Error (HTTPValidationError) |
<!-- DELETE /api/admin/campanhas/{campaign_id}: Remove Campaign -->
| **PATCH** | /api/admin/campanhas/{campaign_id}/estado | administrador | path:campaign_id* | CampaignStateRequest | 200 Successful Response (object)<br>422 Validation Error (HTTPValidationError) |
<!-- PATCH /api/admin/campanhas/{campaign_id}/estado: Change Campaign State -->
| **PATCH** | /api/admin/campanhas/{campaign_id}/proprietario | administrador | path:campaign_id* | CampaignOwnerRequest | 200 Successful Response (object)<br>422 Validation Error (HTTPValidationError) |
<!-- PATCH /api/admin/campanhas/{campaign_id}/proprietario: Change Campaign Owner -->
| **POST** | /api/admin/convites | administrador | — | CriarConviteRequest | 201 Successful Response (CriarConviteResponse)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/admin/convites: Criar Convite -->
| **GET** | /api/admin/usuarios | administrador | query:email, query:estado | — | 200 Successful Response (AdminUsersResponse)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/admin/usuarios: Admin List Users -->
| **DELETE** | /api/admin/usuarios/{user_id} | administrador | path:user_id* | — | 204 Successful Response<br>422 Validation Error (HTTPValidationError) |
<!-- DELETE /api/admin/usuarios/{user_id}: Remove User -->
| **PATCH** | /api/admin/usuarios/{user_id}/estado | administrador | path:user_id* | UserStateRequest | 200 Successful Response (object)<br>422 Validation Error (HTTPValidationError) |
<!-- PATCH /api/admin/usuarios/{user_id}/estado: Change User State -->
| **POST** | /api/admin/usuarios/{user_id}/reset | administrador | path:user_id* | — | 201 Successful Response (ResetLinkResponse)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/admin/usuarios/{user_id}/reset: Reset User -->
| **POST** | /api/auth/convite/aceitar | auth | — | TokenPasswordBody | 200 Successful Response (object)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/auth/convite/aceitar: Aceitar Convite -->
| **POST** | /api/auth/login | auth | — | LoginBody | 200 Successful Response (object)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/auth/login: Login -->
| **POST** | /api/auth/logout | auth | — | — | 204 Successful Response |
<!-- POST /api/auth/logout: Logout -->
| **GET** | /api/auth/me | auth | — | — | 200 Successful Response (object) |
<!-- GET /api/auth/me: Me -->
| **POST** | /api/auth/reset/confirmar | auth | — | TokenPasswordBody | 200 Successful Response (object)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/auth/reset/confirmar: Reset Confirmar -->
| **GET** | /api/c/{slug}/admin/arcos | admin-arcos | path:slug* | — | 200 Successful Response (array)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/admin/arcos: List Arcos Admin -->
| **POST** | /api/c/{slug}/admin/arcos | admin-arcos | path:slug* | ArcoCreate | 201 Successful Response (ArcoRead)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/c/{slug}/admin/arcos: Create Arco -->
| **POST** | /api/c/{slug}/admin/arcos/propor | admin-arcos | path:slug* | — | 200 Successful Response (ProporArcosResponse)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/c/{slug}/admin/arcos/propor: Propor Arcos Admin -->
| **GET** | /api/c/{slug}/admin/arcos/{arco_id} | admin-arcos | path:arco_id*, path:slug* | — | 200 Successful Response (ArcoRead)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/admin/arcos/{arco_id}: Get Arco Admin -->
| **PUT** | /api/c/{slug}/admin/arcos/{arco_id} | admin-arcos | path:arco_id*, path:slug* | ArcoUpdate | 200 Successful Response (ArcoRead)<br>422 Validation Error (HTTPValidationError) |
<!-- PUT /api/c/{slug}/admin/arcos/{arco_id}: Update Arco -->
| **DELETE** | /api/c/{slug}/admin/arcos/{arco_id} | admin-arcos | path:arco_id*, path:slug* | — | 204 Successful Response<br>422 Validation Error (HTTPValidationError) |
<!-- DELETE /api/c/{slug}/admin/arcos/{arco_id}: Delete Arco -->
| **GET** | /api/c/{slug}/admin/descoberta | admin-descoberta | path:slug* | — | 200 Successful Response (DescobertaAdmin)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/admin/descoberta: List Descoberta Admin -->
| **GET** | /api/c/{slug}/admin/eventos | admin-eventos | path:slug* | — | 200 Successful Response (EventoListAdmin)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/admin/eventos: List Eventos Admin -->
| **POST** | /api/c/{slug}/admin/eventos | admin-eventos | path:slug* | EventoCreate | 201 Successful Response (EventoAdmin)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/c/{slug}/admin/eventos: Create Evento -->
| **POST** | /api/c/{slug}/admin/eventos/sugerir-associacoes | admin-eventos | path:slug* | SugestaoAssociacoesEventoRequest | 200 Successful Response (SugestaoAssociacoesEventoResponse)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/c/{slug}/admin/eventos/sugerir-associacoes: Sugerir Associacoes Admin -->
| **GET** | /api/c/{slug}/admin/eventos/{evento_id} | admin-eventos | path:evento_id*, path:slug* | — | 200 Successful Response (EventoAdmin)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/admin/eventos/{evento_id}: Get Evento Admin -->
| **PATCH** | /api/c/{slug}/admin/eventos/{evento_id} | admin-eventos | path:evento_id*, path:slug* | EventoUpdate | 200 Successful Response (EventoAdmin)<br>422 Validation Error (HTTPValidationError) |
<!-- PATCH /api/c/{slug}/admin/eventos/{evento_id}: Update Evento -->
| **DELETE** | /api/c/{slug}/admin/eventos/{evento_id} | admin-eventos | path:evento_id*, path:slug* | — | 204 Successful Response<br>422 Validation Error (HTTPValidationError) |
<!-- DELETE /api/c/{slug}/admin/eventos/{evento_id}: Delete Evento -->
| **GET** | /api/c/{slug}/admin/export | admin-export | path:slug* | — | 200 Successful Response (—)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/admin/export: Export Campaign -->
| **PUT** | /api/c/{slug}/admin/grupo | admin-grupo | path:slug* | GrupoPosicaoUpdate | 200 Successful Response (GrupoPosicaoRead)<br>422 Validation Error (HTTPValidationError) |
<!-- PUT /api/c/{slug}/admin/grupo: Update Grupo -->
| **GET** | /api/c/{slug}/admin/itens | admin-itens | path:slug* | — | 200 Successful Response (ItemListAdmin)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/admin/itens: List Itens Admin -->
| **POST** | /api/c/{slug}/admin/itens | admin-itens | path:slug* | ItemCreate | 201 Successful Response (ItemAdmin)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/c/{slug}/admin/itens: Create Item -->
| **GET** | /api/c/{slug}/admin/itens/{item_id} | admin-itens | path:item_id*, path:slug* | — | 200 Successful Response (ItemAdmin)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/admin/itens/{item_id}: Get Item Admin -->
| **PATCH** | /api/c/{slug}/admin/itens/{item_id} | admin-itens | path:item_id*, path:slug* | ItemUpdate | 200 Successful Response (ItemAdmin)<br>422 Validation Error (HTTPValidationError) |
<!-- PATCH /api/c/{slug}/admin/itens/{item_id}: Update Item -->
| **DELETE** | /api/c/{slug}/admin/itens/{item_id} | admin-itens | path:item_id*, path:slug* | — | 204 Successful Response<br>422 Validation Error (HTTPValidationError) |
<!-- DELETE /api/c/{slug}/admin/itens/{item_id}: Delete Item -->
| **GET** | /api/c/{slug}/admin/locais | admin-locais | path:slug* | — | 200 Successful Response (array)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/admin/locais: List Locais Admin -->
| **POST** | /api/c/{slug}/admin/locais | admin-locais | path:slug* | LocalCreate | 201 Successful Response (LocalRead)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/c/{slug}/admin/locais: Create Local -->
| **PUT** | /api/c/{slug}/admin/locais/{local_id} | admin-locais | path:local_id*, path:slug* | LocalUpdate | 200 Successful Response (LocalRead)<br>422 Validation Error (HTTPValidationError) |
<!-- PUT /api/c/{slug}/admin/locais/{local_id}: Update Local -->
| **DELETE** | /api/c/{slug}/admin/locais/{local_id} | admin-locais | path:local_id*, path:slug* | — | 204 Successful Response<br>422 Validation Error (HTTPValidationError) |
<!-- DELETE /api/c/{slug}/admin/locais/{local_id}: Delete Local -->
| **GET** | /api/c/{slug}/admin/map-scale | admin-map-scale | path:slug* | — | 200 Successful Response (MapScaleRead)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/admin/map-scale: Read Scale -->
| **PUT** | /api/c/{slug}/admin/map-scale | admin-map-scale | path:slug* | MapScaleUpdate | 200 Successful Response (MapScaleRead)<br>422 Validation Error (HTTPValidationError) |
<!-- PUT /api/c/{slug}/admin/map-scale: Update Scale -->
| **GET** | /api/c/{slug}/admin/npcs | admin-npcs | path:slug* | — | 200 Successful Response (array)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/admin/npcs: List Npcs Admin -->
| **POST** | /api/c/{slug}/admin/npcs | admin-npcs | path:slug* | NPCCreate | 201 Successful Response (NPCRead)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/c/{slug}/admin/npcs: Create Npc -->
| **PUT** | /api/c/{slug}/admin/npcs/{npc_id} | admin-npcs | path:npc_id*, path:slug* | NPCUpdate | 200 Successful Response (NPCRead)<br>422 Validation Error (HTTPValidationError) |
<!-- PUT /api/c/{slug}/admin/npcs/{npc_id}: Update Npc -->
| **DELETE** | /api/c/{slug}/admin/npcs/{npc_id} | admin-npcs | path:npc_id*, path:slug* | — | 204 Successful Response<br>422 Validation Error (HTTPValidationError) |
<!-- DELETE /api/c/{slug}/admin/npcs/{npc_id}: Delete Npc -->
| **GET** | /api/c/{slug}/admin/personagens | admin-personagens | path:slug* | — | 200 Successful Response (array)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/admin/personagens: List Personagens Admin -->
| **POST** | /api/c/{slug}/admin/personagens | admin-personagens | path:slug* | PersonagemCreate | 201 Successful Response (PersonagemRead)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/c/{slug}/admin/personagens: Create Personagem -->
| **PUT** | /api/c/{slug}/admin/personagens/{personagem_id} | admin-personagens | path:personagem_id*, path:slug* | PersonagemUpdate | 200 Successful Response (PersonagemRead)<br>422 Validation Error (HTTPValidationError) |
<!-- PUT /api/c/{slug}/admin/personagens/{personagem_id}: Update Personagem -->
| **DELETE** | /api/c/{slug}/admin/personagens/{personagem_id} | admin-personagens | path:personagem_id*, path:slug* | — | 204 Successful Response<br>422 Validation Error (HTTPValidationError) |
<!-- DELETE /api/c/{slug}/admin/personagens/{personagem_id}: Delete Personagem -->
| **GET** | /api/c/{slug}/admin/route-segments | admin-route-segments | path:slug* | — | 200 Successful Response (array)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/admin/route-segments: List Segments -->
| **POST** | /api/c/{slug}/admin/route-segments | admin-route-segments | path:slug* | RouteSegmentCreate | 201 Successful Response (RouteSegmentRead)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/c/{slug}/admin/route-segments: Create Segment -->
| **PUT** | /api/c/{slug}/admin/route-segments/{segment_id} | admin-route-segments | path:segment_id*, path:slug* | RouteSegmentUpdate | 200 Successful Response (RouteSegmentRead)<br>422 Validation Error (HTTPValidationError) |
<!-- PUT /api/c/{slug}/admin/route-segments/{segment_id}: Update Segment -->
| **DELETE** | /api/c/{slug}/admin/route-segments/{segment_id} | admin-route-segments | path:segment_id*, path:slug* | — | 204 Successful Response<br>422 Validation Error (HTTPValidationError) |
<!-- DELETE /api/c/{slug}/admin/route-segments/{segment_id}: Delete Segment -->
| **GET** | /api/c/{slug}/admin/session | — | path:slug* | — | 200 Successful Response (object)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/admin/session: Admin Session -->
| **GET** | /api/c/{slug}/admin/sessoes | admin-sessoes | path:slug* | — | 200 Successful Response (SessaoListAdmin)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/admin/sessoes: List Sessoes Admin -->
| **POST** | /api/c/{slug}/admin/sessoes | admin-sessoes | path:slug* | SessaoCreate | 201 Successful Response (SessaoAdmin)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/c/{slug}/admin/sessoes: Create Sessao -->
| **GET** | /api/c/{slug}/admin/sessoes/proximo-numero | admin-sessoes | path:slug* | — | 200 Successful Response (ProximoNumeroResponse)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/admin/sessoes/proximo-numero: Get Proximo Numero -->
| **POST** | /api/c/{slug}/admin/sessoes/sugerir-associacoes | admin-sessoes | path:slug* | SugestaoAssociacoesRequest | 200 Successful Response (SugestaoAssociacoesResponse)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/c/{slug}/admin/sessoes/sugerir-associacoes: Sugerir Associacoes Admin -->
| **GET** | /api/c/{slug}/admin/sessoes/{sessao_id} | admin-sessoes | path:sessao_id*, path:slug* | — | 200 Successful Response (SessaoAdmin)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/admin/sessoes/{sessao_id}: Get Sessao Admin -->
| **PATCH** | /api/c/{slug}/admin/sessoes/{sessao_id} | admin-sessoes | path:sessao_id*, path:slug* | SessaoUpdate | 200 Successful Response (SessaoAdmin)<br>422 Validation Error (HTTPValidationError) |
<!-- PATCH /api/c/{slug}/admin/sessoes/{sessao_id}: Update Sessao -->
| **DELETE** | /api/c/{slug}/admin/sessoes/{sessao_id} | admin-sessoes | path:sessao_id*, path:slug* | — | 204 Successful Response<br>422 Validation Error (HTTPValidationError) |
<!-- DELETE /api/c/{slug}/admin/sessoes/{sessao_id}: Delete Sessao -->
| **POST** | /api/c/{slug}/admin/uploads | admin-uploads | path:slug* | Body_upload_image_api_c__slug__admin_uploads_post | 200 Successful Response (object)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/c/{slug}/admin/uploads: Upload Image -->
| **GET** | /api/c/{slug}/admin/vinculos | admin-vinculos | path:slug* | — | 200 Successful Response (array)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/admin/vinculos: List Vinculos -->
| **POST** | /api/c/{slug}/admin/vinculos | admin-vinculos | path:slug* | VinculoCreate | 201 Successful Response (VinculoRead)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/c/{slug}/admin/vinculos: Create Vinculo -->
| **PUT** | /api/c/{slug}/admin/vinculos/{vinculo_id} | admin-vinculos | path:vinculo_id*, path:slug* | VinculoUpdate | 200 Successful Response (VinculoRead)<br>422 Validation Error (HTTPValidationError) |
<!-- PUT /api/c/{slug}/admin/vinculos/{vinculo_id}: Update Vinculo -->
| **DELETE** | /api/c/{slug}/admin/vinculos/{vinculo_id} | admin-vinculos | path:vinculo_id*, path:slug* | — | 204 Successful Response<br>422 Validation Error (HTTPValidationError) |
<!-- DELETE /api/c/{slug}/admin/vinculos/{vinculo_id}: Delete Vinculo -->
| **GET** | /api/c/{slug}/admin/waypoints | admin-waypoints | path:slug* | — | 200 Successful Response (array)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/admin/waypoints: List Waypoints -->
| **POST** | /api/c/{slug}/admin/waypoints | admin-waypoints | path:slug* | WaypointCreate | 201 Successful Response (WaypointRead)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/c/{slug}/admin/waypoints: Create Waypoint -->
| **PUT** | /api/c/{slug}/admin/waypoints/{waypoint_id} | admin-waypoints | path:waypoint_id*, path:slug* | WaypointUpdate | 200 Successful Response (WaypointRead)<br>422 Validation Error (HTTPValidationError) |
<!-- PUT /api/c/{slug}/admin/waypoints/{waypoint_id}: Update Waypoint -->
| **DELETE** | /api/c/{slug}/admin/waypoints/{waypoint_id} | admin-waypoints | path:waypoint_id*, path:slug* | — | 204 Successful Response<br>422 Validation Error (HTTPValidationError) |
<!-- DELETE /api/c/{slug}/admin/waypoints/{waypoint_id}: Delete Waypoint -->
| **GET** | /api/c/{slug}/arcos | arcos | path:slug* | — | 200 Successful Response (array)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/arcos: List Arcos -->
| **GET** | /api/c/{slug}/arcos/{arco_id} | arcos | path:arco_id*, path:slug* | — | 200 Successful Response (ArcoRead)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/arcos/{arco_id}: Get Arco -->
| **GET** | /api/c/{slug}/config | config | path:slug* | — | 200 Successful Response (InstanceConfigRead)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/config: Read Instance Config -->
| **GET** | /api/c/{slug}/descoberta | descoberta | path:slug* | — | 200 Successful Response (DescobertaPublic)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/descoberta: List Descoberta -->
| **GET** | /api/c/{slug}/eventos | eventos | path:slug* | — | 200 Successful Response (EventoListPublic)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/eventos: List Eventos -->
| **GET** | /api/c/{slug}/eventos/{evento_id} | eventos | path:evento_id*, path:slug* | — | 200 Successful Response (EventoPublic)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/eventos/{evento_id}: Get Evento -->
| **GET** | /api/c/{slug}/grupo | grupo | path:slug* | — | 200 Successful Response (GrupoPosicaoRead)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/grupo: Get Grupo -->
| **GET** | /api/c/{slug}/itens | itens | path:slug* | — | 200 Successful Response (ItemListPublic)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/itens: List Itens -->
| **GET** | /api/c/{slug}/itens/{item_id} | itens | path:item_id*, path:slug* | — | 200 Successful Response (ItemPublic)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/itens/{item_id}: Get Item -->
| **GET** | /api/c/{slug}/locais | locais | path:slug*, query:q | — | 200 Successful Response (array)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/locais: List Locais -->
| **GET** | /api/c/{slug}/locais/{local_id} | locais | path:local_id*, path:slug* | — | 200 Successful Response (LocalRead)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/locais/{local_id}: Get Local -->
| **GET** | /api/c/{slug}/media/{categoria}/{arquivo} | media | path:slug*, path:categoria*, path:arquivo* | — | 200 Successful Response (—)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/media/{categoria}/{arquivo}: Get Media -->
| **GET** | /api/c/{slug}/npcs | npcs | path:slug*, query:q | — | 200 Successful Response (array)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/npcs: List Npcs -->
| **GET** | /api/c/{slug}/npcs/{npc_id} | npcs | path:npc_id*, path:slug* | — | 200 Successful Response (NPCRead)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/npcs/{npc_id}: Get Npc -->
| **GET** | /api/c/{slug}/personagens | personagens | path:slug*, query:q | — | 200 Successful Response (array)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/personagens: List Personagens -->
| **GET** | /api/c/{slug}/personagens/{personagem_id} | personagens | path:personagem_id*, path:slug* | — | 200 Successful Response (PersonagemRead)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/personagens/{personagem_id}: Get Personagem -->
| **GET** | /api/c/{slug}/routes/plan | routes | path:slug*, query:origem_waypoint_id*, query:destino_waypoint_id*, query:ritmo*, query:velocidade_media_mph, query:ordenacao, query:modo_transporte, query:preferencia_via | — | 200 Successful Response (RoutePlanResponse)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/routes/plan: Plan -->
| **GET** | /api/c/{slug}/sessoes | sessoes | path:slug* | — | 200 Successful Response (SessaoListPublic)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/sessoes: List Sessoes -->
| **GET** | /api/c/{slug}/sessoes/{sessao_id} | sessoes | path:sessao_id*, path:slug* | — | 200 Successful Response (SessaoPublic)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/sessoes/{sessao_id}: Get Sessao -->
| **GET** | /api/c/{slug}/vinculos | vinculos | path:slug* | — | 200 Successful Response (array)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/vinculos: List Vinculos Publicos -->
| **GET** | /api/c/{slug}/waypoints | routes | path:slug*, query:linked_only | — | 200 Successful Response (array)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /api/c/{slug}/waypoints: List Public Waypoints -->
| **POST** | /api/campanhas | campanhas | — | CriarCampanhaRequest | 201 Successful Response (CriarCampanhaResponse)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/campanhas: Criar Campanha Http -->
| **GET** | /api/campanhas/catalogo | campanhas | — | — | 200 Successful Response (CatalogoResponse) |
<!-- GET /api/campanhas/catalogo: Catalogo Publico -->
| **POST** | /api/campanhas/import | campanhas | — | Body_import_campaign_api_campanhas_import_post | 201 Successful Response (object)<br>422 Validation Error (HTTPValidationError) |
<!-- POST /api/campanhas/import: Import Campaign -->
| **GET** | /api/campanhas/minhas | campanhas | — | — | 200 Successful Response (MinhasResponse) |
<!-- GET /api/campanhas/minhas: Minhas Campanhas -->
| **PATCH** | /api/campanhas/{slug}/capa | campanhas | path:slug* | CapaRequest | 200 Successful Response (CapaResponse)<br>422 Validation Error (HTTPValidationError) |
<!-- PATCH /api/campanhas/{slug}/capa: Patch Capa -->
| **PATCH** | /api/campanhas/{slug}/genero | campanhas | path:slug* | GeneroRequest | 200 Successful Response (GeneroResponse)<br>422 Validation Error (HTTPValidationError) |
<!-- PATCH /api/campanhas/{slug}/genero: Patch Genero -->
| **PATCH** | /api/campanhas/{slug}/modulos | campanhas | path:slug* | ModuloToggleRequest | 200 Successful Response (ModuloToggleResponse)<br>422 Validation Error (HTTPValidationError) |
<!-- PATCH /api/campanhas/{slug}/modulos: Patch Modulo -->
| **PATCH** | /api/campanhas/{slug}/unidade-distancia | campanhas | path:slug* | UnidadeDistanciaRequest | 200 Successful Response (UnidadeDistanciaResponse)<br>422 Validation Error (HTTPValidationError) |
<!-- PATCH /api/campanhas/{slug}/unidade-distancia: Patch Unidade Distancia -->
| **PATCH** | /api/campanhas/{slug}/visibilidade | campanhas | path:slug* | VisibilidadeRequest | 200 Successful Response (VisibilidadeResponse)<br>422 Validation Error (HTTPValidationError) |
<!-- PATCH /api/campanhas/{slug}/visibilidade: Patch Visibilidade -->
| **GET** | /api/health | — | — | — | 200 Successful Response (object) |
<!-- GET /api/health: Health -->
| **GET** | /uploads/c/{slug}/{file_path} | — | path:slug*, path:file_path* | — | 200 Successful Response (—)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /uploads/c/{slug}/{file_path}: Uploads C Gone -->
| **GET** | /uploads/{file_path} | — | path:file_path* | — | 200 Successful Response (—)<br>422 Validation Error (HTTPValidationError) |
<!-- GET /uploads/{file_path}: Uploads Bare Gone -->

## Schemas de dados

Os nomes abaixo são os contratos Pydantic/SQLModel referenciados pelas operações. Campos e obrigatoriedade devem ser consultados no /openapi.json da mesma revisão.

- **AdminCampaignView** — id*: integer; nome*: string; slug*: string; sistema*: string; proprietario*: CampaignOwnerView; activa*: boolean; visibilidade*: string; criado_em*: —; modificado_em*: —; ultima_alteracao_em*: —
- **AdminCampaignsResponse** — campanhas*: array
- **AdminUserView** — id*: integer; email*: string; estado*: string; is_admin*: boolean; criado_em*: string; mesas_proprietarias*: array
- **AdminUsersResponse** — usuarios*: array
- **AlertaInconsistencia** — personagem_id*: integer; personagem_nome*: string; sessao_visivel_id*: integer; sessao_visivel_numero*: integer; sessao_oculta_id*: integer; sessao_oculta_numero*: integer; sessao_oculta_titulo*: string
- **AparicaoAdmin** — origem*: string; id*: integer; titulo*: string; numero: —; ano: —; mes: —; reaparicao: boolean; intervalo: —; visivel_para_todos: boolean
- **AparicaoPublic** — origem*: string; id*: integer; titulo*: string; numero: —; ano: —; mes: —; reaparicao: boolean; intervalo: —
- **ArcoCreate** — titulo*: string; resumo: string; ordem: integer; visivel_para_todos: boolean; cor: —; sessao_ids: array; sessao_transicao_id: —
- **ArcoRead** — id*: integer; titulo*: string; resumo*: string; ordem*: integer; visivel_para_todos: boolean; cor: —; sessao_ids: array; sessao_transicao_id: —
- **ArcoUpdate** — titulo: —; resumo: —; ordem: —; visivel_para_todos: —; cor: —; sessao_ids: —; sessao_transicao_id: —
- **Body_import_campaign_api_campanhas_import_post** — file*: string; slug: —
- **Body_upload_image_api_c__slug__admin_uploads_post** — category*: string; file*: string
- **CampaignOwnerRequest** — email*: string
- **CampaignOwnerView** — id*: integer; email*: string
- **CampaignStateRequest** — activa*: boolean
- **CapaRequest** — capa_arquivo: —; limpar_capa: boolean
- **CapaResponse** — slug*: string; capa_arquivo: string; capa_url: —
- **CatalogoItem** — slug*: string; nome*: string; sistema*: string; genero: string; capa_url: —
- **CatalogoResponse** — campanhas*: array
- **CriarCampanhaRequest** — nome*: string; slug*: string; sistema*: string; genero*: string; visibilidade: —
- **CriarCampanhaResponse** — slug*: string; id*: integer; nome*: string; sistema*: string; genero*: string; visibilidade*: string
- **CriarConviteRequest** — email*: string
- **CriarConviteResponse** — email*: string; link*: string
- **DescobertaAdmin** — entidades*: array; alertas: array
- **DescobertaPublic** — entidades*: array
- **DiaVisual** — dia*: integer; residual: boolean; fadiga_apos: integer; geometria: array
- **EntidadeDescobertaAdmin** — tipo*: string; id: —; nome*: string; descricao: —; aparicoes: array
- **EntidadeDescobertaPublic** — tipo*: string; id: —; nome*: string; descricao: —; aparicoes: array
- **EventoAdmin** — id*: integer; titulo*: string; ano*: integer; mes: —; rotulo_era: —; descricao: string; sessao_id: —; locais: array; personagens: array; visivel_para_todos: boolean
- **EventoCreate** — titulo*: string; ano*: integer; mes: —; rotulo_era: —; descricao: string; visivel_para_todos: boolean; sessao_id: —; local_ids: array; personagem_ids: array
- **EventoListAdmin** — eventos*: array
- **EventoListPublic** — eventos*: array
- **EventoPublic** — id*: integer; titulo*: string; ano*: integer; mes: —; rotulo_era: —; descricao: string; sessao_id: —; locais: array; personagens: array
- **EventoRefLocal** — id*: integer; nome*: string
- **EventoRefPersonagem** — id*: integer; nome*: string; tipo*: string; retrato_url: —
- **EventoUpdate** — titulo: —; ano: —; mes: —; rotulo_era: —; descricao: —; visivel_para_todos: —; sessao_id: —; local_ids: —; personagem_ids: —
- **GeneroRequest** — genero*: string
- **GeneroResponse** — slug*: string; genero*: string
- **GrupoPosicaoRead** — x*: number; y*: number; formato: string; atualizado_em*: string
- **GrupoPosicaoUpdate** — x*: number; y*: number; formato: —
- **HTTPValidationError** — detail: array
- **InstanceConfigRead** — slug*: string; nome*: string; sistema*: string; modulos_ativos: array; has_map_image*: boolean; mapa_arquivo: —; map_url: —; unidade_distancia: string; genero: string; capa_url: —
- **IntervaloAparicao** — anos: integer; meses: integer; sessoes: —
- **ItemAdmin** — id*: integer; nome*: string; descricao: string; sessoes: array; eventos: array; visivel_para_todos: boolean
- **ItemCreate** — nome*: string; descricao: string; visivel_para_todos: boolean; sessao_ids: array; evento_ids: array
- **ItemListAdmin** — itens*: array
- **ItemListPublic** — itens*: array
- **ItemPublic** — id*: integer; nome*: string; descricao: string; sessoes: array; eventos: array
- **ItemRefEvento** — id*: integer; titulo*: string; ano*: integer; mes: —
- **ItemRefSessao** — id*: integer; numero*: integer; titulo*: string
- **ItemUpdate** — nome: —; descricao: —; visivel_para_todos: —; sessao_ids: —; evento_ids: —
- **LocalCreate** — nome*: string; descricao: string; x*: number; y*: number; imagem_url: —; data_sessao: —; estado_exploracao: string; arco_id: —; npc_ids: array; saida_ids: array; cor_pin*: string; waypoint_id: —; visivel_para_todos: boolean
- **LocalRead** — id*: integer; nome*: string; descricao*: string; x*: number; y*: number; imagem_url*: —; data_sessao*: —; estado_exploracao: string; arco_id*: —; npc_ids: array; saida_ids: array; cor_pin*: string; waypoint_id: —; visivel_para_todos: boolean
- **LocalUpdate** — nome: —; descricao: —; x: —; y: —; imagem_url: —; data_sessao: —; estado_exploracao: string; arco_id: —; npc_ids: —; saida_ids: —; cor_pin: —; waypoint_id: —; visivel_para_todos: —
- **LoginBody** — email*: string; password*: string
- **MapScaleRead** — id*: integer; miles_per_map_unit*: number; notas*: —
- **MapScaleUpdate** — miles_per_map_unit*: number; notas: —
- **MinhasResponse** — campanhas*: array
- **ModuloToggleRequest** — modulo*: string; ativo*: boolean
- **ModuloToggleResponse** — slug*: string; modulos_ativos*: array
- **NPCCreate** — nome*: string; tipo: PersonagemTipo; papel: —; descricao: string; faccao: —; status: —; retrato_url: —; visivel_para_todos: boolean
- **NPCRead** — id*: integer; nome*: string; tipo: PersonagemTipo; papel: —; descricao*: string; faccao*: —; status*: —; retrato_url*: —; visivel_para_todos: boolean; local_ids: array
- **NPCStatus**
- **NPCUpdate** — nome: —; tipo: —; papel: —; descricao: —; faccao: —; status: —; retrato_url: —; visivel_para_todos: —
- **OwnedCampaignView** — id*: integer; slug*: string; nome*: string; activa*: boolean
- **PainelItem** — slug*: string; nome*: string; sistema*: string; visibilidade*: string; unidade_distancia: string; genero: string; capa_url: —; bytes_usados*: integer; cota_bytes*: integer; aviso_cota*: boolean; modulos_ativos: array
- **Pernoite** — dia*: integer; tipo*: PernoiteTipo; local_id: —; nome: —; x*: number; y*: number
- **PernoiteTipo**
- **PersonagemCreate** — nome*: string; tipo: PersonagemTipo; papel: —; descricao: string; faccao: —; status: —; retrato_url: —; visivel_para_todos: boolean; extensoes_mecanica: object
- **PersonagemRead** — id*: integer; nome*: string; tipo*: PersonagemTipo; papel*: —; descricao*: string; faccao*: —; status*: —; retrato_url*: —; visivel_para_todos: boolean; extensoes_mecanica: object; local_ids: array
- **PersonagemTipo**
- **PersonagemUpdate** — nome: —; tipo: —; papel: —; descricao: —; faccao: —; status: —; retrato_url: —; visivel_para_todos: —; extensoes_mecanica: —
- **Point** — x*: number; y*: number
- **ProporArcosResponse** — estado*: string; mensagem: string; propostas: array
- **PropostaArcoRead** — titulo*: string; resumo: string; sessao_ids: array; sessao_transicao_id: —; local_ids: array
- **ProximoNumeroResponse** — numero*: integer
- **ResetLinkResponse** — email*: string; link*: string
- **RoutePlanItem** — waypoint_ids*: array; distancia_milhas*: number; tempo_horas*: number; tempo_dias: integer; tempo_horas_resto: number; tempo_texto: string; tipos*: array; geometria*: array; custo_dentro_bp: number; custo_fora_bp: number; pernoites: array; fadiga_saldo: integer; fadiga_pico: integer; fadiga_aviso: boolean; fadiga_morte: boolean; dias_visuais: array
- **RoutePlanResponse** — rotas*: array
- **RouteSegmentCreate** — waypoint_a_id*: integer; waypoint_b_id*: integer; tipo: RouteTipo; pontos_intermediarios: array; modificador_velocidade: —
- **RouteSegmentRead** — id*: integer; waypoint_a_id*: integer; waypoint_b_id*: integer; tipo*: RouteTipo; pontos_intermediarios*: array; distancia_milhas*: number; modificador_velocidade*: —
- **RouteSegmentUpdate** — waypoint_a_id: —; waypoint_b_id: —; tipo: —; pontos_intermediarios: —; modificador_velocidade: —
- **RouteTipo**
- **SessaoAdmin** — id*: integer; numero*: integer; titulo*: string; data_rotulo: —; resumo: string; locais: array; personagens: array; arco_id: —; arco_transicao_id: —; visivel_para_todos: boolean; alertas_inconsistencia: array
- **SessaoCreate** — numero*: integer; titulo*: string; data_rotulo: —; resumo: string; visivel_para_todos: boolean; local_ids: array; personagem_ids: array; arco_id: —; arco_transicao_id: —
- **SessaoListAdmin** — sessoes*: array
- **SessaoListPublic** — sessoes*: array
- **SessaoPublic** — id*: integer; numero*: integer; titulo*: string; data_rotulo: —; resumo: string; locais: array; personagens: array; arco_id: —; arco_transicao_id: —
- **SessaoRefLocal** — id*: integer; nome*: string
- **SessaoRefPersonagem** — id*: integer; nome*: string; tipo*: string
- **SessaoUpdate** — numero: —; titulo: —; data_rotulo: —; resumo: —; visivel_para_todos: —; local_ids: —; personagem_ids: —; arco_id: —; arco_transicao_id: —
- **SugestaoAssociacoesEventoRequest** — descricao*: string
- **SugestaoAssociacoesEventoResponse** — estado*: string; mensagem: string; local_ids: array; personagem_ids: array
- **SugestaoAssociacoesRequest** — resumo*: string
- **SugestaoAssociacoesResponse** — estado*: string; mensagem: string; local_ids: array; personagem_ids: array
- **TokenPasswordBody** — token*: string; password*: string
- **UnidadeDistanciaRequest** — unidade_distancia*: string
- **UnidadeDistanciaResponse** — slug*: string; unidade_distancia*: string
- **UserStateRequest** — activo*: boolean
- **ValidationError** — loc*: array; msg*: string; type*: string; input: —; ctx: object
- **VinculoCreate** — personagem_a_id*: integer; personagem_b_id*: integer; tipo_ab*: VinculoTipo; tipo_ba: —; nota_ab: string; nota_ba: string; publico: boolean; conhecido_ab: boolean; conhecido_ba: boolean; qualificador_ab: string; qualificador_ba: string; direcao: —
- **VinculoDirecao**
- **VinculoRead** — id*: integer; personagem_a_id*: integer; personagem_b_id*: integer; tipo_ab: —; tipo_ba: —; nota_ab: string; nota_ba: string; publico*: boolean; conhecido_ab: —; conhecido_ba: —; qualificador_ab: string; qualificador_ba: string; direcao: —
- **VinculoTipo**
- **VinculoUpdate** — personagem_a_id: —; personagem_b_id: —; tipo_ab: —; tipo_ba: —; nota_ab: —; nota_ba: —; publico: —; conhecido_ab: —; conhecido_ba: —; qualificador_ab: —; qualificador_ba: —; direcao: —
- **VisibilidadeRequest** — visibilidade*: string
- **VisibilidadeResponse** — slug*: string; visibilidade*: string
- **WaypointCreate** — nome: —; x*: number; y*: number; local_id: —
- **WaypointRead** — id*: integer; nome*: —; x*: number; y*: number; local_id*: —
- **WaypointUpdate** — nome: —; x: —; y: —; local_id: —

## Exemplos mínimos

```bash
# Saúde
curl http://localhost:8000/api/health

# Configuração pública da campanha
curl http://localhost:8000/api/c/e2e-codex/config

# Planejamento de rota
curl "http://localhost:8000/api/c/e2e-codex/routes/plan?from_node_id=1&to_node_id=2"
```
