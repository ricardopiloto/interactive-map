# Manual: Rede de Relações

Como ver e (no Modo GM) criar o grafo de personagens e vínculos. Rota: **Relações** (`/relacoes`).

Para o mapa geográfico, ver [manual-mapa.md](./manual-mapa.md).

---

## Ideia

A Rede responde «quem este personagem conhece, e como». Não há mapa de fundo: só discos (PJ/NPC) e linhas coloridas por **tipo de vínculo**.

A barra é a mesma do resto da app: **Mapa** | **Relações**, idioma, **Acesso restrito (GM)**.

---

## Vista de jogador

### Palco

- **Roda** / pinch = zoom; **+** / **−** no canto
- **Arrastar o fundo** = pan
- **Arrastar um disco** = reposicionar na sessão (não grava; no próximo carregamento o layout volta ao automático)
- **Clique num disco** = selecciona; as linhas desse personagem destacam-se após um instante
- **Clique de novo** no mesmo disco, no fundo, ou no **×** do painel = fecha o detalhe

### Coluna esquerda

- **Buscar personagem…** — filtra quem aparece no palco
- **Tipos de vínculo** (chips coloridos):
  - **Clique** — liga / desliga aquele tipo
  - **Duplo clique** — isola só aquele tipo; duplo clique de novo no mesmo chip restaura todos
- **Isolar seleção** — com alguém seleccionado, mostra só esse personagem e os vínculos **directos**
- **Legenda** — PJ vs NPC e as 8 cores de tipo

### Painel de detalhe

Abre à direita (no telemóvel, folha inferior). Mostra:

- Tipo (PJ/NPC), papel, nome, retrato, status, facção, descrição
- Lista **Vínculos (n)** — bolinha da cor, nome clicável (muda o foco), tipo (+ qualificador, + seta se houver direcção), nota

Jogadores **não** vêem personagens marcados como ocultos nem as conexões desses personagens. Vínculos secretos (não visíveis / não conhecidos) também não aparecem.

---

## Os 8 tipos (cor da linha)

| Tipo | Cor no palco | Uso típico |
|------|----------------|------------|
| Aliado | Roxo accent | Aliança, patrono, lacaio |
| Vínculo de Sangue | Borgonha / vermelho escuro | Coerção sobrenatural (nome agnóstico — não é mecânica de um sistema) |
| Amizade | Verde | Afeição sem romance |
| Inimizade | Magenta / fúcsia | Hostilidade pessoal |
| Adversário | Cobre | Oposição estrutural (facção, cargo) |
| Romance | Rosa | Relação romântica |
| Família | Âmbar | Laço familiar |
| Conhecido | Cinza **tracejado** | Conhecem-se, sem laço forte |

A cor está no **tipo**, não em cada linha à parte. Qualificador (Mentor, Medo, …) não muda a cor.

---

## Modo GM

**Acesso restrito (GM)** → senha. Aparecem **+ Personagem** e **+ Conexão**. Personagens ocultos ficam visíveis para o mestre, com distintivo no disco e indicação na ficha.

### Criar ou editar personagem

**+ Personagem**, ou **Editar** no painel de detalhe.

- Retrato (arrastar imagem) — o mesmo da ficha de NPC no mapa
- Nome, tipo **PJ** ou **NPC**, papel, facção, status, descrição
- **Visível para todos** (ligado por omissão). Desligado = só o GM vê o personagem **e todas as suas conexões** nas vistas de jogador
- Se o módulo **fadiga** estiver activo na instância, aparece o controlo 0–6

**Remover** apaga o personagem e os vínculos em que participa (pede confirmação).

### Criar ou editar conexão

Três caminhos:

- **+ Conexão** na barra
- **Editar** / **Remover** na lista de vínculos da ficha
- **Clique na linha** do grafo (atalho)

#### Personagens

Escolha A e B (têm de ser dois personagens diferentes). Não pode haver dois vínculos para o mesmo par.

#### Modo recíproco

Um só tipo nos dois sentidos. Campos:

- **Tipo de vínculo**
- **Qualificador (opcional)** — sugestões conforme o tipo (Mentor, Rival, Lacaio, …) + **Medo** em qualquer tipo; texto livre também serve
- **Direção**: Mútuo, A→B ou B→A. Ao escolher **Vínculo de Sangue**, a direcção pré-preenche A→B (pode alterar antes de gravar)
- **Visível para jogadores** — se desligado, o jogador não vê esta conexão (mesmo com ambos os personagens visíveis)
- **Nota**

#### Modo duas vias

Cada sentido tem o seu tipo (ex. A vê B como Inimizade, B vê A como Romance). No palco a linha é um **gradiente** das duas cores; cada extremo mostra `Tipo (Qualificador)` quando há texto.

Por sentido: tipo, qualificador, nota, e **Conhecido pelos jogadores (A → B)** / o inverso.

#### Qualificadores úteis

| Tipo | Sugestões |
|------|-----------|
| Aliado | Mentor, Protegido, Patrono, Devedor, Segredo, Lacaio |
| Vínculo de Sangue | Lacaio (+ Medo) |
| Amizade | Segredo, Companheiro de guerra |
| Inimizade / Adversário | Rival, Traidor, Antigo aliado |
| Família | Pai/Mãe, Irmão/Irmã, Tutor |
| Conhecido | Rival, Desconfiança, Contato |
| Romance | (só Medo / texto livre) |

**Medo** e **Lacaio** são qualificadores, não tipos. Inimizade vs Adversário: o mestre escolhe (hostilidade pessoal vs oposição de cargo/facção).

---

## O que o jogador não vê

Tudo isto é filtrado **no servidor**, não só escondido no ecrã:

1. Personagem com **Visível para todos** desligado — some o disco e **todas** as linhas ligadas a ele (também no mapa / listas de NPC, se for o caso)
2. Vínculo com **Visível para jogadores** desligado (recíproco)
3. Em duas vias, um sentido **não conhecido pelos jogadores** — esse lado da relação não entra na vista pública

O GM em modo restrito vê o grafo completo, incluindo ocultos.

---

## Dicas

- Use **duplo clique** no chip para estudar um tipo de cada vez (ex. só Família)
- **Isolar seleção** + um PJ seleccionado é o atalho para «a rede imediata deste personagem»
- Arrastar nós ajuda a desfazer sobreposições na sessão; não substitui gravar posições (não há «guardar layout»)
- Conteúdo (nomes, notas, qualificadores) fica na língua em que o mestre escreveu; o combo PT/EN só muda a interface
