# Proposal

## Why

Preparar uma sessão envolve ferramentas rápidas de improviso que o Campaign Codex não oferece hoje: sortear um nome de PNG, um rumor pra plantar na cidade, uma condição de clima pra cena, ou um item de recompensa genérico. O mestre hoje precisa recorrer a ferramentas externas pra isso. Como as duas campanhas em produção (WFRP e WoD) têm tons completamente diferentes, um gerador de conteúdo único e genérico serviria mal as duas — o conteúdo sorteado precisa respeitar a ambientação da campanha.

## What Changes

- Adiciona quatro geradores de apoio, cada um sorteando de uma tabela fixa (hardcoded): nomes de PNGs, rumores/ganchos narrativos, condição de clima/ambiente, e item/loot genérico.
- Cada gerador tem pelo menos duas variantes de conteúdo, uma por ambientação (`wfrp4e`, `wod`), selecionada a partir do campo `sistema` já existente na `Campanha`. Uma campanha com `sistema` fora desse conjunto conhecido usa um conjunto de conteúdo genérico de fallback (ver `design.md` — isso é necessário porque o BKLG-029, já especificado em `specs/140-sistema-agnostico/`, está prestes a remover a validação que hoje restringe `sistema` a esses dois valores).
- Adiciona uma tela/painel novo, só visível ao mestre (Modo GM), com um acionador por gerador.
- Conteúdo das quatro tabelas é redigido em pt-BR e en, como entregável de redação separado do trabalho de engenharia.
- **Fora de escopo desta entrega** (ver BKLG-047 no backlog): tornar as tabelas editáveis pelo mestre por campanha. Esta entrega usa só tabelas fixas no código.
- **Fora de escopo desta entrega**: o atalho de enviar o resultado sorteado direto pra `notas_preparo` de uma Sessão (change `sessao-notas-preparo`) — é uma sinergia desejável, mas não uma dependência; os dois itens funcionam de forma independente.

## Capabilities

### New Capabilities
- `geradores-apoio-mestre`: o sistema sorteia conteúdo de apoio (nome, rumor, clima, item) de tabelas fixas, com conteúdo específico por ambientação da campanha, acessível só ao mestre.

### Modified Capabilities
_Nenhuma — não há capability existente que cubra sorteio/geração de conteúdo ou conteúdo por ambientação de campanha._

## Impact

- **Backend**: módulo de serviço novo (ex.: `backend/app/services/geradores.py`) com as quatro tabelas fixas por ambientação e a lógica de sorteio; rota admin nova (GM-only) que expõe os quatro geradores — sem migração de banco, sem campo novo em `Campanha` (reaproveita `sistema`, já existente).
- **Frontend (`frontend-v2/`, único frontend em produção)**: rota nova (`frontend-v2/src/routes/campaignRoutes.tsx`, ex. path `ferramentas`), página nova, item de navegação condicional em `frontend-v2/src/components/codex/Shell.tsx` (visível só quando `canEdit`/Modo GM está ativo, mesmo padrão já usado pro toggle de edição), locales novos em `frontend-v2/src/locales/{pt-BR,en}/`.
- **Conteúdo**: quatro tabelas (nomes, rumores, clima, itens) × duas ambientações (WFRP, WoD) × dois idiomas (pt-BR, en) — trabalho de redação, não só tradução mecânica, a ser produzido e revisado antes do merge.
- **Sem impacto** em `frontend/` nem `frontend-next/` (não deployados), sem migração Alembic, sem dado GM-only a proteger (conteúdo é estático do sistema, não da campanha).
