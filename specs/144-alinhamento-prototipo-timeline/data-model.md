# Data Model: Alinhamento da Linha do Tempo ao protótipo

## Persistência

Esta feature não cria nem altera entidades persistidas. Permanecem válidas as entidades e regras documentadas em [spec 141](../141-linha-tempo-eventos/data-model.md).

## Projeção de apresentação

| Dado apresentado | Origem | Regra |
|---|---|---|
| Ano | Evento | Sempre apresentado no cabeçalho/resumo do evento |
| Era | `Evento.rotulo_era` | Apresentar somente quando preenchida |
| Título | Evento | Visível para ambos os papéis |
| Descrição | Evento | Mestre: no detalhe expandido. Jogador: diretamente no card quando não vazia |
| Locais e personagens | Referências do Evento | Mestre: detalhe expandido. Jogador: diretamente no card, apenas referências autorizadas já entregues pela API pública |
| Sessão vinculada | `Evento.sessao_id` resolvido contra lista de Sessões existente | Mostrar número e título quando a sessão estiver no catálogo do papel; ausência no catálogo público significa que o metadado deve ser omitido |
| Estado de visibilidade | `Evento.visivel_para_todos` | Mestre: indicador no resumo quando oculto. Jogador: evento oculto nunca entra na lista |
| Mês | `Evento.mes` já existente | Não apresentar nem editar nesta experiência; preservar o valor ao salvar outros campos |

## Estado transitório da interface

- Papel corrente da sessão: determina resumo recolhível do mestre ou detalhe direto do jogador.
- IDs dos cards expandidos: mantidos somente na sessão da página do mestre; não representam dado persistente.
- Catálogo de sessões: lista já fornecida pela API adequada ao papel, usada para mapear `sessao_id` a número e título sem revelar sessões ocultas.

## Ordenação e validação

- Não alterar a ordenação da API: `ano ASC`, `mes ASC NULLS LAST`, `sessao.numero ASC NULLS LAST`, `id ASC`, conforme o serviço atual.
- Nenhuma validação ou transição de estado de Evento muda nesta feature.
- Ao editar Evento com mês existente, o valor original permanece no payload, embora não haja controle para alterá-lo. Novos Eventos são enviados sem mês (`null`).

## Migração

Nenhuma migração Alembic. Não remover nem alterar os campos já existentes.
