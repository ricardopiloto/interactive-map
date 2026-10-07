// Dados mocados — protótipo v3, 100% desconectado de qualquer backend.
// Flavor emprestado da campanha real "Armada Agazzi" (WFRP 4e) para o protótipo
// soar como uma mesa de verdade, não um lorem ipsum genérico.

export type TipoPersonagem = 'pj' | 'npc'
export type StatusPersonagem = 'vivo' | 'morto' | 'desaparecido' | 'desconhecido'
export type TipoVinculo =
  | 'aliado'
  | 'sangue'
  | 'amizade'
  | 'inimizade'
  | 'adversario'
  | 'romance'
  | 'familia'
  | 'conhecido'

export interface StatBlock {
  sistema: 'wfrp'
  ca?: number
  hpr?: number
  for?: number
  res?: number
  ini?: number
  ag?: number
  des?: number
  int?: number
  von?: number
  cam?: number
  pericias?: string[]
  talentos?: string[]
  pertences?: string[]
}

export interface Personagem {
  id: string
  nome: string
  tipo: TipoPersonagem
  papel?: string
  faccaoId?: string
  status: StatusPersonagem
  corRetrato: string
  iniciais: string
  descricao: string // markdown com [[wikilinks]]
  statBlock?: StatBlock
  visivelParaTodos: boolean
  localIds?: string[]
}

export interface Local {
  id: string
  nome: string
  tipo: 'cidade' | 'regiao' | 'ponto'
  arcoId?: string
  corPin: string
  x: number
  y: number
  descricao: string
  visivelParaTodos: boolean
}

export interface Faccao {
  id: string
  nome: string
  corAccent: string
  descricao: string
}

export interface Item {
  id: string
  nome: string
  descricao: string
  portadorId?: string
  localId?: string
}

export interface Arco {
  id: string
  titulo: string
  resumo: string
  cor: string
  ordem: number
  visivelParaTodos: boolean
}

export interface Capitulo {
  id: string
  arcoId: string | null
  titulo: string
  ordem: number
  corpoMarkdown: string
  visivelParaTodos: boolean
  preparado: boolean
}

export interface Sessao {
  id: string
  numero: number
  titulo: string
  data: string
  resumo: string
  capituloId: string | null
  arcoId: string | null
  visivelParaTodos: boolean
}

export interface Vinculo {
  id: string
  aId: string
  bId: string
  tipo: TipoVinculo
  qualificador?: string
  direcao?: 'mutuo' | 'a-b' | 'b-a'
}

export interface EventoTimeline {
  id: string
  titulo: string
  ano: number
  mes?: number
  arcoId?: string
  sessaoId?: string
  descricao: string
}

// ---------------------------------------------------------------------------
// Facções
// ---------------------------------------------------------------------------

export const faccoes: Faccao[] = [
  {
    id: 'armada-agazzi',
    nome: 'Armada Agazzi',
    corAccent: '#d8aa5a',
    descricao:
      'Companhia mercenária fundada por [[Ettore Agazzi]] em Altdorf. Conhecida — nos círculos certos — como solucionadora de problemas delicados que não devem chamar atenção pública.',
  },
  {
    id: 'rosa-negra',
    nome: 'Ordem da Rosa Negra',
    corAccent: '#8a2b4c',
    descricao:
      'Ordem obscura ligada ao [[Grande Hospício]], envolvida em desaparições nunca totalmente explicadas.',
  },
  {
    id: 'cacadores-bruxas',
    nome: 'Caçadores de Bruxas',
    corAccent: '#7a1f1f',
    descricao:
      'Braço religioso do Império que [[Friedrich von Carstein]] e seus aliados fazem questão de manter longe do Reikland.',
  },
  {
    id: 'von-carstein',
    nome: 'Círculo von Carstein',
    corAccent: '#4a2a5c',
    descricao: 'Vampiros antigos que operam nas sombras da política de Altdorf.',
  },
]

// ---------------------------------------------------------------------------
// Locais
// ---------------------------------------------------------------------------

export const locais: Local[] = [
  {
    id: 'altdorf',
    nome: 'Altdorf',
    tipo: 'cidade',
    corPin: '#d8aa5a',
    x: 0.52,
    y: 0.58,
    visivelParaTodos: true,
    descricao:
      'Capital do Império. É em [[Cassino de Altdorf|uma casa de apostas clandestina]] da cidade que [[Ettore Agazzi]] fechou o contrato que levaria a companhia até [[Sigurd Ugenhauer]].',
  },
  {
    id: 'cassino-altdorf',
    nome: 'Cassino de Altdorf',
    tipo: 'ponto',
    arcoId: 'arco-fome',
    corPin: '#d8aa5a',
    x: 0.535,
    y: 0.585,
    visivelParaTodos: true,
    descricao:
      'Casa de apostas clandestina onde [[Friedrich von Carstein]] costuma aparecer "como um nobre entre outros". Fumaça, veludo vermelho e dados rolando.',
  },
  {
    id: 'grande-hospicio',
    nome: 'Grande Hospício de Reikland',
    tipo: 'ponto',
    arcoId: 'arco-fome',
    corPin: '#8a2b4c',
    x: 0.49,
    y: 0.47,
    visivelParaTodos: true,
    descricao:
      'Administrado pela [[Ordem da Rosa Negra]]. Origem de desaparições nunca explicadas; [[Albert Vernick]] é evasivo sobre o que acontece lá dentro.',
  },
  {
    id: 'ubersreik',
    nome: 'Ubersreik',
    tipo: 'cidade',
    corPin: '#5a7a9a',
    x: 0.44,
    y: 0.62,
    visivelParaTodos: true,
    descricao: 'Parada da Armada Agazzi antes de seguir para o Domínio de Falkenried.',
  },
  {
    id: 'falkenried',
    nome: 'Domínio de Falkenried',
    tipo: 'regiao',
    arcoId: 'arco-falkenried',
    corPin: '#4a7a4a',
    x: 0.4,
    y: 0.7,
    visivelParaTodos: true,
    descricao:
      'Feudo pequeno e antigo nas franjas do Império, última parada antes da fronteira da Bretonnia. Repousa — sem que a família saiba — sobre túneis Skaven antigos.',
  },
  {
    id: 'vila-falkenried',
    nome: 'Vila de Falkenried',
    tipo: 'ponto',
    arcoId: 'arco-falkenried',
    corPin: '#4a7a4a',
    x: 0.39,
    y: 0.705,
    visivelParaTodos: true,
    descricao:
      'Sede do domínio, junto ao Ribeirão Falken. A taverna **A Coruja Cinzenta** é ponto de encontro natural para testes de Fofoca.',
  },
  {
    id: 'mansao-falkenried',
    nome: 'Mansão Senhorial',
    tipo: 'ponto',
    arcoId: 'arco-falkenried',
    corPin: '#4a7a4a',
    x: 0.395,
    y: 0.695,
    visivelParaTodos: false,
    descricao:
      'Numa elevação ao norte da vila. As galerias mais profundas do sistema Skaven passam exatamente sob esta colina — ninguém na família sabe disso.',
  },
]

// ---------------------------------------------------------------------------
// Personagens (PJs e NPCs)
// ---------------------------------------------------------------------------

export const personagens: Personagem[] = [
  {
    id: 'ettore-agazzi',
    nome: 'Ettore Agazzi',
    tipo: 'pj',
    papel: 'Líder da companhia',
    faccaoId: 'armada-agazzi',
    status: 'vivo',
    corRetrato: '#d8aa5a',
    iniciais: 'EA',
    visivelParaTodos: true,
    descricao:
      'Fundador da [[Armada Agazzi]]. Negociou o contrato com [[Friedrich von Carstein]] para caçar [[Sigurd Ugenhauer]] e desferiu o golpe final em [[Capítulo: Caçada ao Porco]].',
    statBlock: {
      sistema: 'wfrp',
      ca: 52,
      hpr: 38,
      for: 40,
      res: 38,
      ini: 45,
      ag: 42,
      des: 35,
      int: 38,
      von: 44,
      cam: 46,
      pericias: ['Intimidação', 'Lábia', 'Liderança'],
      talentos: ['Golpe Certeiro', 'Sangue Frio'],
      pertences: ['Rapieira ornamentada', 'Mapa amarelado de Friedrich'],
    },
  },
  {
    id: 'rocco-niekisch',
    nome: 'Rocco Niekisch',
    tipo: 'pj',
    papel: 'Combatente',
    faccaoId: 'armada-agazzi',
    status: 'vivo',
    corRetrato: '#b5553a',
    iniciais: 'RN',
    visivelParaTodos: true,
    descricao:
      'Derrotou [[Sigurd Ugenhauer]] com fogo concentrado, rompendo sua regeneração amaldiçoada. Recebeu uma marca misteriosa na costela depois do confronto.',
    statBlock: {
      sistema: 'wfrp',
      ca: 48,
      hpr: 30,
      for: 44,
      res: 42,
      ini: 32,
      ag: 38,
      des: 30,
      int: 28,
      von: 36,
      cam: 25,
      pericias: ['Canalização', 'Perceber Perigo'],
      talentos: ['Ignite', 'Resistente à Dor'],
      pertences: ['Grimório de bolso'],
    },
  },
  {
    id: 'marial-del-solacruz',
    nome: 'Marial Eduarda del Solacruz',
    tipo: 'pj',
    papel: 'Investigadora',
    faccaoId: 'armada-agazzi',
    status: 'vivo',
    corRetrato: '#9a6ab5',
    iniciais: 'ME',
    visivelParaTodos: true,
    descricao:
      'Recebeu o desenho de Grosslin e a carta de [[Rosanna Breuhl]]. Lutou na clareira final contra [[Sigurd Ugenhauer]].',
  },
  {
    id: 'sarah-everstein',
    nome: 'Sarah Everstein',
    tipo: 'pj',
    papel: 'Erudita',
    faccaoId: 'armada-agazzi',
    status: 'vivo',
    corRetrato: '#5a9a8a',
    iniciais: 'SE',
    visivelParaTodos: true,
    descricao:
      'Descobriu a existência da [[Ordem da Rosa Negra]]. Abordada pelo paciente [[Stal]] no [[Grande Hospício]].',
  },
  {
    id: 'grodnar-goldhand',
    nome: 'Grodnar Goldhand',
    tipo: 'pj',
    papel: 'Rastreador',
    faccaoId: 'armada-agazzi',
    status: 'vivo',
    corRetrato: '#c99a4a',
    iniciais: 'GG',
    visivelParaTodos: true,
    descricao:
      'Leu os rastros nas fazendas a sul do [[Grande Hospício]] e trancou o portão do hospício. Mordido por um carniçal — a ferida nunca saiu totalmente da cabeça dele.',
  },
  {
    id: 'reinhardt-falkenried',
    nome: 'Reinhardt von Falkenried',
    tipo: 'pj',
    papel: 'Noviço de Myrmidia',
    faccaoId: 'armada-agazzi',
    status: 'vivo',
    corRetrato: '#6a7ab5',
    iniciais: 'RF',
    visivelParaTodos: true,
    descricao:
      'Irmão de [[Isabella von Falkenried]]. Formalmente um noviço devoto; na família, sabe-se que tem o dom de Scryer. Junta-se à [[Armada Agazzi]] a partir de [[Capítulo: O Silêncio entre os tijolos]].',
  },
  {
    id: 'friedrich-carstein',
    nome: 'Friedrich von Carstein',
    tipo: 'npc',
    papel: 'Vampiro contratante',
    faccaoId: 'von-carstein',
    status: 'vivo',
    corRetrato: '#4a2a5c',
    iniciais: 'FC',
    visivelParaTodos: true,
    descricao:
      'Contratou a [[Armada Agazzi]] para caçar [[Sigurd Ugenhauer]]. Reaparece na clareira final, elegante como sempre: "Bravo... vocês são melhores caçadores do que imaginei."',
  },
  {
    id: 'lilli-carstein',
    nome: 'Lilli von Carstein',
    tipo: 'npc',
    papel: 'Acompanhante de Friedrich',
    faccaoId: 'von-carstein',
    status: 'vivo',
    corRetrato: '#6a3a7c',
    iniciais: 'LC',
    visivelParaTodos: false,
    descricao:
      'Decapitou o corpo de [[Sigurd Ugenhauer]] sem hesitação e confirmou a maldição do necromante. Avisou sobre [[Rosanna Breuhl]].',
  },
  {
    id: 'sigurd-ugenhauer',
    nome: 'Sigurd Ugenhauer',
    tipo: 'npc',
    papel: 'Ghoul — "O Porco"',
    status: 'morto',
    corRetrato: '#5a3a2a',
    iniciais: 'SU',
    visivelParaTodos: true,
    descricao:
      'Chamado de *O Porco*. Senhor de uma matilha de carniçais que aterrorizou as fazendas a sul do [[Grande Hospício]]. Amaldiçoado por um necromante não identificado — regenerava ferimentos quase tão rápido quanto os recebia. Morreu em [[Capítulo: Caçada ao Porco]], quando [[Rocco Niekisch]] arrancou seu olho com fogo concentrado e [[Ettore Agazzi]] cravou a rapieira. Últimas palavras: *"A fome nunca morre."*',
    statBlock: {
      sistema: 'wfrp',
      ca: 48,
      for: 48,
      res: 52,
      ini: 32,
      ag: 38,
      des: 28,
      int: 18,
      von: 38,
      cam: 8,
      pericias: ['Intimidação', 'Percepção', 'Furtividade'],
      talentos: ['Regeneração Amaldiçoada', 'Fome Voraz', 'Resistente à Dor'],
      pertences: ['Nenhum — luta com garras e dentes'],
    },
  },
  {
    id: 'albert-vernick',
    nome: 'Albert Vernick',
    tipo: 'npc',
    papel: 'Administrador do Hospício',
    faccaoId: 'rosa-negra',
    status: 'vivo',
    corRetrato: '#8a2b4c',
    iniciais: 'AV',
    visivelParaTodos: false,
    descricao: 'Administrador do [[Grande Hospício]], evasivo sobre a [[Ordem da Rosa Negra]].',
  },
  {
    id: 'stal',
    nome: 'Stal',
    tipo: 'npc',
    papel: 'Paciente do Hospício',
    status: 'desconhecido',
    corRetrato: '#7a7a7a',
    iniciais: 'ST',
    visivelParaTodos: false,
    descricao: 'Abordou [[Sarah Everstein]] dizendo o nome de Franz Beck.',
  },
  {
    id: 'rosanna-breuhl',
    nome: 'Rosanna Breuhl',
    tipo: 'npc',
    papel: 'Correspondente misteriosa',
    status: 'desconhecido',
    corRetrato: '#9a5a6a',
    iniciais: 'RB',
    visivelParaTodos: false,
    descricao:
      'Nunca apareceu pessoalmente, mas enviou cartas via [[Friedrich von Carstein]] e [[Lilli von Carstein]].',
  },
  {
    id: 'isabella-falkenried',
    nome: 'Isabella von Falkenried',
    tipo: 'npc',
    papel: 'Herdeira do feudo',
    status: 'vivo',
    corRetrato: '#6a7ab5',
    iniciais: 'IF',
    visivelParaTodos: true,
    descricao:
      'Herdeira legítima de [[Domínio de Falkenried]]. Sua aceitação garante a legitimidade legal da sucessão de [[Ettore Agazzi]] como senhor feudal.',
  },
  {
    id: 'wilhelm-falkenried',
    nome: 'Wilhelm von Falkenried',
    tipo: 'npc',
    papel: 'Ex-barão (falecido)',
    status: 'morto',
    corRetrato: '#5a5a5a',
    iniciais: 'WF',
    visivelParaTodos: true,
    descricao: 'Morto pouco antes da chegada da companhia, sem herdeiro secular disponível.',
  },
]

// ---------------------------------------------------------------------------
// Itens
// ---------------------------------------------------------------------------

export const itens: Item[] = [
  {
    id: 'mapa-amarelado',
    nome: 'Mapa amarelado de Friedrich',
    portadorId: 'ettore-agazzi',
    descricao:
      'Entregue por [[Friedrich von Carstein]] no Cassino de Altdorf. Símbolos riscados em tinta escura marcam locais de carnificina.',
  },
  {
    id: 'pedra-ritual',
    nome: 'Pedra ritual coberta de sangue',
    localId: 'grande-hospicio',
    descricao: 'Encontrada entre os restos de [[Sigurd Ugenhauer]], aponta de volta para o Hospício.',
  },
]

// ---------------------------------------------------------------------------
// Arcos e Capítulos (preparação)
// ---------------------------------------------------------------------------

export const arcos: Arco[] = [
  {
    id: 'arco-fome',
    titulo: 'A Fome de Reikland',
    resumo:
      'A caçada a [[Sigurd Ugenhauer]] e o rastro de desaparições que leva ao [[Grande Hospício]].',
    cor: '#8a2b4c',
    ordem: 1,
    visivelParaTodos: true,
  },
  {
    id: 'arco-falkenried',
    titulo: 'O Legado de Falkenried',
    resumo: 'A decadência de um domínio e a ascensão inesperada de [[Ettore Agazzi]] a senhor feudal.',
    cor: '#4a7a4a',
    ordem: 2,
    visivelParaTodos: true,
  },
]

export const capitulos: Capitulo[] = [
  {
    id: 'cap-fumo-ouro',
    arcoId: 'arco-fome',
    titulo: 'Entre o Fumo e o Ouro',
    ordem: 1,
    preparado: true,
    visivelParaTodos: false,
    corpoMarkdown: `**Objetivo:** reforçar a decisão da caçada e apresentar o início concreto da missão.

**Cenário:** a casa de apostas clandestina de [[Cassino de Altdorf]]. O salão está cheio de fumaça, risadas falsas e cheiro de vinho velho.

**Desenvolvimento:** [[Friedrich von Carstein|Friederich]] está ali novamente, como um nobre entre outros. Já sabe da decisão dos mercenários e os parabeniza com ironia:

> "Ah, então a caça venceu a curiosidade... uma escolha sensata. Nosso amigo faminto não conhece descanso — e nem limite."

Ele entrega um **mapa amarelado**, com símbolos riscados em tinta escura.

> [!handout] Anotação no mapa
> "Rumores de corpos desaparecendo próximo ao caminho do Grande Hospício."

**Transição:** os jogadores deixam Altdorf com destino ao interior.`,
  },
  {
    id: 'cap-cacada-porco',
    arcoId: 'arco-fome',
    titulo: 'Caçada ao Porco',
    ordem: 2,
    preparado: true,
    visivelParaTodos: false,
    corpoMarkdown: `**Encontro final:** [[Sigurd Ugenhauer]] ("O Porco") — Ghoul imortal (versão aprimorada), +15% WS, +10% Toughness, +20% Wounds. Pode recuperar 1d10 Wounds se devorar carne durante o combate. 2–3 ghouls menores acompanham o banquete.

**Clímax:** quando Sigurd é derrubado, o corpo apodrece até restar pó e ossos. Um sussurro é ouvido no vento: *"A fome nunca morre..."*

Entre os restos, há uma [[Pedra ritual coberta de sangue|pedra ritual]] apontando de volta para o [[Grande Hospício]].`,
  },
  {
    id: 'cap-ecos-hospicio',
    arcoId: 'arco-fome',
    titulo: 'Ecos do Hospício',
    ordem: 3,
    preparado: false,
    visivelParaTodos: false,
    corpoMarkdown: `**Gancho:** rumores de eventos estranhos no [[Grande Hospício]] — enfermos desaparecendo, gritos na madrugada.

**NPC focal:** [[Albert Vernick]], administrador evasivo sobre a [[Ordem da Rosa Negra]].

_(rascunho — ainda não totalmente preparado)_`,
  },
  {
    id: 'cap-silencio-tijolos',
    arcoId: 'arco-falkenried',
    titulo: 'O Silêncio entre os tijolos',
    ordem: 1,
    preparado: true,
    visivelParaTodos: false,
    corpoMarkdown: `**Resumo:** a companhia é chamada para lidar com a decadência do [[Domínio de Falkenried]] — colapsos estruturais, desaparecimentos, surtos de doença.

> [!tip] Geografia
> Vila junto ao ribeirão; mansão numa colina ao norte; as galerias Skaven passam sob a própria mansão, sem que a família saiba.

**NPCs principais:** [[Isabella von Falkenried]] (herdeira), [[Wilhelm von Falkenried]] (falecido), [[Reinhardt von Falkenried|Reinhardt]] (novo PJ a partir desta cena).

> [!handout] Carta de Grodnar
> Curta, sem desculpas longas: "Eu fico com a família." É a despedida real do personagem.`,
  },
  {
    id: 'cap-vazio-poder',
    arcoId: 'arco-falkenried',
    titulo: 'O Vazio do Poder',
    ordem: 2,
    preparado: false,
    visivelParaTodos: false,
    corpoMarkdown: `**Resolução:** a eliminação da ameaça cria um vácuo de poder preenchido por um casamento político — [[Ettore Agazzi]] vira não só herói local, mas senhor feudal.

_(rascunho — depende do resultado da cena anterior)_`,
  },
]

// ---------------------------------------------------------------------------
// Sessões (crônica)
// ---------------------------------------------------------------------------

export const sessoes: Sessao[] = [
  {
    id: 'sessao-1',
    numero: 1,
    titulo: 'O contrato de Friedrich',
    data: '2026-07-14',
    capituloId: 'cap-fumo-ouro',
    arcoId: 'arco-fome',
    visivelParaTodos: true,
    resumo:
      'O grupo escolhe caçar [[Sigurd Ugenhauer]] em vez de procurar Johanns. [[Friedrich von Carstein]] entrega o mapa amarelado.',
  },
  {
    id: 'sessao-2',
    numero: 2,
    titulo: 'Fazendas silenciosas',
    data: '2026-07-21',
    capituloId: null,
    arcoId: 'arco-fome',
    visivelParaTodos: true,
    resumo: 'Primeiros sinais do massacre nas fazendas a sul do [[Grande Hospício]].',
  },
  {
    id: 'sessao-3',
    numero: 3,
    titulo: 'A clareira',
    data: '2026-07-28',
    capituloId: 'cap-cacada-porco',
    arcoId: 'arco-fome',
    visivelParaTodos: true,
    resumo:
      '[[Rocco Niekisch]] queima o olho de [[Sigurd Ugenhauer]]; [[Ettore Agazzi]] crava o golpe final. "A fome nunca morre."',
  },
  {
    id: 'sessao-4',
    numero: 4,
    titulo: 'A carta de Grodnar',
    data: '2026-09-15',
    capituloId: 'cap-silencio-tijolos',
    arcoId: 'arco-falkenried',
    visivelParaTodos: true,
    resumo:
      'Grodnar se despede do grupo. [[Reinhardt von Falkenried]] se junta à companhia em [[Domínio de Falkenried]].',
  },
  {
    id: 'sessao-5',
    numero: 5,
    titulo: 'Sob a mansão',
    data: '2026-09-22',
    capituloId: 'cap-silencio-tijolos',
    arcoId: 'arco-falkenried',
    visivelParaTodos: true,
    resumo:
      'Primeiro contato com os Skaven sob a [[Mansão Senhorial]] — mesmo capítulo, segunda sessão de mesa.',
  },
]

// ---------------------------------------------------------------------------
// Vínculos (rede de relações)
// ---------------------------------------------------------------------------

export const vinculos: Vinculo[] = [
  { id: 'v1', aId: 'ettore-agazzi', bId: 'friedrich-carstein', tipo: 'conhecido', qualificador: 'Contratante' },
  { id: 'v2', aId: 'ettore-agazzi', bId: 'sigurd-ugenhauer', tipo: 'adversario', qualificador: 'Caça contratada', direcao: 'a-b' },
  { id: 'v3', aId: 'rocco-niekisch', bId: 'sigurd-ugenhauer', tipo: 'adversario', qualificador: 'Golpe decisivo', direcao: 'a-b' },
  { id: 'v4', aId: 'friedrich-carstein', bId: 'lilli-carstein', tipo: 'familia' },
  { id: 'v5', aId: 'lilli-carstein', bId: 'sigurd-ugenhauer', tipo: 'adversario', qualificador: 'Decapitou o corpo', direcao: 'a-b' },
  { id: 'v6', aId: 'reinhardt-falkenried', bId: 'isabella-falkenried', tipo: 'sangue', qualificador: 'Irmãos' },
  { id: 'v7', aId: 'isabella-falkenried', bId: 'wilhelm-falkenried', tipo: 'familia', qualificador: 'Pai' },
  { id: 'v8', aId: 'ettore-agazzi', bId: 'isabella-falkenried', tipo: 'romance', qualificador: 'Casamento político' },
  { id: 'v9', aId: 'sarah-everstein', bId: 'stal', tipo: 'conhecido', qualificador: 'Abordagem no Hospício' },
  { id: 'v10', aId: 'marial-del-solacruz', bId: 'rosanna-breuhl', tipo: 'conhecido', qualificador: 'Correspondência' },
  { id: 'v11', aId: 'ettore-agazzi', bId: 'rocco-niekisch', tipo: 'aliado', qualificador: 'Companhia' },
  { id: 'v12', aId: 'ettore-agazzi', bId: 'marial-del-solacruz', tipo: 'aliado', qualificador: 'Companhia' },
  { id: 'v13', aId: 'ettore-agazzi', bId: 'sarah-everstein', tipo: 'aliado', qualificador: 'Companhia' },
  { id: 'v14', aId: 'ettore-agazzi', bId: 'grodnar-goldhand', tipo: 'amizade', qualificador: 'Despediu-se' },
  { id: 'v15', aId: 'ettore-agazzi', bId: 'reinhardt-falkenried', tipo: 'aliado', qualificador: 'Companhia' },
]

// ---------------------------------------------------------------------------
// Linha do tempo
// ---------------------------------------------------------------------------

export const eventos: EventoTimeline[] = [
  { id: 'e1', titulo: 'Contrato fechado com Friedrich', ano: 2522, mes: 3, arcoId: 'arco-fome', sessaoId: 'sessao-1', descricao: 'No Cassino de Altdorf.' },
  { id: 'e2', titulo: 'Massacre nas fazendas', ano: 2522, mes: 3, arcoId: 'arco-fome', sessaoId: 'sessao-2', descricao: 'Primeiros rastros de Sigurd.' },
  { id: 'e3', titulo: 'Morte de Sigurd Ugenhauer', ano: 2522, mes: 4, arcoId: 'arco-fome', sessaoId: 'sessao-3', descricao: 'Clareira ritual na floresta.' },
  { id: 'e4', titulo: 'Chegada a Falkenried', ano: 2522, mes: 6, arcoId: 'arco-falkenried', sessaoId: 'sessao-4', descricao: 'Reinhardt se junta ao grupo.' },
  { id: 'e5', titulo: 'Primeiro contato Skaven', ano: 2522, mes: 6, arcoId: 'arco-falkenried', sessaoId: 'sessao-5', descricao: 'Sob a Mansão Senhorial.' },
]

// ---------------------------------------------------------------------------
// Índices derivados (nome → entidade, backlinks) — simula o que o motor de
// wikilinks faria no backend real.
// ---------------------------------------------------------------------------

export type EntidadeTipo = 'personagem' | 'local' | 'faccao' | 'item' | 'arco' | 'capitulo' | 'sessao'

export interface EntidadeRef {
  tipo: EntidadeTipo
  id: string
  nome: string
  rota: string
}

function slugRota(tipo: EntidadeTipo, id: string): string {
  switch (tipo) {
    case 'personagem':
      return `/codex/personagens/${id}`
    case 'local':
      return `/codex/locais/${id}`
    case 'faccao':
      return `/codex/faccoes/${id}`
    case 'item':
      return `/codex/itens/${id}`
    case 'capitulo':
      return `/prep/${id}`
    case 'sessao':
      return `/sessoes/${id}`
    case 'arco':
      return `/prep#${id}`
  }
}

export const todasEntidades: EntidadeRef[] = [
  ...personagens.map((p) => ({ tipo: 'personagem' as const, id: p.id, nome: p.nome, rota: slugRota('personagem', p.id) })),
  ...locais.map((l) => ({ tipo: 'local' as const, id: l.id, nome: l.nome, rota: slugRota('local', l.id) })),
  ...faccoes.map((f) => ({ tipo: 'faccao' as const, id: f.id, nome: f.nome, rota: slugRota('faccao', f.id) })),
  ...itens.map((i) => ({ tipo: 'item' as const, id: i.id, nome: i.nome, rota: slugRota('item', i.id) })),
  ...arcos.map((a) => ({ tipo: 'arco' as const, id: a.id, nome: a.titulo, rota: slugRota('arco', a.id) })),
  ...capitulos.map((c) => ({ tipo: 'capitulo' as const, id: c.id, nome: `Capítulo: ${c.titulo}`, rota: slugRota('capitulo', c.id) })),
  ...sessoes.map((s) => ({ tipo: 'sessao' as const, id: s.id, nome: `Sessão ${s.numero}: ${s.titulo}`, rota: slugRota('sessao', s.id) })),
]

const nomeParaEntidade = new Map<string, EntidadeRef>()
for (const ref of todasEntidades) {
  nomeParaEntidade.set(ref.nome.toLowerCase(), ref)
}

export function resolverWikilink(nome: string): EntidadeRef | undefined {
  return nomeParaEntidade.get(nome.trim().toLowerCase())
}

const WIKILINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

export interface Backlink {
  origem: EntidadeRef
  trecho: string
}

function textosDeOrigem(): { origem: EntidadeRef; texto: string }[] {
  const out: { origem: EntidadeRef; texto: string }[] = []
  for (const p of personagens) out.push({ origem: nomeParaEntidade.get(p.nome.toLowerCase())!, texto: p.descricao })
  for (const l of locais) out.push({ origem: nomeParaEntidade.get(l.nome.toLowerCase())!, texto: l.descricao })
  for (const f of faccoes) out.push({ origem: nomeParaEntidade.get(f.nome.toLowerCase())!, texto: f.descricao })
  for (const c of capitulos)
    out.push({ origem: nomeParaEntidade.get(`capítulo: ${c.titulo}`.toLowerCase())!, texto: c.corpoMarkdown })
  for (const s of sessoes)
    out.push({ origem: nomeParaEntidade.get(`sessão ${s.numero}: ${s.titulo}`.toLowerCase())!, texto: s.resumo })
  return out
}

export function backlinksPara(nomeAlvo: string): Backlink[] {
  const alvoLower = nomeAlvo.trim().toLowerCase()
  const out: Backlink[] = []
  for (const { origem, texto } of textosDeOrigem()) {
    if (!origem) continue
    let match: RegExpExecArray | null
    WIKILINK_RE.lastIndex = 0
    while ((match = WIKILINK_RE.exec(texto))) {
      const alvo = match[1]!.trim().toLowerCase()
      if (alvo === alvoLower && origem.nome.toLowerCase() !== alvoLower) {
        out.push({ origem, trecho: texto.slice(Math.max(0, match.index - 40), match.index + 60) })
      }
    }
  }
  // dedupe por origem
  const seen = new Set<string>()
  return out.filter((b) => {
    const key = `${b.origem.tipo}:${b.origem.id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function vinculosDe(personagemId: string): { vinculo: Vinculo; outro: Personagem }[] {
  return vinculos
    .filter((v) => v.aId === personagemId || v.bId === personagemId)
    .map((v) => {
      const outroId = v.aId === personagemId ? v.bId : v.aId
      const outro = personagens.find((p) => p.id === outroId)!
      return { vinculo: v, outro }
    })
    .filter((x) => x.outro)
}

export const ROTULOS_VINCULO: Record<TipoVinculo, string> = {
  aliado: 'Aliado',
  sangue: 'Vínculo de Sangue',
  amizade: 'Amizade',
  inimizade: 'Inimizade',
  adversario: 'Adversário',
  romance: 'Romance',
  familia: 'Família',
  conhecido: 'Conhecido',
}

export const COR_VINCULO: Record<TipoVinculo, string> = {
  aliado: '#4a9a6a',
  sangue: '#8a2b2b',
  amizade: '#4a8aaa',
  inimizade: '#aa4a2a',
  adversario: '#aa2a4a',
  romance: '#c25a9a',
  familia: '#c9944a',
  conhecido: '#8a8a8a',
}

export const campanha = {
  nome: 'Armada Agazzi',
  sistema: 'Warhammer Fantasy Roleplay 4ª Edição',
  slug: 'wfrp',
  proximaSessao: { data: '2026-10-13', numero: 6 },
}
