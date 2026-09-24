# Manual: Mapa da campanha

Como usar o mapa: pins, menu lateral, ficha de local, grupo e cálculo de rotas.

A barra superior tem **Mapa** e **Relações**. Este manual cobre só o **Mapa** (`/c/<slug>` em produção: `/c/wfrp` ou `/c/wod`). A página inicial `/` é o catálogo de mesas.

Para desenhar a rede de vias (nós e segmentos), ver [manual-rede-rotas.md](./manual-rede-rotas.md).  
Para o grafo de personagens, ver [manual-relacoes.md](./manual-relacoes.md).

---

## Quem vê o quê

| Papel | O que pode fazer |
|-------|------------------|
| **Jogador** | Explorar o mapa, abrir fichas, listar locais/NPCs/história, calcular rotas |
| **Mestre (Modo GM)** | Tudo do jogador, mais criar/editar locais, NPCs, arcos, mover o grupo, substituir a imagem do mapa e abrir a **Rede de rotas** |

Para entrar no Modo GM: **Acesso restrito (GM)** na barra → senha do mestre. Para sair: **Modo GM · Sair**.

Se a instância **ainda não tem imagem de mapa**, a app abre em **Relações** e o link Mapa fica oculto para jogadores. O mestre, depois de autenticar em Relações, pode abrir o Mapa para enviar a imagem.

---

## Explorar o mapa

### Zoom e pan

- **Roda do rato** (ou pinch no ecrã táctil) para aproximar / afastar
- **Arrastar o fundo** para deslocar a vista
- Botões no canto: **+** / **−** / **1:1** (reset)
- **⚑ Ir ao grupo** — centra a câmara no marcador do grupo

O tamanho dos pins no ecrã **não cresce** com o zoom: continuam legíveis de longe e de perto.

### Pins e grupo

- Cada **local** é um pin colorido
- O **grupo** é uma bandeira ou um brasão (o mestre escolhe o formato)
- Legenda no mapa: **Visitado** (vermelho sugerido) e **Conhecido** (lilás sugerido). O GM pode usar outras cores

### Abrir um local

- **Clique no pin** — a vista foca o local e abre a ficha ao lado do pin
- **Clique no nome no menu** (aba Locais) — o mesmo: pan/zoom animado até ao pin
- **Hover no menu** — o pin destaca-se **sem** mover a câmara

A ficha mostra nome, descrição (texto ou Markdown), imagem do local, NPCs ligados e saídas. Fecha com **×**, clicando no fundo, ou escolhendo outro sítio.

Com um local seleccionado, o mapa desenha **linhas de saída** para os destinos que o mestre cadastrou («para onde o grupo foi»).

---

## Menu lateral

Abas:

| Aba | Conteúdo |
|-----|----------|
| **Locais** | Lista (com busca). Em GM: criar, editar, apagar |
| **NPCs** | Personagens conhecidos no mapa (status, facção, retrato). Em GM: CRUD |
| **História** | Arcos da campanha e locais de cada arco. Em GM: CRUD |
| **Rota** | [Calcular rota](#calcular-rota) |
| **Grupo** | Só em GM: formato do ícone e reposicionar o grupo |

Em ecrãs estreitos o menu vira painel sobre o mapa; fecha-se para voltar a ver o mapa.

Listas vazias para o jogador (ex. «Nenhum local visitado ainda») significam que o mestre ainda não publicou esses dados na vista de jogador.

---

## Calcular rota

Aba **Rota** no menu. Só funciona se o mestre já tiver uma [rede de vias](./manual-rede-rotas.md) com nós **nomeados** (ou ligados a um Local).

1. Escolha **De** e **Para** (combo-box; também pode clicar pins no mapa enquanto o painel está aberto)
2. Abra **Opções de viagem** se quiser mudar o default:
   - **Transporte**: Pago ou Próprio (próprio pede velocidade em mi/h)
   - **Ritmo**: Normal (6 h/dia) ou Intenso (8 h/dia)
   - **Ordenar por**: mais rápida ou mais barata
   - **Preferência de via**: nenhuma, por rio ou por estrada
3. **Calcular**

O mapa mostra alternativas: a **seleccionada** em vermelho destacado; as outras mais discretas. A lista indica distância, tempo, trechos dentro/fora, e distintivos «mais rápida» / «mais barata».

Em ritmo **intenso**, trechos que acumulam fadiga ficam vermelho mais escuro; o hover no segmento indica o saldo. **Pernoites** aparecem no mapa: relento como pin azul; noite num Local como marca no pin desse local.

Origem e destino têm de ser nós diferentes. Sem nós nomeados, o painel avisa e não calcula.

---

## Modo GM no mapa

### Novo local

1. Aba **Locais** → começar adição
2. Clique no mapa onde o pin deve ficar (faixa: «Clique no mapa para posicionar o novo local»)
3. Preencha o formulário:
   - Nome (obrigatório)
   - Descrição (texto ou Markdown)
   - Rótulo de sessão (opcional)
   - Arco
   - **Cor do pin** (obrigatória) — atalhos **Visitado** e **Conhecido**
   - Imagem do local (arrastar ficheiro)
   - **Nó da rede** — liga o pin a um waypoint (o pin segue o nó)
   - NPCs presentes
   - Saídas para outros locais
4. **Salvar**

**Reposicionar**: no formulário de edição, **Reposicionar no mapa** → clique no novo sítio.

### NPCs e arcos

Nas abas correspondentes: **+ Novo NPC** / **+ Novo arco**. NPC: nome, papel, facção, status (Vivo / Morto / Desaparecido), retrato, descrição. Arco: título, resumo, ordem.

O retrato do NPC no mapa é o mesmo personagem da Rede de Relações (ficha partilhada).

### Grupo

Aba **Grupo**:

- Formato **Bandeira** ou **Brasão**
- **Mover** → clique no mapa para a nova posição

### Substituir a imagem do mapa

Botão **Mapa** nos controlos do canto (só GM). Envia um ficheiro de imagem; a vista actualiza de imediato.

### Rede de rotas

Botão **Rede de rotas** na barra (só GM). Abre o editor de nós e segmentos — [manual-rede-rotas.md](./manual-rede-rotas.md).

---

## Idioma

O combo-box PT/EN na barra muda **rótulos da interface**. Nomes, descrições e notas escritos pelo mestre **não** são traduzidos.
