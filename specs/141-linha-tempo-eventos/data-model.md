# Data Model: Linha do Tempo — Evento

## Evento

Acontecimento narrativo da campanha (cadastro manual).

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | int PK | Auto |
| `titulo` | str | Obrigatório; trim; max ~200 (alinhar Sessão) |
| `ano` | int | Obrigatório; usado na ordenação |
| `mes` | int \| null | Opcional; numeral livre do calendário da mesa; participa da ordenação quando preenchido |
| `rotulo_era` | str \| null | Opcional; só exibição; max ~100 |
| `descricao` | str | Texto livre; default `""`; max generoso (ex. 50000 como resumo de Sessão) |
| `sessao_id` | int FK → `sessao.id` \| null | Opcional; SET NULL on delete sessão (ou bloquear — preferir SET NULL / limpar no serviço) |
| `visivel_para_todos` | bool | Default `True`; mesmo padrão Sessão/Local/NPC |

**Ordenação de listagem**: `ano ASC`, `mes ASC` (NULLS LAST), `sessao.numero ASC` (NULLS LAST), `id ASC`.

**Validação create/update**:
- `titulo` não vazio após strip
- `ano` presente (int)
- `mes` se presente MUST ser int (calendário da mesa; sem intervalo fixo 1–12)
- `local_ids` / `personagem_ids` (se enviados) MUST existir na campanha; senão erro `LOCAL_NAO_ENCONTRADO` / `NPCS_NAO_ENCONTRADOS` (códigos alinhados a Sessão)
- `sessao_id` se presente MUST existir; senão `SESSAO_NAO_ENCONTRADA`

## EventoLocalLink

| Campo | Tipo |
|-------|------|
| `evento_id` | FK → `evento.id` (PK composta) |
| `local_id` | FK → `local.id` |

## EventoNpcLink

| Campo | Tipo |
|-------|------|
| `evento_id` | FK → `evento.id` (PK composta) |
| `npc_id` | FK → `npc.id` |

API expõe como `personagens` / `personagem_ids`.

## Relacionamentos

```text
Campanha (SQLite)
  └── Evento (N)
        ├── 0..1 Sessao
        ├── 0..N Local   (via EventoLocalLink)
        └── 0..N NPC     (via EventoNpcLink)  # PJ|NPC
```

## Visibilidade (leitura)

| Papel | Eventos listados | Chips local/personagem |
|-------|------------------|------------------------|
| Mestre (admin) | Todos | Completos |
| Jogador (público membro) | Só `visivel_para_todos == True` | Só entidades `is_visivel_para_jogador` |

Evento oculto: omitido da lista pública (não 404 enumerável por id se política Sessão for a mesma — alinhar: get público de id oculto → 404).

## Fora de escopo (v1)

- Tipo/categoria de evento
- Calendário / data de início da campanha
- Inclusão em export/import ZIP
- Soft-delete / histórico de versões
