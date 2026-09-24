---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ['docs/backlog/backlog.md#bklg-030']
session_topic: 'BKLG-030 — Linha do Tempo vertical da campanha (Codex da Campanha)'
session_goals: 'Fechar as perguntas em aberto (dado derivado vs. entidade nova, formato de data/calendário, o que aparece em cada ponto, visibilidade mestre/jogador) e chegar numa direção de protótipo de tela antes de qualquer TR/spec formal.'
selected_approach: 'ai-recommended'
techniques_used: ['Mind Mapping', 'Role Playing']
ideas_generated: 6
technique_execution_complete: true
session_active: false
workflow_completed: true
context_file: 'docs/backlog/backlog.md'
---

# Brainstorming Session Results

**Facilitator:** Ricardo
**Date:** 2026-09-24

## Session Overview

**Topic:** Linha do Tempo vertical da campanha — novo menu ao lado de Sessões, mostrando locais visitados e NPCs/PJs conhecidos por momento, com início (ano/mês) definido pelo mestre.

**Goals:** Decidir se a timeline é derivada dos dados existentes (Sessão/Local/NPC) ou uma entidade nova de "Evento"; definir como funciona a data/calendário; definir o que aparece em cada ponto; definir visibilidade mestre vs. jogador; chegar numa direção de protótipo de tela.

### Context Guidance

Levantamento técnico feito antes da sessão (ver `BKLG-030` em `docs/backlog/backlog.md`): hoje não existe calendário de ficção estruturado — `Sessao.data_rotulo` e `Local.data_sessao` são só rótulos de texto livre. `Local` já tem relação N:N com `NPC` (via `LocalNPCLink`), mas sem "quando". `Sessao` já é uma cronologia numerada com `visivel_para_todos`.

### Session Setup

Usuário pediu algo curto, não muito longo. Sequência de 2 técnicas confirmada.

## Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** BKLG-030 (Linha do Tempo) com foco em fechar 4 perguntas em aberto + direção de protótipo de tela, em sessão curta.

**Recommended Techniques:**

- **Mind Mapping:** ramifica "Linha do Tempo" nas 4 perguntas em aberto (dado derivado vs. entidade nova / calendário / conteúdo do card / visibilidade), até bater uma direção provisória em cada ramo.
- **Role Playing:** perspectiva de Mestre vs. Jogador sobre o mapa da Fase 1, pra validar a direção e puxar o esboço do protótipo de tela.

**AI Rationale:** tópico meio-abstrato mas concreto (decisões de modelo de dados + tela), sessão pedida curta (<30min) → 2 técnicas focadas em vez de geração de volume.

## Technique Execution Results

**Mind Mapping:**

- **Ramo 1 (dado):** entidade nova `Evento`, cadastro manual do mestre — não derivado de Sessão/Local/NPC.
- **Ramo 2 (data):** sem config de calendário/início separada — `Evento.ano` (int, ordena) + `rotulo_era` (texto livre, opcional, só exibição); timeline ordena automaticamente do mais antigo pro mais recente.
- **Ramo 3 (conteúdo):** `Evento` = título + ano/era + descrição + locais vinculados (0+) + personagens vinculados (0+) + sessão vinculada (opcional). Sem categorização/tipo nesta primeira versão (fica pra depois).
- **Ramo 4 (visibilidade):** `visivel_para_todos` (mesmo padrão de Sessão/Local/NPC) + redação de referências ocultas em vez de esconder o evento inteiro.
- **Energy Level:** ritmo ágil, decisões fechadas rápido, sem impasses.

**Role Playing:**

- **Como Mestre:** tela central em coluna vertical, um marcador por Evento (mais antigo no topo, mais recente embaixo), card expansível com título/ano/descrição/chips de local/personagens, botão "+ Novo Evento" sempre visível (é tela de documentação viva, não só consulta).
- **Como Jogador:** mesma tela, sem botão de criar (só leitura); clicar num Local/Personagem citado navega direto pro perfil dele — timeline funciona como hub de navegação cruzada, igual ao padrão já usado em Relações/Mapa.
- **Energy Level:** confirmado sem ajustes na primeira passada.

**Overall Creative Journey:** sessão enxuta e objetiva, como pedido — as 4 perguntas em aberto do BKLG-030 foram fechadas com decisões concretas, e a direção de protótipo de tela (vertical, cards expansíveis, hub de navegação, criação só pro mestre) ficou clara o suficiente pra virar spec.

### Session Highlights

**Breakthrough Moments:** simplificação do Ramo 2 (usuário cortou a necessidade de uma config de calendário/início separada — a timeline se ordena sozinha pelo evento mais antigo cadastrado), o que elimina uma entidade/decisão a mais do escopo.
**Energy Flow:** direto ao ponto do início ao fim, sem idas e vindas — sessão fechou nas 2 técnicas planejadas.

## Idea Organization and Prioritization

Sessão convergente (não divergente) — as 6 decisões já formam um único pacote coerente, sem necessidade de clustering por tema. Consolidado:

**Modelo de dados — entidade `Evento` (nova):**
- `titulo` (obrigatório)
- `ano` (int, obrigatório, ordena) + `rotulo_era` (texto livre, opcional, só exibição)
- `descricao` (texto livre)
- `locais` (0+, vínculo com `Local` já existente)
- `personagens` (0+, vínculo com `NPC`/PJ já existente)
- `sessao_id` (opcional, vínculo com `Sessao` já existente)
- `visivel_para_todos` (mesmo padrão já usado em Sessão/Local/NPC)
- Sem categorização/tipo nesta primeira versão.
- Ordenação: automática, mais antigo → mais recente. Sem config de calendário/início separada.

**Tela — "Linha do Tempo" (novo item de menu, ao lado de Sessões):**
- Coluna vertical central, scrollável, um marcador por Evento.
- Card expansível por evento: título, ano/era, descrição, chips de locais, retratos/nomes de personagens.
- Mestre: botão "+ Novo Evento" sempre visível — tela de documentação viva.
- Jogador: mesma tela, somente leitura, sem botão de criar.
- Navegação cruzada: clicar num Local/Personagem citado leva direto ao perfil dele (mesmo padrão já usado em Relações/Mapa).

**Ação imediata:** registrar essas decisões no `BKLG-030` (`docs/backlog/backlog.md`) e montar um protótipo visual da tela, conforme pedido original do usuário. De lá, o item fica pronto para `/speckit-specify`.

## Session Summary and Insights

**Key Achievements:**

- As 4 perguntas em aberto do BKLG-030 foram fechadas com decisões concretas e um modelo de dados coerente.
- Direção de tela definida (layout, card, navegação cruzada, diferença mestre/jogador).
- Sessão durou o esperado (curta, ~15-20 min), sem perder foco.

**Session Reflections:** o pedido original do backlog ("definição de início pelo mestre") foi corrigido em tempo real pelo usuário durante o brainstorm — vale atualizar o texto do `BKLG-030` pra refletir a versão final (ordenação automática), não a formulação inicial.
