# Proposal

## Why

O mestre escreve muito texto livre para preparar e registrar a campanha: notas de preparo da próxima sessão, resumo de sessão, descrição e notas mecânicas de personagens, descrição de locais. Hoje a IA só aparece em tarefas estruturadas (arcos, associações de sessão/evento). Pedir ajuda para escrever esses textos — rascunhar um NPC, propor ganchos para a próxima sessão — obriga o mestre a sair da ferramenta e colar contexto manualmente num chat genérico, que devolve algo desconectado da campanha.

O risco central é exatamente esse: IA sem contexto sugere ideias genéricas ou que contradizem NPCs, facções, arcos e segredos já existentes. A infraestrutura de chamada já existe (`ia-provider`); falta generalizá-la para "assistir um campo de texto" com contexto real da campanha, incluindo o conteúdo oculto que só o mestre vê.

O provedor de IA nesta fase é o **DeepSeek**, via `ia_provider`. O custo das chamadas fica por conta do produto, para favorecer adoção. Essa decisão resolve, para esta change, a dúvida de custo/privacidade do BKLG-015 (ver design, Decisão 1); monetização e cota ficam para uma decisão futura.

## What Changes

- Novo assistente de IA em campos de texto livre do mestre, acionado por botão explícito, nunca automático. Primeira onda:
  - **Notas de preparo** da sessão (rascunho) e **fios narrativos** (ganchos e linhas em aberto propostos a partir do que já aconteceu na campanha). Fios narrativos é uma ação do editor de sessão cujo resultado vai para as notas de preparo, inclusive em sessão nova ainda não salva.
  - **Resumo** de sessão.
  - **Descrição** de personagem (PJ e NPC), em todos os editores de personagem (lista de relações e mapa) — cobre o fluxo de criação de personagem.
  - **Notas mecânicas** de personagem, em texto livre e agnóstico de sistema.
  - **Descrição** de local.
- Cada pedido monta contexto real da campanha conforme o campo (ver design). O mestre dono envia também conteúdo oculto (`visivel_para_todos=false`) da própria campanha, para que as sugestões sejam coerentes com os segredos.
- A sugestão aparece num painel de revisão em texto puro. O mestre escolhe inserir, substituir ou descartar; nada é gravado sem o fluxo normal de salvar do formulário. Quando a sugestão usou conteúdo oculto e o campo de destino é visível para jogadores, o mestre vê um aviso antes de aplicar.
- O gate continua sendo o toggle de IA que o mestre já usa no Painel (módulo `ia_arcos`), em modelo tudo-ou-nada: ligado, todas as ajudas de IA aparecem; desligado, nenhuma. O rótulo e o texto de ajuda do toggle passam a dizer que o assistente pode enviar conteúdo oculto da campanha ao DeepSeek.
- Sem cota nova de custo. Vale o limite por minuto já usado nos endpoints de IA existentes, mais um teto de contexto e de tokens de saída por chamada.

## Capabilities

### New Capabilities

- `motor-ia-assistente`: contrato de assistência de IA a campos de texto livre do mestre — campos cobertos, contexto por campo, revisão antes de aplicar, tratamento de conteúdo oculto, falhas e gate por módulo. Nome alinhado ao padrão `motor-ia-*` das capacidades de IA existentes.

### Modified Capabilities

- `ia-provider`: o requirement "Dados ocultos nunca enviados ao provedor de IA" é renomeado e passa a ter uma exceção explícita e restrita: o mestre dono, ao acionar assistência de escrita, pode incluir conteúdo oculto da própria campanha. Os motores existentes (arcos, associações de sessão e evento) continuam enviando apenas conteúdo visível.

## Impact

- **Backend**: novo serviço de assistência (espelhando `motor_ia_sessao_associacoes.py`), uma rota admin de assistência com limite por minuto, schemas de pedido/resposta, extensão de `ia_provider.completar`/`montar_contexto` com `incluir_ocultos` (só-keyword, padrão `False`) e `max_tokens`, prompts fixos por tipo de assistência, testes de gate, autorização, visibilidade, isolamento e falha do provedor.
- **Frontend (`frontend-v2`)**: componente reutilizável de assistência (botão + painel de revisão) integrado em `SessionEditor.tsx`, `PersonagemEditor` (`RelationEditors.tsx`), `NpcEditor` e `LocalEditor` (`MapEditors.tsx`); `iaAtiva`/`isDono` passam a ser levados por prop até esses editores, em cada rota que os usa (sessões, relações, mapa); rótulo e ajuda do toggle em `painel.tsx` e `locales/*/comum.json`; copy pt-BR e en.
- **Sem migração de schema**: nenhum dado novo é persistido; o resultado só entra nos campos existentes pelo salvar normal.
- **Custo operacional**: aumenta o gasto com o provedor DeepSeek sem cota. Risco aceito conscientemente (ver design).
- **Privacidade**: campanhas que já tinham o toggle ligado passam a enviar conteúdo oculto ao DeepSeek nas assistências, sem novo opt-in. Aceito pelo produto (design, Decisão 1); mitigado por texto explícito no toggle e nota de release.
- **Backlog**: BKLG-046 depende do BKLG-015; esta change registra a resolução parcial dele (custo por conta do produto, DeepSeek por ora).
- **Fora de `frontend/` e `frontend-next/`**: produção roda só `frontend-v2`.
