// Player actions, progression, navigation wiring, and bootstrap flow.
function triggerRandomEvent() {
  if (state.event || state.world.route || state.battle) {
    return;
  }

  const now = Date.now();
  if (now < (state.nextEventEarliestAt || 0)) {
    return;
  }

  if (Math.random() > 0.012) {
    return;
  }

  const template = eventCatalog[Math.floor(Math.random() * eventCatalog.length)];
  state.event = {
    ...cloneState(template),
    choices: template.choices.map((choice) => ({ ...choice }))
  };
  state.nextEventEarliestAt = now + 600000;
  addLog(`O reino recebeu um novo evento: ${template.title}.`);
  renderAll();
  saveState();
}

function resolveEvent(choiceIndex) {
  if (!state.event) {
    return;
  }

  const choice = state.event.choices[choiceIndex];
  if (!choice) {
    return;
  }

  const eventEffect = getEventEffect(choice.effect);
  Object.entries(eventEffect).forEach(([resourceKey, amount]) => {
    if (resourceKey === 'food' || resourceKey === 'gold' || resourceKey === 'wood' || resourceKey === 'stone' || resourceKey === 'iron') {
      state.resources[resourceKey] = (state.resources[resourceKey] || 0) + amount;
    }
  });

  clampResources();
  const reputationDelta = typeof choice.reputation === 'number' ? choice.reputation : 3;
  awardReputation(reputationDelta, `O conselho reconheceu a decisão sobre ${state.event.title}.`);
  updateCharacterProgress('envoy', 3, 3, 2);
  updateCharacterProgress('steward', 2, 2, 1);
  incrementStat('eventsResolved');
  addLog(choice.message || 'O reino decidiu agir diante do evento.');
  const eventDelta = formatResourceDelta(eventEffect);
  pushReport('events', state.event.title, choice.message || 'O reino respondeu a um evento externo e ajustou o curso da administração.', `Decisão tomada: "${choice.label}". ${choice.message || ''} Efeito nos recursos: ${eventDelta || 'nenhum'}. Reputação: ${reputationDelta >= 0 ? '+' : ''}${reputationDelta}.`);
  showToast(eventDelta ? `${choice.message || 'Decisão registrada.'} (${eventDelta})` : (choice.message || 'Decisão registrada.'), 'info');
  state.event = null;
  renderAll();
  saveState();
}

function startExpedition(targetX, targetY) {
  if (state.expedition || state.world.route || state.battle || state.event) {
    addLog('O reino não consegue dispersar suas forças em duas expedições ao mesmo tempo.');
    renderAll();
    return;
  }

  const targetKey = tileKey(targetX, targetY);
  const targetTile = getWorldTileByKey(targetKey);
  const travelTime = getTravelTimeToTile(targetX, targetY);

  state.expedition = {
    targetKey,
    targetName: targetTile.name,
    startedAt: Date.now(),
    endsAt: Date.now() + travelTime * 1000,
    totalMs: travelTime * 1000,
    reward: { ...(targetTile.reward || {}) }
  };

  state.world.selectedTileKey = targetKey;
  state.world.discovered[targetKey] = true;
  addLog(`Uma expedição partiu para ${targetTile.name}. O retorno será em ${travelTime}s.`);
  renderAll();
  saveState();
}

function resolveExpedition() {
  if (!state.expedition) {
    return;
  }

  const now = Date.now();
  if (now < state.expedition.endsAt) {
    return;
  }

  const targetKey = state.expedition.targetKey;
  const targetTile = getWorldTileByKey(targetKey);
  const rewardEntries = Object.entries(targetTile.reward || {});

  rewardEntries.forEach(([resourceKey, amount]) => {
    state.resources[resourceKey] = (state.resources[resourceKey] || 0) + amount;
  });

  if (targetTile.kind === 'ruin') {
    awardInventoryItem('seal', 1);
    addLog(`Uma relíquia antiga foi adicionada ao inventário de ${targetTile.name}.`);
  } else if (Math.random() > 0.45) {
    awardInventoryItem('supply-wood', 2);
  }

  state.world.discovered[targetKey] = true;
  awardReputation(4, `A expedição em ${targetTile.name} reforçou a confiança do reino.`);
  updateCharacterProgress('scout', 4, 3, 4);
  updateCharacterProgress('merchant', 2, 2, 1);
  incrementStat('expeditionsCompleted');
  addLog(`A expedição retornou de ${targetTile.name} com descobertas e ${rewardEntries.length} tipos de recompensa.`);
  const expeditionDelta = formatResourceDelta(Object.fromEntries(rewardEntries));
  pushReport('exploration', `Retorno de ${targetTile.name}`, 'A expedição retornou com descobertas e recursos para o reino.', `Decisão tomada: explorar ${targetTile.name}. Ganhos: ${expeditionDelta || 'nenhum recurso'}. Reputação: +4.`);
  showToast(expeditionDelta ? `Expedição retornou de ${targetTile.name}. (${expeditionDelta})` : `Expedição retornou de ${targetTile.name}.`, 'success');
  state.expedition = null;
  clampResources();
  saveState();
}

function setCounselorMessage() {
  const nextMessage = counselorLines[Math.floor(Math.random() * counselorLines.length)];
  document.getElementById('counselorText').textContent = nextMessage;
}

function startWorldTravel(targetX, targetY) {
  if (state.world.route) {
    addLog('A expedição atual já está em marcha. Aguarde o retorno das patrulhas.');
    renderAll();
    return;
  }

  const targetKey = tileKey(targetX, targetY);
  if (targetKey === '0,0') {
    addLog('O castelo já está sob sua guarda. Escolha outra rota para explorar.');
    renderAll();
    return;
  }

  const targetTile = getWorldTileByKey(targetKey);
  state.world.tiles[targetKey] = {
    ...targetTile,
    kind: targetTile.kind || 'empty',
    name: targetTile.name,
    description: targetTile.description
  };
  const travelTime = getTravelTimeToTile(targetX, targetY);

  state.world.route = {
    targetKey,
    targetName: targetTile.name,
    startedAt: Date.now(),
    endsAt: Date.now() + travelTime * 1000,
    totalMs: travelTime * 1000
  };

  state.world.selectedTileKey = targetKey;
  state.world.discovered[targetKey] = true;
  addLog(`Uma coluna marchou para ${targetTile.name}. O retorno será em ${travelTime}s.`);
  renderAll();
  saveState();
}

function completeWorldTravel() {
  if (!state.world.route) {
    return;
  }

  const now = Date.now();
  if (now < state.world.route.endsAt) {
    return;
  }

  const targetKey = state.world.route.targetKey;
  const tile = getWorldTileByKey(targetKey);
  state.world.route = null;
  state.world.selectedTileKey = targetKey;
  state.world.discovered[targetKey] = true;
  if (!state.world.tiles[targetKey]) {
    state.world.tiles[targetKey] = {
      ...tile,
      kind: 'empty',
      name: tile.name,
      description: tile.description
    };
  }
  addLog(`A expedição retornou de ${tile.name}. O território foi mapeado e a rota ficou registrada.`);
  showToast(`Coluna retornou de ${tile.name}.`, 'info');
}

function startBattle(targetKey) {
  if (state.battle || state.world.route) {
    addLog('As tropas do reino já estão mobilizadas em outra ação.');
    renderAll();
    return;
  }

  const targetTile = getWorldTileByKey(targetKey);
  if (!targetTile || targetKey === '0,0') {
    addLog('O castelo não pode ser atacado por suas próprias forças.');
    renderAll();
    return;
  }

  const armyCount = getArmyCount();
  if (armyCount <= 0) {
    addLog('Nenhuma unidade do exército está disponível para a ofensiva.');
    showToast('Nenhuma unidade disponível para atacar.', 'danger');
    renderAll();
    return;
  }

  const attackPower = getArmyStrength();
  const targetDefense = (targetTile.threat || 25) + (state.buildings.wall || 0) * 8;
  const travelTime = getTravelTimeToTile(targetTile.x, targetTile.y);

  state.battle = {
    targetKey,
    targetName: targetTile.name,
    startedAt: Date.now(),
    endsAt: Date.now() + travelTime * 1000,
    totalMs: travelTime * 1000,
    attackPower,
    targetDefense,
    report: null,
    loot: null
  };

  state.world.selectedTileKey = targetKey;
  addLog(`O comando avançou contra ${targetTile.name}. A batalha terá duração de ${travelTime}s.`);
  renderAll();
  saveState();
}

function resolveBattle() {
  if (!state.battle) {
    return;
  }

  const now = Date.now();
  if (now < state.battle.endsAt) {
    return;
  }

  const attackPower = state.battle.attackPower;
  const targetDefense = state.battle.targetDefense;
  const battleScore = attackPower + (Math.random() * 24 - 12);
  const defenseScore = targetDefense + (Math.random() * 26 - 10);
  const victory = battleScore >= defenseScore;
  const totalTroops = getArmyCount();
  const casualtyRatio = victory ? 0.18 + (Math.random() * 0.12) : 0.34 + (Math.random() * 0.18);
  const casualties = Math.max(1, Math.round(totalTroops * casualtyRatio));

  removeArmyUnits(casualties);

  const reward = {
    wood: 30,
    stone: 24,
    food: 26,
    gold: 18
  };

  if (victory) {
    Object.entries(reward).forEach(([resourceKey, amount]) => {
      state.resources[resourceKey] = (state.resources[resourceKey] || 0) + amount + (Math.random() * 18);
    });

    if (Math.random() > 0.5) {
      awardInventoryItem('iron-sword', 1);
    } else {
      awardInventoryItem('rations', 4);
    }

    awardReputation(5, `A vitória em ${state.battle.targetName} elevou a fama do reino.`);
    updateCharacterProgress('general', 6, 4, 5);
    updateCharacterProgress('scout', 3, 2, 2);
    incrementStat('battlesWon');
    addLog(`Vitória em ${state.battle.targetName}! As tropas retornam com reforço de recursos e ${casualties} baixas no campo.`);
    pushReport('battle', `Vitória em ${state.battle.targetName}`, 'As forças do reino mantiveram o controle da frente e retornaram com recursos.', `Decisão tomada: atacar ${state.battle.targetName}. A campanha terminou em vitória, com ${casualties} baixas no exército. Ganhos: ${formatResourceDelta(reward)}. Reputação: +5.`);
    showToast(`Vitória em ${state.battle.targetName}. (${formatResourceDelta(reward)})`, 'success');
  } else {
    const loss = Math.max(10, Math.round(attackPower * 0.12));
    Object.entries(reward).forEach(([resourceKey, amount]) => {
      state.resources[resourceKey] = Math.max(0, (state.resources[resourceKey] || 0) - amount * 0.5);
    });
    awardReputation(-3, `A derrota em ${state.battle.targetName} abalou a confiança do reino.`);
    updateCharacterProgress('general', 1, -2, -4);
    incrementStat('battlesLost');
    addLog(`A ofensiva falhou em ${state.battle.targetName}. O exército recuou com ${casualties} perdas e pouco saque.`);
    pushReport('battle', `Retirada em ${state.battle.targetName}`, 'A ofensiva falhou e o capitão ordenou o recuo com perdas.', `Decisão tomada: atacar ${state.battle.targetName}. A ofensiva falhou, com ${casualties} baixas e perda de ${loss} ouro em suprimentos. Reputação: -3.`);
    showToast(`A ofensiva falhou em ${state.battle.targetName}. ${casualties} baixas.`, 'danger');
    if (loss > 0) {
      state.resources.gold = Math.max(0, (state.resources.gold || 0) - loss);
    }
  }

  clampResources();
  state.battle = null;
  saveState();
}

function queueConstruction(buildingKey) {
  if (state.queue) {
    addLog('O reino só consegue sustentar uma obra por vez.');
    renderAll();
    return;
  }

  const config = buildingCatalog[buildingKey];
  if (!config) {
    return;
  }

  if (!canAfford(config.cost)) {
    addLog(`Recursos insuficientes para ${config.name}.`);
    showToast(`Recursos insuficientes para ${config.name}.`, 'danger');
    renderAll();
    return;
  }

  popResourceCost(config.cost);

  state.queue = {
    id: buildingKey,
    label: config.name,
    startedAt: Date.now(),
    endsAt: Date.now() + config.buildTime * 1000,
    totalMs: config.buildTime * 1000,
    onCompleteMessage: `${config.name} foi concluída.`
  };

  addLog(`${config.name} foi inaugurada na praça do reino.`);
  renderAll();
  saveState();
}

function queueTraining(unitKey) {
  if (state.trainingQueue) {
    addLog('A praça de armas já está treinando outra unidade.');
    renderAll();
    return;
  }

  const config = militaryCatalog[unitKey];
  if (!config) {
    return;
  }

  if (!canAfford(config.cost)) {
    addLog(`Recursos insuficientes para treinar ${config.name}.`);
    showToast(`Recursos insuficientes para treinar ${config.name}.`, 'danger');
    renderAll();
    return;
  }

  popResourceCost(config.cost);

  state.trainingQueue = {
    unitKey,
    label: config.name,
    startedAt: Date.now(),
    endsAt: Date.now() + config.time * 1000,
    totalMs: config.time * 1000
  };

  addLog(`${config.name} entrou na praça de armas para treinamento.`);
  renderAll();
  saveState();
}

function advanceProduction(elapsedSeconds) {
  if (elapsedSeconds <= 0) {
    return;
  }

  const rates = getResourceRates();

  Object.keys(state.resources).forEach((resourceKey) => {
    const gain = (rates[resourceKey] || 0) * elapsedSeconds;
    state.resources[resourceKey] = (state.resources[resourceKey] || 0) + gain;
  });

  const currentCap = getPopulationCap();
  if (state.population < currentCap && (state.resources.food || 0) > 0) {
    const growthRate = 0.03 + (state.buildings.farm || 0) * 0.02;
    const growth = Math.min(currentCap - state.population, growthRate * elapsedSeconds);
    state.population += growth;
  }

  clampResources();
}

function finishQueuedConstruction() {
  if (!state.queue) {
    return;
  }

  const now = Date.now();
  if (now < state.queue.endsAt) {
    return;
  }

  const { id, label } = state.queue;
  state.buildings[id] = (state.buildings[id] || 0) + 1;
  incrementStat('buildingsCompleted');

  if (id === 'wall') {
    addLog(`A muralha se ergueu ao redor do castelo. Defesa total: ${getDefenseScore()}.`);
    showToast(`A muralha se ergueu ao redor do castelo.`, 'success');
  } else {
    addLog(`${label} foi concluída. O reino se fortalece.`);
    showToast(`${label} foi concluída.`, 'success');
  }

  state.queue = null;
}

function finishTraining() {
  if (!state.trainingQueue) {
    return;
  }

  const now = Date.now();
  if (now < state.trainingQueue.endsAt) {
    return;
  }

  const { unitKey, label } = state.trainingQueue;
  state.army[unitKey] = (state.army[unitKey] || 0) + 1;
  addLog(`${label} concluiu o treinamento e agora marcha sob seu comando.`);
  showToast(`${label} concluiu o treinamento.`, 'info');
  state.trainingQueue = null;
}

function renderWorldPanel() {
  const panel = document.getElementById('worldPanel');
  const selectedTile = getSelectedWorldTile();
  const selectedKey = tileKey(selectedTile.x, selectedTile.y);
  const terrain = terrainCatalog[selectedTile.terrain] || terrainCatalog.plains;
  const artwork = getWorldArtwork(selectedTile);
  const distance = Math.abs(selectedTile.x) + Math.abs(selectedTile.y);

  const journey = state.world.route || state.battle || state.expedition || null;
  const journeyTargetKey = journey?.targetKey || null;
  const routeTileSet = new Set();
  if (journeyTargetKey) {
    const [targetX, targetY] = journeyTargetKey.split(',').map(Number);
    getRouteLineTiles(0, 0, targetX, targetY).forEach((key) => routeTileSet.add(key));
  }

  const cells = [];
  for (let y = 4; y >= -4; y -= 1) {
    for (let x = -4; x <= 4; x += 1) {
      const key = tileKey(x, y);
      const tile = getWorldTileByKey(key);
      const tileTerrain = terrainCatalog[tile.terrain] || terrainCatalog.plains;
      const isDiscovered = Boolean(state.world.discovered[key] || key === '0,0');
      const isSelected = key === selectedKey;
      const label = isDiscovered ? (tile.name || 'Território') : 'Território desconhecido';
      const isRouteTarget = key === journeyTargetKey;
      const isOnRoute = !isRouteTarget && key !== '0,0' && routeTileSet.has(key);
      const symbol = isRouteTarget
        ? (state.battle ? '⚔' : state.expedition ? '🔎' : '🚩')
        : isDiscovered ? (tile.kind === 'capital' ? '🏰' : terrainCatalog[tile.terrain]?.symbol || '◈') : '?';

      const terrainClass = isDiscovered ? `terrain-${tile.terrain || 'plains'}` : 'terrain-hidden';
      const kindClass = isDiscovered ? `kind-${tile.kind || 'empty'}` : 'kind-hidden';
      const routeClass = isRouteTarget ? 'is-route-target' : isOnRoute ? 'is-on-route' : '';

      cells.push(`
        <button
          class="map-tile ${isDiscovered ? 'is-discovered' : 'is-hidden'} ${isSelected ? 'is-selected' : ''} ${terrainClass} ${kindClass} ${routeClass}"
          data-map-x="${x}"
          data-map-y="${y}"
          title="${label} · ${t(`terrain.${tile.terrain}`, tileTerrain.label) || t('world.terrain_fallback', 'Terreno')} · (${x}, ${y})"
          type="button"
        >${symbol}</button>
      `);
    }
  }

  const routeMessage = state.world.route
    ? tp('world.route.active', { name: state.world.route.targetName, s: Math.max(0, Math.ceil((state.world.route.endsAt - Date.now()) / 1000)) }, `Expedição a ${state.world.route.targetName} · ${Math.max(0, Math.ceil((state.world.route.endsAt - Date.now()) / 1000))}s`)
    : t('world.route.default', 'A área ao redor do castelo já foi mapeada e está pronta para novas rotas.');
  const battleMessage = state.battle
    ? tp('world.battle.active', { name: state.battle.targetName, s: Math.max(0, Math.ceil((state.battle.endsAt - Date.now()) / 1000)) }, `Batalha contra ${state.battle.targetName} · ${Math.max(0, Math.ceil((state.battle.endsAt - Date.now()) / 1000))}s`)
    : tp('world.battle.threat', { t: selectedTile.threat || 0 }, `Ameaça estimada: ${selectedTile.threat || 0}`);
  const expeditionMessage = state.expedition
    ? tp('world.expedition.active', { name: state.expedition.targetName, s: Math.max(0, Math.ceil((state.expedition.endsAt - Date.now()) / 1000)) }, `Exploração de ${state.expedition.targetName} · ${Math.max(0, Math.ceil((state.expedition.endsAt - Date.now()) / 1000))}s`)
    : selectedTile.kind === 'ruin'
      ? t('world.expedition.ruin', 'Ruínas antigas ainda guardam segredos e talvez tesouros.')
      : t('world.expedition.default', 'Território em expansão e sem descoberta ativa.');
  const travelBlocked = state.world.route || state.battle || state.expedition || selectedKey === '0,0';

  panel.innerHTML = `
    <div class="world-layout">
      <div class="map-scroll">
        <div class="map-grid">
          ${cells.join('')}
        </div>
        <div class="map-legend">
          <span class="map-legend-item"><span class="map-legend-swatch">🏰</span> ${t('map.legend.castle', 'Castelo')}</span>
          <span class="map-legend-item"><span class="map-legend-swatch">🌲</span> ${t('map.legend.forest', 'Floresta')}</span>
          <span class="map-legend-item"><span class="map-legend-swatch">◼</span> ${t('map.legend.plains', 'Planície')}</span>
          <span class="map-legend-item"><span class="map-legend-swatch">⛰</span> ${t('map.legend.hill', 'Colina')}</span>
          <span class="map-legend-item"><span class="map-legend-swatch">≈</span> ${t('map.legend.river_coast', 'Rio/Costa')}</span>
          <span class="map-legend-item"><span class="map-legend-swatch">🏔</span> ${t('map.legend.mountain', 'Montanha')}</span>
          <span class="map-legend-item"><span class="map-legend-dot kind-village"></span> ${t('map.legend.village', 'Aldeia')}</span>
          <span class="map-legend-item"><span class="map-legend-dot kind-ruin"></span> ${t('map.legend.ruin', 'Ruína')}</span>
          <span class="map-legend-item"><span class="map-legend-dot is-on-route"></span> ${t('map.legend.route', 'Rota em marcha')}</span>
        </div>
      </div>
      <div class="world-detail">
        <div class="world-card world-card-featured">
          <img class="world-artwork" src="${artwork}" alt="Paisagem de ${selectedTile.name}">
          <div class="world-card-copy">
            <div class="world-header">
              <span class="world-terrain-icon">${terrain.symbol}</span>
              <div>
                <h3>${selectedTile.name}</h3>
                <div class="building-meta">${localizeRuntimeText(selectedTile.description)}</div>
              </div>
            </div>
            <div class="world-meta-line">${tp('world.coordinates', { x: selectedTile.x, y: selectedTile.y }, `Coordenadas: ${selectedTile.x}, ${selectedTile.y}`)}</div>
            <div class="world-meta-line">${tp('world.terrain_label', { terrain: t(`terrain.${selectedTile.terrain}`, terrain.label) }, `Terreno: ${terrain.label}`)}</div>
            <div class="world-meta-line">${tp('world.distance', { d: distance }, `Distância até o castelo: ${distance}`)}</div>
            <div class="world-meta-line">${tp('world.threat', { t: selectedTile.threat || 0 }, `Força estimada do alvo: ${selectedTile.threat || 0}`)}</div>
          </div>
        </div>
        <div class="world-card">
          <div class="building-meta">${routeMessage}</div>
          <button class="world-button" data-world-action="travel" type="button" ${travelBlocked ? 'disabled' : ''}>
            ${state.world.route ? t('world.action.travel_marching', 'Expedição em marcha') : selectedKey === '0,0' ? t('world.action.castle_selected', 'Castelo selecionado') : tp('world.action.travel_to', { name: selectedTile.name }, `Viajar para ${selectedTile.name}`)}
          </button>
        </div>
        <div class="world-card">
          <div class="building-meta">${battleMessage}</div>
          <button class="world-button battle-button" data-world-action="attack" type="button" ${state.world.route || state.battle || state.expedition || selectedKey === '0,0' ? 'disabled' : ''}>
            ${state.battle ? t('world.action.battle_ongoing', 'Batalha em curso') : tp('world.action.attack', { name: selectedTile.name }, `Atacar ${selectedTile.name}`)}
          </button>
        </div>
        <div class="world-card">
          <div class="building-meta">${expeditionMessage}</div>
          <button class="world-button" data-world-action="expedition" type="button" ${state.world.route || state.battle || state.expedition || selectedKey === '0,0' ? 'disabled' : ''}>
            ${state.expedition ? t('world.action.travel_marching', 'Expedição em marcha') : tp('world.action.explore', { name: selectedTile.name }, `Explorar ${selectedTile.name}`)}
          </button>
        </div>
      </div>
    </div>
  `;

  panel.querySelectorAll('[data-map-x]').forEach((button) => {
    button.addEventListener('click', () => {
      const nextX = Number(button.dataset.mapX);
      const nextY = Number(button.dataset.mapY);
      state.world.selectedTileKey = tileKey(nextX, nextY);
      renderAll();
    });
  });

  const travelButton = panel.querySelector('[data-world-action="travel"]');
  if (travelButton) {
    travelButton.addEventListener('click', withActionGuard(() => {
      startWorldTravel(selectedTile.x, selectedTile.y);
    }));
  }

  const attackButton = panel.querySelector('[data-world-action="attack"]');
  if (attackButton) {
    attackButton.addEventListener('click', withActionGuard(() => {
      startBattle(selectedTile.x + ',' + selectedTile.y);
    }));
  }

  const expeditionButton = panel.querySelector('[data-world-action="expedition"]');
  if (expeditionButton) {
    expeditionButton.addEventListener('click', withActionGuard(() => {
      startExpedition(selectedTile.x, selectedTile.y);
    }));
  }
}

function applyOfflineProgress() {
  const now = Date.now();
  const elapsedMs = now - state.lastUpdatedAt;
  const elapsedSeconds = Math.max(0, Math.min(elapsedMs / 1000, 8 * 60 * 60));

  if (elapsedSeconds <= 5) {
    return;
  }

  advanceProduction(elapsedSeconds);
  finishQueuedConstruction();
  finishTraining();
  completeWorldTravel();
  resolveBattle();
  resolveExpedition();

  if (elapsedSeconds > 15) {
    const totalGain = Object.entries(getResourceRates()).reduce((sum, [resourceKey, rate]) => {
      const gained = (rate || 0) * elapsedSeconds;
      return sum + gained;
    }, 0);

    addLog(`Enquanto você estava fora, o reino produziu ${totalGain.toFixed(0)} unidades de recursos.`);
  }
}

function initAIKingdoms() {
  if (state.aiKingdoms) {
    return;
  }
  state.aiKingdoms = cloneState(initialAIState);
}

// Weighted random pick influenced by personality weight and noise.
function aiRoll(weight) {
  return Math.random() * 100 < weight * (0.7 + Math.random() * 0.6);
}

function tickAI() {
  initAIKingdoms();
  const now = Date.now();
  const playerStrength = getArmyStrength() + getDefenseScore();

  aiKingdomCatalog.forEach((catalog) => {
    const ai = state.aiKingdoms[catalog.id];
    if (!ai || now < ai.nextActionAt) {
      return;
    }

    const p = catalog.personality;

    // Decide action via personality weights with noise
    let action = null;

    if (aiRoll(p.aggressive) && ai.strength > 30 && playerStrength < ai.strength * 1.4) {
      action = 'raid';
    } else if (aiRoll(p.expansionist) && ai.resources > 60) {
      action = 'expand';
    } else if (aiRoll(p.economic)) {
      action = 'gather';
    } else if (aiRoll(p.diplomatic)) {
      action = 'envoy';
    }

    if (!action) {
      ai.nextActionAt = now + (30 + Math.random() * 45) * 1000;
      return;
    }

    if (action === 'raid') {
      const stolen = Math.round(Math.min(30 + Math.random() * 30, state.resources.food + state.resources.gold));
      const damage = Math.round(stolen * 0.4);
      state.resources.food = Math.max(0, state.resources.food - damage);
      state.resources.gold = Math.max(0, state.resources.gold - Math.round(damage * 0.5));
      ai.resources += stolen;
      ai.lastAction = 'raid';
      addLog(`${catalog.name} lançou uma incursão contra o reino. Recursos saqueados: ${damage}.`);
      pushReport('war', `Incursão de ${catalog.name}`, `${catalog.name} atacou o reino com força de ${ai.strength}.`, `Danos sofridos: ${damage} em recursos. Reputação mantida. Fortaleça sua defesa.`);
      showToast(`⚔ ${catalog.name} saqueou o reino!`, 'danger');
    } else if (action === 'expand') {
      ai.territory = Math.min(6, ai.territory + 1);
      ai.resources -= 40;
      ai.lastAction = 'expand';
      addLog(`${catalog.name} expandiu seu território para novas terras.`);
    } else if (action === 'gather') {
      ai.resources = Math.min(400, ai.resources + 20 + Math.round(Math.random() * 20));
      ai.strength = Math.min(120, ai.strength + Math.round(Math.random() * 5));
      ai.lastAction = 'gather';
    } else if (action === 'envoy') {
      const reputationGain = 3 + Math.round(Math.random() * 4);
      awardReputation(reputationGain, `${catalog.name} enviou um emissário com boas novas.`);
      ai.lastAction = 'envoy';
      addLog(`Um emissário de ${catalog.name} chegou ao castelo trazendo presentes.`);
    }

    // Next action in 60–120s, faster for aggressive kingdoms
    const baseDelay = p.aggressive > 60 ? 45 : 75;
    ai.nextActionAt = now + (baseDelay + Math.random() * 45) * 1000;
  });
}

function gameTick() {
  const now = Date.now();
  const elapsedSeconds = (now - state.lastUpdatedAt) / 1000;

  if (elapsedSeconds <= 0) {
    renderAll();
    return;
  }

  advanceProduction(elapsedSeconds);
  finishQueuedConstruction();
  finishTraining();
  completeWorldTravel();
  resolveBattle();
  resolveExpedition();
  triggerRandomEvent();
  triggerLivingWorldEvent();
  tickAI();
  state.lastUpdatedAt = now;
  renderAll();
  saveState();
}

function renderAll() {
  renderResources();
  renderFortressSummary();
  renderEventsCenter();
  renderOverviewSignals();
  renderOverviewCards();
  renderActivityPanel();
  renderPriorityPanel();
  renderSummary();
  renderQueue();
  renderWorldPanel();
  renderCharacterPanel();
  renderMarketPanel();
  renderExpansionPanel();
  renderMultiplayerPanel();
  renderAlliancePanel();
  renderWorldLivingPanel();
  renderEventPanel();
  renderUrgentLivingEvent();
  renderNotificationLetter();
  renderInventoryPanel();
  renderBuildings();
  renderArmyPanel();
  renderPlayerProfile();
  renderLog();

  renderReportsPanel();

  const urgentBar = document.getElementById('urgentBar');
  if (urgentBar) {
    const hasUrgent = Boolean(state.event) || Boolean(state.worldLiving?.activeEvent);
    if (hasUrgent && !notificationWasPending) {
      notificationOpen = false;
    }
    urgentBar.hidden = !hasUrgent;
    urgentBar.classList.toggle('is-open', hasUrgent && notificationOpen);
    const notificationToggle = document.getElementById('notificationToggle');
    if (notificationToggle) {
      notificationToggle.setAttribute('aria-expanded', String(notificationOpen));
      notificationToggle.setAttribute('aria-label', notificationOpen ? t('notification.open.aria', 'Fechar carta de notificações') : t('notification.closed.aria', 'Abrir carta de notificações'));
      const notificationTitle = notificationToggle.querySelector('.notification-toggle-copy strong');
      const notificationHint = notificationToggle.querySelector('.notification-toggle-copy small');
      if (notificationTitle) {
        notificationTitle.textContent = notificationOpen ? t('notification.open.title', 'Carta aberta') : t('notification.closed.title', 'Carta selada');
      }
      if (notificationHint) {
        notificationHint.textContent = notificationOpen ? t('notification.open.hint', 'Clique para fechar') : t('notification.closed.hint', 'Clique para abrir');
      }
    }
    notificationWasPending = hasUrgent;
  }

  const statusLabel = document.getElementById('realmStatusText');
  if (statusLabel) {
    statusLabel.textContent = state.queue || state.trainingQueue || state.world.route || state.battle || state.expedition ? t('status.moving', 'Reino em movimento') : t('status.order', 'Reino em ordem');
  }
}

function switchMainView(viewName) {
  document.querySelectorAll('.sidebar .side-nav .nav-item[data-view]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.view === viewName);
  });
  document.querySelectorAll('.main-column > [data-view]').forEach((section) => {
    section.classList.toggle('is-active-view', section.dataset.view === viewName);
  });
}

function switchSideView(viewName) {
  document.querySelectorAll('.side-nav-mini .nav-item[data-side-view]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.sideView === viewName);
  });
  document.querySelectorAll('.right-panel section[data-side-view]').forEach((section) => {
    section.classList.toggle('is-active-view', section.dataset.sideView === viewName);
  });
}

function initNavigation() {
  document.querySelectorAll('.sidebar .side-nav .nav-item[data-view]').forEach((button) => {
    button.addEventListener('click', () => switchMainView(button.dataset.view));
  });

  document.querySelectorAll('[data-lang-option]').forEach((button) => {
    button.addEventListener('click', () => {
      I18N.setLocale(button.dataset.langOption);
    });
  });

  document.querySelectorAll('.side-nav-mini .nav-item[data-side-view]').forEach((button) => {
    button.addEventListener('click', () => switchSideView(button.dataset.sideView));
  });

  const eventsCenterButton = document.getElementById('eventsCenterButton');
  if (eventsCenterButton) {
    eventsCenterButton.addEventListener('click', () => {
      const urgentBar = document.getElementById('urgentBar');
      if (urgentBar) {
        urgentBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  const notificationToggle = document.getElementById('notificationToggle');
  if (notificationToggle) {
    notificationToggle.addEventListener('click', withActionGuard(toggleNotificationLetter));
  }

  switchMainView('overview');
  switchSideView('log');
}

function bootstrap() {
  state = loadState();
  applyOfflineProgress();
  setCounselorMessage();
  initNavigation();
  renderAll();
  saveState();
  window.setInterval(gameTick, 1000);
  window.setInterval(setCounselorMessage, 12000);
}

let state = cloneState(initialState);
bootstrap();
