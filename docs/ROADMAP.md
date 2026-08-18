# Iron Realms — Roadmap de desenvolvimento

> Este arquivo descreve planejamento. O status oficial do que foi executado e validado está em [PROGRESS.txt](PROGRESS.txt). Não marque um item aqui como concluído sem registrar evidência no progresso.

## Estado do roadmap — 2026-08-16

- Base das Eras I, II e III: concluída e registrada no progresso.
- Groundwork da Era IX: implementado para métricas, perfil e especialização emergente.
- TASK-023: concluída; mapa editável e catálogo visual territorial integrados.
- Próximo foco: `IR-090` a `IR-100`.
- QA final posterior: `IR-110` a `IR-118`.

## Como ler os status

- `COMPLETED`: item implementado e validado, com evidência em `PROGRESS.txt`.
- `PARTIAL`: existe uma parte funcional, mas o sistema não cobre o escopo completo.
- `PLANNED`: ainda não existe no código; não deve ser apresentado na interface como se existisse.
- `NEXT`: próximo item priorizado, ainda não iniciado.

## Concluído

### Era I — Identidade do reino

`IR-000` auditoria visual, `IR-001` direção visual, `IR-002` paleta, `IR-003` tipografia, `IR-004` iconografia inicial, `IR-005` materiais, `IR-006` botões, `IR-007` painéis e `IR-008` espaçamento.

### Era II — Sala do trono

`IR-010` composição principal, `IR-011` identidade da fortaleza, `IR-012` topbar de recursos, `IR-013` navegação, `IR-014` painel de atividade, `IR-015` construções em andamento, `IR-016` movimentações, `IR-017` ações prioritárias, `IR-018` estados vazios e `IR-019` estados de alerta.

### Era III — Reino em movimento

`IR-020` produção, `IR-021` filas, `IR-022` timers, `IR-023` feedback, `IR-024` notificações, `IR-025` persistência, `IR-026` validação de fluxos e `IR-027` integração dos estados.

### Era IX — Perfil do jogador

`IR-080` métricas de estilo, `IR-081` perfil do reino e `IR-084` especialização emergente.

### Entregas recentes

- `TASK-014`: toasts, stats, perfil, fallbacks de save, responsividade e feedback de ações.
- `TASK-015`: navegação funcional por abas principais e secundárias.
- `TASK-016`: guard contra cliques duplicados, eventos mais espaçados e relatórios enriquecidos.
- `TASK-017`: caixa de decisões urgentes flutuante e estética “mesa do rei”.
- `TASK-018`: rotas visuais com Bresenham e legenda do mapa.
- `TASK-019`: histórico de relatórios com filtros e retenção de 40 registros.
- `TASK-020`: imagem externa `assets/world-map.jpg` e névoa de guerra.
- `TASK-021`: mapa completo em largura total, sem corte ou grade duplicada.
- `TASK-022`: campos interativos alinhados à grade A-I/1-9 da imagem.
- `TASK-023`: catálogo `location-*`/`terrain-*` na ficha do território.
- `TASK-024`: idiomas PT-BR/ES-ES em arquivos separados e ícones PNG dos recursos.

## Parcial

### Era IV — Fronteira

- Viagem, seleção de território, rota, batalha e expedição existem no cliente.
- `IR-030` a `IR-038` permanecem como revisão formal de fronteira, equilíbrio e cobertura de cenários.

### Era V — Guerra

O combate simulado existe, mas ainda precisa de revisão formal de progressão, defesa e campanhas longas. Itens `IR-040` a `IR-048` permanecem em revisão.

### Era VI — Relatórios e comunicação

Log curto e relatórios filtráveis existem. Melhorias de apresentação e cobertura continuam em `IR-050` a `IR-056`.

### Era VIII — Mundo vivo

Eventos globais, alianças, rede e expansão possuem estado e interface locais. Não há multiplayer real, autenticação ou sincronização de servidores. Itens `IR-070` a `IR-077` só devem avançar quando houver sistemas reais que sustentem as regras.

## Planejado

### Era VII — Tesouros do reino

- `IR-060` inventário expandido.
- `IR-061` equipamentos com slots e bônus reais.
- `IR-062` consumíveis ampliados.
- `IR-063` loot integrado.
- `IR-064` recompensas detalhadas.
- `IR-065` feedback visual de raridade, somente se houver dados reais.

### Era X — Polimento

- `IR-090` microinterações.
- `IR-091` hover.
- `IR-092` pressed states.
- `IR-093` transições.
- `IR-094` animações de progresso.
- `IR-095` feedback de ações.
- `IR-096` loading states.
- `IR-097` error states.
- `IR-098` responsividade final.
- `IR-099` acessibilidade.
- `IR-100` performance visual.

### Era XI — QA final

- `IR-110` navegação completa.
- `IR-111` botões com ação, feedback e atualização de estado.
- `IR-112` notificações.
- `IR-113` timers, conclusão, persistência e reload.
- `IR-114` economia e recursos.
- `IR-115` combate e expedições.
- `IR-116` eventos e decisões.
- `IR-117` saves antigos e progresso offline.
- `IR-118` regressão final em browser.

## Regras de atualização

1. Uma tarefa só muda para `COMPLETED` depois de alteração real, teste e registro em `PROGRESS.txt`.
2. Roadmap não cria funcionalidades: `PLANNED` significa que o código ainda não possui o sistema.
3. Riscos e limitações ficam em `QA_AUDIT.md`.
4. O fluxo efetivamente executado fica em `GAME_FLOW_MAP.md`.
5. `README.md` e `CONTRIBUTING.md` ajudam novos colaboradores a se orientar, mas não substituem esta regra.
