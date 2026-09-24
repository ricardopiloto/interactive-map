import type { Campaign } from './types'

/**
 * Dados 100% mocados — sem chamadas de rede. Dois codex completos (um por
 * gênero com profundidade real) e um terceiro raso só para provar a
 * variedade de gêneros nas telas de descoberta/painel.
 */

const reikland: Campaign = {
  slug: 'ecos-de-reikland',
  nome: 'Ecos de Reikland',
  sistema: 'WFRP 4e',
  genero: 'fantasia',
  mestre: 'Ricardo',
  visibilidade: 'listada',
  capaGradient: 'linear-gradient(135deg, #2c2415 0%, #191610 60%, #0f0d09 100%)',
  resumo: 'Uma peste se espalha por Ubersreik enquanto o grupo tenta decifrar quem — ou o quê — está por trás dela.',
  jogadores: 4,
  ultimaSessao: 'há 3 dias',
  cotaUsadaGb: 2.4,
  cotaTotalGb: 10,
  arcos: [
    { id: 'arco-1', titulo: 'A Peste em Ubersreik', resumo: 'O grupo chega a Ubersreik em meio a um surto misterioso.', ordem: 1, visivelParaTodos: true },
    { id: 'arco-2', titulo: 'Sombra sobre Altdorf', resumo: 'Pistas levam à capital do Império.', ordem: 2, visivelParaTodos: false },
  ],
  locais: [
    { id: 'loc-altdorf', nome: 'Altdorf', descricao: 'Capital do Império, sede do culto de Sigmar. O grupo chegou seguindo rumores de um culto skaven nos esgotos.', x: 0.589, y: 0.17, corPin: '#d8aa5a', visitado: true, arcoId: 'arco-2', npcIds: ['npc-tomas', 'npc-helga'], saidaIds: ['loc-bruckthin', 'loc-carroburg'] },
    { id: 'loc-carroburg', nome: 'Carroburg', descricao: 'Porto fluvial movimentado a noroeste de Altdorf. Conhecido por rumores, ainda não visitado.', x: 0.474, y: 0.126, corPin: '#d8aa5a', visitado: false, arcoId: 'arco-2', npcIds: [], saidaIds: ['loc-altdorf'] },
    { id: 'loc-bruckthin', nome: 'Bruckthin', descricao: 'Vilarejo agrícola onde os primeiros casos da peste foram registrados.', x: 0.539, y: 0.219, corPin: '#d8aa5a', visitado: true, arcoId: 'arco-1', npcIds: ['npc-wilhelmina'], saidaIds: ['loc-altdorf', 'loc-fielbach'] },
    { id: 'loc-fielbach', nome: 'Fielbach', descricao: 'Cruzamento de estradas com uma guarnição pequena e um físico local.', x: 0.61, y: 0.279, corPin: '#d8aa5a', visitado: true, arcoId: 'arco-1', npcIds: ['npc-hedrich'], saidaIds: ['loc-bruckthin', 'loc-grunburg'] },
    { id: 'loc-grunburg', nome: 'Grunburg', descricao: 'Cidade murada às margens do rio. Ainda só conhecida por mapas e histórias.', x: 0.65, y: 0.425, corPin: '#d8aa5a', visitado: false, arcoId: 'arco-1', npcIds: ['npc-elara'], saidaIds: ['loc-fielbach', 'loc-auerswald'] },
    { id: 'loc-auerswald', nome: 'Auerswald', descricao: 'Pequeno povoado ao sul, próximo dos Montes Cinzentos.', x: 0.535, y: 0.672, corPin: '#d8aa5a', visitado: false, arcoId: 'arco-1', npcIds: ['npc-ranulf'], saidaIds: ['loc-grunburg'] },
  ],
  personagens: [
    { id: 'npc-tomas', nome: 'Brother Tomas', tipo: 'pj', papel: 'Iniciado de Sigmar', faccao: 'Culto de Sigmar', status: 'vivo', descricao: 'PJ — fé fervorosa e pouco tato social.', visivelParaTodos: true, localIds: ['loc-altdorf'] },
    { id: 'npc-marcus', nome: 'Marcus Stein', tipo: 'pj', papel: 'Soldado', status: 'vivo', descricao: 'PJ — veterano de Reikland, protege o grupo como se fossem tropa.', visivelParaTodos: true, localIds: [] },
    { id: 'npc-lila', nome: 'Lila Nacht', tipo: 'pj', papel: 'Ladina', status: 'vivo', descricao: 'PJ — cresceu nos becos de Altdorf, confia em poucos.', visivelParaTodos: true, localIds: [] },
    { id: 'npc-helga', nome: 'Capitã Helga Brunn', tipo: 'npc', papel: 'Capitã da Guarda', faccao: 'Guarda de Altdorf', status: 'vivo', descricao: 'Comanda a guarda do distrito onde o culto foi avistado.', visivelParaTodos: true, localIds: ['loc-altdorf'] },
    { id: 'npc-skrik', nome: 'Skrik Orelha-Fendida', tipo: 'npc', papel: 'Agente Skaven', faccao: 'Clã Pestilens', status: 'desconhecido', descricao: 'Visto nos esgotos de Altdorf. Ninguém sabe se ainda está na cidade.', visivelParaTodos: false, localIds: [] },
    { id: 'npc-elara', nome: 'Elara Voss', tipo: 'npc', papel: 'Caçadora de recompensas', status: 'vivo', descricao: 'Rastreia o mesmo culto por razões próprias.', visivelParaTodos: true, localIds: ['loc-grunburg'] },
    { id: 'npc-ranulf', nome: 'Ranulf Grimsby', tipo: 'npc', papel: 'Contrabandista', status: 'vivo', descricao: 'Conhece as rotas alternativas entre Grunburg e Auerswald.', visivelParaTodos: true, localIds: ['loc-auerswald'] },
    { id: 'npc-hedrich', nome: 'Doutor Hedrich', tipo: 'npc', papel: 'Físico', status: 'vivo', descricao: 'Tenta isolar a causa da peste em Fielbach.', visivelParaTodos: true, localIds: ['loc-fielbach'] },
    { id: 'npc-wilhelmina', nome: 'Irmã Wilhelmina', tipo: 'npc', papel: 'Sacerdotisa de Shallya', faccao: 'Culto de Shallya', status: 'vivo', descricao: 'Cuida dos doentes em Bruckthin.', visivelParaTodos: true, localIds: ['loc-bruckthin'] },
  ],
  vinculos: [
    { id: 'v1', aId: 'npc-marcus', bId: 'npc-tomas', familia: 'afinidade', tipo: 'aliado', qualificador: 'Mentor', nota: 'Marcus cuida; Tomas confia.' },
    { id: 'v2', aId: 'npc-tomas', bId: 'npc-wilhelmina', familia: 'afinidade', tipo: 'amizade', nota: 'Respeito entre cultos — com ressalvas.' },
    { id: 'v3', aId: 'npc-tomas', bId: 'npc-lila', familia: 'afinidade', tipo: 'amizade', nota: 'Vê-o como um amigo de confiança.' },
    { id: 'v4', aId: 'npc-skrik', bId: 'npc-tomas', familia: 'hostil', tipo: 'inimizade', nota: 'Skrik vê-o como Amizade — não é recíproco.' },
    { id: 'v5', aId: 'npc-marcus', bId: 'npc-elara', familia: 'laco', tipo: 'romance', nota: 'Ainda não declarado ao grupo.' },
    { id: 'v6', aId: 'npc-helga', bId: 'npc-tomas', familia: 'hostil', tipo: 'adversario', nota: 'Desconfia dos métodos do culto.' },
    { id: 'v7', aId: 'npc-ranulf', bId: 'npc-elara', familia: 'neutro', tipo: 'conhecido' },
  ],
  waypoints: [
    { id: 'wp-altdorf', nome: 'Altdorf', x: 0.589, y: 0.17, localId: 'loc-altdorf' },
    { id: 'wp-carroburg', nome: 'Carroburg', x: 0.474, y: 0.126, localId: 'loc-carroburg' },
    { id: 'wp-bruckthin', nome: 'Bruckthin', x: 0.539, y: 0.219, localId: 'loc-bruckthin' },
    { id: 'wp-fielbach', nome: 'Fielbach', x: 0.61, y: 0.279, localId: 'loc-fielbach' },
    { id: 'wp-grunburg', nome: 'Grunburg', x: 0.65, y: 0.425, localId: 'loc-grunburg' },
    { id: 'wp-auerswald', nome: 'Auerswald', x: 0.535, y: 0.672, localId: 'loc-auerswald' },
  ],
  edges: [
    { a: 'wp-altdorf', b: 'wp-carroburg', tipo: 'rio', distanciaMi: 38 },
    { a: 'wp-altdorf', b: 'wp-bruckthin', tipo: 'estrada', distanciaMi: 22 },
    { a: 'wp-bruckthin', b: 'wp-fielbach', tipo: 'estrada', distanciaMi: 27 },
    { a: 'wp-fielbach', b: 'wp-grunburg', tipo: 'rio', distanciaMi: 64 },
    { a: 'wp-fielbach', b: 'wp-grunburg', tipo: 'estrada', distanciaMi: 71 },
    { a: 'wp-grunburg', b: 'wp-auerswald', tipo: 'trilha', distanciaMi: 41 },
  ],
  sessoes: [
    { id: 's3', numero: 3, titulo: 'Os sinos de Altdorf', data: '14 set 2026', resumo: 'O grupo seguiu Skrik até os esgotos e confirmou a presença de um culto skaven sob o distrito do templo.', localIds: ['loc-altdorf'], npcIds: ['npc-skrik', 'npc-helga'] },
    { id: 's2', numero: 2, titulo: 'A febre de Fielbach', data: '31 ago 2026', resumo: 'Doutor Hedrich revelou que os sintomas não batem com nenhuma peste conhecida.', localIds: ['loc-fielbach'], npcIds: ['npc-hedrich'] },
    { id: 's1', numero: 1, titulo: 'Chegada a Bruckthin', data: '17 ago 2026', resumo: 'Primeiro contato com os doentes e com a Irmã Wilhelmina.', localIds: ['loc-bruckthin'], npcIds: ['npc-wilhelmina'] },
  ],
  grupo: { x: 0.589, y: 0.17, localId: 'loc-altdorf' },
}

const vespera: Campaign = {
  slug: 'vespera-eterna',
  nome: 'Véspera Eterna',
  sistema: 'Crônicas Sombrias',
  genero: 'gotico',
  mestre: 'Camila',
  visibilidade: 'listada',
  capaGradient: 'linear-gradient(135deg, #2c1417 0%, #191011 60%, #0d0809 100%)',
  resumo: 'Uma coterie recém-formada precisa sobreviver à política da cidade antes de escolher um lado.',
  jogadores: 5,
  ultimaSessao: 'ontem',
  cotaUsadaGb: 5.1,
  cotaTotalGb: 10,
  arcos: [
    { id: 'arco-1', titulo: 'A Primeira Noite', resumo: 'Os PJs despertam para a condição e para a política da cidade.', ordem: 1, visivelParaTodos: true },
  ],
  locais: [
    { id: 'loc-elisio', nome: 'Elísio do Porto Velho', descricao: 'Terreno neutro sob a antiga catedral portuária — reuniões da Curia acontecem aqui.', x: 0.52, y: 0.34, corPin: '#de7384', visitado: true, arcoId: 'arco-1', npcIds: ['npc-orquidea'], saidaIds: ['loc-necropole'] },
    { id: 'loc-necropole', nome: 'Necrópole de Vidro', descricao: 'Cemitério abandonado onde a Linhagem Vermelha guarda seus segredos.', x: 0.38, y: 0.52, corPin: '#de7384', visitado: true, arcoId: 'arco-1', npcIds: ['npc-severin'], saidaIds: ['loc-elisio', 'loc-clinica'] },
    { id: 'loc-clinica', nome: 'Clínica Sombria', descricao: 'Fachada de clínica popular, fonte discreta de sangue para quem sabe pedir.', x: 0.6, y: 0.58, corPin: '#de7384', visitado: false, arcoId: 'arco-1', npcIds: ['npc-dahlia'], saidaIds: ['loc-necropole'] },
    { id: 'loc-cais', nome: 'Cais Afogado', descricao: 'Doca abandonada, território disputado entre facções menores.', x: 0.3, y: 0.72, corPin: '#de7384', visitado: false, arcoId: null, npcIds: [], saidaIds: ['loc-necropole'] },
  ],
  personagens: [
    { id: 'npc-orquidea', nome: 'Orquídea Vasconcelos', tipo: 'pj', papel: 'Arauto da coterie', status: 'vivo', descricao: 'PJ — busca reconhecimento na Curia a qualquer custo.', visivelParaTodos: true, localIds: ['loc-elisio'] },
    { id: 'npc-severin', nome: 'Severin', tipo: 'npc', papel: 'Guardião da Necrópole', faccao: 'Linhagem Vermelha', status: 'vivo', descricao: 'Fala pouco, sabe demais sobre a coterie.', visivelParaTodos: true, localIds: ['loc-necropole'] },
    { id: 'npc-dahlia', nome: 'Dra. Dahlia Reyes', tipo: 'npc', papel: 'Médica', status: 'vivo', descricao: 'Fornece sangue e silêncio — por um preço.', visivelParaTodos: true, localIds: ['loc-clinica'] },
  ],
  vinculos: [
    { id: 'v1', aId: 'npc-orquidea', bId: 'npc-severin', familia: 'laco', tipo: 'vinculo_sangue', qualificador: 'Dívida', nota: 'Orquídea deve um favor de sangue a Severin.' },
    { id: 'v2', aId: 'npc-severin', bId: 'npc-dahlia', familia: 'hostil', tipo: 'adversario', nota: 'Disputam a mesma fonte de sangue.' },
  ],
  waypoints: [
    { id: 'wp-elisio', nome: 'Elísio do Porto Velho', x: 0.52, y: 0.34, localId: 'loc-elisio' },
    { id: 'wp-necropole', nome: 'Necrópole de Vidro', x: 0.38, y: 0.52, localId: 'loc-necropole' },
    { id: 'wp-clinica', nome: 'Clínica Sombria', x: 0.6, y: 0.58, localId: 'loc-clinica' },
    { id: 'wp-cais', nome: 'Cais Afogado', x: 0.3, y: 0.72, localId: 'loc-cais' },
  ],
  edges: [
    { a: 'wp-elisio', b: 'wp-necropole', tipo: 'estrada', distanciaMi: 3 },
    { a: 'wp-necropole', b: 'wp-clinica', tipo: 'estrada', distanciaMi: 4 },
    { a: 'wp-necropole', b: 'wp-cais', tipo: 'trilha', distanciaMi: 2 },
  ],
  sessoes: [
    { id: 's2', numero: 2, titulo: 'Dívidas antigas', data: 'ontem', resumo: 'Severin cobrou o favor de Orquídea em plena Elísio, diante da Curia.', localIds: ['loc-elisio'], npcIds: ['npc-severin'] },
    { id: 's1', numero: 1, titulo: 'A Primeira Noite', data: '2 semanas atrás', resumo: 'A coterie se formou sob supervisão de Severin.', localIds: ['loc-necropole'], npcIds: ['npc-severin'] },
  ],
  grupo: { x: 0.52, y: 0.34, localId: 'loc-elisio' },
}

const cinabrio: Campaign = {
  slug: 'estacao-cinabrio',
  nome: 'Estação Cinábrio',
  sistema: 'Starfinder',
  genero: 'scifi',
  mestre: 'João',
  visibilidade: 'listada',
  capaGradient: 'linear-gradient(135deg, #142a2d 0%, #101719 60%, #090e10 100%)',
  resumo: 'Uma estação de mineração isolada perde contato com a frota — e algo respondeu no lugar dela.',
  jogadores: 3,
  ultimaSessao: 'há 2 semanas',
  cotaUsadaGb: 0.6,
  cotaTotalGb: 10,
  arcos: [{ id: 'arco-1', titulo: 'Sinal Perdido', resumo: 'Chegada à estação e primeiros sinais de algo errado.', ordem: 1, visivelParaTodos: true }],
  locais: [
    { id: 'loc-doca', nome: 'Doca de Atracação', descricao: 'Ponto de entrada da estação, luzes de emergência piscando.', x: 0.5, y: 0.3, corPin: '#51c0d6', visitado: true, arcoId: 'arco-1', npcIds: [], saidaIds: ['loc-nucleo'] },
    { id: 'loc-nucleo', nome: 'Núcleo de Mineração', descricao: 'Coração da estação, de onde vem o sinal anômalo.', x: 0.42, y: 0.55, corPin: '#51c0d6', visitado: false, arcoId: 'arco-1', npcIds: [], saidaIds: ['loc-doca'] },
  ],
  personagens: [],
  vinculos: [],
  waypoints: [
    { id: 'wp-doca', nome: 'Doca de Atracação', x: 0.5, y: 0.3, localId: 'loc-doca' },
    { id: 'wp-nucleo', nome: 'Núcleo de Mineração', x: 0.42, y: 0.55, localId: 'loc-nucleo' },
  ],
  edges: [{ a: 'wp-doca', b: 'wp-nucleo', tipo: 'trilha', distanciaMi: 1 }],
  sessoes: [{ id: 's1', numero: 1, titulo: 'Silêncio de rádio', data: 'há 2 semanas', resumo: 'A tripulação chegou à Cinábrio sem resposta do controle da estação.', localIds: ['loc-doca'], npcIds: [] }],
  grupo: { x: 0.5, y: 0.3, localId: 'loc-doca' },
}

export const CAMPAIGNS: Campaign[] = [reikland, vespera, cinabrio]

export function getCampaign(slug: string): Campaign | undefined {
  return CAMPAIGNS.find((c) => c.slug === slug)
}

/** Mestre "logado" no protótipo — dono de duas das três campanhas mocadas. */
export const CURRENT_MESTRE = {
  nome: 'Ricardo',
  email: 'ac.ricardosobral@gmail.com',
  campanhas: ['ecos-de-reikland', 'vespera-eterna'],
}
