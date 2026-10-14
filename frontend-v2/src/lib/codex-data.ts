// Mock campaign data — frontend concept only.
export type LocState = "visitado" | "conhecido";
export interface Location {
  id: string;
  name: string;
  kind: string;
  x: number; // % on map
  y: number;
  state: LocState;
  arc: string;
  blurb: string;
  description: string;
  characters: string[];
  sessions: number[];
  events: string[];
}

export const locations: Location[] = [
  {
    id: "altdorf",
    name: "Altdorf",
    kind: "Capital imperial",
    x: 53.5,
    y: 33,
    state: "visitado",
    arc: "Arco II · Intrigas na Corte",
    blurb: "A cidade das mil torres, na confluência do Reik e do Talabec.",
    description:
      "Muralhas que nunca dormem, pontes cobradas por pedágio e um palácio onde cada corredor esconde uma dívida. O grupo chegou a Altdorf com uma carta lacrada — e saiu com três inimigos novos.",
    characters: ["helverth", "merta", "ettore"],
    sessions: [9, 10],
    events: ["coroacao", "tratado"],
  },
  {
    id: "ubersreik",
    name: "Ubersreik",
    kind: "Cidade fortificada",
    x: 25,
    y: 25,
    state: "visitado",
    arc: "Arco I · O Ferro de Ubersreik",
    blurb: "Porta de entrada do Passo Cinzento. O grupo se conheceu aqui.",
    description:
      "Mercadores anões, guardas cansados e um castelo que já trocou de mãos duas vezes nesta geração. É aqui que o grupo mantém seu quarto alugado sobre a Taverna do Javali.",
    characters: ["grodnar", "rocco", "sarah"],
    sessions: [1, 2, 3, 12],
    events: ["cerco"],
  },
  {
    id: "falkenried",
    name: "Falkenried",
    kind: "Feudo em ruínas",
    x: 8.5,
    y: 31,
    state: "visitado",
    arc: "Arco III · As Cinzas de Falkenried",
    blurb: "Uma torre de vigia e um vilarejo que ainda cheira a fumaça.",
    description:
      "Há vinte anos, um incêndio consumiu o feudo dos von Falkenried em uma única noite. Os aldeões falam pouco e sempre olham para a torre. Reinhardt, o último herdeiro, voltou — e não está sozinho.",
    characters: ["reinhardt", "konrad", "merta"],
    sessions: [11, 12],
    events: ["incendio", "fundacao"],
  },
  {
    id: "dunkelbrand",
    name: "Dunkelbrand",
    kind: "Aldeia madeireira",
    x: 30,
    y: 54,
    state: "conhecido",
    arc: "Arco III · As Cinzas de Falkenried",
    blurb: "Serrarias silenciosas à beira da floresta escura.",
    description:
      "Mencionada em cartas encontradas na torre de Falkenried. Ninguém do grupo esteve lá — ainda.",
    characters: ["konrad"],
    sessions: [12],
    events: [],
  },
  {
    id: "hagendorn",
    name: "Hagendorn",
    kind: "Vila ribeirinha",
    x: 16,
    y: 86,
    state: "conhecido",
    arc: "—",
    blurb: "Uma ponte de pedra e rumores de barqueiros desaparecidos.",
    description: "Conhecida apenas por relatos de viajantes no Reik.",
    characters: [],
    sessions: [],
    events: ["peste"],
  },
];

export type Status = "vivo" | "morto" | "desaparecido";
export interface Character {
  id: string;
  name: string;
  short: string;
  type: "PJ" | "PNJ";
  role: string;
  faction: string;
  status: Status;
  description: string;
  locations: string[];
  sessions: number[];
  x: number; // network position (0-1000 / 0-700)
  y: number;
}

export const characters: Character[] = [
  {
    id: "grodnar",
    name: "Grodnar Goldhand",
    short: "Grodnar",
    type: "PJ",
    role: "Matador de trolls",
    faction: "Grupo",
    status: "vivo",
    description:
      "Anão de poucas palavras e juramentos pesados. Carrega a culpa de uma mina perdida.",
    locations: ["ubersreik"],
    sessions: [1, 2, 3, 9, 11, 12],
    x: 470,
    y: 330,
  },
  {
    id: "rocco",
    name: "Rocco Niekisch",
    short: "Rocco",
    type: "PJ",
    role: "Barqueiro e contrabandista",
    faction: "Grupo",
    status: "vivo",
    description: "Conhece cada eclusa do Reik e cada guarda que aceita moedas.",
    locations: ["ubersreik", "hagendorn"],
    sessions: [1, 2, 10, 12],
    x: 330,
    y: 230,
  },
  {
    id: "ettore",
    name: "Ettore Agazzi",
    short: "Ettore",
    type: "PJ",
    role: "Duelista tileano",
    faction: "Grupo",
    status: "vivo",
    description: "Exilado de Miragliano por um duelo que venceu bem demais.",
    locations: ["altdorf"],
    sessions: [1, 3, 9, 10, 11],
    x: 610,
    y: 220,
  },
  {
    id: "sarah",
    name: "Sarah Everstein",
    short: "Sarah",
    type: "PJ",
    role: "Erudita da Ordem Luminosa",
    faction: "Grupo",
    status: "vivo",
    description: "Procura o pai, desaparecido durante uma expedição a Falkenried.",
    locations: ["ubersreik", "falkenried"],
    sessions: [2, 3, 11, 12],
    x: 560,
    y: 460,
  },
  {
    id: "helverth",
    name: "Helverth Volkmar",
    short: "Helverth",
    type: "PNJ",
    role: "Conde-tesoureiro",
    faction: "Corte de Altdorf",
    status: "vivo",
    description: "Sorri sempre. Nunca esquece uma dívida.",
    locations: ["altdorf"],
    sessions: [9, 10],
    x: 800,
    y: 160,
  },
  {
    id: "konrad",
    name: "Konrad",
    short: "Konrad",
    type: "PNJ",
    role: "Lenhador e guia",
    faction: "Dunkelbrand",
    status: "desaparecido",
    description: "Guiou o grupo até a torre. Sumiu na noite seguinte.",
    locations: ["falkenried", "dunkelbrand"],
    sessions: [11, 12],
    x: 260,
    y: 470,
  },
  {
    id: "merta",
    name: "Merta Hess",
    short: "Merta",
    type: "PNJ",
    role: "Espiã do Conde",
    faction: "Corte de Altdorf",
    status: "vivo",
    description: "Aparece onde menos se espera, sempre com a informação certa.",
    locations: ["altdorf", "falkenried"],
    sessions: [10, 11],
    x: 760,
    y: 420,
  },
  {
    id: "reinhardt",
    name: "Reinhardt von Falkenried",
    short: "Reinhardt",
    type: "PNJ",
    role: "Herdeiro deserdado",
    faction: "Casa Falkenried",
    status: "vivo",
    description: "Último de sua linhagem. Jura que não ateou o fogo.",
    locations: ["falkenried"],
    sessions: [11, 12],
    x: 420,
    y: 580,
  },
  {
    id: "ulla",
    name: "Ulla von Falkenried",
    short: "Ulla",
    type: "PNJ",
    role: "Matriarca",
    faction: "Casa Falkenried",
    status: "morto",
    description: "Morreu no incêndio de 2502.",
    locations: ["falkenried"],
    sessions: [],
    x: 180,
    y: 620,
  },
];

export type RelType =
  | "aliado"
  | "sangue"
  | "amizade"
  | "inimizade"
  | "adversario"
  | "romance"
  | "familia"
  | "conhecido";
export const relTypes: Record<RelType, { label: string; glyph: string }> = {
  aliado: { label: "Aliado", glyph: "◆" },
  sangue: { label: "Laço de sangue", glyph: "✦" },
  amizade: { label: "Amizade", glyph: "○" },
  inimizade: { label: "Inimizade", glyph: "✕" },
  adversario: { label: "Adversário", glyph: "⚔" },
  romance: { label: "Romance", glyph: "♡" },
  familia: { label: "Família", glyph: "⌂" },
  conhecido: { label: "Conhecido", glyph: "·" },
};

export interface Relationship {
  from: string;
  to: string;
  type: RelType;
  directional?: boolean; // only "from" feels this
  qualifier?: string;
}

export const relationships: Relationship[] = [
  { from: "grodnar", to: "rocco", type: "amizade" },
  { from: "grodnar", to: "ettore", type: "aliado", qualifier: "relutante" },
  { from: "grodnar", to: "sarah", type: "sangue", qualifier: "juramento" },
  { from: "rocco", to: "ettore", type: "amizade" },
  { from: "ettore", to: "helverth", type: "adversario", qualifier: "duelo pendente" },
  {
    from: "merta",
    to: "ettore",
    type: "romance",
    directional: true,
    qualifier: "não correspondido",
  },
  { from: "helverth", to: "merta", type: "aliado", qualifier: "empregador" },
  { from: "sarah", to: "reinhardt", type: "conhecido", qualifier: "desconfiança" },
  { from: "reinhardt", to: "ulla", type: "familia", qualifier: "mãe" },
  {
    from: "konrad",
    to: "reinhardt",
    type: "aliado",
    directional: true,
    qualifier: "lealdade antiga",
  },
  { from: "grodnar", to: "konrad", type: "conhecido" },
  {
    from: "helverth",
    to: "reinhardt",
    type: "inimizade",
    directional: true,
    qualifier: "suspeita do incêndio",
  },
  { from: "rocco", to: "konrad", type: "conhecido" },
];

export interface Session {
  n: number;
  title: string;
  date: string;
  arc: string;
  summary: string; // inline refs: [[loc:id|Texto]] or [[pc:id|Texto]]
  locations: string[];
  characters: string[];
}

export const sessions: Session[] = [
  {
    n: 12,
    title: "Retorno a Falkenried",
    date: "04 out 2026",
    arc: "As Cinzas de Falkenried",
    summary:
      "A chuva não parou desde [[loc:ubersreik|Ubersreik]]. O grupo voltou a [[loc:falkenried|Falkenried]] seguindo as cartas da torre, apenas para descobrir que [[pc:konrad|Konrad]] havia sumido. [[pc:reinhardt|Reinhardt]] os recebeu com uma lanterna e uma confissão incompleta. [[pc:sarah|Sarah]] reconheceu a caligrafia do pai em um diário queimado; [[pc:grodnar|Grodnar]] encontrou pegadas que levavam para [[loc:dunkelbrand|Dunkelbrand]]. A sessão terminou com o sino da torre tocando sozinho.",
    locations: ["falkenried", "ubersreik", "dunkelbrand"],
    characters: ["reinhardt", "sarah", "grodnar", "konrad"],
  },
  {
    n: 11,
    title: "A Torre de Vigia",
    date: "27 set 2026",
    arc: "As Cinzas de Falkenried",
    summary:
      "Guiados por [[pc:konrad|Konrad]], os aventureiros subiram à torre de [[loc:falkenried|Falkenried]]. [[pc:ettore|Ettore]] venceu um duelo no escuro contra algo que não sangrava. [[pc:merta|Merta Hess]] apareceu na escadaria com um recado do Conde — e uma faca escondida.",
    locations: ["falkenried"],
    characters: ["konrad", "ettore", "merta", "reinhardt"],
  },
  {
    n: 10,
    title: "Dívidas de Altdorf",
    date: "13 set 2026",
    arc: "Intrigas na Corte",
    summary:
      "Em [[loc:altdorf|Altdorf]], [[pc:helverth|Helverth Volkmar]] cobrou o favor que o grupo nem sabia dever. [[pc:rocco|Rocco]] negociou passagem por três eclusas; [[pc:ettore|Ettore]] recusou uma desculpa formal.",
    locations: ["altdorf"],
    characters: ["helverth", "rocco", "ettore", "merta"],
  },
  {
    n: 9,
    title: "A Carta Lacrada",
    date: "30 ago 2026",
    arc: "Intrigas na Corte",
    summary:
      "Uma carta com o selo da Casa Falkenried leva o grupo à capital. Nos portões de [[loc:altdorf|Altdorf]], [[pc:grodnar|Grodnar]] quase provoca um incidente diplomático.",
    locations: ["altdorf"],
    characters: ["grodnar", "helverth"],
  },
  {
    n: 3,
    title: "O Cerco do Javali",
    date: "07 jun 2026",
    arc: "O Ferro de Ubersreik",
    summary:
      "A taverna de [[loc:ubersreik|Ubersreik]] vira trincheira. [[pc:sarah|Sarah]] descobre que sua magia chama atenção indesejada.",
    locations: ["ubersreik"],
    characters: ["sarah", "grodnar", "ettore"],
  },
  {
    n: 1,
    title: "Encontro na Ponte",
    date: "10 mai 2026",
    arc: "O Ferro de Ubersreik",
    summary:
      "Quatro estranhos, uma ponte e uma carroça em chamas nos arredores de [[loc:ubersreik|Ubersreik]].",
    locations: ["ubersreik"],
    characters: ["grodnar", "rocco", "ettore"],
  },
];

export interface Era {
  id: string;
  name: string;
  start: number;
  end: number;
}
export const eras: Era[] = [
  { id: "fundacao", name: "Era da Fundação", start: 2300, end: 2420 },
  { id: "pragas", name: "Anos das Pragas", start: 2420, end: 2480 },
  { id: "ferro", name: "Era do Ferro", start: 2480, end: 2512 },
  { id: "atual", name: "Tempos Atuais", start: 2512, end: 2525 },
];

export interface TimelineEvent {
  id: string;
  year: number;
  month?: string;
  approx?: boolean;
  era: string;
  title: string;
  description: string;
  locations: string[];
  characters: string[];
  session?: number;
}

export const events: TimelineEvent[] = [
  {
    id: "fundacao",
    year: 2312,
    approx: true,
    era: "fundacao",
    title: "Fundação de Falkenried",
    description: "Um cavaleiro sem nome ergue uma torre de vigia sobre o vale.",
    locations: ["falkenried"],
    characters: [],
  },
  {
    id: "peste",
    year: 2431,
    era: "pragas",
    title: "A Peste do Reik",
    description: "Barqueiros levam a doença rio abaixo; Hagendorn fecha sua ponte por sete anos.",
    locations: ["hagendorn"],
    characters: [],
  },
  {
    id: "cerco",
    year: 2489,
    month: "Pflugzeit",
    era: "ferro",
    title: "Primeiro cerco de Ubersreik",
    description: "O castelo muda de mãos pela primeira vez.",
    locations: ["ubersreik"],
    characters: [],
  },
  {
    id: "incendio",
    year: 2502,
    month: "Nachexen",
    era: "ferro",
    title: "O Incêndio de Falkenried",
    description:
      "Em uma única noite, o feudo arde. Ulla von Falkenried morre; Reinhardt desaparece.",
    locations: ["falkenried"],
    characters: ["ulla", "reinhardt", "konrad"],
    session: 11,
  },
  {
    id: "tratado",
    year: 2512,
    era: "atual",
    title: "Tratado das Eclusas",
    description: "Helverth Volkmar assume o controle das taxas fluviais.",
    locations: ["altdorf"],
    characters: ["helverth"],
    session: 10,
  },
  {
    id: "coroacao",
    year: 2522,
    month: "Sigmarzeit",
    era: "atual",
    title: "O grupo chega à capital",
    description: "Uma carta lacrada abre as portas do palácio — e de antigas rivalidades.",
    locations: ["altdorf"],
    characters: ["grodnar", "ettore", "helverth"],
    session: 9,
  },
];

export const party = { at: "ubersreik" };

export const getLoc = (id: string) => locations.find((l) => l.id === id);
export const getChar = (id: string) => characters.find((c) => c.id === id);
export const getSession = (n: number) => sessions.find((s) => s.n === n);
export const getEvent = (id: string) => events.find((e) => e.id === id);
