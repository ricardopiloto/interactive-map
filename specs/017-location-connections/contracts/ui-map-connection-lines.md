# UI Contract: Linhas de conexão no mapa

## Quando desenhar

| Condição | Linhas |
|----------|--------|
| `selectedLocalId == null` | Nenhuma |
| Local selecionado com `saida_ids.length === 0` | Nenhuma |
| Local selecionado com `saida_ids = [d1, …]` | Uma linha simples origem→cada destino encontrado em `locais` |

- **Não** desenhar por `hoveredLocalId`.
- Destinos ausentes da lista carregada: pular (não quebrar o mapa).

## Geometria

- Endpoints: centro do pin = `(local.x * 100%, local.y * 100%)` no stage (mesmo sistema dos pins).
- Estilo: linha simples (stroke), sem seta, sem texto na linha.
- `pointer-events: none` — não capturar clique (pins, placement, clear selection).
- Camada abaixo dos pins (pins continuam clicáveis).

## Interação

| Ação | Efeito nas linhas |
|------|-------------------|
| Abrir pin / selecionar local (jogador ou GM) | Mostra saídas desse local |
| Fechar modal / deselecionar | Oculta todas |
| Zoom / pan | Linhas acompanham (estão no stage transformado) |
| Placement GM ativo | Linhas não bloqueiam clique no mapa |

## Formulário GM (`LocalFormDialog`)

- Campo/seção **Saídas**: multi-seleção dos outros locais (excluir o local em edição).
- Novo local: `saida_ids` inicia `[]`; destinos = locais já existentes.
- Label clara (ex. “Saídas (para onde o grupo foi)”); opcional.

## Fora de escopo (UI)

- Overlay permanente de todas as rotas
- Setas / rótulos na linha
- Modo “ligar pins” no mapa
- Destacar pin destino além da linha (opcional futuro; não requerido)
