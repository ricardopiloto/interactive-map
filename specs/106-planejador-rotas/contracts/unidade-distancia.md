# Contract: Unidade distância

`PATCH /api/campanhas/{slug}/unidade-distancia`  
Body: `{ "unidade_distancia": "mi" | "km" }`  
Auth: dono.  
Response: `{ "slug", "unidade_distancia" }`

`GET /api/c/{slug}/config` inclui `unidade_distancia`.
