# Design

## Context

Ver `proposal.md` — Why. O `Personagem` já tem um campo mecânico, `extensoes_mecanica: dict[str, Any]` (JSON), mas ele é gated por `Campanha.modulos_ativos` e validado chave a chave por `backend/app/services/mecanica.py` (`sanitize_extensoes`/`filter_extensoes`), que hoje só reconhece o módulo `fadiga` — uma chave desconhecida é rejeitada com `MODULO_MECANICA_DESCONHECIDO`. O `NPC` usa um único schema de leitura, `PersonagemRead`, filtrado por parâmetro em `personagem_to_read(npc, for_player: bool)` (`backend/app/routers/public/personagens.py`), em vez do padrão de dois schemas (`Public`/`Admin`) usado por `Sessao`.

## Goals / Non-Goals

**Goals:**
- Campo de texto sempre disponível, sem exigir ativação de módulo por campanha.
- Visibilidade GM-only garantida no mesmo ponto onde `local_ids` já é filtrado hoje, sem introduzir um segundo mecanismo de filtragem.
- Mesmo campo e mesmo comportamento pra `tipo=pj` e `tipo=npc` — nenhuma ramificação por tipo.

**Non-Goals:**
- Não cria um stat block estruturado (perícias, atributos, iniciativa) — é texto livre, ver BKLG-041/042 no backlog sobre a decisão de não comprometer com schema de sistema.
- Não adiciona indicador visual de "quais Personagens têm nota preenchida" na lista/grafo — fora de escopo desta entrega.
- Não migra ou reaproveita `extensoes_mecanica` — campo novo e independente.

## Decisions

### Campo novo e independente, não reaproveitar `extensoes_mecanica`
`extensoes_mecanica` pertence ao mecanismo de módulos por campanha; usá-lo exigiria registrar um módulo novo (ex.: `"notas"`) em `sanitize_extensoes`/`filter_extensoes` e teria que ser ativado por campanha antes de funcionar — contrário ao objetivo de um campo sempre disponível. Alternativa descartada: adicionar `"notas"` como módulo sempre-ativo por padrão — rejeitada porque mistura um conceito de dado-sempre-presente dentro de um mecanismo pensado pra extensões opcionais, aumentando a superfície de `sanitize_extensoes` sem necessidade.

### Filtragem por parâmetro em `personagem_to_read`, não um schema `PersonagemAdmin` separado
`Sessao` usa dois schemas (`SessaoPublic`/`SessaoAdmin`); `NPC` usa um único `PersonagemRead` com filtragem condicional dentro de `personagem_to_read(npc, for_player)` — mesmo padrão já usado ali pra `local_ids`. Seguir o padrão já existente no próprio arquivo é mais simples que introduzir um segundo padrão de separação admin/público só para este campo. `notas_mecanicas` entra em `PersonagemRead` como `str` (default `""`, não `Optional[str]`/`None`), consistente com `descricao` no mesmo schema — forçado a `""` quando `for_player=True`.

### Exibição no painel de leitura reaproveita o gate `isGm` já existente
`frontend-v2/src/routes/relacoes.tsx` já condiciona a exibição de informação GM-only (ex.: aviso de `visivel_para_todos === false`) a um booleano `isGm` calculado no componente pai. A nota mecânica usa o mesmo gate, na mesma área da ficha (perto da linha que já mostra `fadiga`), em vez de criar um novo mecanismo de visibilidade no frontend.

## Risks / Trade-offs

- **[Risco] Uma rota futura que leia `NPC` sem passar por `personagem_to_read()` pode esquecer de omitir `notas_mecanicas`** → Mitigação: o teste de visibilidade (ver `tasks.md`) cobre os endpoints públicos existentes; qualquer rota pública nova de leitura de Personagem deve ser coberta pelo mesmo teste antes de ser considerada completa — registrar essa expectativa no teste, não só confiar em revisão manual.
- **[Risco] Campo de texto livre sem limite pode crescer sem controle** → Mitigação: usar o mesmo `max_length` já aplicado a `descricao` (10000 caracteres) como teto, consistente com o padrão existente no modelo.

## Migration Plan

- Migração Alembic nova em `backend/alembic_campaign/versions/`, adicionando a coluna `notas_mecanicas` (`str`, default `""`, não nula) à tabela `npc`. Nenhum dado existente é alterado; a migração é aplicada automaticamente na próxima vez que cada banco de campanha for aberto (`_upgrade_or_bridge_campaign` em `backend/app/campaign_db.py`), sem passo manual por campanha.
- Rollback: `downgrade` padrão da migração remove a coluna; seguro porque nenhum outro dado depende dela.
- **Dependência cruzada de ordenação com a change `sessao-notas-preparo`** (achado da revisão arquitetural de 2026-10-20): essa change também propõe uma migração nova no mesmo diretório `backend/alembic_campaign/versions/`. A cadeia de revisões do Alembic é linear (`down_revision` encadeado a partir de `009_item`) — se as duas migrações forem escritas de forma independente, ambas vão assumir `down_revision="009_item"` e o Alembic detecta "Multiple heads" na primeira vez que qualquer banco de campanha tentar migrar. Por isso o número/nome do arquivo **não é fixado aqui**: a tarefa 1.2 em `tasks.md` instrui a conferir o head real do Alembic no momento da implementação, não hardcodar `010_...`. Se as duas changes forem implementadas na mesma sessão de trabalho, a segunda a ser escrita deve encadear sua migração a partir do head deixado pela primeira.
