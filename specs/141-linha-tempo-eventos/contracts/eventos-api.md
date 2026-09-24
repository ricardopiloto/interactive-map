# Contract: API Eventos (Linha do Tempo)

**Surface**: HTTP sob campanha `/api/c/{slug}` (espelho Sessões).

## Público (leitura — membro / regras de visibilidade da campanha)

Prefixo: `/api/c/{slug}`

| Método | Path | Comportamento |
|--------|------|----------------|
| `GET` | `/eventos` | Lista ordenada `ano ASC, mes ASC NULLS LAST, sessao.numero ASC NULLS LAST, id ASC`; só `visivel_para_todos`; chips filtrados |
| `GET` | `/eventos/{id}` | Detalhe; 404 se inexistente ou oculto ao jogador |

### Item público (resposta)

```json
{
  "id": 1,
  "titulo": "Queda de Bögenhafen",
  "ano": 2512,
  "mes": 3,
  "rotulo_era": "Ano 3, Era do Lobo",
  "descricao": "…",
  "sessao_id": 4,
  "locais": [{ "id": 2, "nome": "Bögenhafen" }],
  "personagens": [{ "id": 7, "nome": "Eber", "tipo": "pj", "retrato_url": "…" }]
}
```

- Sem campo `visivel_para_todos` no público.
- `rotulo_era` pode ser `null` / omitido.
- Locais/personagens ocultos **não** aparecem nos arrays.

## Admin (CRUD — `require_membro` / papel mestre conforme Sessões)

Prefixo: `/api/c/{slug}/admin`

| Método | Path | Comportamento |
|--------|------|----------------|
| `GET` | `/eventos` | Todos os eventos; chips completos; inclui `visivel_para_todos` |
| `GET` | `/eventos/{id}` | Detalhe admin |
| `POST` | `/eventos` | Cria |
| `PATCH` | `/eventos/{id}` | Actualiza campos e/ou substitui links |
| `DELETE` | `/eventos/{id}` | Remove evento + links |

### Body create / update (campos relevantes)

```json
{
  "titulo": "…",
  "ano": 2512,
  "mes": 3,
  "rotulo_era": "…",
  "descricao": "…",
  "visivel_para_todos": true,
  "sessao_id": null,
  "local_ids": [1, 2],
  "personagem_ids": [7]
}
```

- Create: `titulo` + `ano` obrigatórios; `mes` opcional (int livre do calendário da mesa).
- Update: partial OK; se `local_ids` / `personagem_ids` enviados, **substituem** o conjunto (padrão Sessão).
- Ordenação: `ano ASC` → `mes ASC` (sem mês por último no mesmo ano) → `sessao.numero ASC` (sem sessão por último) → `id ASC`.

### Códigos de erro (API `detail.erro`)

| Código | Quando |
|--------|--------|
| `EVENTO_NAO_ENCONTRADO` | id inválido / fora da campanha |
| `LOCAL_NAO_ENCONTRADO` | id de local inexistente |
| `NPCS_NAO_ENCONTRADOS` | id de personagem inexistente |
| `SESSAO_NAO_ENCONTRADA` | `sessao_id` inválido |
| validação 422 | título vazio, ano em falta, tipos errados |

Isolamento: pedidos a slug B NUNCA lêem/escrevem eventos de A (matriz de testes).

## UI (contrato de produto)

- Nav: item «Linha do Tempo» ao lado de Sessões (`campaignNav`).
- Rota app: `/c/:slug/linha-do-tempo`.
- Mestre: botão criar + editar/apagar; jogador: só leitura.
- Clique em chip permitido → navegação existente (relações/mapa) como em `SessoesPage`.
