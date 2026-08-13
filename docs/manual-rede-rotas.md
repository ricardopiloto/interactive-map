# Manual: Rede de rotas (nós e segmentos)

Como o mestre digitaliza a rede de vias sobre o mapa: **nós** (waypoints) e **segmentos** (estrada, rio, trilha). Essa rede alimenta o [cálculo de rotas](./manual-mapa.md#calcular-rota).

Só disponível em **Modo GM**. Jogadores não editam a rede; só a usam ao calcular uma viagem.

---

## Abrir e sair

No **Mapa**, autenticado como GM:

1. Clique **Rede de rotas** na barra superior
2. O editor substitui a vista normal: mapa + lista de nós/arestas. **Sem pins de lore** — só navegação
3. **Sair** volta ao mapa da campanha

Zoom: roda / pinch, botões **+** / **−** / **↺** (reset). Arrastar o fundo desloca a vista.

---

## Conceitos

| Peça | Função |
|------|--------|
| **Nó (waypoint)** | Ponto na via. Pode ter **nome** (aparece no combo De/Para) e/ou estar **ligado a um Local** (o pin do mapa segue este nó) |
| **Segmento (aresta)** | Ligação **bidireccional** entre dois nós: tipo estrada / rio / trilha, traçado (pontos intermédios) e distância em milhas |
| **Escala** | Quantas **milhas** valem uma unidade do mapa. Define as distâncias dos segmentos e o tempo das rotas |

Um Local só pode estar ligado a **um** nó, e um nó a **um** Local.

---

## Escala do mapa

No painel do digitizer, campo **Escala (mi / unidade)**. Ajuste e grave. Sem uma escala correcta, as milhas e os dias de viagem ficam desproporcionados.

---

## Criar um nó

1. Preencha **Nome (opcional)** se este ponto for origem/destino no calculador (ex. «Altdorf», «Encruzilhada do Reik»)
2. Opcional: escolha um **Local** para vincular já na criação
3. Clique **Novo nó**
4. Clique no mapa no sítio exacto

O modo volta a idle depois de gravar. Nós sem nome **não** aparecem no De/Para do calculador, a menos que estejam ligados a um Local (o nome do Local serve de rótulo).

### Lista de nós

- Busca no topo filtra nós e segmentos
- Clique numa linha **foca** o nó no mapa
- **Local do nó** — associar ou trocar o Local (só locais ainda livres)
- **Apagar** — remove o nó **e** todos os segmentos ligados (pede confirmação)

---

## Traçar um segmento

1. Escolha o **tipo**: Estrada, Rio ou Trilha (antes ou durante o traçado)
2. Clique **Traçar segmento**
3. **Clique no nó de origem** (tem de existir; não se cria origem «no vazio»)
4. Clique ao longo da via para **pontos intermédios** (seguem o desenho da estrada/rio no mapa)
5. **Clique no nó de destino** (ou bem junto a ele) para gravar

**Botão direito** desfaz o último ponto; se não houver intermédios, desfaz a origem e pode recomeçar.

Dicas no ecrã:

- «Clique no nó de origem…»
- «Clique intermediários na via; para salvar, clique no nó de destino…»

O segmento é **bidireccional**: a rota pode percorrê-lo nos dois sentidos. A distância em milhas deriva da escala + comprimento do traçado.

### Lista de arestas

- Clique na linha foca o segmento no mapa
- Hover no traçado (modo idle) mostra tipo e milhas
- **Apagar** remove só essa aresta (os nós ficam)

---

## Boas práticas

1. Coloque nós nos sítios que o grupo vai usar como **De/Para** (cidades, encruzilhadas, portos) e **nomeie-os**
2. Ligue o nó ao **Local** correspondente para o pin e o calculador ficarem alinhados
3. Traceie a via com intermédios a seguir o desenho do mapa — um segmento a direito entre duas cidades ignora meandros e distorce milhas
4. Use **tipo** certo: o calculador pode preferir rio ou estrada; trilhas costumam ser mais lentas
5. Grave a **escala** uma vez, com uma distância conhecida no mapa (ex. «esta barra = 80 mi»)

---

## Relação com o mapa da campanha

- Editar a rede **não** cria pins. Pins criam-se no [mapa](./manual-mapa.md#modo-gm-no-mapa)
- Vincular Local ↔ nó faz o pin **seguir** o waypoint
- Sem segmentos entre dois nós nomeados, **Calcular rota** devolve «Nenhuma rota encontrada»

---

## Ecrã estreito

A lista de nós/arestas vira folha inferior (**Lista**). Abrir a lista, escolher um item, foca no mapa e fecha a folha.
