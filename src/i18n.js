// Motor de idiomas do Iron Realms.
// Não contém regras de jogo: apenas lê os dicionários de /lang e troca textos exibidos.
(function () {
  const STORAGE_KEY = 'iron-realms-lang';
  const DEFAULT_LOCALE = 'pt-BR';

  function getDictionaries() {
    return {
      'pt-BR': window.IRON_LANG_PT_BR || {},
      'es-ES': window.IRON_LANG_ES_ES || {}
    };
  }

  let currentLocale = localStorage.getItem(STORAGE_KEY) || DEFAULT_LOCALE;
  if (!getDictionaries()[currentLocale]) {
    currentLocale = DEFAULT_LOCALE;
  }

  function t(key, fallback) {
    const dictionary = getDictionaries()[currentLocale] || {};
    return dictionary[key] || fallback || key;
  }

  // Traduz e substitui marcadores {nome} pelos valores em params.
  function tp(key, params, fallback) {
    let text = t(key, fallback);
    Object.entries(params || {}).forEach(([paramKey, paramValue]) => {
      text = text.split(`{${paramKey}}`).join(paramValue);
    });
    return text;
  }

  function localizeEvent(event) {
    if (!event || !event.id) {
      return event;
    }
    const localized = { ...event };
    localized.title = t(`event.${event.id}.title`, event.title);
    localized.description = t(`event.${event.id}.description`, event.description);
    localized.choices = (event.choices || []).map((choice, index) => ({
      ...choice,
      label: localizeRuntimeText(t(`event.${event.id}.choice.${index}.label`, choice.label)),
      message: localizeRuntimeText(t(`event.${event.id}.choice.${index}.message`, choice.message))
    }));
    return localized;
  }

  function localizeRuntimeText(value) {
    if (typeof value !== 'string') {
      return value;
    }
    const replacements = currentLocale === 'es-ES'
      ? [
          ['Enquanto você estava fora, o reino produziu', 'Mientras estabas fuera, el reino produjo'],
          ['O reino recebeu um novo evento:', 'El reino recibió un nuevo evento:'],
          ['O mundo vivo reagiu:', 'El mundo vivo reaccionó:'],
          ['A expedição retornou de', 'La expedición regresó de'],
          ['Uma coluna marchou para', 'Una columna marchó hacia'],
          ['O conselho reconheceu a decisão sobre', 'El consejo reconoció la decisión sobre'],
          ['A quarentena foi organizada com dignidade.', 'La cuarentena se organizó con dignidad.'],
          ['Uma nova aldeia foi fundada em', 'Se fundó una nueva aldea en'],
          ['Praga na vila', 'Plaga en la aldea'],
          ['Isolar os doentes com cuidado', 'Aislar a los enfermos con cuidado'],
          ['A quarentena foi organizada com dignidade.', 'La cuarentena se organizó con dignidad.'],
          ['O povo viu a coroa proteger a todos, mesmo os mais pobres.', 'El pueblo vio a la corona proteger a todos, incluso a los más pobres.'],
          ['A decisão do reino', 'La decisión del reino'],
          ['Comprar minério', 'Comprar mineral'],
          ['Contratar escoltas', 'Contratar escoltas'],
          ['Cometa no céu', 'Cometa en el cielo'],
          ['Caravana de mercadores', 'Caravana de mercaderes'],
          ['O reino respondeu a um evento externo e ajustou o curso da administração.', 'El reino respondió a un evento externo y ajustó el rumbo de la administración.'],
          ['O reino respondeu a um sinal do mundo vivo.', 'El reino respondió a una señal del mundo vivo.'],
          ['A expedição retornou com descobertas e recursos para o reino.', 'La expedición regresó con descubrimientos y recursos para el reino.'],
          ['A sede do reino, onde o conselho e a guarda se reúnem.', 'La sede del reino, donde se reúnen el consejo y la guardia.'],
          ['Um ponto do reino ainda sem nome fixo, mas pronto para exploração.', 'Un punto del reino aún sin nombre fijo, listo para la exploración.'],
          ['A entrada foi selada para preservar a segurança e os segredos da região.', 'La entrada fue sellada para preservar la seguridad y los secretos de la región.'],
          ['O reino respondeu ao evento do mundo vivo: Ruína acordada.', 'El reino respondió al evento del mundo vivo: Ruina despierta.'],
          ['O reino abriu suas portas. Muitos deles hoje trabalham a terra em nome da coroa.', 'El reino abrió sus puertas. Muchos de ellos hoy trabajan la tierra en nombre de la corona.'],
          ['O conselho reconheceu a decisão sobre Praga na vila.', 'El consejo reconoció la decisión sobre la plaga en la aldea.'],
          ['A expedição retornou de Território', 'La expedición regresó de Territorio'],
          ['O território foi mapeado e a rota ficou registrada.', 'El territorio fue mapeado y la ruta quedó registrada.'],
          ['O reino recebeu um novo evento: ', 'El reino recibió un nuevo evento: '],
          ['Uma coluna marchou para ', 'Una columna marchó hacia '],
          ['O reino se adaptou ao pulso do mundo vivo.', 'El reino se adaptó al pulso del mundo vivo.'],
          ['O reino decidiu agir diante do evento.', 'El reino decidió actuar ante el evento.'],
          ['O reino ajustou seus cofres e seus estoques.', 'El reino ajustó sus arcas y sus reservas.'],
          ['Os exploradores acharam tesouros antigos e o reino ganhou prestígio.', 'Los exploradores encontraron tesoros antiguos y el reino ganó prestigio.'],
          ['A entrada foi selada', 'La entrada fue sellada'],
          ['População', 'Población'],
          ['Reputação', 'Reputación'],
          ['Celebrar no pátio', 'Celebrar en el patio'],
          ['Guardar para o inverno', 'Guardar para el invierno'],
          ['Mobilizar os bombeiros', 'Movilizar a los bomberos'],
          ['Cortar o acesso e reforçar', 'Cerrar el acceso y reforzar'],
          ['Responder com patrulha', 'Responder con una patrulla'],
          ['Pagar tributo por segurança', 'Pagar tributo por seguridad'],
          ['Extrair o minério com registro oficial', 'Extraer el mineral con registro oficial'],
          ['Escavar em segredo, sem dividir', 'Excavar en secreto, sin compartir'],
          ['Trancar os doentes e abandonar a vila', 'Encerrar a los enfermos y abandonar la aldea'],
          ['Queimar a vila com os doentes dentro', 'Quemar la aldea con los enfermos dentro'],
          ['Perdoar e oferecer trabalho honesto', 'Perdonar y ofrecer trabajo honesto'],
          ['Cortar a mão em praça pública', 'Cortar la mano en la plaza pública'],
          ['Executar como exemplo', 'Ejecutar como ejemplo'],
          ['Expor a fraude publicamente', 'Exponer el fraude públicamente'],
          ['Usá-lo para controlar o povo', 'Usarlo para controlar al pueblo'],
          ['Prendê-lo em silêncio, sem julgamento', 'Encerrarlo en silencio, sin juicio'],
          ['Acolher e alimentar a todos', 'Acoger y alimentar a todos'],
          ['Negar entrada e fechar os portões', 'Negar la entrada y cerrar las puertas'],
          ['Vendê-los como servos a mercadores', 'Venderlos como siervos a mercaderes'],
          ['Julgá-lo e devolver o excedente', 'Juzgarlo y devolver el excedente'],
          ['Ignorar em troca de uma parte', 'Ignorarlo a cambio de una parte'],
          ['Promovê-lo a chefe da região', 'Ascenderlo a jefe de la región'],
          ['Reforçar a fronteira', 'Reforzar la frontera'],
          ['Negociar descanso', 'Negociar un descanso'],
          ['Preparar celeiros', 'Preparar los graneros'],
          ['Movimentar a guarda', 'Movilizar a la guardia'],
          ['Abrir os portos', 'Abrir los puertos'],
          ['Reaproveitar a rota', 'Reutilizar la ruta'],
          ['Explorar a ruína', 'Explorar la ruina'],
          ['Cobrir o acesso', 'Cubrir el acceso'],
          ['Abater e queimar os animais doentes', 'Sacrificar y quemar los animales enfermos'],
          ['Vender os animais doentes escondidos no mercado', 'Vender los animales enfermos a escondidas en el mercado'],
          ['Recebê-lo com cautela e vigilância', 'Recibirlo con cautela y vigilancia'],
          ['Prendê-lo e confiscar seus bens sem provas', 'Detenerlo y confiscar sus bienes sin pruebas'],
          ['Decisão tomada:', 'Decisión tomada:'],
          ['Efeito nos recursos:', 'Efecto en los recursos:'],
          ['Reputação:', 'Reputación:'],
          ['Respeitada', 'Respetada'],
          ['Muralha', 'Muralla'],
          ['Guarda', 'Guardia'],
          ['Patrulha', 'Patrulla'],
          ['Força total', 'Fuerza total'],
          ['Produção', 'Producción'],
          ['Nível', 'Nivel'],
          ['foi concluído.', 'se completó.'],
          ['concluiu o treinamento e agora marcha sob seu comando.', 'completó el entrenamiento y ahora marcha bajo tu mando.']
        ]
      : [];
    return replacements.reduce((text, [from, to]) => text.split(from).join(to), value);
  }

  function translateStaticDom() {
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = t(element.getAttribute('data-i18n'), element.textContent);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
      element.setAttribute('aria-label', t(element.getAttribute('data-i18n-aria-label'), element.getAttribute('aria-label')));
    });
    document.querySelectorAll('[data-i18n-title]').forEach((element) => {
      element.setAttribute('title', t(element.getAttribute('data-i18n-title'), element.getAttribute('title')));
    });
    document.documentElement.setAttribute('lang', currentLocale);
    document.querySelectorAll('[data-lang-option]').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-lang-option') === currentLocale);
    });
  }

  function setLocale(locale) {
    if (!getDictionaries()[locale] || locale === currentLocale) {
      return;
    }
    currentLocale = locale;
    localStorage.setItem(STORAGE_KEY, locale);
    translateStaticDom();
    // O jogo em si não muda: apenas re-renderiza os textos traduzíveis já existentes.
    if (typeof renderAll === 'function' && typeof state !== 'undefined') {
      renderAll();
    }
  }

  function getLocale() {
    return currentLocale;
  }

  window.t = t;
  window.tp = tp;
  window.localizeEvent = localizeEvent;
  window.localizeRuntimeText = localizeRuntimeText;
  window.I18N = { t, tp, setLocale, getLocale, translateStaticDom, localizeEvent, localizeRuntimeText };

  document.addEventListener('DOMContentLoaded', translateStaticDom);
})();
