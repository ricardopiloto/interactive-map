# Design

## Context

Ver `proposal.md` — Why. `Sessao` (`backend/app/models/sessao.py`) tem `numero` único e obrigatório, e já separa schema público (`SessaoPublic`) de schema admin (`SessaoAdmin(SessaoPublic)`, em `backend/app/schemas/sessao.py`) — `SessaoAdmin` hoje adiciona `visivel_para_todos` e `alertas_inconsistencia` por cima do público. Já existe o endpoint `GET /sessoes/proximo-numero` (`backend/app/routers/admin/sessoes.py:41`, usando `sessao_service.proximo_numero`). O frontend já tem o padrão de gate `gm && x.visivel_para_todos === false` pra indicar item oculto ao mestre (`frontend-v2/src/routes/cronologia.tsx:433`, usado hoje para Eventos).

## Goals / Non-Goals

**Goals:**
- Permitir preparo de sessão futura sem exigir que ela "exista oficialmente" antes da hora, usando apenas mecanismos já existentes no schema (`visivel_para_todos`, `proximo-numero`).
- Preservar notas de preparo e resumo lado a lado, sem substituição automática.
- Indicador na Linha do Tempo reaproveitando o padrão de gate `isGm`/`gm` já usado para Eventos.

**Non-Goals:**
- Não introduz um campo de estado/enum novo (`rascunho`, `planejada`, `jogada`) — decisão explícita de não fazer isso, pois `visivel_para_todos` já resolve o mesmo problema de produto.
- Não estrutura as notas em cena/gancho/segredo como campos separados — é um único texto Markdown livre, como `resumo`.
- Não lida com concorrência real-time entre múltiplos mestres — ver Risco abaixo.

## Decisions

### Reaproveitar `visivel_para_todos` como o indicador de "sessão em preparo", não um estado novo
Alternativa considerada: adicionar um campo `status: rascunho|planejada|jogada`. Descartada porque exigiria migrar dados legados (toda `Sessao` existente precisaria de um valor de `status` retroativo, provavelmente `jogada`), mais um enum pra manter em sincronia entre backend e frontend, e mais lugares na UI pra refletir o estado — tudo isso pra resolver um problema que `visivel_para_todos` (campo já existente, sem dado legado a migrar) já resolve: uma sessão "em preparo" é simplesmente uma sessão oculta dos jogadores. Ganho prático confirmado na validação fullstack desta proposta.

### `notas_preparo` entra em `SessaoAdmin`, nunca em `SessaoPublic`
Mesma decisão estrutural já usada para `visivel_para_todos`/`alertas_inconsistencia` — GM-only por construção do schema, não por um filtro condicional em tempo de leitura. Mantém consistência com o padrão já estabelecido em `Sessao` (diferente do padrão usado em `NPC`, que filtra por parâmetro — ver a proposta separada `personagem-notas-mecanicas`, que documenta por que cada modelo usa um padrão diferente).

### Pré-criar a sessão com número reservado, em vez de permitir preparo "sem número"
O endpoint `proximo-numero` já existe; o fluxo de UI de "preparar próxima sessão" simplesmente chama esse endpoint pra sugerir o número ao criar a Sessão antecipadamente. Alternativa de permitir uma Sessão sem `numero` definido foi descartada — exigiria relaxar uma constraint `unique`+`NOT NULL` já usada em ordenação e exibição em várias telas, risco desproporcional ao ganho.

## Risks / Trade-offs

- **[Risco] Conflito de `numero` ao pré-criar a próxima sessão a partir de dois dispositivos/abas ao mesmo tempo** (constraint `unique`) → Mitigação: o backend já rejeita a gravação duplicada por constraint de banco; garantir que o erro retornado é tratável pela UI (mensagem clara, não um 500 genérico) — ver tarefa de teste de borda.
- **[Risco] Mestre esquece de voltar `visivel_para_todos` para `true` depois de jogar** → Mitigação: fora de escopo desta entrega (comportamento de UI/lembrete), mas o dado em si fica correto — a sessão simplesmente continua oculta até o mestre revelar manualmente, sem efeito colateral de dados.
- **[Trade-off] Reaproveitar `visivel_para_todos` significa que uma sessão "em preparo" e uma sessão "jogada mas intencionalmente mantida oculta" são indistinguíveis só pelo booleano** → Aceito: a indicação na Linha do Tempo usa a presença de `notas_preparo` como sinal adicional de "ainda em preparo", não só `visivel_para_todos` isolado.

## Migration Plan

- Migração Alembic nova em `backend/alembic_campaign/versions/`, adicionando a coluna `notas_preparo` (nullable/default vazio) à tabela `sessao`. Aplicada automaticamente por campanha via `_upgrade_or_bridge_campaign`. Rollback: `downgrade` remove a coluna.
- **Dependência cruzada de ordenação com a change `personagem-notas-mecanicas`** (achado da revisão arquitetural de 2026-10-20): essa change também propõe uma migração nova no mesmo diretório `backend/alembic_campaign/versions/`. A cadeia de revisões do Alembic é linear (`down_revision` encadeado a partir de `009_item`) — se as duas migrações forem escritas de forma independente, ambas vão assumir `down_revision="009_item"` e o Alembic detecta "Multiple heads" na primeira vez que qualquer banco de campanha tentar migrar. Por isso o número/nome do arquivo **não é fixado aqui**: a tarefa 1.2 em `tasks.md` instrui a conferir o head real do Alembic no momento da implementação, não hardcodar `011_...`. Se as duas changes forem implementadas na mesma sessão de trabalho, a segunda a ser escrita deve encadear sua migração a partir do head deixado pela primeira.
