# Design

## Context

Ver `proposal.md` para a motivação. O formulário do evento está em `LinhaTempoPage`: `MarkdownField` de `descricao` e checkboxes de `local_ids` / `personagem_ids`. O save já persiste essas ligações. A sugestão de sessão é o modelo: `motor_ia_sessao_associacoes.py`, `POST .../admin/sessoes/sugerir-associacoes`, `require_dono`, limite `10/minute`, união de ids no rascunho.

## Goals / Non-Goals

**Goals:**

- Um clique com a descrição preenchida atualiza as checkboxes do evento com uma sugestão saneada.
- O mesmo módulo `ia_arcos`, o mesmo dono e as mesmas regras de visibilidade do provedor.
- Resposta no mesmo envelope da sessão: `estado` `sugestoes` | `vazio` | `falha`, mais `local_ids` e `personagem_ids`.

**Non-Goals:**

- Sugerir título, ano, mês, era, sessão ligada ou visibilidade do evento.
- Gravar o evento ou reescrever a descrição.
- Novo toggle no Painel.
- Disparo automático enquanto o mestre escreve.

## Decisions

1. **O texto de entrada é `descricao`, não um campo chamado resumo.** O evento não tem resumo. O pedido é `{ descricao }`, com trim, rejeição de texto em branco (422, sem chamada ao provedor) e o mesmo teto de 50000 caracteres do campo.

2. **Rota irmã da de sessão, declarada antes de `GET /eventos/{evento_id}`.** `POST /api/c/{slug}/admin/eventos/sugerir-associacoes`. `require_dono` e `10/minute`, como a rota de sessão. Não estender o POST/PATCH que grava o evento.

3. **Serviço próprio, não um parâmetro novo em `completar`.** `motor_ia_evento_associacoes.py` repete o fluxo da sessão: prompt fixo sobre a descrição, catálogo de locais e personagens visíveis, descarte de ids inventados ou ocultos, listas vazias saneadas como `vazio`. A descrição é o primeiro item de contexto.

4. **União no rascunho.** Sucesso acrescenta ids às checkboxes já marcadas. `vazio` e `falha` mostram a copy do frontend e não mexem na seleção. O botão só aparece com `ia_arcos` em `modulos_ativos`, no mesmo drawer de criar e editar, desabilitado quando a descrição está em branco.

5. **Copy em `linhaTempo.json` (pt-BR e en), não reutilizar as chaves de `sessoes.json`.** Os textos falam em descrição, para o botão desabilitado bater com o campo do formulário.

## Risks / Trade-offs

- [O módulo no Painel continua rotulado como sugestão de arcos] → O botão do evento diz o que faz. Renomear o toggle fica de fora.
- [Personagem ou local oculto citado na descrição] → Não entra no catálogo nem na sugestão; o mestre marca à mão se quiser.
- [Rota `sugerir-associacoes` capturada por `/{evento_id}`] → Registrar o POST estático antes da rota com id.

## Migration Plan

Sem migração. Publicar API e frontend juntos. Rollback remove o endpoint e o botão; o save manual do evento permanece.

## Open Questions

Nenhuma.
