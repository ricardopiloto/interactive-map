# Design

## Context

- Formulário de sessão: `frontend/src/pages/SessoesPage.tsx` (`FormDrawer` com `MarkdownField` de resumo e checkboxes de `local_ids` / `personagem_ids`).
- IA: `backend/app/services/ia_provider.py` (`MODULO_IA = "ia_arcos"`, `completar`, filtro de visibilidade) e referência de saneamento JSON em `motor_ia_arcos.py`.
- Endpoint de arcos: `POST .../admin/arcos/propor` — padrão a repetir para sessões.

## Goals / Non-Goals

**Goals:**

- Um clique após preencher o resumo → checkboxes atualizadas com sugestão saneada.
- Mesmo módulo Painel (`ia_arcos`), mesmas regras de mestre/campanha/credencial.
- Resposta estruturada `{ local_ids: number[], personagem_ids: number[] }` (ou envelope com `estado`/`mensagem` alinhado ao motor de arcos).

**Non-Goals:**

- Renomear o módulo `ia_arcos` no Painel ou criar módulo separado nesta entrega.
- Sugerir título, número, data_rotulo, arco ou visibilidade da sessão.
- Persistir sugestões ou histórico de chamadas.
- Acionar IA automaticamente ao digitar (somente botão explícito).
- Jogador: fluxo continua mestre-only.

## Decisions

1. **Gate = `ia_arcos`**  
   Reutiliza `modulo_ia_ativo` sem novo toggle. O botão só renderiza quando `cfg.modulos_ativos.includes('ia_arcos')` e o utilizador está no fluxo admin de sessões.  
   *Alternativa:* módulo `ia_sessoes` — rejeitada para não multiplicar flags no Painel.

2. **Endpoint dedicado**  
   `POST /api/c/{slug}/admin/sessoes/sugerir-associacoes` com body `{ resumo: string }` (trim, mínimo 1 carácter não-branco).  
   *Alternativa:* estender PATCH de sessão — rejeitada para não misturar leitura de IA com persistência.

3. **Contexto enviado ao provedor**  
   - System prompt fixo (produto): tarefa, usar só ids/nomes fornecidos, JSON de saída.  
   - User payload JSON: `resumo` + catálogo `[{ tipo: "local"|"personagem", id, nome }]` montado a partir das mesmas listas que o formulário já carrega (registros visíveis segundo `ia-provider`; ocultos não entram no catálogo nem podem ser sugeridos).  
   *Alternativa:* enviar só nomes sem ids — rejeitada; ids reduzem alucinação e simplificam saneamento.

4. **Aplicação no formulário**  
   União: `local_ids = unique(draft.local_ids ∪ sugeridos)` (idem personagens). O mestre desmarca o que não quiser antes de salvar.  
   *Alternativa:* substituir seleção — rejeitada para não apagar trabalho manual prévio no mesmo rascunho.

5. **Resumo vazio**  
   Botão desabilitado ou pedido recusado com 400/mensagem clara — não chama o provedor.

6. **Resposta vazia saneada**  
   Estado de sucesso com listas vazias + copy do tipo “Nenhum local ou personagem identificado” — não é erro de provedor.

## Risks / Trade-offs

- **[Nomes ambíguos no resumo]** → Prompt exige escolher só entradas do catálogo; saneamento por id descarta ids inválidos.  
- **[Resumo longo / custo]** → Limite de tamanho no body (reutilizar limites de descrição/resumo já usados no backend, ex. 50k) e timeout do `ia_provider`.  
- **[Módulo rotulado “IA para arcos”]** → Copy do botão fala em “sugerir locais e personagens”; renomear toggle fica fora de escopo.  
- **[Personagem mencionado mas oculto]** → Não aparece no catálogo; mestre associa manualmente se necessário.

## Migration Plan

Deploy backend + frontend juntos. Sem migração de DB. Rollback: remover endpoint e botão; formulário manual inalterado.

## Open Questions

(nenhuma bloqueante para implementação.)
