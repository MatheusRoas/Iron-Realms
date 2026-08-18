// UI rendering for panels, map, inventory, reports, and feedback surfaces.
function renderResources() {
  const resourceList = document.getElementById('resourceList');

  const resourceMarkup = Object.entries(resourceMeta).map(([resourceKey, meta]) => {
    const row = document.createElement('div');
    row.className = 'resource-card';
    const label = t(`resource.${resourceKey}`, meta.label);
    const iconMarkup = resourceArtwork[resourceKey]
      ? `<img src="${resourceArtwork[resourceKey]}" alt="${label}">`
      : meta.icon;
    row.innerHTML = `
      <div class="resource-icon">${iconMarkup}</div>
      <div class="resource-meta">
        <span class="resource-name">${label}</span>
        <span class="resource-value">${Math.floor(state.resources[resourceKey] || 0)}</span>
      </div>
      <span class="resource-name">/ ${Math.floor(getStorageCap())}</span>
    `;
    return row;
  });

  if (resourceList) {
    resourceList.innerHTML = '';
    resourceMarkup.forEach((row) => resourceList.appendChild(row));
  }
}

function renderEventsCenter() {
  const badge = document.getElementById('eventsCenterBadge');
  const button = document.getElementById('eventsCenterButton');
  if (!badge || !button) {
    return;
  }

  const pending = (state.event ? 1 : 0) + (state.worldLiving?.activeEvent ? 1 : 0);
  badge.textContent = String(pending);
  badge.hidden = pending === 0;
  button.classList.toggle('has-pending', pending > 0);
}

function computePlayerProfile() {
  const stats = state.stats || {};
  const categories = [
    { key: 'war', label: t('profile.war', 'Guerreiro'), value: (stats.battlesWon || 0) * 1.4 + (stats.battlesLost || 0) * 0.6 },
    { key: 'trade', label: t('profile.trade', 'Comerciante'), value: stats.tradesCompleted || 0 },
    { key: 'exploration', label: t('profile.exploration', 'Explorador'), value: stats.expeditionsCompleted || 0 },
    { key: 'diplomacy', label: t('profile.diplomacy', 'Diplomata'), value: stats.allianceActions || 0 },
    { key: 'builder', label: t('profile.builder', 'Construtor'), value: stats.buildingsCompleted || 0 },
    { key: 'administration', label: t('profile.administration', 'Administrador'), value: stats.eventsResolved || 0 }
  ];

  const total = categories.reduce((sum, category) => sum + category.value, 0);
  if (total <= 0) {
    return { label: t('profile.none', 'Sem tendência definida'), detail: t('profile.none.detail', 'O reino ainda não reuniu ações suficientes para revelar seu estilo.'), categories };
  }

  const sorted = [...categories].sort((a, b) => b.value - a.value);
  const top = sorted[0];
  const second = sorted[1];
  const isHybrid = second && top.value > 0 && (second.value / top.value) >= 0.75;

  return {
    label: isHybrid ? tp('profile.hybrid', { top: top.label, second: second.label }, `Híbrido: ${top.label} / ${second.label}`) : top.label,
    detail: tp('profile.detail', { percent: Math.round((top.value / total) * 100) }, `${Math.round((top.value / total) * 100)}% das ações do reino apontam para este perfil.`),
    categories: sorted
  };
}

function renderPlayerProfile() {
  const panel = document.getElementById('profilePanel');
  if (!panel) {
    return;
  }

  const profile = computePlayerProfile();

  panel.innerHTML = `
    <div class="profile-card">
      <div class="profile-header">
        <strong>${profile.label}</strong>
        <span class="profile-tag">${t('profile.tag', 'Estilo emergente')}</span>
      </div>
      <div class="building-meta">${profile.detail}</div>
      <div class="profile-metrics">
        ${profile.categories.map((category) => `<span class="character-stat">${category.label}: ${Math.round(category.value)}</span>`).join('')}
      </div>
    </div>
  `;
}

function renderOverviewSignals() {
  const container = document.getElementById('overviewSignals');
  if (!container) {
    return;
  }

  const signals = [];

  if (state.event) {
    signals.push({ label: 'Evento urgente', value: state.event.title, tone: 'warning' });
  }

  if (state.queue) {
    signals.push({ label: 'Obra ativa', value: state.queue.label, tone: 'info' });
  }

  if (state.trainingQueue) {
    signals.push({ label: 'Treinamento', value: state.trainingQueue.label, tone: 'success' });
  }

  if (state.world?.route) {
    signals.push({ label: 'Rota em curso', value: state.world.route.targetName || 'Exploração', tone: 'info' });
  }

  if (state.battle) {
    signals.push({ label: 'Batalha ativa', value: state.battle.targetName || 'Frente em conflito', tone: 'danger' });
  }

  if (state.expedition) {
    signals.push({ label: 'Expedição', value: state.expedition.targetName || 'Território em exploração', tone: 'success' });
  }

  if (!signals.length) {
    signals.push({ label: t('status.order', 'Reino em ordem'), value: t('status.stable', 'Estável e em ordem'), tone: 'success' });
  }

  container.innerHTML = signals.slice(0, 3).map((signal) => `
    <div class="signal-card ${signal.tone}">
      <span>${signal.label}</span>
      <strong>${signal.value}</strong>
    </div>
  `).join('');
}

function renderFortressSummary() {
  const fortressSummary = document.getElementById('fortressSummary');
  if (!fortressSummary) {
    return;
  }

  const wallLevel = state.buildings?.wall || 0;
  const barracksLevel = state.buildings?.barracks || 0;
  const defense = getDefenseScore();

  fortressSummary.innerHTML = `
    <div class="fortress-banner">
      <div class="fortress-badge">${t('summary.wall', 'Muralha')}</div>
      <div class="fortress-copy">
        <strong>${t('summary.castle', 'Castelo de Ferro')}</strong>
        <span>${t('summary.level_prefix', 'Nível')} ${wallLevel} · ${t('summary.defense', 'Defesa')} ${defense}</span>
      </div>
    </div>
    <div class="fortress-meta">
      <div>
        <small>${t('summary.barracks', 'Quartel')}</small>
        <strong>${barracksLevel}</strong>
      </div>
      <div>
        <small>${t('summary.guard', 'Guarda')}</small>
        <strong>${getArmyCount()}</strong>
      </div>
      <div>
        <small>${t('summary.patrol', 'Patrulha')}</small>
        <strong>${Math.max(0, Math.min(99, Math.round((state.population || 0) / 2)))}</strong>
      </div>
    </div>
  `;
}

function renderPriorityPanel() {
  const panel = document.getElementById('priorityPanel');
  if (!panel) {
    return;
  }

  const actions = [];

  if (state.event) {
    actions.push({ label: t('status.event_response', 'Responder evento'), value: localizeEvent(state.event).title, tone: 'warning' });
  }

  if (state.queue) {
    actions.push({ label: 'Concluir obra', value: state.queue.label, tone: 'info' });
  }

  if (state.trainingQueue) {
    actions.push({ label: 'Finalizar treino', value: state.trainingQueue.label, tone: 'success' });
  }

  if (state.world?.route) {
    actions.push({ label: 'Retorno de rota', value: state.world.route.targetName || 'Exploração', tone: 'info' });
  }

  if (state.battle) {
    actions.push({ label: 'Apoiar frente', value: state.battle.targetName || 'Batalha ativa', tone: 'danger' });
  }

  if (state.expedition) {
    actions.push({ label: 'Revisar expedição', value: state.expedition.targetName || 'Território explorado', tone: 'success' });
  }

  if (!actions.length) {
    actions.push({ label: t('status.order', 'Reino em ordem'), value: t('status.no_urgency', 'Sem urgências iminentes'), tone: 'success' });
  }

  panel.innerHTML = actions.slice(0, 3).map((action) => `
    <div class="priority-item ${action.tone}">
      <span>${action.label}</span>
      <strong>${action.value}</strong>
    </div>
  `).join('');
}

function renderOverviewCards() {
  const overviewCards = document.getElementById('overviewCards');
  if (!overviewCards) {
    return;
  }

  const rates = getResourceRates();
  const cards = [
    { label: t('summary.population', 'População'), value: `${Math.floor(state.population)}/${Math.floor(getPopulationCap())}`, tone: 'info' },
    { label: t('summary.force', 'Força total'), value: `${getArmyStrength()}`, tone: 'success' },
    { label: t('summary.reputation', 'Reputação'), value: `${state.reputation || 0}`, tone: 'warning' },
    { label: t('summary.production', 'Produção'), value: `${rates.food.toFixed(1)}/s`, tone: 'danger' }
  ];

  overviewCards.innerHTML = cards.map((card) => `
    <div class="overview-card ${card.tone}">
      <span class="card-label">${card.label}</span>
      <span class="card-value">${card.value}</span>
    </div>
  `).join('');
}

function getReputationTier() {
  if ((state.reputation || 0) >= 80) {
    return t('summary.legendary', 'Lendária');
  }
  if ((state.reputation || 0) >= 60) {
  return t('summary.respected', 'Respeitada');
  }
  if ((state.reputation || 0) >= 35) {
    return t('summary.stable', 'Estável');
  }
  return t('summary.modest', 'Modesta');
}

function awardReputation(delta, reason) {
  state.reputation = Math.max(0, Math.min(100, (state.reputation || 0) + delta));
  if (reason) {
    addLog(reason);
  }
}

function updateCharacterProgress(characterId, experienceGain, loyaltyGain = 0, moraleGain = 0) {
  if (!state.characters || !state.characters[characterId]) {
    return;
  }

  const character = state.characters[characterId];
  character.experience = Math.max(0, (character.experience || 0) + experienceGain);
  character.loyalty = Math.max(0, Math.min(100, (character.loyalty || 0) + loyaltyGain));
  character.morale = Math.max(0, Math.min(100, (character.morale || 0) + moraleGain));
}

function renderSummary() {
  const summaryList = document.getElementById('summaryList');
  const rates = getResourceRates();
  const levelLabel = t('summary.level_prefix', 'Nível');
  const entries = [
    { icon: '📦', label: t('summary.capacity', 'Capacidade'), value: `${Math.floor(getStorageCap())}` },
    { icon: '👥', label: t('summary.population', 'População'), value: `${Math.floor(state.population)}/${Math.floor(getPopulationCap())}` },
    { icon: '⚔', label: t('summary.army', 'Exército'), value: `${getArmyCount()}` },
    { icon: '🧱', label: t('summary.wall', 'Muralha'), value: `${levelLabel} ${state.buildings.wall || 0}` },
    { icon: '🛡', label: t('summary.defense', 'Defesa'), value: `${getDefenseScore()}` },
    { icon: '🏹', label: t('summary.barracks', 'Quartel'), value: `${levelLabel} ${state.buildings.barracks || 0}` },
    { icon: '👑', label: t('summary.reputation', 'Reputação'), value: `${state.reputation || 0} · ${getReputationTier()}` },
    { icon: '🌲', label: t('summary.wood_rate', 'Madeira/s'), value: rates.wood.toFixed(1) },
    { icon: '🪨', label: t('summary.stone_rate', 'Pedra/s'), value: rates.stone.toFixed(1) },
    { icon: '⛓', label: t('summary.iron_rate', 'Ferro/s'), value: rates.iron.toFixed(1) },
    { icon: '🌾', label: t('summary.food_rate', 'Comida/s'), value: rates.food.toFixed(1) }
  ];

  summaryList.innerHTML = entries.map((entry) => `
    <li class="summary-chip">
      <span class="summary-chip-icon" aria-hidden="true">${entry.icon}</span>
      <span class="summary-chip-copy">
        <small>${entry.label}</small>
        <strong>${entry.value}</strong>
      </span>
    </li>
  `).join('');
}

function renderActivityPanel() {
  const panel = document.getElementById('activityPanel');
  if (!panel) {
    return;
  }

  const activityItems = [];

  if (state.queue) {
    const progress = calculateQueuedProgress();
    const remainingMs = Math.max(0, state.queue.endsAt - Date.now());
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    activityItems.push({
      title: state.queue.label,
      detail: `Obra em andamento · ${remainingSeconds}s restantes`,
      tone: 'warning',
      progress
    });
  }

  if (state.trainingQueue) {
    const progress = Math.min(100, ((Date.now() - state.trainingQueue.startedAt) / state.trainingQueue.totalMs) * 100);
    const remainingMs = Math.max(0, state.trainingQueue.endsAt - Date.now());
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    activityItems.push({
      title: state.trainingQueue.label,
      detail: tp('status.training_active', { s: remainingSeconds }, `Treinamento ativo · ${remainingSeconds}s restantes`),
      tone: 'info',
      progress
    });
  }

  if (state.world?.route) {
    activityItems.push({
      title: tp('status.route_to', { name: state.world.route.targetName || t('world.terrain_fallback', 'território') }, `Rota para ${state.world.route.targetName || 'território'}`),
      detail: tp('status.travel_active', { s: Math.max(0, Math.ceil((state.world.route.endsAt - Date.now()) / 1000)) }, `Viagem em curso · ${Math.max(0, Math.ceil((state.world.route.endsAt - Date.now()) / 1000))}s`),
      tone: 'success',
      progress: Math.min(100, ((Date.now() - state.world.route.startedAt) / state.world.route.totalMs) * 100)
    });
  }

  if (state.battle) {
    activityItems.push({
      title: tp('status.battle_at', { name: state.battle.targetName || 'frente' }, `Batalha em ${state.battle.targetName || 'frente'}`),
      detail: t('status.conflict', 'Conflito ativo no reino'),
      tone: 'danger',
      progress: 55
    });
  }

  if (state.expedition) {
    activityItems.push({
      title: tp('status.expedition_at', { name: state.expedition.targetName || 'território' }, `Expedição em ${state.expedition.targetName || 'território'}`),
      detail: t('status.exploration_collecting', 'Exploração e coleta em andamento'),
      tone: 'success',
      progress: 50
    });
  }

  if (state.event) {
    activityItems.push({
      title: localizeEvent(state.event).title,
      detail: t('status.event_pending', 'Decisão do reino pendente'),
      tone: 'warning',
      progress: 80
    });
  }

  if (!activityItems.length) {
    panel.innerHTML = `<div class="empty-activity"><span>${t('status.no_activity', 'Sem atividade no momento.')}</span><strong>${t('status.calm', 'O reino está em calma e as rotas aguardam ordens.')}</strong></div>`;
    return;
  }

  panel.innerHTML = activityItems.map((item) => `
    <div class="activity-item ${item.tone}">
      <div class="activity-head">
        <strong>${item.title}</strong>
        <span>${item.detail}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${Math.max(8, Math.min(100, item.progress || 0))}%;"></div>
      </div>
    </div>
  `).join('');
}

function renderQueue() {
  const queuePanel = document.getElementById('queuePanel');

  if (!state.queue) {
    queuePanel.innerHTML = `<p class="empty-state">${t('queue.empty', 'Nenhuma obra em andamento. O reino aguarda sua decisão.')}</p>`;
    return;
  }

  const queue = state.queue;
  const progress = calculateQueuedProgress();
  const remainingMs = Math.max(0, queue.endsAt - Date.now());
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  queuePanel.innerHTML = `
    <div class="queue-card">
      <div class="queue-text">
        <strong>${queue.label}</strong>
        <span>${tp('queue.remaining', { s: remainingSeconds }, `Tempo restante: ${remainingSeconds}s`)}</span>
      </div>
      <div style="width: 180px;">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%;"></div>
        </div>
      </div>
    </div>
  `;
}

function renderBuildings() {
  const buildingList = document.getElementById('buildingList');
  buildingList.innerHTML = '';

  Object.entries(buildingCatalog).forEach(([buildingKey, config]) => {
    const card = document.createElement('div');
    card.className = 'building-card';

    const costPills = Object.entries(config.cost)
      .map(([resourceKey, amount]) => `<span class="cost-pill">${resourceMeta[resourceKey]?.icon || '◈'} ${amount}</span>`)
      .join('');

    const buttonDisabled = state.queue ? 'disabled' : '';
    const buildingName = t(`building.${buildingKey}.name`, config.name);
    const buildingDesc = t(`building.${buildingKey}.desc`, config.description);

    card.innerHTML = `
      <div>
        <div class="title-row">
          <span class="title-icon" aria-hidden="true">${config.icon || '◈'}</span>
          <h3>${buildingName}</h3>
        </div>
        <div class="building-meta">${t('summary.level_prefix', 'Nível')} ${state.buildings[buildingKey] || 0} · ${buildingDesc}</div>
        <div class="cost-list">${costPills}</div>
      </div>
      <div class="building-actions">
        <span class="building-meta">${config.buildTime}s</span>
        <button class="building-button" ${buttonDisabled} data-building-key="${buildingKey}">${t('action.build', 'Construir')}</button>
      </div>
    `;

    buildingList.appendChild(card);
  });

  buildingList.querySelectorAll('.building-button').forEach((button) => {
    button.addEventListener('click', withActionGuard(() => {
      const key = button.dataset.buildingKey;
      queueConstruction(key);
    }));
  });
}

function renderArmyPanel() {
  const armyPanel = document.getElementById('armyPanel');
  armyPanel.innerHTML = '';

  if (state.trainingQueue) {
    const queue = state.trainingQueue;
    const progress = Math.min(100, ((Date.now() - queue.startedAt) / queue.totalMs) * 100);
    const remaining = Math.max(0, Math.ceil((queue.endsAt - Date.now()) / 1000));

    const trainingCard = document.createElement('div');
    trainingCard.className = 'training-card';
    trainingCard.innerHTML = `
      <div>
        <strong>${queue.label}</strong>
        <div class="building-meta">${tp('army.training.progress', { s: remaining }, `Treinamento em andamento · ${remaining}s restantes`)}</div>
      </div>
      <div style="width: 180px;">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%;"></div>
        </div>
      </div>
    `;
    armyPanel.appendChild(trainingCard);
  }

  const hasAnyUnits = Object.values(state.army || {}).some((count) => Number(count) > 0);
  if (!state.trainingQueue && !hasAnyUnits) {
    armyPanel.innerHTML = `
      <div class="empty-state-card">
        <strong>${t('army.empty.title', 'Praça vazia')}</strong>
        <span>${t('army.empty.desc', 'Não há tropas em treinamento nem unidades prontas para a guarda do reino.')}</span>
      </div>
    `;
    return;
  }

  Object.entries(militaryCatalog).forEach(([unitKey, config]) => {
    const card = document.createElement('div');
    card.className = 'military-card';

    const costPills = Object.entries(config.cost)
      .map(([resourceKey, amount]) => `<span class="cost-pill">${resourceMeta[resourceKey]?.icon || '◈'} ${amount}</span>`)
      .join('');

    const unitName = t(`unit.${unitKey}.name`, config.name);
    const unitDesc = t(`unit.${unitKey}.desc`, config.description);

    card.innerHTML = `
      <div>
        <div class="title-row">
          <span class="title-icon unit-icon" aria-hidden="true">${config.icon}</span>
          <h3>${unitName}</h3>
        </div>
        <div class="building-meta">${unitDesc}</div>
        <div class="building-meta">${tp('army.quantity', { n: state.army[unitKey] || 0 }, `Quantidade: ${state.army[unitKey] || 0}`)}</div>
        <div class="cost-list">${costPills}</div>
      </div>
      <div class="building-actions">
        <span class="building-meta">${config.time}s</span>
        <button class="building-button" data-unit-key="${unitKey}">${t('action.train', 'Treinar')}</button>
      </div>
    `;

    armyPanel.appendChild(card);
  });

  armyPanel.querySelectorAll('[data-unit-key]').forEach((button) => {
    button.addEventListener('click', withActionGuard(() => {
      queueTraining(button.dataset.unitKey);
    }));
  });
}

function renderEventPanel() {
  const panel = document.getElementById('urgentEventPanel');
  if (!panel) {
    return;
  }

  if (!state.event) {
    panel.innerHTML = '';
    return;
  }

  const event = localizeEvent(state.event);
  const choiceButtons = event.choices.map((choice, index) => `
    <button class="event-choice" data-event-choice="${index}" type="button">${choice.label}</button>
  `).join('');

  panel.innerHTML = `
    <div class="event-card">
      <div class="event-actions">
        ${choiceButtons}
      </div>
    </div>
  `;

  panel.querySelectorAll('[data-event-choice]').forEach((button) => {
    button.addEventListener('click', withActionGuard(() => {
      resolveEvent(Number(button.dataset.eventChoice));
    }));
  });
}

function renderCharacterPanel() {
  const panel = document.getElementById('characterPanel');
  const roster = Object.values(state.characters || defaultCharacters);

  panel.innerHTML = roster.map((character) => `
    <div class="character-card">
      <div class="character-header">
        <div>
          <strong>${character.name}</strong>
          <div class="building-meta">${character.specialty}</div>
        </div>
        <span class="character-role">${character.role}</span>
      </div>
      <div class="character-metrics">
        <span class="character-stat">${t('character.stat.exp', 'Exp.')} ${character.experience}</span>
        <span class="character-stat">${t('character.stat.loyalty', 'Lealdade')} ${character.loyalty}</span>
        <span class="character-stat">${t('character.stat.morale', 'Ânimo')} ${character.morale}</span>
        <span class="character-stat">${t('character.stat.personality', 'Personalidade')} ${character.personality}</span>
      </div>
      <div class="building-meta">${character.trait}</div>
    </div>
  `).join('');
}

function executeMarketOffer(index) {
  const offer = state.economy?.offers?.[index];
  if (!offer) {
    return;
  }

  if (offer.kind === 'buy') {
    if ((state.resources.gold || 0) < offer.goldCost) {
      addLog('O mercado exige ouro suficiente antes de fechar a compra.');
      showToast('Ouro insuficiente para essa compra.', 'danger');
      renderAll();
      return;
    }

    state.resources.gold -= offer.goldCost;
    state.resources[offer.resource] = (state.resources[offer.resource] || 0) + offer.amount;
    state.economy.merchants = Math.min(10, (state.economy.merchants || 0) + 1);
    awardReputation(2, `O reino fechou uma compra no mercado: ${offer.title}.`);
    updateCharacterProgress('merchant', 3, 2, 2);
  } else {
    if ((state.resources[offer.resource] || 0) < offer.amount) {
      addLog('O reino não tem stock suficiente para vender o lote solicitado.');
      showToast('Estoque insuficiente para essa venda.', 'danger');
      renderAll();
      return;
    }

    state.resources[offer.resource] -= offer.amount;
    state.resources.gold = (state.resources.gold || 0) + offer.goldReward;
    state.economy.routes = Math.min(8, (state.economy.routes || 0) + 1);
    awardReputation(2, `O reino vendeu ${offer.amount} de ${resourceMeta[offer.resource]?.label || offer.resource} ao mercado.`);
    updateCharacterProgress('merchant', 2, 1, 1);
  }

  incrementStat('tradesCompleted');
  addLog(`${offer.title} foi concluído. O reino ajustou seus cofres e seus estoques.`);
  pushReport('trade', offer.title, offer.kind === 'buy' ? 'O reino reforçou seus estoques por meio do mercado.' : 'O reino vendeu excedentes para fortalecer o tesouro.', offer.kind === 'buy'
    ? `A compra de ${offer.amount} de ${resourceMeta[offer.resource]?.label || offer.resource} foi registrada no mercado do reino. O ouro foi gasto para garantir estabilidade e continuidade nas reservas.`
    : `A venda de ${offer.amount} de ${resourceMeta[offer.resource]?.label || offer.resource} reforçou o cofre real. A rota comercial do reino ganhou mais confiança e o tesouro voltou a girar.`);
  showToast(`${offer.title} concluído.`, 'success');
  renderAll();
  saveState();
}

function renderMarketPanel() {
  const panel = document.getElementById('marketPanel');
  const offers = state.economy?.offers || defaultMarketOffers;

  panel.innerHTML = offers.map((offer, index) => {
    const resourceLabel = t(`resource.${offer.resource}`, resourceMeta[offer.resource]?.label || offer.resource);
    const primaryText = offer.kind === 'buy'
      ? tp('market.primary.buy', { amount: offer.amount, resource: resourceLabel, gold: offer.goldCost }, `Compra ${offer.amount} de ${resourceLabel} por ${offer.goldCost} ouro`)
      : tp('market.primary.sell', { amount: offer.amount, resource: resourceLabel, gold: offer.goldReward }, `Venda ${offer.amount} de ${resourceLabel} por ${offer.goldReward} ouro`);

    return `
      <div class="market-card">
        <div class="market-header">
          <div>
            <strong>${offer.title}</strong>
            <div class="building-meta">${offer.detail}</div>
          </div>
          <span class="market-tag">${offer.kind === 'buy' ? t('market.tag.buy', 'Compra') : t('market.tag.sell', 'Venda')}</span>
        </div>
        <div class="building-meta">${primaryText}</div>
        <div class="market-actions">
          <button class="market-button" type="button" data-market-offer="${index}">${t('market.action.confirm', 'Confirmar')}</button>
        </div>
      </div>
    `;
  }).join('');

  panel.querySelectorAll('[data-market-offer]').forEach((button) => {
    button.addEventListener('click', withActionGuard(() => {
      executeMarketOffer(Number(button.dataset.marketOffer));
    }));
  });
}

function foundSettlement() {
  const selectedTile = getSelectedWorldTile();
  const key = tileKey(selectedTile.x, selectedTile.y);

  if (!selectedTile || selectedTile.kind === 'capital' || key === '0,0') {
    addLog('O castelo já é a base central do reino. Escolha uma região externa para expandir.');
    renderAll();
    return;
  }

  const exists = (state.expansion?.settlements || []).some((settlement) => settlement.id === key || settlement.name === selectedTile.name);
  if (exists) {
    addLog(`${selectedTile.name} já faz parte do território do reino.`);
    renderAll();
    return;
  }

  const specialty = selectedTile.terrain === 'forest'
    ? 'Madeira'
    : selectedTile.terrain === 'coast'
      ? 'Comércio'
      : selectedTile.terrain === 'hill'
        ? 'Pedra'
        : 'Produção';

  state.expansion.settlements.push({
    id: key,
    name: selectedTile.name,
    specialty,
    loyalty: 72
  });
  state.expansion.territory += 1;
  state.world.discovered[key] = true;
  awardReputation(5, `O reino consolidou ${selectedTile.name} como nova extensão de seu território.`);
  updateCharacterProgress('scout', 4, 3, 2);
  incrementStat('settlementsFounded');
  addLog(`Uma nova aldeia foi fundada em ${selectedTile.name}.`);
  showToast(`Nova aldeia fundada em ${selectedTile.name}.`, 'success');
  renderAll();
  saveState();
}

function renderExpansionPanel() {
  const panel = document.getElementById('expansionPanel');
  const selectedTile = getSelectedWorldTile();
  const settlements = state.expansion?.settlements || defaultExpansionSettlements;

  panel.innerHTML = `
    <div class="expansion-card">
      <div class="expansion-header">
        <div>
          <strong>${t('expansion.title', 'Fronteiras do reino')}</strong>
          <div class="building-meta">${tp('expansion.territory', { n: state.expansion?.territory || 0 }, `Território sob tutela: ${state.expansion?.territory || 0}`)}</div>
        </div>
        <span class="expansion-tag">${tp('expansion.tag', { n: state.expansion?.territory || 0 }, `${state.expansion?.territory || 0} aldeias`)}</span>
      </div>
      <div class="character-metrics">
        ${settlements.map((settlement) => `<span class="character-stat">${settlement.name} · ${settlement.specialty}</span>`).join('')}
      </div>
      <div class="expansion-actions">
        <button class="expansion-button" type="button" data-found-settlement="${selectedTile.name}">${t('expansion.action.found', 'Fundar aldeia')}</button>
      </div>
    </div>
  `;

  const button = panel.querySelector('[data-found-settlement]');
  if (button) {
    button.addEventListener('click', withActionGuard(foundSettlement));
  }
}

function connectRealmNetwork() {
  state.multiplayer.connected = true;
  state.multiplayer.sync = Math.min(100, (state.multiplayer.sync || 0) + 12);
  state.multiplayer.latency = Math.max(12, (state.multiplayer.latency || 0) - 8);
  awardReputation(3, 'O reino abriu a rede interna de conselhos e sincronizou os canais de comando.');
  updateCharacterProgress('envoy', 2, 2, 2);
  addLog('A rede do reino foi ativada e agora a corte se comunica em tempo real.');
  renderAll();
  saveState();
}

function sendAllianceSupport() {
  const ally = state.alliance?.members?.[0];
  if (!ally) {
    return;
  }

  const foodGain = 20;
  const woodGain = 18;
  const goldGain = 12;

  state.resources.food = (state.resources.food || 0) + foodGain;
  state.resources.wood = (state.resources.wood || 0) + woodGain;
  state.resources.gold = (state.resources.gold || 0) + goldGain;
  state.alliance.morale = Math.min(100, (state.alliance.morale || 0) + 5);
  awardReputation(2, `${ally.name} respondeu com ajuda prática ao reino.`);
  updateCharacterProgress('merchant', 2, 2, 2);
  incrementStat('allianceActions');
  addLog(`${ally.name} enviou reforços: comida, madeira e ouro para sustentar a fronteira.`);
  showToast(`${ally.name} enviou reforços ao reino.`, 'success');
  renderAll();
  saveState();
}

function requestAllianceAid() {
  if ((state.resources.gold || 0) < 8) {
    addLog('O reino não tem ouro suficiente para convocar apoio diplomático imediato.');
    showToast('Ouro insuficiente para convocar apoio.', 'danger');
    renderAll();
    return;
  }

  state.resources.gold -= 8;
  state.resources.food = (state.resources.food || 0) + 26;
  state.resources.stone = (state.resources.stone || 0) + 18;
  state.alliance.influence = Math.min(12, (state.alliance.influence || 0) + 1);
  state.alliance.morale = Math.min(100, (state.alliance.morale || 0) + 8);
  awardReputation(3, 'A aliança respondeu ao pedido de apoio com carga e proteção de rota.');
  updateCharacterProgress('envoy', 3, 3, 3);
  incrementStat('allianceActions');
  addLog('Uma coalizão de aliados respondeu à convocação e reforçou os estoques do reino.');
  showToast('A aliança respondeu ao pedido de apoio.', 'success');
  renderAll();
  saveState();
}

function renderMultiplayerPanel() {
  const panel = document.getElementById('multiplayerPanel');
  const multiplayer = state.multiplayer || defaultMultiplayerRealm;

  panel.innerHTML = `
    <div class="multiplayer-card">
      <div class="multiplayer-header">
        <div>
          <strong>${multiplayer.realmName}</strong>
          <div class="building-meta">${tp('multiplayer.sync', { s: multiplayer.sync, l: multiplayer.latency }, `Sincronização: ${multiplayer.sync}% · Latência: ${multiplayer.latency}ms`)}</div>
        </div>
        <span class="multiplayer-tag">${multiplayer.connected ? t('multiplayer.tag.online', 'Online') : t('multiplayer.tag.local', 'Local')}</span>
      </div>
      <div class="character-metrics">
        ${multiplayer.channels.map((channel) => `<span class="character-stat">${channel}</span>`).join('')}
      </div>
      <div class="multiplayer-actions">
        <button class="multiplayer-button" type="button" data-connect-realm="true">
          ${multiplayer.connected ? t('multiplayer.action.refresh', 'Reatualizar rede') : t('multiplayer.action.connect', 'Conectar reino')}
        </button>
      </div>
    </div>
  `;

  const button = panel.querySelector('[data-connect-realm]');
  if (button) {
    button.addEventListener('click', withActionGuard(connectRealmNetwork));
  }
}

function renderAlliancePanel() {
  const panel = document.getElementById('alliancePanel');
  const alliance = state.alliance || { pact: 'Pacto da Fronteira', morale: 76, influence: 3, members: cloneState(defaultAllianceMembers) };

  panel.innerHTML = `
    <div class="alliance-card">
      <div class="alliance-header">
        <div>
          <strong>${alliance.pact}</strong>
          <div class="building-meta">${tp('alliance.morale', { m: alliance.morale, i: alliance.influence }, `Moral da federação: ${alliance.morale}% · Influência: ${alliance.influence}`)}</div>
        </div>
        <span class="alliance-tag">${tp('alliance.tag', { n: alliance.members.length }, `${alliance.members.length} pactos`)}</span>
      </div>
      <div class="character-metrics">
        ${alliance.members.map((member) => `<span class="character-stat">${member.name} · ${member.role}</span>`).join('')}
      </div>
      <div class="alliance-actions">
        <button class="alliance-button" type="button" data-alliance-action="support">${t('alliance.action.support', 'Enviar reforço')}</button>
        <button class="alliance-button" type="button" data-alliance-action="aid">${t('alliance.action.aid', 'Pedir auxílio')}</button>
      </div>
    </div>
  `;

  const supportButton = panel.querySelector('[data-alliance-action="support"]');
  if (supportButton) {
    supportButton.addEventListener('click', withActionGuard(sendAllianceSupport));
  }

  const aidButton = panel.querySelector('[data-alliance-action="aid"]');
  if (aidButton) {
    aidButton.addEventListener('click', withActionGuard(requestAllianceAid));
  }
}

function triggerLivingWorldEvent() {
  if (state.worldLiving?.activeEvent) {
    return;
  }

  const now = Date.now();
  if (now < (state.worldLiving.nextEventEarliestAt || 0)) {
    return;
  }

  if (Math.random() > 0.01) {
    return;
  }

  const templates = [
    {
      id: 'invasion',
      title: 'Invasão de batedores',
      description: 'Grupo de invasores cruzou o norte em busca de rota e saque.',
      effect: { gold: -18, food: -12, wood: -16 },
      choices: [
        { label: 'Reforçar a fronteira', effect: { gold: -20, food: -10 }, reputation: 7, message: 'As patrulhas impediram a incursão e a linha foi reforçada.' },
        { label: 'Negociar descanso', effect: { gold: -16 }, reputation: -3, message: 'Os invasores aceitaram um pagamento temporário e recuaram da rota, mas o reino cedeu.' }
      ]
    },
    {
      id: 'weather',
      title: 'Clima severo',
      description: 'Tempestades de inverno vieram do ocidente e ameaçam os campos do reino.',
      effect: { food: -18, stone: -10 },
      choices: [
        { label: 'Preparar celeiros', effect: { food: -16, gold: -8 }, reputation: 6, message: 'Os armazéns foram protegidos e a colheita saiu intacta.' },
        { label: 'Movimentar a guarda', effect: { gold: -22 }, reputation: 4, message: 'A guarda apoiou os trabalhadores e as estradas foram mantidas abertas.' }
      ]
    },
    {
      id: 'caravan',
      title: 'Caravana do sul',
      description: 'Uma rota comercial segura passou por território próximo, trazendo pedidos e rumores.',
      effect: { gold: 24, food: 12 },
      choices: [
        { label: 'Abrir os portos', effect: { gold: 26, food: 12 }, reputation: 5, message: 'O comércio cresceu e os portos ficaram lotados de mercadores.' },
        { label: 'Reaproveitar a rota', effect: { wood: 22, stone: 18 }, reputation: 2, message: 'A rota foi convertida em um ponto de abastecimento e logística.' }
      ]
    },
    {
      id: 'ruin',
      title: 'Ruína acordada',
      description: 'Uma antiga estrutura das fronteiras começou a revelar sinais de presença oculta.',
      effect: { gold: 20 },
      choices: [
        { label: 'Explorar a ruína', effect: { gold: 34, stone: 18 }, reputation: 6, message: 'Os exploradores acharam tesouros antigos e o reino ganhou prestígio.' },
        { label: 'Cobrir o acesso', effect: { gold: -8 }, reputation: 1, message: 'A entrada foi selada para preservar a segurança e os segredos da região.' }
      ]
    },
    {
      id: 'livestock-plague',
      title: 'Peste no gado',
      description: 'Um mal misterioso atinge os rebanhos da fronteira, ameaçando o abastecimento de carne e couro.',
      effect: { food: -20 },
      choices: [
        { label: 'Abater e queimar os animais doentes', effect: { food: -20, gold: -10 }, reputation: 5, message: 'A dor foi contida antes que se espalhasse pelo resto do gado.' },
        { label: 'Vender os animais doentes escondidos no mercado', effect: { gold: 24 }, reputation: -20, message: 'O lucro veio rápido, mas quem comer aquela carne não saberá o que arriscou.' }
      ]
    },
    {
      id: 'comet-omen',
      title: 'Cometa no céu',
      description: 'Um cometa cruza o céu por três noites seguidas. O povo sussurra sobre maldições e sinais divinos.',
      effect: {},
      choices: [
        { label: 'Acalmar o povo com a verdade', effect: { gold: -6 }, reputation: 10, message: 'Os conselheiros explicaram o fenômeno e o medo deu lugar à curiosidade.' },
        { label: 'Usar o medo para exigir mais tributos', effect: { gold: 30 }, reputation: -24, message: 'O povo pagou em silêncio, mas o silêncio guarda ressentimento.' }
      ]
    },
    {
      id: 'foreign-merchant',
      title: 'Mercador estrangeiro suspeito',
      description: 'Um mercador de terras distantes pede audiência, mas seus mapas e perguntas levantam suspeita de espionagem.',
      effect: {},
      choices: [
        { label: 'Recebê-lo com cautela e vigilância', effect: { gold: 18 }, reputation: 6, message: 'O comércio se manteve e nenhum segredo do reino escapou pelas portas.' },
        { label: 'Prendê-lo e confiscar seus bens sem provas', effect: { gold: 34 }, reputation: -22, message: 'O ouro dele agora é do reino, mas a notícia viajará mais longe do que ele jamais viajaria.' }
      ]
    }
  ];

  const template = templates[Math.floor(Math.random() * templates.length)];
  state.worldLiving.activeEvent = {
    ...cloneState(template),
    choices: template.choices.map((choice) => ({ ...choice }))
  };
  state.worldLiving.crises = [template.title];
  state.worldLiving.nextEventEarliestAt = now + 720000;
  addLog(`O mundo vivo reagiu: ${template.title}.`);
  renderAll();
  saveState();
}

function resolveLivingWorldEvent(choiceIndex) {
  if (!state.worldLiving?.activeEvent) {
    return;
  }

  const choice = state.worldLiving.activeEvent.choices[choiceIndex];
  if (!choice) {
    return;
  }

  const eventEffect = getEventEffect(choice.effect);
  Object.entries(eventEffect).forEach(([resourceKey, amount]) => {
    if (['food', 'gold', 'wood', 'stone', 'iron'].includes(resourceKey)) {
      state.resources[resourceKey] = (state.resources[resourceKey] || 0) + amount;
    }
  });

  clampResources();
  const reputationDelta = typeof choice.reputation === 'number' ? choice.reputation : 4;
  const eventTitle = state.worldLiving.activeEvent.title;
  awardReputation(reputationDelta, `O reino respondeu ao evento do mundo vivo: ${eventTitle}.`);
  incrementStat('eventsResolved');
  addLog(choice.message || 'O reino se adaptou ao pulso do mundo vivo.');
  const livingDelta = formatResourceDelta(eventEffect);
  pushReport('events', eventTitle, choice.message || 'O reino respondeu a um sinal do mundo vivo.', `Decisão tomada: "${choice.label}". ${choice.message || ''} Efeito nos recursos: ${livingDelta || 'nenhum'}. Reputação: ${reputationDelta >= 0 ? '+' : ''}${reputationDelta}.`);
  showToast(livingDelta ? `${choice.message || 'O reino se adaptou.'} (${livingDelta})` : (choice.message || 'O reino se adaptou.'), 'info');
  state.worldLiving.activeEvent = null;
  state.worldLiving.climate = ['Estável', 'Calmo', 'Tempestuoso', 'Vigoroso'][Math.floor(Math.random() * 4)];
  state.worldLiving.invasionRisk = Math.max(8, Math.min(95, (state.worldLiving.invasionRisk || 18) + (Math.random() > 0.5 ? 8 : -7)));
  state.worldLiving.caravanTraffic = Math.max(1, Math.min(8, (state.worldLiving.caravanTraffic || 2) + (Math.random() > 0.5 ? 1 : -1)));
  renderAll();
  saveState();
}

function renderWorldLivingPanel() {
  const panel = document.getElementById('worldLivingPanel');
  const living = state.worldLiving || cloneState(defaultWorldLiving);

  panel.innerHTML = `
    <div class="world-living-card">
      <div class="world-living-header">
        <div>
          <strong>Pulso do mundo</strong>
          <div class="building-meta">Clima: ${living.climate} · Risco de invasão: ${living.invasionRisk}%</div>
        </div>
        <span class="world-living-tag">${living.caravanTraffic} rotas</span>
      </div>
      <div class="character-metrics">
        <span class="character-stat">Caravanas: ${living.caravanTraffic}</span>
        <span class="character-stat">Crise: ${living.crises[0]}</span>
        <span class="character-stat">Ruínas: ${living.ruinedSites[0]}</span>
      </div>
    </div>
  `;
}

function renderUrgentLivingEvent() {
  const panel = document.getElementById('urgentLivingEventPanel');
  if (!panel) {
    return;
  }

  const living = state.worldLiving;
  if (!living?.activeEvent || state.event) {
    panel.innerHTML = '';
    return;
  }

  const event = localizeEvent(living.activeEvent);
  panel.innerHTML = `
    <div class="world-living-card">
      <div class="alliance-actions">
        ${event.choices.map((choice, index) => `
          <button class="alliance-button" type="button" data-living-choice="${index}">${choice.label}</button>
        `).join('')}
      </div>
    </div>
  `;

  panel.querySelectorAll('[data-living-choice]').forEach((button) => {
    button.addEventListener('click', withActionGuard(() => resolveLivingWorldEvent(Number(button.dataset.livingChoice))));
  });
}

function normalizeInventoryItem(item, index = 0) {
  const fallback = defaultInventoryItems[index % defaultInventoryItems.length] || defaultInventoryItems[0];
  const raw = item && typeof item === 'object' ? item : {};
  const amountValue = Number(raw.amount ?? raw.quantity ?? raw.count ?? fallback.amount ?? 1);

  return {
    ...(fallback || {}),
    ...raw,
    id: raw.id || raw.key || fallback.id || `item-${index}`,
    name: raw.name || fallback.name || 'Item do reino',
    kind: raw.kind || raw.type || fallback.kind || 'Item',
    quality: raw.quality || raw.rarity || fallback.quality || 'Comum',
    icon: raw.icon || fallback.icon || '📦',
    amount: Number.isFinite(amountValue) ? Math.max(0, amountValue) : Math.max(0, Number(fallback.amount || 1)),
    consumable: Boolean(raw.consumable ?? raw.usable ?? fallback.consumable ?? false),
    effect: raw.effect || fallback.effect || {}
  };
}

function ensureInventoryState() {
  if (!Array.isArray(state.inventory)) {
    state.inventory = cloneState(defaultInventoryItems);
    return;
  }

  state.inventory = state.inventory.map((item, index) => normalizeInventoryItem(item, index));
}

function awardInventoryItem(itemId, amount = 1) {
  ensureInventoryState();

  const existing = state.inventory.find((item) => item.id === itemId);
  if (existing) {
    existing.amount = (existing.amount || 0) + Math.max(1, amount);
    return existing;
  }

  const baseItem = defaultInventoryItems.find((item) => item.id === itemId) || {
    id: itemId,
    name: itemId,
    kind: 'Item',
    quality: 'Comum',
    icon: '📦',
    amount: 0,
    consumable: true,
    effect: {}
  };

  const newItem = { ...baseItem, amount: Math.max(1, amount) };
  state.inventory.push(newItem);
  return newItem;
}

function consumeInventoryItem(itemId) {
  ensureInventoryState();

  const item = state.inventory.find((entry) => entry.id === itemId);
  if (!item || !item.consumable || (item.amount || 0) <= 0) {
    return false;
  }

  const effect = item.effect || {};
  Object.entries(effect).forEach(([resourceKey, amount]) => {
    if (['food', 'gold', 'wood', 'stone', 'iron'].includes(resourceKey)) {
      state.resources[resourceKey] = (state.resources[resourceKey] || 0) + amount;
    }
  });

  item.amount -= 1;
  if (item.amount <= 0) {
    state.inventory = state.inventory.filter((entry) => entry.id !== itemId);
  }

  addLog(`${item.name} foi consumido e reforçou os estoques do reino.`);
  clampResources();
  renderAll();
  saveState();
  return true;
}

function renderInventoryPanel() {
  const panel = document.getElementById('inventoryPanel');
  if (!panel) {
    return;
  }

  ensureInventoryState();
  const items = Array.isArray(state.inventory) ? state.inventory : [];

  if (!items.length) {
    panel.innerHTML = `
      <div class="empty-state-card">
        <strong>${t('inventory.empty.title', 'Baú vazio')}</strong>
        <span>${t('inventory.empty.desc', 'O reino ainda não guardou itens de rotina, recompensas ou suprimentos em estoque.')}</span>
      </div>
    `;
    return;
  }

  panel.innerHTML = `
    <div class="inventory-grid">
      ${items.map((item) => {
        const normalized = normalizeInventoryItem(item, 0);
        return `
          <article class="inventory-card">
            <div class="inventory-swatch" aria-hidden="true">${normalized.icon}</div>
            <div class="inventory-copy">
              <div class="inventory-head">
                <strong>${normalized.name}</strong>
                <span class="inventory-quality">${normalized.quality}</span>
              </div>
              <div class="building-meta">${normalized.kind}</div>
              <div class="inventory-amount">${tp('inventory.qty', { n: normalized.amount }, `Qtd. ${normalized.amount}`)}</div>
              ${normalized.consumable ? '<button class="inventory-button" type="button" data-inventory-use="' + normalized.id + '">' + t('inventory.action.use', 'Usar') + '</button>' : '<span class="inventory-locked">' + t('inventory.equipped', 'Equipado') + '</span>'}
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;

  panel.querySelectorAll('[data-inventory-use]').forEach((button) => {
    button.addEventListener('click', withActionGuard(() => {
      consumeInventoryItem(button.dataset.inventoryUse);
    }));
  });
}

function renderLog() {
  const eventLog = document.getElementById('eventLog');
  eventLog.innerHTML = '';

  state.log.forEach((entry) => {
    const item = document.createElement('li');
    item.textContent = localizeRuntimeText(entry);
    eventLog.appendChild(item);
  });
}

const reportCategoryLabels = {
  battle: 'Batalha',
  exploration: 'Exploração',
  trade: 'Comércio',
  events: 'Eventos',
  administration: 'Administração'
};

const reportCategoryKeys = {
  battle: 'report.category.battle',
  exploration: 'report.category.exploration',
  trade: 'report.category.trade',
  events: 'report.category.events',
  administration: 'report.category.administration'
};

let activeReportFilter = 'all';

function filterReports(category) {
  activeReportFilter = category;
  renderReportsPanel();
}

function renderReportsPanel() {
  const panel = document.getElementById('reportPanel');
  const filtersPanel = document.getElementById('reportFilters');
  const countLabel = document.getElementById('reportCount');
  if (!panel) {
    return;
  }

  const allReports = Array.isArray(state.reports) ? state.reports : [];

  if (countLabel) {
    const countWord = t(allReports.length === 1 ? 'report.count.singular' : 'report.count.plural', allReports.length === 1 ? 'registro' : 'registros');
    countLabel.textContent = `${allReports.length} ${countWord}`;
  }

  if (filtersPanel) {
    const categoriesPresent = ['all', ...Object.keys(reportCategoryLabels)];
    filtersPanel.innerHTML = categoriesPresent.map((category) => {
      const label = category === 'all' ? t('report.category.all', 'Todos') : t(reportCategoryKeys[category], reportCategoryLabels[category]);
      const count = category === 'all' ? allReports.length : allReports.filter((report) => report.category === category).length;
      const isActive = activeReportFilter === category;
      return `<button class="report-filter ${isActive ? 'is-active' : ''}" type="button" data-report-filter="${category}">${label} (${count})</button>`;
    }).join('');

    filtersPanel.querySelectorAll('[data-report-filter]').forEach((button) => {
      button.addEventListener('click', () => filterReports(button.dataset.reportFilter));
    });
  }

  const reports = activeReportFilter === 'all' ? allReports : allReports.filter((report) => report.category === activeReportFilter);

  if (reports.length === 0) {
    panel.innerHTML = `<div class="event-card empty-event">${t('report.empty', 'Nenhum relatório registrado nesta categoria ainda.')}</div>`;
    return;
  }

  panel.innerHTML = reports.map((report) => {
    const categoryLabel = t(reportCategoryKeys[report.category], reportCategoryLabels[report.category] || 'Administração');

    const timestamp = new Date(report.timestamp || Date.now()).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <article class="report-card">
        <div class="report-head">
          <span class="report-badge ${report.category}">${categoryLabel}</span>
          <time>${timestamp}</time>
        </div>
        <h3>${localizeRuntimeText(report.title)}</h3>
        <p>${localizeRuntimeText(report.summary)}</p>
        <button class="report-toggle" type="button" data-report-toggle="${report.id}" aria-expanded="false">${t('report.details.toggle', 'Ver detalhes')}</button>
        <div class="report-details" hidden>${localizeRuntimeText(report.details)}</div>
      </article>
    `;
  }).join('');

  panel.querySelectorAll('[data-report-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const details = button.parentElement.querySelector('.report-details');
      const isOpen = !details.hidden;
      details.hidden = isOpen;
      button.textContent = isOpen ? t('report.details.toggle', 'Ver detalhes') : t('report.details.hide', 'Ocultar detalhes');
      button.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}
