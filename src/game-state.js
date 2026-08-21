// Runtime state helpers: loading, saving, normalization, and shared calculations.
function tileKey(x, y) {
  return `${x},${y}`;
}

function getRouteLineTiles(x1, y1, x2, y2) {
  const tiles = [];
  let x = x1;
  let y = y1;
  const dx = Math.abs(x2 - x1);
  const dy = -Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx + dy;

  while (true) {
    tiles.push(tileKey(x, y));
    if (x === x2 && y === y2) {
      break;
    }
    const doubleErr = err * 2;
    if (doubleErr >= dy) {
      err += dy;
      x += sx;
    }
    if (doubleErr <= dx) {
      err += dx;
      y += sy;
    }
  }

  return tiles;
}

function generateWorldTile(x, y) {
  const terrain = getMappedWorldTerrain(x, y);

  return {
    x,
    y,
    terrain,
    kind: 'empty',
    name: x === 0 && y === 0 ? 'Castelo de Ferro' : `Território ${x}:${y}`,
    description: x === 0 && y === 0
      ? 'A sede do reino, onde o conselho e a guarda se reúnem.'
      : 'Um ponto do reino ainda sem nome fixo, mas pronto para exploração.'
  };
}

function normalizeWorldTile(tile, fallbackX = 0, fallbackY = 0) {
  const x = Number(tile?.x ?? fallbackX);
  const y = Number(tile?.y ?? fallbackY);
  const normalizedKey = tileKey(x, y);
  const safeTile = tile && typeof tile === 'object' ? { ...tile } : {};

  return {
    ...safeTile,
    x,
    y,
    terrain: getMappedWorldTerrain(x, y) || safeTile.terrain || 'plains',
    kind: safeTile.kind || 'empty',
    name: safeTile.name || (normalizedKey === '0,0' ? 'Castelo de Ferro' : `Território ${x}:${y}`),
    description: safeTile.description || (normalizedKey === '0,0'
      ? 'A sede do reino, onde o conselho e a guarda se reúnem.'
      : 'Um ponto do reino ainda sem nome fixo, mas pronto para exploração.')
  };
}

function getWorldTileByKey(key) {
  const [rawX, rawY] = key.split(',');
  const x = Number(rawX) || 0;
  const y = Number(rawY) || 0;

  if (state.world.tiles[key]) {
    return normalizeWorldTile(state.world.tiles[key], x, y);
  }

  return normalizeWorldTile(generateWorldTile(x, y), x, y);
}

function getSelectedWorldTile() {
  return getWorldTileByKey(state.world.selectedTileKey || '0,0');
}

function getWorldArtwork(tile) {
  return worldArtworkCatalog.kind[tile?.kind]
    || worldArtworkCatalog.terrain[tile?.terrain]
    || worldArtworkCatalog.terrain.plains;
}

function getTravelTimeToTile(x, y) {
  const target = getWorldTileByKey(tileKey(x, y));
  const distance = Math.abs(target.x) + Math.abs(target.y);
  const terrainFactor = terrainCatalog[target.terrain]?.travelModifier || 1;
  return Math.max(8, Math.round(distance * 7 * terrainFactor));
}

function getStorageCap() {
  const base = 420;
  const granaryBonus = (state.buildings.granary || 0) * 160;
  return base + granaryBonus;
}

function getPopulationCap() {
  const base = 36;
  const farmBonus = (state.buildings.farm || 0) * 14;
  const granaryBonus = (state.buildings.granary || 0) * 8;
  const townHallBonus = (state.buildings.townHall || 0) * 10;
  return base + farmBonus + granaryBonus + townHallBonus;
}

function getResourceRates() {
  const rates = { wood: 0, stone: 0, iron: 0, food: 0, gold: 0 };

  Object.entries(buildingCatalog).forEach(([buildingKey, config]) => {
    const level = state.buildings[buildingKey] || 0;
    if (level <= 0) {
      return;
    }

    Object.entries(config.output).forEach(([resourceKey, value]) => {
      if (resourceKey === 'storage') {
        return;
      }

      rates[resourceKey] += value * level;
    });
  });

  return rates;
}

function getDefenseScore() {
  const wallLevel = state.buildings.wall || 0;
  return 25 + wallLevel * 30;
}

function getArmyCount() {
  return Object.values(state.army || {}).reduce((sum, count) => sum + count, 0);
}

function getArmyStrength() {
  return Object.entries(state.army || {}).reduce((sum, [unitKey, count]) => {
    const unit = militaryCatalog[unitKey];
    return sum + (unit ? unit.strength * count : 0);
  }, 0);
}

function removeArmyUnits(totalToRemove) {
  let remaining = Math.max(0, totalToRemove);
  const order = Object.entries(state.army || {}).sort((a, b) => {
    const strengthA = militaryCatalog[a[0]]?.strength || 0;
    const strengthB = militaryCatalog[b[0]]?.strength || 0;
    return strengthB - strengthA;
  });

  for (const [unitKey, count] of order) {
    if (remaining <= 0) {
      break;
    }

    const lost = Math.min(count, remaining);
    state.army[unitKey] = Math.max(0, count - lost);
    remaining -= lost;
  }
}

function clampResources() {
  const cap = getStorageCap();
  Object.keys(state.resources).forEach((resourceKey) => {
    const max = resourceKey === 'food' ? cap + 120 : cap;
    state.resources[resourceKey] = Math.max(0, Math.min(state.resources[resourceKey], max));
  });
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return cloneState(initialState);
    }

    const parsed = JSON.parse(raw);
    return {
      ...cloneState(initialState),
      ...parsed,
      resources: { ...initialState.resources, ...(parsed.resources || {}) },
      buildings: { ...initialState.buildings, ...(parsed.buildings || {}) },
      population: typeof parsed.population === 'number' ? parsed.population : initialState.population,
      populationCap: typeof parsed.populationCap === 'number' ? parsed.populationCap : initialState.populationCap,
      army: { ...initialState.army, ...(parsed.army || {}) },
      trainingQueue: parsed.trainingQueue || null,
      world: {
        ...cloneState(initialState.world),
        ...(parsed.world || {}),
        discovered: { ...(initialState.world.discovered || {}), ...(parsed.world?.discovered || {}) },
        tiles: { ...cloneState(defaultWorldTiles), ...(parsed.world?.tiles || {}) }
      },
      battle: parsed.battle || null,
      event: parsed.event || null,
      expedition: parsed.expedition || null,
      nextEventEarliestAt: typeof parsed.nextEventEarliestAt === 'number' ? parsed.nextEventEarliestAt : 0,
      reputation: typeof parsed.reputation === 'number' ? parsed.reputation : initialState.reputation,
      characters: { ...cloneState(defaultCharacters), ...(parsed.characters || {}) },
      economy: {
        offers: Array.isArray(parsed.economy?.offers) && parsed.economy.offers.length > 0 ? parsed.economy.offers : cloneState(defaultMarketOffers),
        routes: typeof parsed.economy?.routes === 'number' ? parsed.economy.routes : initialState.economy.routes,
        merchants: typeof parsed.economy?.merchants === 'number' ? parsed.economy.merchants : initialState.economy.merchants,
        cargo: typeof parsed.economy?.cargo === 'number' ? parsed.economy.cargo : initialState.economy.cargo
      },
      expansion: {
        settlements: Array.isArray(parsed.expansion?.settlements) ? parsed.expansion.settlements : cloneState(defaultExpansionSettlements),
        territory: typeof parsed.expansion?.territory === 'number' ? parsed.expansion.territory : initialState.expansion.territory,
        nobles: Array.isArray(parsed.expansion?.nobles) ? parsed.expansion.nobles : cloneState(initialState.expansion.nobles)
      },
      multiplayer: {
        connected: Boolean(parsed.multiplayer?.connected),
        realmName: typeof parsed.multiplayer?.realmName === 'string' ? parsed.multiplayer.realmName : initialState.multiplayer.realmName,
        sync: typeof parsed.multiplayer?.sync === 'number' ? parsed.multiplayer.sync : initialState.multiplayer.sync,
        latency: typeof parsed.multiplayer?.latency === 'number' ? parsed.multiplayer.latency : initialState.multiplayer.latency,
        channels: Array.isArray(parsed.multiplayer?.channels) ? parsed.multiplayer.channels : cloneState(initialState.multiplayer.channels)
      },
      alliance: {
        pact: typeof parsed.alliance?.pact === 'string' ? parsed.alliance.pact : initialState.alliance.pact,
        morale: typeof parsed.alliance?.morale === 'number' ? parsed.alliance.morale : initialState.alliance.morale,
        influence: typeof parsed.alliance?.influence === 'number' ? parsed.alliance.influence : initialState.alliance.influence,
        members: Array.isArray(parsed.alliance?.members) ? parsed.alliance.members : cloneState(initialState.alliance.members)
      },
      inventory: Array.isArray(parsed.inventory)
        ? parsed.inventory.map((item, index) => normalizeInventoryItem(item, index))
        : cloneState(initialState.inventory),
      worldLiving: {
        climate: typeof parsed.worldLiving?.climate === 'string' ? parsed.worldLiving.climate : initialState.worldLiving.climate,
        invasionRisk: typeof parsed.worldLiving?.invasionRisk === 'number' ? parsed.worldLiving.invasionRisk : initialState.worldLiving.invasionRisk,
        caravanTraffic: typeof parsed.worldLiving?.caravanTraffic === 'number' ? parsed.worldLiving.caravanTraffic : initialState.worldLiving.caravanTraffic,
        crises: Array.isArray(parsed.worldLiving?.crises) ? parsed.worldLiving.crises : cloneState(initialState.worldLiving.crises),
        ruinedSites: Array.isArray(parsed.worldLiving?.ruinedSites) ? parsed.worldLiving.ruinedSites : cloneState(initialState.worldLiving.ruinedSites),
        activeEvent: parsed.worldLiving?.activeEvent || null,
        nextEventEarliestAt: typeof parsed.worldLiving?.nextEventEarliestAt === 'number' ? parsed.worldLiving.nextEventEarliestAt : 0
      },
      stats: {
        battlesWon: typeof parsed.stats?.battlesWon === 'number' ? parsed.stats.battlesWon : 0,
        battlesLost: typeof parsed.stats?.battlesLost === 'number' ? parsed.stats.battlesLost : 0,
        tradesCompleted: typeof parsed.stats?.tradesCompleted === 'number' ? parsed.stats.tradesCompleted : 0,
        expeditionsCompleted: typeof parsed.stats?.expeditionsCompleted === 'number' ? parsed.stats.expeditionsCompleted : 0,
        eventsResolved: typeof parsed.stats?.eventsResolved === 'number' ? parsed.stats.eventsResolved : 0,
        settlementsFounded: typeof parsed.stats?.settlementsFounded === 'number' ? parsed.stats.settlementsFounded : 0,
        allianceActions: typeof parsed.stats?.allianceActions === 'number' ? parsed.stats.allianceActions : 0,
        buildingsCompleted: typeof parsed.stats?.buildingsCompleted === 'number' ? parsed.stats.buildingsCompleted : 0
      },
      log: Array.isArray(parsed.log) ? parsed.log : cloneState(initialState.log),
      reports: Array.isArray(parsed.reports) ? parsed.reports : cloneState(initialState.reports),
      aiKingdoms: parsed.aiKingdoms && typeof parsed.aiKingdoms === 'object' ? parsed.aiKingdoms : null
    };
  } catch (error) {
    console.warn('Falha ao ler save do reino.', error);
    return cloneState(initialState);
  }
}

function addLog(message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 6);
}

function pushReport(category, title, summary, details) {
  if (!state) {
    return;
  }

  const report = {
    id: `report-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    category,
    title,
    summary,
    details,
    timestamp: Date.now()
  };

  state.reports = [report, ...(state.reports || [])].slice(0, 40);
}

function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer || !message) {
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `<div class="toast-message">${message}</div>`;

  toastContainer.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3000);
}

function incrementStat(key, amount = 1) {
  if (!state.stats) {
    state.stats = cloneState(initialState.stats);
  }
  state.stats[key] = (state.stats[key] || 0) + amount;
}

let actionGuardTimeout = null;
let notificationOpen = false;
let notificationWasPending = false;

function toggleNotificationLetter() {
  notificationOpen = !notificationOpen;
  renderAll();
}

function renderNotificationLetter() {
  const content = document.getElementById('notificationLetterContent');
  if (!content) {
    return;
  }

  const event = localizeEvent(state.event || state.worldLiving?.activeEvent);
  content.innerHTML = event
    ? `<strong>${event.title}</strong><span>${event.description}</span>`
    : '';
}

function withActionGuard(handler) {
  return function guardedAction(...args) {
    if (actionGuardTimeout) {
      return;
    }
    actionGuardTimeout = window.setTimeout(() => {
      actionGuardTimeout = null;
    }, 450);
    handler(...args);
  };
}

function formatResourceDelta(effect) {
  return Object.entries(effect || {})
    .filter(([resourceKey]) => resourceMeta[resourceKey])
    .map(([resourceKey, amount]) => `${amount >= 0 ? '+' : ''}${Math.round(amount)} ${resourceMeta[resourceKey].icon}`)
    .join('  ');
}

function getEventEffect(effect) {
  return Object.fromEntries(Object.entries(effect || {}).map(([resourceKey, amount]) => [
    resourceKey,
    amount < 0 ? Math.round(amount * 1.5) : amount
  ]));
}

function saveState() {
  state.lastUpdatedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function canAfford(cost) {
  return Object.entries(cost).every(([resourceKey, amount]) => (state.resources[resourceKey] || 0) >= amount);
}

function popResourceCost(cost) {
  Object.entries(cost).forEach(([resourceKey, amount]) => {
    state.resources[resourceKey] = (state.resources[resourceKey] || 0) - amount;
  });
}

function calculateQueuedProgress() {
  if (!state.queue) {
    return 0;
  }

  const now = Date.now();
  const total = state.queue.totalMs;
  const elapsed = Math.max(0, now - state.queue.startedAt);
  return Math.min(100, (elapsed / total) * 100);
}
