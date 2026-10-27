// Treino Livre — a tela original do projeto, agora como atividade.
// Palavras do nível/tema escolhidos passam na tela uma por vez, a cada N
// segundos, em ordem aleatória, com tela cheia e retomada da pausa.

import { LS, readPref, savePref, applyTheme } from "../prefs.js";
import { navigate } from "../router.js";
import { getWords, levelKeys, levelLabel, displayWord } from "../words-data.js";
import { criarTelaCheia } from "./tela-cheia.js";

var ALL = "*";
var FADE_MS = 160;
var MAX_PX = 180;
var HINT_DEFAULT = "PRESSIONE PLAY PARA COMEÇAR";
var HINT_EMPTY = "Nenhuma palavra neste filtro";

var ICONS = {
  back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  stop: '<rect x="4" y="4" width="16" height="16" rx="2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  fsMax: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
  fsMin: '<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>'
};
// fsMin corrigido abaixo no HTML (path idêntico ao original)

var HTML =
  '<header class="menu">' +
    '<button class="btn-back" id="tlBack" type="button" aria-label="Voltar para a tela inicial">' + ICONS.back + '</button>' +

    '<div class="ctrl">' +
      '<label class="ctrl-label" for="tlNivel">Nível</label>' +
      '<select id="tlNivel"></select>' +
    '</div>' +

    '<div class="ctrl">' +
      '<label class="ctrl-label" for="tlTema">Tema</label>' +
      '<select id="tlTema"></select>' +
    '</div>' +

    '<div class="ctrl">' +
      '<label class="ctrl-label" for="tlSegundos">Segundos</label>' +
      '<select id="tlSegundos"></select>' +
    '</div>' +

    '<div class="ctrl ctrl-switch">' +
      '<span class="switch-label">Minúsculo</span>' +
      '<label class="switch">' +
        '<input type="checkbox" id="tlCase">' +
        '<span class="switch-track"><span class="switch-thumb"></span></span>' +
      '</label>' +
      '<span class="switch-label">Maiúsculo</span>' +
    '</div>' +

    '<div class="ctrl ctrl-switch">' +
      '<svg class="switch-glyph" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS.sun + '</svg>' +
      '<label class="switch">' +
        '<input type="checkbox" id="tlDark" aria-label="Modo escuro">' +
        '<span class="switch-track"><span class="switch-thumb"></span></span>' +
      '</label>' +
      '<svg class="switch-glyph" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS.moon + '</svg>' +
    '</div>' +

    '<button class="btn-play" id="tlToggle" type="button" aria-label="Iniciar">' +
      '<svg id="tlIconPlay" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + ICONS.play + '</svg>' +
      '<svg id="tlIconStop" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" hidden>' + ICONS.stop + '</svg>' +
    '</button>' +
  '</header>' +

  '<main class="palavra-area">' +
    '<div class="hint" id="tlHint">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + ICONS.play + '</svg>' +
      '<span id="tlHintText">' + HINT_DEFAULT + '</span>' +
    '</div>' +

    '<div class="word-wrap" id="tlWordWrap">' +
      '<span class="word" id="tlWord"></span>' +
    '</div>' +

    '<div class="counter" id="tlCounter" aria-hidden="true"></div>' +

    '<button class="btn-fs" id="tlFs" type="button" aria-label="Tela cheia">' +
      '<svg id="tlIconMax" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS.fsMax + '</svg>' +
      '<svg id="tlIconMin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" hidden>' + ICONS.fsMin + '</svg>' +
    '</button>' +
  '</main>';

export function createTreinoLivre() {
  // `el` é preenchido na seção "Montagem" abaixo, quando o container já existe.
  var el;

  var state = { running: false, order: [], idx: 0, last: null };
  var timerWord = null;
  var timerFade = null;
  var destroyed = false;
  var mctx = document.createElement("canvas").getContext("2d");

  /* ---------- Setup ---------- */

  function themeKeys() {
    if (el.nivel.value === ALL) {
      var union = [];
      levelKeys().forEach(function (k) {
        Object.keys(getWords()[k] || {}).forEach(function (t) {
          if (union.indexOf(t) === -1) union.push(t);
        });
      });
      return union;
    }
    return Object.keys(getWords()[el.nivel.value] || {});
  }

  function themeLabel(key) {
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  function populate() {
    var all = document.createElement("option");
    all.value = ALL;
    all.textContent = "Todos os níveis";
    el.nivel.appendChild(all);

    levelKeys().forEach(function (key) {
      var opt = document.createElement("option");
      opt.value = key;
      opt.textContent = levelLabel(key);
      el.nivel.appendChild(opt);
    });

    for (var i = 1; i <= 120; i++) {
      var o = document.createElement("option");
      o.value = String(i);
      o.textContent = String(i);
      el.seg.appendChild(o);
    }
  }

  function populateTemas(keep) {
    var cur = keep === undefined ? el.tema.value : keep;
    var keys = themeKeys();

    el.tema.textContent = "";

    var all = document.createElement("option");
    all.value = ALL;
    all.textContent = "Todos os temas";
    el.tema.appendChild(all);

    keys.forEach(function (k) {
      var o = document.createElement("option");
      o.value = k;
      o.textContent = themeLabel(k);
      el.tema.appendChild(o);
    });

    el.tema.value = (cur && keys.indexOf(cur) !== -1) ? cur : ALL;
  }

  function loadPrefs() {
    var nivel = readPref(LS.nivel);
    var tema = readPref(LS.tema);
    var seg = readPref(LS.seg);
    var cs = readPref(LS.cs);

    if (nivel === ALL || getWords()[nivel]) el.nivel.value = nivel;
    else el.nivel.value = levelKeys()[0];

    populateTemas(tema);

    var segNum = parseInt(seg, 10);
    el.seg.value = (segNum >= 1 && segNum <= 120) ? String(segNum) : "3";

    el.cs.checked = cs === "1";
    el.dark.checked = readPref(LS.theme) === "1";
  }

  /* ---------- Estado da UI ---------- */

  function setHidden(node, hidden) {
    if (hidden) node.setAttribute("hidden", "");
    else node.removeAttribute("hidden");
  }

  function currentList() {
    var nv = el.nivel.value;
    var t = el.tema.value;
    var out = [];
    var levels = (nv === ALL) ? levelKeys() : [nv];

    levels.forEach(function (k) {
      var lvl = getWords()[k];
      if (!lvl) return;
      if (t === ALL) {
        Object.keys(lvl).forEach(function (tk) { out = out.concat(lvl[tk]); });
      } else if (lvl[t]) {
        out = out.concat(lvl[t]);
      }
    });

    return out;
  }

  function syncUI() {
    var r = state.running;
    var empty = currentList().length === 0;

    el.nivel.disabled = r;
    el.tema.disabled = r;
    el.seg.disabled = r;
    el.cs.disabled = r;
    el.dark.disabled = r;

    setHidden(el.iconPlay, r);
    setHidden(el.iconStop, !r);
    el.btn.setAttribute("aria-label", r ? "Parar" : "Iniciar");
    el.btn.disabled = empty;

    el.hintText.textContent = empty ? HINT_EMPTY : HINT_DEFAULT;
    setHidden(el.hint, r || (!empty && el.word.textContent !== ""));
  }

  function applyCase() {
    savePref(LS.cs, el.cs.checked ? "1" : "0");
    // A caixa é aplicada na exibição (displayWord em words-data.js):
    // no modo MINÚSCULO, nomes próprios mantêm a inicial maiúscula.
    if (state.last !== null) el.word.textContent = displayWord(state.last, el.cs.checked);
    fit();
  }

  function onDarkChange() {
    applyTheme(el.dark.checked);
  }

  /* ---------- Ajuste de tamanho da palavra ---------- */

  function fit() {
    var text = el.word.textContent;
    if (!text) return;

    var avail = el.wrap.clientWidth - 4;
    var maxPx = Math.min(MAX_PX, Math.floor(el.area.clientHeight * 0.6) || 120);

    // O textContent já é o texto com a caixa final (displayWord), então
    // mede diretamente — sem rebaixar/altear de novo.
    mctx.font = '700 ' + maxPx + 'px "Atkinson Hyperlegible", sans-serif';
    var w = mctx.measureText(text).width;

    var size = maxPx;
    if (w > 0 && w > avail) {
      size = Math.max(20, Math.floor(maxPx * (avail / w)));
    }
    el.word.style.fontSize = size + "px";
  }

  /* ---------- Ciclo das palavras ---------- */

  function seconds() {
    var n = parseInt(el.seg.value, 10);
    return (n >= 1 && n <= 120) ? n : 3;
  }

  function shuffled(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    if (a.length > 1 && state.last && a[0] === state.last) {
      var s = a[0];
      a[0] = a[1];
      a[1] = s;
    }
    return a;
  }

  function paint(text, n) {
    clearTimeout(timerFade);

    var apply = function () {
      el.word.textContent = displayWord(text, el.cs.checked);
      el.counter.textContent = n + "/" + state.order.length;
      state.last = text; // guarda o texto PURO; a caixa é aplicada na exibição
      fit();
      el.word.style.opacity = "1";
    };

    if (!el.word.textContent) {
      apply();
      return;
    }

    el.word.style.opacity = "0";
    timerFade = setTimeout(apply, FADE_MS);
  }

  function arm() {
    clearTimeout(timerWord);
    timerWord = setTimeout(tick, seconds() * 1000);
  }

  function tick() {
    if (!state.running || destroyed) return;
    state.idx++;
    if (state.idx >= state.order.length) {
      state.order = shuffled(currentList());
      state.idx = 0;
    }
    paint(state.order[state.idx], state.idx + 1);
    arm();
  }

  function start() {
    if (state.running || el.btn.disabled) return;

    // Retomada: ciclo pausado com palavra congelada na tela
    if (state.order.length && el.word.textContent) {
      state.running = true;
      syncUI();
      arm();
      return;
    }

    var list = currentList();
    if (!list.length) return;
    state.running = true;
    state.order = shuffled(list);
    state.idx = 0;
    syncUI();
    paint(state.order[0], 1);
    arm();
  }

  function stop() {
    if (!state.running) return;
    state.running = false;
    clearTimeout(timerWord);
    syncUI();
  }

  function toggle() {
    if (state.running) stop();
    else start();
  }

  function onFilterChange() {
    state.order = []; // próximo Play inicia ciclo novo no filtro escolhido
    state.idx = 0;
    if (currentList().length === 0) {
      clearTimeout(timerFade);
      el.word.style.opacity = "1";
      el.word.textContent = "";
      el.counter.textContent = "";
      state.last = null;
    }
    syncUI();
  }

  /* ---------- Tela cheia ---------- */
  // O controle (nativa + fallback do iOS, simulado por CSS) mora em
  // activities/tela-cheia.js e é compartilhado com Palavras Desconhecidas.

  var telaCheia = null;

  function syncFsUI(on) {
    setHidden(el.iconMax, on);
    setHidden(el.iconMin, !on);
    el.fs.setAttribute("aria-label", on ? "Sair da tela cheia" : "Tela cheia");
  }

  /* ---------- Eventos ---------- */

  function onKeydown(e) {
    if (e.key === "Escape" && telaCheia && telaCheia.emFallback()) {
      telaCheia.alternar(); // sai do modo simulado
      return;
    }
    if (e.code !== "Space" && e.key !== " ") return;
    var t = e.target;
    if (t && (t.tagName === "SELECT" || t.tagName === "BUTTON" ||
              t.tagName === "INPUT" || t.tagName === "A" || t.isContentEditable)) {
      return;
    }
    e.preventDefault();
    toggle();
  }

  function bind() {
    el.btn.addEventListener("click", toggle);
    el.fs.addEventListener("click", telaCheia.alternar);
    el.back.addEventListener("click", goHome);

    el.nivel.addEventListener("change", function () {
      populateTemas(ALL); // tema pode não existir no nível novo
      savePref(LS.nivel, el.nivel.value);
      savePref(LS.tema, ALL);
      onFilterChange();
    });

    el.tema.addEventListener("change", function () {
      savePref(LS.tema, el.tema.value);
      onFilterChange();
    });

    el.seg.addEventListener("change", function () {
      savePref(LS.seg, el.seg.value);
    });

    el.cs.addEventListener("change", applyCase);
    el.dark.addEventListener("change", onDarkChange);

    document.addEventListener("keydown", onKeydown);
    telaCheia.ativar(); // fullscreenchange + webkitfullscreenchange
    window.addEventListener("resize", fit);
  }

  function goHome() {
    navigate("/");
  }

  /* ---------- Montagem ---------- */

  var container = document.createElement("div");
  container.className = "screen";
  container.innerHTML = HTML;

  // Substitui as referências pelos elementos recém-criados (ids tl*)
  el = {
    back: container.querySelector("#tlBack"),
    nivel: container.querySelector("#tlNivel"),
    tema: container.querySelector("#tlTema"),
    seg: container.querySelector("#tlSegundos"),
    cs: container.querySelector("#tlCase"),
    dark: container.querySelector("#tlDark"),
    btn: container.querySelector("#tlToggle"),
    iconPlay: container.querySelector("#tlIconPlay"),
    iconStop: container.querySelector("#tlIconStop"),
    area: container.querySelector(".palavra-area"),
    hint: container.querySelector("#tlHint"),
    hintText: container.querySelector("#tlHintText"),
    wrap: container.querySelector("#tlWordWrap"),
    word: container.querySelector("#tlWord"),
    counter: container.querySelector("#tlCounter"),
    fs: container.querySelector("#tlFs"),
    iconMax: container.querySelector("#tlIconMax"),
    iconMin: container.querySelector("#tlIconMin")
  };

  populate();
  loadPrefs();
  applyCase();
  applyTheme(el.dark.checked);
  syncUI();

  // precisa de el.area (o elemento que cresce em tela cheia)
  telaCheia = criarTelaCheia({
    area: el.area,
    aoAlternar: function (on) { syncFsUI(on); setTimeout(fit, 60); }
  });

  bind();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { if (!destroyed) fit(); });
  }

  return {
    el: container,
    destroy: function () {
      destroyed = true;
      clearTimeout(timerWord);
      clearTimeout(timerFade);
      document.removeEventListener("keydown", onKeydown);
      window.removeEventListener("resize", fit);
      telaCheia.destruir(); // listeners, fallback e tela cheia nativa
    }
  };
}
