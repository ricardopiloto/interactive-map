# Research: Migração das instâncias legadas e corte

**Feature**: `099-migracao-legado-corte`  
**Date**: 2026-09-20

## 1. Distinguir zip 097 de import legado

**Decision**: Novo subcomando CLI `campanha importar-legado`. `campanha importar` (zip) **não** muda. Este caminho só aceita uma **árvore de instância** (pasta com `mapa.db` + `uploads/`). Ficheiro `.db` solto, zip, ou pasta sem `mapa.db` → `ORIGEM_INVALIDA`. Sem rota HTTP de import legado (spec: CLI/script só).

**Rationale**: Constituição II/IV; clarificação 097 vs 099; FR-001; nunca abrir `.db` de utilizador na API.

**Alternatives considered**: Reusar `campanha importar --origem`. Rejeitado (mistura contratos). Empacotar legado em zip 097. Rejeitado (spec: cópia de `mapa.db` de operador).

## 2. Sequência no destino (reutilizar 093)

**Decision**:

1. Validar origem (árvore, `mapa.db`, pasta `uploads/` presente — pode estar vazia).
2. `create_campanha` (slug/sistema/nome/visibilidade; `cota_bytes` default ou `--cota-bytes`).
3. Substituir `campanha.db` pela **cópia** de `mapa.db`.
4. Copiar `uploads/` da origem para o sítio (layout abaixo).
5. `reset_engines` + `ensure_campaign_schema(fresh=False)` → ponte `_migrate_sqlite` + `alembic stamp` **só no destino**.
6. Reescrita **persistida** de URLs de imagem para `/api/c/{slug}/media/…`.
7. Stamp `mapa_arquivo` (096) + `reconcile_bytes_usados`.
8. `assign_owner`.
9. Relatório PASS/FAIL; FAIL → rollback sítio + linha `Campanha` (+ membro se criado).

Origem: só leitura (cópia). Comparar hashes/mtime **depois**.

**Rationale**: FR-002/012; contrato 093 `legacy-bridge-stamp`; rollback já usado em `create_campanha`.

**Alternatives considered**: Ponte na origem. Rejeitado (III/VI). Abrir `mapa.db` in-place no `/opt`. Rejeitado.

## 3. Layout da origem

**Decision**: `--origem` aponta à pasta da instância. Resolver `mapa.db` nesta ordem:

1. `{origem}/mapa.db`
2. `{origem}/data/mapa.db`

`uploads/`:

1. `{origem}/uploads/`
2. `{origem}/data/uploads/`

Ambos MUST existir (db ficheiro; uploads diretório). Sem criar origem.

**Rationale**: 078 usa volumes `mapa-data` / `mapa-uploads`; instâncias `/opt/codex-*` misturam `data/mapa.db` e `uploads/` na raiz.

**Alternatives considered**: Só um layout. Frágil no ensaio.

## 4. Layout de uploads no destino

**Decision**: Destino = `campanhas/<uuid>/uploads/{map,portraits,locals}/` (093/096).

Cópia:

- Se origem já tem `map|portraits|locals/` → copiar para as mesmas categorias.
- Ficheiros `campaign-map.*` na raiz de `uploads/` → `map/`.
- Outros ficheiros na raiz: se parecer retrato/local por convenção antiga, recusar com `UPLOADS_LAYOUT_DESCONHECIDO` **ou** deixar na raiz **e** contar para cota (096 already counts `rglob`). Preferir: copiar árvore **tal-qual** para `uploads/` do destino **depois** garantir subpastas categoria (mkdir). Stamp 096 encontra `campaign-map.*` em `map/` **ou** leftover na pasta map. Se `campaign-map.*` ficou na raiz de `uploads/`, mover para `map/` no destino (não na origem).

**Rationale**: FR-003; ponte mapa 096; origem intacta.

**Alternatives considered**: Exigir layout 096 na origem. Rejeitado (legado).

## 5. Reescrita persistida de URLs

**Decision**: No **destino**, UPDATE dos campos `retrato_url` / `imagem_url` (e equivalentes se existirem) para `/api/c/{slug_novo}/media/{categoria}/{arquivo}`:

| Padrão origem | Destino |
|---------------|---------|
| `/uploads/c/{qualquer}/(map\|portraits\|locals)/{ficheiro}` | `/api/c/{slug_novo}/media/…` |
| `/uploads/(map\|portraits\|locals)/{ficheiro}` | idem |
| `/uploads/{ficheiro}` se o ficheiro está em `map/` ou é `campaign-map.*` | `/api/c/{slug}/media/map/{ficheiro}` |
| já `/api/c/…/media/…` | só substituir o slug pelo novo; idempotente |

Não alterar origem. 096 rewrite-on-read continua como rede de segurança.

**Rationale**: FR-003; legado não tem `/uploads/c/{slug}` igual ao Codex.

**Alternatives considered**: Só rewrite na leitura 096. Rejeitado (spec pede reescrita no conteúdo importado).

## 6. Relatório de verificação

**Decision**: JSON stdout (+ opcional `--relatorio PATH`). Tabelas de conteúdo (contagem `SELECT count(*)` se a tabela existir):

`arco`, `npc`, `local`, `local_npc`, `local_conexao`, `grupo_posicao`, `vinculo`, `waypoint`, `route_segment`, `map_scale` — `__tablename__` dos modelos de conteúdo (097 `content.json` como lista canónica). Ficheiros: número de ficheiros (`Path.rglob` files) em uploads origem vs destino.

`resultado`: `PASS` sse todas as chaves presentes em **ambos** lados coincidem (tabela ausente nos dois = 0). Qualquer divergência → `FAIL` + rollback.

**Rationale**: FR-005; SC-001.

**Alternatives considered**: Diff binário de `.db`. Rejeitado (ponte altera schema). Hash só de uploads. Insuficiente para IDs.

## 7. Cota

**Decision**: Omissão `cota_bytes = 10 * 1024**3`. `--cota-bytes N` (inteiro > 0) no CLI. Após cópia, se `bytes_usados > cota_bytes` → `COTA_EXCEDIDA`, rollback. Depois vale 096.

**Rationale**: Clarificação Q5; não apagar origem.

**Alternatives considered**: Isenção silenciosa acima de 10 GB. Rejeitado (096).

## 8. Snippets de corte (078)

**Decision**: Script `scripts/imprimir-snippets-codex.sh` (ou `campanha snippets-corte`) preenche `deploy/snippets/caddy.site.tpl` e `cloudflared.ingress.tpl` com hostname **`campaign-codex.1nodado.com.br`** e portas do compose Codex. **Stdout só.** MUST NOT escrever Caddyfile, `config.yml`, `hub/campanhas.json`, `/opt/codex-*`. Sem snippet de hub JSON (hub aposentado). Sem `redir` / `redir permanent` para hosts antigos.

**Rationale**: FR-007; clarificação Q2; 078.

**Alternatives considered**: Ansible no host. Rejeitado (078).

## 9. Ordem do corte e janela

**Decision**: Runbook: (1) ensaio em **cópias** + relatórios PASS; (2) import de produção para o `DATA_DIR` do Codex **novo** (origem `/opt` só lida); (3) publicar compose Codex; (4) colar snippets; (5) **verificar** smoke (`/`, `/c/wfrp`, `/c/wod`, login mestre, um GET mídia mapa); (6) **parar** instâncias antigas; (7) 14 dias intactas; (8) fechar retorno (arquivar/desligar — documentado; sem delete na janela).

**Rationale**: Clarificações Q1–Q2.

**Alternatives considered**: Parar antigas primeiro. Rejeitado (gap).

## 10. Aposentar 078

**Decision**: `scripts/nova-campanha.sh` e `scripts/migrar-wfrp.sh` passam a imprimir aviso (Codex + `campanha criar` / painel) e `exit 1` **antes** de criar pastas. Ficheiros e `hub/` ficam no git. README / manuais / runbook novo apontam a `campaign-codex.1nodado.com.br` + `/c/wfrp` + `/c/wod`.

**Rationale**: Clarificação Q4; FR-009.

**Alternatives considered**: Apagar scripts. Rejeitado (histórico + janela 14 dias). Deixar scripts funcionais. Rejeitado (dois modelos vivos).

## 11. Slugs e parâmetros

**Decision**: CLI exige `--slug --sistema --email --nome --origem`. Runbook de produção usa `wfrp` + `wfrp4e` e `wod` + `wod`. Visibilidade omissão `listada`. Dono: email já existente (095). Sem adivinhar slug a partir da pasta.

**Rationale**: Clarificação Q3; FR-004.

## 12. Testes e `/opt`

**Decision**: Fixtures em `backend/tests/fixtures/legado/` (wfrp-like + wod-like: `mapa.db` mínimo + uploads). Testes **nunca** apontam a `/opt/codex-*`. Assert: origem fixture byte-igual; destino isolado; scripts 078 exit ≠ 0; snippets não tocam `deploy/Caddyfile`.

**Rationale**: III mesmo nesta spec de corte: o código não escreve nas pastas vivas; o operador copia à mão para o ensaio.

**Alternatives considered**: Teste de integração contra `/opt`. Rejeitado (não reproduzível; risco).

## 13. Release

**Decision**: Corte operacional = **2.0.0** (modelo de deploy: uma instância Codex; 078 deixa de ser procedimento corrente). CHANGELOG `[Unreleased]` até o implement; bump no fecho da fase.

**Rationale**: `specs/v2/README.md` target 2.0.0; scripts 078 passam a recusar.

**Alternatives considered**: Manter 0.19.1. Rejeitado para o corte (breaking para operadores).
