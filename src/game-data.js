
// Static game content: catalogs, world layout, defaults, and event templates.
const resourceMeta = {
  wood: { label: 'Madeira', icon: '🌲' },
  stone: { label: 'Pedra', icon: '🪨' },
  iron: { label: 'Ferro', icon: '⛓' },
  food: { label: 'Comida', icon: '🌾' },
  gold: { label: 'Ouro', icon: '🪙' }
};

const resourceArtwork = {
  wood: 'assets/resource-wood.png',
  stone: 'assets/resource-stone.png',
  iron: 'assets/resource-iron.png',
  food: 'assets/resource-food.png',
  gold: 'assets/resource-gold.png'
};

const buildingCatalog = {
  townHall: {
    icon: '🏛️',
    name: 'Prefeitura',
    description: 'Centro administrativo do reino.',
    cost: { wood: 50, stone: 35 },
    buildTime: 25,
    output: { gold: 0.4 }
  },
  sawmill: {
    icon: '🪵',
    name: 'Serraria',
    description: 'Mantém a floresta sob corte ordenado.',
    cost: { wood: 35, stone: 20 },
    buildTime: 20,
    output: { wood: 1.8 }
  },
  quarry: {
    icon: '🪨',
    name: 'Pedreira',
    description: 'Extração de pedra para muralhas e edifícios.',
    cost: { wood: 30, stone: 25 },
    buildTime: 22,
    output: { stone: 1.6 }
  },
  ironMine: {
    icon: '⛏️',
    name: 'Mina de Ferro',
    description: 'Consolida o setor metalúrgico do reino.',
    cost: { wood: 45, stone: 30, food: 12 },
    buildTime: 30,
    output: { iron: 1.2 }
  },
  farm: {
    icon: '🌾',
    name: 'Fazenda',
    description: 'Sustenta a população e os soldados do reino.',
    cost: { wood: 28, stone: 18 },
    buildTime: 20,
    output: { food: 2.1 }
  },
  granary: {
    icon: '📦',
    name: 'Armazém',
    description: 'Amplia a capacidade de armazenamento do reino.',
    cost: { wood: 60, stone: 45 },
    buildTime: 35,
    output: { storage: 160 }
  },
  barracks: {
    icon: '🛡️',
    name: 'Quartel',
    description: 'Espaço para treinar homens de armas.',
    cost: { wood: 85, stone: 65, food: 28 },
    buildTime: 48,
    output: {}
  },
  wall: {
    icon: '🧱',
    name: 'Muralha',
    description: 'Protege o castelo contra ataques diretos.',
    cost: { wood: 70, stone: 95, food: 18 },
    buildTime: 44,
    output: {}
  }
};

const militaryCatalog = {
  lancer: {
    name: 'Lanceiro',
    icon: '⚔️',
    description: 'Cavalaria leve para patrulhas e ataques rápidos.',
    cost: { wood: 16, food: 12, gold: 8 },
    time: 14,
    strength: 14
  },
  swordsman: {
    name: 'Espadachim',
    icon: '🛡️',
    description: 'Infantaria de linha para ofensiva e defesa.',
    cost: { wood: 20, stone: 12, food: 18, gold: 10 },
    time: 18,
    strength: 22
  },
  axeman: {
    name: 'Machadeiro',
    icon: '🪓',
    description: 'Soldados de choque para romper linhas inimigas.',
    cost: { wood: 18, iron: 14, food: 16, gold: 12 },
    time: 20,
    strength: 18
  },
  scout: {
    name: 'Batedor',
    icon: '🏹',
    description: 'Exploram território, encontram rotas e sinais de perigo.',
    cost: { wood: 14, food: 10, gold: 6 },
    time: 12,
    strength: 11
  }
};

const terrainCatalog = {
  plains: { label: 'Planícies', symbol: '◼', travelModifier: 1 },
  forest: { label: 'Floresta', symbol: '🌲', travelModifier: 1.4 },
  hill: { label: 'Colina', symbol: '⛰', travelModifier: 1.2 },
  river: { label: 'Rio', symbol: '≈', travelModifier: 1.6 },
  mountain: { label: 'Montanha', symbol: '🏔', travelModifier: 2.1 },
  coast: { label: 'Costa', symbol: '≈', travelModifier: 1.3 }
};

const worldArtworkCatalog = {
  kind: {
    capital: 'assets/location-castle.jpg',
    village: 'assets/location-village.jpg',
    ruin: 'assets/location-ruins.jpg'
  },
  terrain: {
    plains: 'assets/terrain-plains.jpg',
    forest: 'assets/terrain-forest.jpg',
    hill: 'assets/terrain-hill.jpg',
    river: 'assets/terrain-river.jpg',
    mountain: 'assets/terrain-mountain.jpg',
    coast: 'assets/terrain-river.jpg'
  }
};

const worldTerrainRows = [
  ['mountain', 'mountain', 'mountain', 'mountain', 'mountain', 'river', 'mountain', 'plains', 'plains'],
  ['mountain', 'mountain', 'forest', 'forest', 'plains', 'river', 'mountain', 'plains', 'plains'],
  ['mountain', 'forest', 'forest', 'forest', 'river', 'river', 'plains', 'plains', 'river'],
  ['hill', 'river', 'forest', 'forest', 'forest', 'forest', 'plains', 'river', 'coast'],
  ['river', 'plains', 'forest', 'forest', 'forest', 'forest', 'plains', 'coast', 'coast'],
  ['plains', 'river', 'forest', 'forest', 'forest', 'plains', 'river', 'forest', 'coast'],
  ['river', 'river', 'hill', 'hill', 'river', 'plains', 'forest', 'coast', 'coast'],
  ['river', 'river', 'plains', 'plains', 'plains', 'plains', 'coast', 'coast', 'coast'],
  ['river', 'river', 'plains', 'plains', 'coast', 'coast', 'coast', 'coast', 'coast']
];

function getMappedWorldTerrain(x, y) {
  const column = x + 4;
  const row = 4 - y;
  return worldTerrainRows[row]?.[column] || 'plains';
}

const defaultWorldTiles = {
  '0,0': {
    x: 0,
    y: 0,
    terrain: 'plains',
    kind: 'capital',
    name: 'Castelo de Ferro',
    description: 'A sede do reino, onde o conselho e a guarda se reúnem.',
    threat: 0,
    reward: { wood: 0, stone: 0, food: 0, gold: 0 }
  },
  '2,1': {
    x: 2,
    y: 1,
    terrain: 'forest',
    kind: 'village',
    name: 'Aldeia de Rowan',
    description: 'Uma vila de lenhadores e patrulhas da fronteira.',
    threat: 30,
    reward: { wood: 60, food: 44, gold: 26 }
  },
  '-3,1': {
    x: -3,
    y: 1,
    terrain: 'forest',
    kind: 'village',
    name: 'Bosque de Cindral',
    description: 'Território verdejante, com caça e madeira em abundância.',
    threat: 42,
    reward: { wood: 72, food: 36, gold: 18 }
  },
  '1,-2': {
    x: 1,
    y: -2,
    terrain: 'coast',
    kind: 'village',
    name: 'Costa de Dour',
    description: 'A praia oferece rota de comércio e pesca rápida.',
    threat: 36,
    reward: { gold: 40, food: 32, stone: 24 }
  },
  '-1,3': {
    x: -1,
    y: 3,
    terrain: 'river',
    kind: 'village',
    name: 'Várzea da Mire',
    description: 'Campos férteis e travessias de rio alinhadas ao comércio.',
    threat: 28,
    reward: { food: 56, gold: 22, wood: 38 }
  },
  '4,-1': {
    x: 4,
    y: -1,
    terrain: 'hill',
    kind: 'village',
    name: 'Três Colinas',
    description: 'Pontos altos para vigias e sinalização de caminho.',
    threat: 48,
    reward: { stone: 48, wood: 34, gold: 28 }
  },
  '-4,-2': {
    x: -4,
    y: -2,
    terrain: 'mountain',
    kind: 'village',
    name: 'Passo de Cael',
    description: 'Uma rota montanhosa que exige cuidado e disciplina.',
    threat: 60,
    reward: { stone: 60, iron: 28, gold: 32 }
  },
  '-2,4': {
    x: -2,
    y: 4,
    terrain: 'forest',
    kind: 'ruin',
    name: 'Ruínas de Serev',
    description: 'Estruturas antigas cobertas por musgo e sinais de antigos reis.',
    threat: 44,
    reward: { gold: 55, stone: 38, wood: 26 }
  },
  '3,3': {
    x: 3,
    y: 3,
    terrain: 'hill',
    kind: 'ruin',
    name: 'Jazida de Aurel',
    description: 'Um monte de pedras quebradas e galerias em direção ao desconhecido.',
    threat: 52,
    reward: { iron: 42, gold: 36, stone: 30 }
  },
  '5,-3': {
    x: 5,
    y: -3,
    terrain: 'coast',
    kind: 'ruin',
    name: 'Fenda do Sal',
    description: 'Uma enseada antiga, tomada por cacos de cerâmica e tesouros de marinheiros.',
    threat: 50,
    reward: { gold: 50, food: 42, wood: 20 }
  }
};

const defaultCharacters = {
  general: {
    id: 'general',
    name: 'Aldric Morn',
    role: 'General',
    specialty: 'Defesa e disciplina',
    personality: 'Determinado',
    experience: 26,
    loyalty: 90,
    morale: 84,
    trait: 'Mantém a guarda firme mesmo diante de ameaças repetidas.'
  },
  steward: {
    id: 'steward',
    name: 'Mara Fen',
    role: 'Conselheira',
    specialty: 'Administração',
    personality: 'Prudente',
    experience: 22,
    loyalty: 86,
    morale: 80,
    trait: 'Ajusta impostos e estoques antes que a escassez se instale.'
  },
  merchant: {
    id: 'merchant',
    name: 'Tavin Orca',
    role: 'Comerciante',
    specialty: 'Rota e trocas',
    personality: 'Astuto',
    experience: 19,
    loyalty: 74,
    morale: 78,
    trait: 'Introduz contratos e taxas que ampliam o ouro sem perder a confiança.'
  },
  scout: {
    id: 'scout',
    name: 'Elira Vale',
    role: 'Exploradora',
    specialty: 'Território e sinais',
    personality: 'Curiosa',
    experience: 28,
    loyalty: 82,
    morale: 88,
    trait: 'Reconhece rotas, ruínas e riscos antes que o reino os veja.'
  },
  envoy: {
    id: 'envoy',
    name: 'Seren Doss',
    role: 'Emissário',
    specialty: 'Eventos e negociação',
    personality: 'Diplomático',
    experience: 17,
    loyalty: 80,
    morale: 75,
    trait: 'Lida com enviados e rumores sem deixar que o reino se derrube.'
  }
};

const defaultMarketOffers = [
  { id: 'wood-purchase', title: 'Leilão de madeira', kind: 'buy', resource: 'wood', amount: 40, goldCost: 18, detail: 'Caravanas vindas do bosque pagam por enquadrar a serraria.' },
  { id: 'stone-sale', title: 'Contrato de pedra', kind: 'sell', resource: 'stone', amount: 24, goldReward: 16, detail: 'Pedra lavrada para reparos de muralha e túneis.' },
  { id: 'iron-demand', title: 'Demanda de ferro', kind: 'buy', resource: 'iron', amount: 18, goldCost: 22, detail: 'Ferreiros da fronteira procuram material de ponta.' },
  { id: 'food-supply', title: 'Carga de comida', kind: 'sell', resource: 'food', amount: 30, goldReward: 18, detail: 'Mercadores querem abastecer a rota do sul antes do inverno.' }
];

const defaultExpansionSettlements = [
  { id: 'rowan', name: 'Aldeia de Rowan', specialty: 'Madeira', loyalty: 74 },
  { id: 'mire', name: 'Várzea da Mire', specialty: 'Comida', loyalty: 68 },
  { id: 'dour', name: 'Costa de Dour', specialty: 'Ouro', loyalty: 71 }
];

const defaultMultiplayerRealm = {
  connected: false,
  realmName: 'Reino de Ferro',
  sync: 84,
  latency: 32,
  channels: ['Corte', 'Frente', 'Fronteiras']
};

const defaultAllianceMembers = [
  { id: 'doran', name: 'Casa Doran', role: 'Vassalo', specialty: 'Comida', support: 26, strength: 62 },
  { id: 'vale', name: 'Conselho de Vale', role: 'Aliado', specialty: 'Pedra', support: 18, strength: 72 },
  { id: 'north', name: 'Patrulhas do Norte', role: 'Liga', specialty: 'Segurança', support: 14, strength: 68 }
];

const defaultInventoryItems = [
  { id: 'iron-sword', name: 'Espada de Ferro', kind: 'Arma', quality: 'Comum', icon: '⚔️', amount: 1, consumable: false },
  { id: 'iron-shield', name: 'Escudo de Ferro', kind: 'Arma', quality: 'Robusto', icon: '🛡️', amount: 1, consumable: false },
  { id: 'rations', name: 'Rações do Reino', kind: 'Suprimento', quality: 'Perecível', icon: '🥖', amount: 16, consumable: true, effect: { food: 18 } },
  { id: 'supply-wood', name: 'Madeira de construção', kind: 'Material', quality: 'Curada', icon: '🪵', amount: 18, consumable: true, effect: { wood: 22 } },
  { id: 'seal', name: 'Selo do Castelo', kind: 'Relíquia', quality: 'Real', icon: '🛕', amount: 1, consumable: false }
];

const defaultWorldLiving = {
  climate: 'Estável',
  invasionRisk: 18,
  caravanTraffic: 2,
  crises: ['Sem crise ativa'],
  ruinedSites: ['Ruínas de Serev', 'Jazida de Aurel'],
  activeEvent: null,
  nextEventEarliestAt: 0
};

const initialState = {
  resources: {
    wood: 220,
    stone: 180,
    iron: 60,
    food: 200,
    gold: 80
  },
  buildings: {
    townHall: 1,
    sawmill: 1,
    quarry: 1,
    ironMine: 1,
    farm: 1,
    granary: 1,
    barracks: 1,
    wall: 1
  },
  population: 42,
  populationCap: 60,
  army: {
    lancer: 0,
    swordsman: 0,
    axeman: 0,
    scout: 0
  },
  queue: null,
  trainingQueue: null,
  world: {
    selectedTileKey: '0,0',
    route: null,
    discovered: {
      '0,0': true,
      '1,0': true,
      '0,1': true,
      '-1,0': true,
      '0,-1': true
    },
    tiles: { ...defaultWorldTiles }
  },
  battle: null,
  event: null,
  expedition: null,
  nextEventEarliestAt: 0,
  reputation: 62,
  characters: cloneState(defaultCharacters),
  economy: {
    offers: cloneState(defaultMarketOffers),
    routes: 1,
    merchants: 2,
    cargo: 18
  },
  expansion: {
    settlements: cloneState(defaultExpansionSettlements),
    territory: 3,
    nobles: [{ name: 'Lady Ashara', title: 'Senhora de Rowan', influence: 64 }]
  },
  multiplayer: cloneState(defaultMultiplayerRealm),
  alliance: {
    pact: 'Pacto da Fronteira',
    morale: 76,
    influence: 3,
    members: cloneState(defaultAllianceMembers)
  },
  inventory: cloneState(defaultInventoryItems),
  worldLiving: cloneState(defaultWorldLiving),
  stats: {
    battlesWon: 0,
    battlesLost: 0,
    tradesCompleted: 0,
    expeditionsCompleted: 0,
    eventsResolved: 0,
    settlementsFounded: 0,
    allianceActions: 0,
    buildingsCompleted: 0
  },
  lastUpdatedAt: Date.now(),
  aiKingdoms: null,
  log: [
    'A corte do reino se reúne sob sua bandeira.',
    'Sua administração começou a tomar forma.'
  ],
  reports: [
    {
      id: 'report-intro',
      category: 'administration',
      title: 'Corte reunida',
      summary: 'Sua administração começou a tomar forma e o reino tomou o primeiro rumo estável.',
      details: 'A corte, os conselheiros e os servidores do castelo registraram o início da rotina do reino. Os primeiros pilares foram entregues e as decisões do soberano já começam a afetar o futuro da região.',
      timestamp: Date.now()
    }
  ]
};

const eventCatalog = [
  {
    id: 'harvest-blessing',
    title: 'Colheita da sorte',
    description: 'Os campos cresceram além do esperado e a coleta foi abundante.',
    choices: [
      { label: 'Celebrar no pátio', effect: { food: 48, gold: 26 }, reputation: 8, message: 'Os súditos festejaram e a praça vibrou com música e comida.' },
      { label: 'Guardar para o inverno', effect: { food: 68 }, reputation: 5, message: 'Os celeiros receberam o excedente e a população respirou mais tranquila.' }
    ]
  },
  {
    id: 'merchant-caravan',
    title: 'Caravana de mercadores',
    description: 'Mesas de troca chegam do sul com bens raros e ouro em bolsas pesadas.',
    choices: [
      { label: 'Comprar minério', effect: { iron: 34, gold: -18 }, reputation: 2, message: 'O ferro chegou em massa, mas o tesouro teve de ser usado para abrir a rota.' },
      { label: 'Contratar escoltas', effect: { gold: -16, wood: 26, stone: 26 }, reputation: 6, message: 'A rota foi protegida e o comércio ficou mais seguro no próximo mês.' }
    ]
  },
  {
    id: 'forest-fire',
    title: 'Incêndio em uma clareira',
    description: 'Uma fogueira solta no bosque quase alcança a floresta do reino.',
    choices: [
      { label: 'Mobilizar os bombeiros', effect: { wood: -36, gold: -12, food: -8 }, reputation: 6, message: 'Os homens da floresta apagaram o fogo a tempo, mas o custo foi alto.' },
      { label: 'Cortar o acesso e reforçar', effect: { stone: -20, wood: -26, gold: -14 }, reputation: 3, message: 'A área foi isolada e a ameaça foi contida antes que se espalhasse.' }
    ]
  },
  {
    id: 'bandit-raid',
    title: 'Ataque de bandidos',
    description: 'Tropas menores assaltaram a rota de suprimentos e levaram tudo que podiam.',
    choices: [
      { label: 'Responder com patrulha', effect: { gold: -20, food: -14 }, reputation: 7, message: 'As patrulhas voltaram com alguns roubados e o caminho foi reforçado.' },
      { label: 'Pagar tributo por segurança', effect: { gold: -32 }, reputation: -6, message: 'O reino evitou um conflito maior, mas ceder aos bandidos custou parte da honra da coroa.' }
    ]
  },
  {
    id: 'gold-rush',
    title: 'Rumo ao veio',
    description: 'Um grupo de mineiros encontrou uma veia rica perto da fronteira.',
    choices: [
      { label: 'Extrair o minério com registro oficial', effect: { gold: 40, iron: 22, food: -8 }, reputation: 4, message: 'O povo se empolgou e o cofre do reino voltou a pulsar.' },
      { label: 'Escavar em segredo, sem dividir', effect: { gold: 48, stone: -16 }, reputation: -4, message: 'Os mineiros abriram uma rota clandestina. O tesouro cresceu, mas o segredo pesa.' }
    ]
  },
  {
    id: 'plague-village',
    title: 'Praga na vila',
    description: 'Uma doença desconhecida se espalha entre os camponeses da periferia. O conselho espera sua ordem.',
    choices: [
      { label: 'Isolar os doentes com cuidado', effect: { food: -30, gold: -15 }, reputation: 10, message: 'A quarentena foi organizada com dignidade. O povo viu a coroa proteger a todos, mesmo os mais pobres.' },
      { label: 'Trancar os doentes e abandonar a vila', effect: { food: 10 }, reputation: -18, message: 'Os gritos da vila isolada ecoaram por dias. Poucos súditos esquecerão a frieza do reino.' },
      { label: 'Queimar a vila com os doentes dentro', effect: { gold: 20, food: 15 }, reputation: -35, message: 'O fogo consumiu tudo. O silêncio que se seguiu pesa sobre o trono como uma sombra que não se apaga.' }
    ]
  },
  {
    id: 'thief-caught',
    title: 'Ladrão capturado nas muralhas',
    description: 'Um ladrão foi pego tentando roubar os cofres do castelo. A multidão se reúne no pátio, esperando a sentença.',
    choices: [
      { label: 'Perdoar e oferecer trabalho honesto', effect: { gold: -5 }, reputation: 12, message: 'O ladrão jurou lealdade diante da corte. O povo viu misericórdia onde esperava sangue.' },
      { label: 'Cortar a mão em praça pública', effect: { gold: 10 }, reputation: -8, message: 'A punição foi cumprida sob os olhos de todos. Alguns aplaudiram, outros baixaram os olhos.' },
      { label: 'Executar como exemplo', effect: { gold: 5 }, reputation: -22, message: 'O corpo ficou exposto no portão por dias. O medo cresceu no reino, e também o rancor.' }
    ]
  },
  {
    id: 'false-prophet',
    title: 'Falso profeta nas ruas',
    description: 'Um homem se diz mensageiro divino e reúne multidões cada vez maiores com promessas de milagres.',
    choices: [
      { label: 'Expor a fraude publicamente', effect: { gold: -8 }, reputation: 9, message: 'A farsa foi desmontada com provas diante do povo, que confiou ainda mais na justiça do reino.' },
      { label: 'Usá-lo para controlar o povo', effect: { gold: 26, food: 10 }, reputation: -20, message: 'As multidões obedecem ao profeta, e o profeta obedece ao ouro do castelo. Um jogo perigoso de fé emprestada.' },
      { label: 'Prendê-lo em silêncio, sem julgamento', effect: { gold: 6 }, reputation: -14, message: 'Ele desapareceu numa noite sem explicação. Rumores tomaram o lugar da verdade.' }
    ]
  },
  {
    id: 'starving-refugees',
    title: 'Refugiados famintos no portão',
    description: 'Uma fila de famintos, expulsos de terras vizinhas devastadas pela guerra, pede abrigo diante das muralhas.',
    choices: [
      { label: 'Acolher e alimentar a todos', effect: { food: -45, gold: -10, wood: 8 }, reputation: 16, message: 'O reino abriu suas portas. Muitos deles hoje trabalham a terra em nome da coroa.' },
      { label: 'Negar entrada e fechar os portões', effect: {}, reputation: -16, message: 'Os gritos do lado de fora enfraqueceram com o passar das noites frias.' },
      { label: 'Vendê-los como servos a mercadores', effect: { gold: 40 }, reputation: -40, message: 'O ouro pesa mais nos cofres do que na consciência de quem o aceitou.' }
    ]
  },
  {
    id: 'corrupt-tax-collector',
    title: 'Coletor de impostos corrupto',
    description: 'Um relatório aponta que o coletor de impostos da fronteira extorque os camponeses muito além da lei do reino.',
    choices: [
      { label: 'Julgá-lo e devolver o excedente', effect: { gold: -20 }, reputation: 14, message: 'A justiça foi feita diante do povo, e os camponeses voltaram a confiar na coroa.' },
      { label: 'Ignorar em troca de uma parte', effect: { gold: 30 }, reputation: -18, message: 'O ouro extra chegou aos cofres reais, mas o preço foi pago em silêncio pelos súditos da fronteira.' },
      { label: 'Promovê-lo a chefe da região', effect: { gold: 55 }, reputation: -32, message: 'A corrupção agora tem selo oficial. O reino lucra, mas algo se corrói por dentro do trono.' }
    ]
  }
];

// AI kingdoms — each NPC realm has a personality that drives its decisions.
// weights: aggressive, economic, expansionist, diplomatic (0–100)
const aiKingdomCatalog = [
  {
    id: 'vorn',
    name: 'Reino de Vorn',
    color: 'crimson',
    home: '3,-2',
    personality: { aggressive: 80, economic: 20, expansionist: 60, diplomatic: 10 },
    description: 'Senhores da guerra do leste. Atacam com frequência mas negociam pouco.'
  },
  {
    id: 'elara',
    name: 'Principado de Elara',
    color: 'royalblue',
    home: '-3,3',
    personality: { aggressive: 15, economic: 90, expansionist: 40, diplomatic: 70 },
    description: 'Comerciantes astutos do norte. Preferem lucro a sangue.'
  },
  {
    id: 'dreth',
    name: 'Clã de Dreth',
    color: 'saddlebrown',
    home: '-4,-3',
    personality: { aggressive: 60, economic: 30, expansionist: 85, diplomatic: 20 },
    description: 'Bárbaros das montanhas. Expandem sem parar, mas com pouca estratégia.'
  },
  {
    id: 'sola',
    name: 'Liga de Sola',
    color: 'goldenrod',
    home: '4,3',
    personality: { aggressive: 25, economic: 65, expansionist: 35, diplomatic: 90 },
    description: 'Diplomatas do sul. Formam alianças e cobram favores.'
  }
];

const initialAIState = {
  vorn:  { id: 'vorn',  strength: 55, resources: 120, territory: 2, stance: 'neutral', lastAction: null, nextActionAt: 0 },
  elara: { id: 'elara', strength: 40, resources: 200, territory: 2, stance: 'neutral', lastAction: null, nextActionAt: 0 },
  dreth: { id: 'dreth', strength: 65, resources: 80,  territory: 1, stance: 'neutral', lastAction: null, nextActionAt: 0 },
  sola:  { id: 'sola',  strength: 35, resources: 160, territory: 3, stance: 'neutral', lastAction: null, nextActionAt: 0 }
};

const counselorLines = [
  'Meu rei, a serraria está operando acima da média.',
  'Os homens da pedreira voltaram com pedra fresca e boa qualidade.',
  'Seus súditos reverenciam a sua presença na praça.',
  'A muralha ainda não existe, mas o reino já começa a respirar segurança.',
  'Meu rei, o que ordena agora?'
];
