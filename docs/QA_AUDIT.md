# Iron Realms — QA Audit

## 1. Escopo

Este audit foi conduzido após a análise do código da aplicação e da verificação funcional em navegador local. O objetivo foi comparar o que o jogo realmente faz com o que a documentação do projeto e o arquivo de progresso afirmam.

O trabalho foi executado sem alterar o código-fonte, conforme a regra de auditoria: primeiro verificar, depois documentar.

## 2. Método

Validação executada:

- leitura do código principal em `src/`
- leitura da estrutura do app em `index.html`
- leitura do registro de progresso em `docs/PROGRESS.txt`
- execução em servidor local em `http://localhost:8000/`
- confirmação de interações via navegador real em contexto local

## 3. Evidência verificada em runtime

### Confirmado

Os seguintes pontos foram observados em execução real:

- a interface renderiza e atualiza recursos no navegador;
- o estado muda em resposta a clique em construção;
- a fila de construção entra em funcionamento e muda o status do reino para "Reino em movimento";
- o sistema de persistência via `localStorage` funciona;
- a visão de mapa responde a seleção de tile;
- a lógica de eventos e o painel de mundo vivo podem abrir interações reais;
- o game loop executa em intervalo de 1 segundo;
- o sistema de relatórios/log também reage ao fluxo do jogo.

Exemplo de evidência observada em runtime:

- clique no botão "Construir" para a Prefeitura gerou `queueAfter: "Prefeitura"`;
- recursos do reino foram alterados após a ação, por exemplo: madeira aumentou para `234` e ouro para `94`; isso confirma atualização do estado e renderização da UI;
- o status foi alterado para "Reino em movimento" sem erro de execução do script.

### Não comprovado como suíte automatizada

Não há um conjunto de testes automatizados cobrindo:

- batalhas com diferentes cenários;
- expedições em múltiplos tiles;
- transição entre eventos e mundo vivo;
- persistência de save/load em múltiplas sessões;
- regressões em longas jogadas;
- validação de cross-browser real.

A validação aqui foi parcial, mas baseada em execução real e inspeção do fluxo funcional.

## 4. Papel deste documento e comparação com o progresso

Este arquivo não define a fase atual nem o próximo item. Ele registra evidências, limitações e riscos encontrados na auditoria. Para o estado oficial, consultar `PROGRESS.txt`; para planejamento, consultar `ROADMAP.md`.

### O que está consistente

- o jogo tem uma estrutura funcional de recursos, fila, construções e produção;
- o mapa, a seleção de tile, o mundo e a lógica de rota existem;
- o sistema de relatórios e log está integrado ao estado;
- o reino tem eventos, mercado, aliados, expedições, batalhas e mundo vivo em código.

### O que estava exagerado ou ambíguo na documentação

Versões anteriores de `PROGRESS.txt` e documentos históricos afirmavam:

- "Jogo funcional em navegador"
- "Progressão central estável"
- "Sistema de eventos vivos"
- "Economia, expansão, rede e alianças integradas"
- "Persistência e loop de gameplay finalizados"

Essas afirmações devem ser lidas como descrição de sistemas implementados no cliente, não como certificação de produto completo. O estado atual foi corrigido no cabeçalho e no bloco `NEXT_TASK` de `PROGRESS.txt`: o jogo é um protótipo funcional local, sem backend real e sem suíte automatizada.

## 5. Findings por prioridade

| Prioridade | Item | Severidade | Status |
| --- | --- | --- | --- |
| P0 | `renderInventoryPanel` é definido duas vezes em `app.js`. A segunda definição sobrescreve a primeira. | Médio | Corrigido em 2026-08-15 |
| P0 | Não existe suíte de testes automatizados para o ciclo completo de jogo. Isso reduz confiança na regressão e no comportamento em cenários multi-estado. | Médio | Confirmado |
| P1 | O sistema de multiplayer/diplomacia aparece como interface e estado local, mas não há backend real, autenticação ou sincronização de rede. | Médio | Confirmado pela estrutura do código |
| P1 | O projeto comunica que o reino está em "Fase 12 — Mundo vivo" e "finalizado", mas a validação real foi apenas em navegador local e não em cenário completo de usuário. | Médio | Confirmado |
| P2 | O código usa aleatoriedade forte em eventos e batalhas sem nenhum mecanismo de determinismo ou histórico de teste. Isso pode causar inconsistência e dificuldade de reproduzir falhas. | Baixo | Confirmado |
| P2 | Há lógica de UI/estado duplicada ou sobrescrita (ex.: inventário). Isso aumenta o risco de manutenção e regressão silenciosa. | Baixo | Corrigido no caso do inventário |
| P3 | O arquivo de progresso parece mais otimista do que o comportamento realmente validado; há gap entre documentação e evidência. | Baixo | Confirmado |

## 6. Achados específicos

### 6.1 Duplicação de função em `renderInventoryPanel`

Há duas definições de `renderInventoryPanel` em `app.js`:

- a primeira renderiza itens com estado básico;
- a segunda sobrescreve a primeira e adiciona botão de uso do item.

O efeito prático é que a implementação final usada pela aplicação é a segunda, e a primeira fica sem efeito. Isso é um sinal de código duplicado e risco de manutenção.

Status após correção: resolvido. A duplicação foi removida, o painel de inventário continua renderizando corretamente e o uso de itens consumíveis foi validado em navegador.

### 6.2 Sistema de multiplayer não é real

O código usa campos como:

- `multiplayer.connected`
- `realmName`
- `sync`
- `latency`
- `channels`

Mas não existe integração com backend real, autenticação, persistência remota ou sincronização real entre clientes. O que existe é um painel simulado em cliente.

### 6.3 Fase “finalizada” não está plenamente verificada

O progresso comunica que todas as fases e sobrecargas visuais foram concluídas. O que a execução e análise evidenciaram é que a maioria dos sistemas está implementada, mas não foi comprovada em uma bateria completa de verificações de jogo, regressão e UX real.

## 7. O que foi validado como funcional

Os elementos abaixo tiveram confirmação material de execução e atualização do estado:

- produção de recursos
- filas de construção
- fila militar
- renderização da UI e atualização de status
- seleção de tiles no mapa
- eventos aleatórios e eventos do mundo vivo
- mercado
- inventário consumível
- relatórios/log
- persistência local

## 8. O que permanece não garantido

Os elementos abaixo continuam sem garantia de completude operacional:

- equilíbrio do jogo em longo prazo
- comportamento de combate em múltiplos cenários
- estabilidade de campanhas longas
- fluxo completo de exploração/território em todas as condições
- suporte real para multiplayer/diplomacia distribuída
- experiência de UX em uso real de usuário sem supervisão

## 9. Avaliação final

Resumo executivo:

- O jogo está funcional como protótipo de estratégia local em navegador.
- O código apresenta estrutura e lógica suficientes para uma simulação de reino plausível.
- O arquivo de progresso está otimista demais para a verificação real feita neste audit.
- A implementação não deve ser tratada como "100% finalizada" sem uma validação adicional mais profunda e um conjunto de testes de regressão.

Conclusão: a base está sólida e funcional, mas a declaração de conclusão total exige mais comprovação do que o que foi observado até este ponto.

## 10. Achados adicionais — Era III / Era IX (2026-08-15)

### 10.1 Bug real: mercado permanentemente vazio em saves com `economy.offers: []`

`loadState()` usava `Array.isArray(parsed.economy?.offers) ? parsed.economy.offers : cloneState(defaultMarketOffers)`. Um array vazio `[]` passa em `Array.isArray`, então um save antigo/corrompido com `economy.offers: []` nunca caía no fallback do catálogo padrão. Efeito prático: o painel "Mercado do reino" renderizava permanentemente vazio (sem cards, sem erro visível), e `executeMarketOffer()` retornava silenciosamente sem nenhuma ação.

Severidade: Médio (funcionalidade inteira de comércio ficava inacessível sem qualquer aviso ao jogador).

Status: Corrigido. Condição ajustada para `Array.isArray(...) && parsed.economy.offers.length > 0`. Validado em runtime: após a correção e reload, o painel de mercado voltou a exibir as 4 ofertas padrão e uma compra foi concluída com sucesso.

### 10.2 Cobertura de feedback ampliada (toasts + delta de recursos)

Antes desta sessão, toasts existiam apenas para construção, treino e batalha. Expedição, retorno de rota, evento do reino, evento do mundo vivo, comércio e ações de aliança não davam feedback textual imediato — apenas log discreto na lateral. Adicionado feedback consistente (toast + delta de recursos quando aplicável) em todos esses fluxos, validado em runtime.

### 10.3 Metodologia de validação nesta sessão

O jogo re-renderiza o DOM inteiro a cada 1 segundo (`gameTick`), o que invalida referências de elementos de acessibilidade quase imediatamente após serem capturadas. Cliques via ferramenta de automação baseada em referência (`click_element`) sofrem timeout por esse motivo. A validação foi feita chamando diretamente as funções de jogo já expostas globalmente (`resolveEvent`, `executeMarketOffer`, `sendAllianceSupport`, `resolveBattle`, etc.) no contexto da página — funcionalmente equivalente ao clique real do jogador, pois é o mesmo código executado pelos manipuladores de evento dos botões.

### 10.4 Estado ainda não fabricado (não implementado, mantido como PLANNED)

Os seguintes itens do roadmap (Era VIII/IX) exigem sistemas que ainda não existem no código e não foram fabricados nesta sessão, conforme a regra "não adicionar eventos falsos":
- NPCs dedicados e mercadores dedicados (além do que já existe em mercado/alianças);
- patrulhas como sistema militar próprio;
- histórico de decisões dedicado (hoje existe apenas log/relatórios recentes, sem tela de histórico completo).
