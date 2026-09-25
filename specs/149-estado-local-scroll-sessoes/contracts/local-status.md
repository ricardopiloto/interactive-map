# Contrato: estado de exploração do Local

## Escopo

Este contrato estende as representações existentes do Local. Não adiciona rota. Todas as chamadas continuam escopadas pela campanha em `/api/c/{slug}` e sujeitas à autenticação e autorização já aplicadas nos endpoints administrativos.

## Campo

```json
{
  "estado_exploracao": "conhecido"
}
```

- Valores aceitos: `conhecido` ou `visitado`.
- Novos Locais que não enviem o campo recebem `conhecido`.
- Leituras públicas e administrativas incluem o valor persistido junto às demais informações do Local.
- A cor do marcador (`cor_pin`) e o rótulo de sessão (`data_sessao`) permanecem campos distintos.

## Operações existentes

| Operação | Requisito do campo |
|---|---|
| `GET /api/c/{slug}/locais` | Retorna `estado_exploracao` na leitura de cada Local visível ao solicitante. |
| `GET /api/c/{slug}/admin/locais` | Retorna `estado_exploracao` na leitura administrativa. |
| `POST /api/c/{slug}/admin/locais` | Aceita o campo opcional; ausência usa `conhecido`. |
| `PUT /api/c/{slug}/admin/locais/{id}` | Aceita o campo em atualização parcial; ausência preserva o estado atual. |

Valor fora do domínio é rejeitado sem gravar a atualização. A operação não modifica `data_sessao`, `cor_pin` ou propriedades não enviadas.

## Compatibilidade

O campo novo é aditivo para consumidores da resposta; clientes antigos podem ignorá-lo. Dados preexistentes recebem a equivalência documentada em [data-model.md](../data-model.md). Nenhuma rota ou permissão existente é ampliada.

## Interface de rolagem

A página de Sessões não muda seu contrato de dados. Quando a lista ultrapassar a altura visível, a rolagem vertical disponível deve permitir chegar a cada entrada, incluindo a última, em desktop e mobile. O indicador visual da scrollbar pode depender do sistema operacional; a capacidade efetiva de rolar é o critério.
