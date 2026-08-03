# Data Model: 006-fix-gm-map-click

Nenhuma alteração de modelo de dados persistido, schemas ou APIs.

Esta feature altera apenas o **estado de apresentação / interação** do mapa no cliente.

## Entidades de UI (conceituais)

### Mapa da campanha (apresentação)

| Campo / estado | Descrição |
|----------------|-----------|
| `mapUrl` | URL da imagem de fundo (já existente em `MapPage`) |
| `showImage` | Imagem carregável e não marcada como falha |
| `mapEditable` | Sessão em modo GM (permissão para substituir mapa) |
| `placementMode` | `none` \| `add-pin` \| `reposition` \| `move-group` (já existente) |

### Gatilho de upload (novo contrato de comportamento)

| Estado | Clique genérico no stage | Ação explícita “Substituir mapa” | Slot/placeholder vazio |
|--------|--------------------------|----------------------------------|-------------------------|
| Jogador + mapa OK | Não abre file picker | N/A (controle oculto) | N/A |
| GM + mapa OK | Não abre file picker | Abre file picker → upload `map` | N/A |
| GM + sem mapa / falha | Não exige clique no “vazio” como único caminho | Pode abrir (opcional) | Pode abrir file picker / drop |

## Transições

1. **Idle GM com mapa** → clique no stage → permanece idle; **sem** file picker.
2. **Idle GM com mapa** → aciona “Substituir mapa” → file picker → sucesso → `mapUrl` atualizado (cache-bust) → volta idle.
3. **GM em placement** → clique no stage → aplica coordenadas; **sem** file picker.
4. **Cancelar file picker** → `mapUrl` inalterado.

## Validação

- Regras de arquivo (tipo/tamanho) permanecem as do upload admin existente.
- Sem novas entidades de domínio.
