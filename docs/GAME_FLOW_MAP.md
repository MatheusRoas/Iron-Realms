# Iron Realms — Mapa real do fluxo do jogo

Este documento registra o fluxo funcional real do jogo a partir da análise do código e da validação em navegador local. Ele descreve o caminho que a aplicação usa em produção, e não o estado aspiracional listado em `PROGRESS.txt`.

## 1. Inicialização

A execução começa em `bootstrap()` em `src/game-actions.js`:

1. `state = loadState();`
2. `applyOfflineProgress();`
3. `setCounselorMessage();`
4. `renderAll();`
5. `saveState();`
6. `window.setInterval(gameTick, 1000);`
7. `window.setInterval(setCounselorMessage, 12000);`

A persistência é feita em `localStorage` com a chave `iron-realms-save-v1`.

## 2. Estado padrão e dados iniciais

Na carga inicial, o jogo usa:

- `initialState`
- `defaultWorldTiles`
- `defaultCharacters`
- `defaultMarketOffers`
- `defaultInventoryItems`
- `defaultAllianceMembers`
- `defaultWorldLiving`

O mapa parte com o castelo em `0,0`, algumas aldeias e ruínas ao redor, recursos iniciais e população/base de produção já configurados.

## 3. Loop principal do jogo

O loop principal é `gameTick()`.

A cada segundo ele executa:

- `advanceProduction(elapsedSeconds)`
- `finishQueuedConstruction()`
- `finishTraining()`
- `completeWorldTravel()`
- `resolveBattle()`
- `resolveExpedition()`
- `triggerRandomEvent()`
- `triggerLivingWorldEvent()`
- atualiza `state.lastUpdatedAt`
- chama `renderAll()`
- salva no `localStorage`

Isso significa que o jogo não é apenas visual: o estado de recursos, filas, batalhas, expedições e eventos é atualizado em tempo real no cliente.

## 4. Fluxo de produção e filas

### Construções

O fluxo de construção começa em `queueConstruction(buildingKey)`:

1. valida se já existe uma fila de construção;
2. valida custo do edifício com `canAfford()`;
3. remove recursos com `popResourceCost()`;
4. cria `state.queue` com `startedAt`, `endsAt`, `totalMs` e `label`;
5. renderiza tudo;
6. salva.

A conclusão ocorre em `finishQueuedConstruction()` quando o tempo termina. Esse trecho aumenta o nível do prédio e dispara a mensagem de conclusão.

### Treinamento

O fluxo de treinamento é similar:

- `queueTraining(unitKey)`
- valida recursos e fila militar
- cria `state.trainingQueue`
- `finishTraining()` completa a unidade quando o cronômetro acaba

## 5. Fluxo de mapa e exploração

A tela de mapa é montada por `renderWorldPanel()`.

Itens importantes do fluxo real:

- usa coordenadas x/y e a chave `tileKey(x, y)`
- seleciona terreno por `state.world.selectedTileKey`
- o castelo fica em `0,0`
- tiles desconhecidas aparecem como `?`
- clique em uma tile atualiza `selectedTileKey` e redesenha a tela

Ações disponíveis no painel do mapa:

- `startWorldTravel(targetX, targetY)`
- `startBattle(targetKey)`
- `startExpedition(targetX, targetY)`

Essas ações ficam bloqueadas quando há outra ação ativa ou quando a tile escolhida é o castelo.

### Viagem mundial

`startWorldTravel()` cria `state.world.route` com:

- alvo
- `startedAt`
- `endsAt`
- `totalMs`

Quando termina, `completeWorldTravel()` limpa a rota e registra o retorno da expedição.

### Batalha

`startBattle()` cria `state.battle` com:

- alvo
- força de ataque
- defesa esperada do alvo
- tempo de travessia

`resolveBattle()` executa o cálculo de vitória/derrota, remove tropas, ajusta recursos e reporta o resultado.

### Expedição

`startExpedition()` cria `state.expedition` e atribui recompensa do tile.

`resolveExpedition()` aplica os ganhos quando o tempo expira e entrega itens de inventário especiais em ruínas.

## 6. Fluxo de eventos

Existem dois motores de eventos principais:

- `triggerRandomEvent()`
- `triggerLivingWorldEvent()`

Os eventos aleatórios entram em `state.event` e exigem escolha do jogador via `resolveEvent(choiceIndex)`.

O mundo vivo usa `state.worldLiving.activeEvent`, com opções e efeitos em recursos.

O fluxo real é:

1. evento é criado;
2. renderiza o painel de evento;
3. o jogador escolhe uma ação;
4. `resolveEvent()` ou `resolveLivingWorldEvent()` aplica efeitos;
5. reputação, log e relatório são atualizados;
6. estado é salvo.

## 7. Fluxo econômico e diplomático

### Mercado

`renderMarketPanel()` monta as ofertas e `executeMarketOffer(index)` aplica compra/venda.

- compra: reduz ouro e aumenta recurso
- venda: reduz recurso e aumenta ouro
- reputação e progresso dos personagens são atualizados
- relatório é adicionado

### Expansão

`foundSettlement()` cria uma nova aldeia quando a tile selecionada não é o castelo e ainda não faz parte do território.

### Multiplayer / alianças / mundo vivo

Há telas e interações implementadas para:

- conectar reino
- enviar reforço
- pedir auxílio
- eventos globais

A lógica usa estado em cliente e atualiza recursos, reputação e relatórios, mas não há backend real de autenticação, sincronização ou rede externa. O que existe é um simulador local de rede/diplomacia.

## 8. Fluxo de inventário

O inventário usa `state.inventory`.

Funções relevantes:

- `ensureInventoryState()`
- `awardInventoryItem()`
- `consumeInventoryItem()`
- `renderInventoryPanel()`

Itens consumíveis aplicam efeitos em recursos ao usar, e a lógica salva o estado imediatamente.

## 9. Relatórios e log

Ao longo do jogo, o código usa:

- `addLog(...)` para o painel de registro
- `pushReport(...)` para o painel de relatórios

O painel de relatórios contém categorias como:

- `administration`
- `battle`
- `exploration`
- `trade`
- `events`

## 10. Conclusão do fluxo

O fluxo real do jogo é um loop de estratégia persistente em cliente, com:

- recursos e produção
- construções e treinamento
- mapa com expedições e batalhas
- eventos narrativos
- economia e diplomacia
- inventário
- relatórios e persistência local

Esse fluxo é funcional no cliente e é consistente com a interface renderizada em navegador.

## 11. Observação crítica de mapear o fluxo real

O mapa acima representa o que realmente existe no código, não necessariamente o que o arquivo `PROGRESS.txt` descreve como "finalizado". A documentação formal do projeto e a implementação real precisam ser lidas em conjunto para evitar falsas conclusões sobre readiness ou completude.

## 12. Fluxo de feedback e central de acontecimentos (adicionado 2026-08-15)

- `showToast(message, type)` exibe uma notificação temporária (3s) no canto inferior direito. Agora é chamada a partir de: `finishQueuedConstruction`, `finishTraining`, `resolveBattle`, `resolveExpedition`, `completeWorldTravel`, `resolveEvent`, `resolveLivingWorldEvent`, `executeMarketOffer`, `foundSettlement`, `sendAllianceSupport`, `requestAllianceAid`, além dos caminhos de erro (recursos insuficientes) em `queueConstruction`, `queueTraining`, `executeMarketOffer`, `requestAllianceAid` e `startBattle`.
- `formatResourceDelta(effect)` converte um objeto de efeito de recursos (`{ wood: 30, gold: -10 }`) em texto legível (`+30 wood -10 gold`) para uso dentro do toast.
- `renderEventsCenter()` atualiza o botão `#eventsCenterButton` e o badge `#eventsCenterBadge` com a soma de `state.event` (evento do reino) + `state.worldLiving.activeEvent` (evento do mundo vivo) pendentes. Clique rola a tela até o painel de ações prioritárias.
- `pushReport('exploration', ...)` foi adicionado ao final de `resolveExpedition()`, fechando a lacuna onde expedições nunca geravam relatório.

## 13. Fluxo de métricas de estilo e perfil do reino (adicionado 2026-08-15)

- `state.stats` guarda contadores reais: `battlesWon`, `battlesLost`, `tradesCompleted`, `expeditionsCompleted`, `eventsResolved`, `settlementsFounded`, `allianceActions`, `buildingsCompleted`. Persistidos no save e migrados de forma segura em `loadState()` (valores ausentes viram 0).
- `incrementStat(key, amount)` é chamado a partir de cada função de resolução de ação real do jogo (nunca de forma simulada).
- `computePlayerProfile()` calcula pesos por categoria (`Guerreiro`, `Comerciante`, `Explorador`, `Diplomata`, `Construtor`, `Administrador`) a partir dos contadores reais e retorna a categoria dominante ou um rótulo híbrido quando duas categorias estão próximas (≥75% uma da outra).
- `renderPlayerProfile()` preenche o painel `#profilePanel` ("Perfil do reino") com o rótulo, o percentual da tendência dominante e a lista de contadores brutos.

## 14. Bug corrigido: catálogo de mercado vazio em saves corrompidos (2026-08-15)

`loadState()` aceitava `economy.offers: []` como válido, nunca restaurando o catálogo padrão (`defaultMarketOffers`). Corrigido para exigir `length > 0` antes de aceitar o array salvo. Sem essa correção, o painel de mercado ficava permanentemente vazio e `executeMarketOffer()` retornava silenciosamente sem nenhum efeito.

## 15. Catálogo visual de territórios (2026-08-16)

`worldArtworkCatalog` conecta a ficha de território a imagens reais em `assets/`. A resolução ocorre em `getWorldArtwork(tile)` com esta prioridade:

1. tipo especial: `capital`, `village` ou `ruin`;
2. terreno: `plains`, `forest`, `hill`, `river`, `mountain` ou `coast`;
3. fallback: `terrain-plains.jpg`.

Arquivos usados:

- `location-castle.jpg`, `location-village.jpg`, `location-ruins.jpg`;
- `terrain-plains.jpg`, `terrain-forest.jpg`, `terrain-hill.jpg`, `terrain-river.jpg`, `terrain-mountain.jpg`.

`renderWorldPanel()` mantém o mapa 9x9 como superfície principal e exibe a arte escolhida em `.world-artwork`, dentro da ficha abaixo do mapa. A troca de tile atualiza imagem, nome, descrição, coordenadas, terreno, distância e ameaça sem alterar o estado de exploração.
