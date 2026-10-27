// Palavras Desconhecidas — vocabulário de ampliação, BNCC EF35LP05
// ("inferir o sentido de palavras ou expressões desconhecidas em textos,
// com base no contexto").
//
// Formato: o do Treino Livre. As palavras incomuns de `vocabulario.js`
// passam na tela uma por vez com o significado curto embaixo, no ritmo de
// N segundos, com tela cheia, pausa e Espaço. Sem acerto/erro e sem
// seletor de nível — a habilidade é de reconhecimento/vocabulário, não de
// questão, e a lista é uma só (pool único).
//
// O que fica por conta da aula (fora da tela): o contexto e a inferência
// do sentido — aqui o papel do módulo é só a exposição à palavra nova.

import { navigate } from "../router.js";
import { LS, readPref, savePref, applyTheme } from "../prefs.js";
import { displayWord } from "../words-data.js";
import { VOCABULARIO } from "../vocabulario.js";
import { criarTelaCheia } from "./tela-cheia.js";

var FADE_MS = 160;
var MAX_PX = 150;
var HINT_DEFAULT = "PRESSIONE PLAY PARA COMEÇAR";
var HINT_EMPTY = "Nenhuma palavra no vocabulário";

var ICONS = {
  back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  stop: '<rect x="4" y="4" width="16" height="16" rx="2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  fsMax: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
  fsMin: '<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>'
};

// Mesmo cromo do Treino Livre, sem os selects de Nível/Tema (pool único).
var HTML =
  '<header class="menu">' +
    '<button class="btn-back" id="pdBack" type="button" aria-label="Voltar para a tela inicial">' + ICONS.back + '</button>' +

    '<div class="ctrl">' +
      '<label class="ctrl-label" for="pdSegundos">Segundos</label>' +
      '<select id="pdSegundos"></select>' +
    '</div>' +

    '<div class="ctrl ctrl-switch">' +
      '<span class="switch-label">Minúsculo</span>' +
      '<label class="switch">' +
        '<input type="checkbox" id="pdCase">' +
        '<span class="switch-track"><span class="switch-thumb"></span></span>' +
      '</label>' +
      '<span class="switch-label">Maiúsculo</span>' +
    '</div>' +

    '<div class="ctrl ctrl-switch">' +
      '<svg class="switch-glyph" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS.sun + '</svg>' +
      '<label class="switch">' +
        '<input type="checkbox" id="pdDark" aria-label="Modo escuro">' +
        '<span class="switch-track"><span class="switch-thumb"></span></span>' +
      '</label>' +
      '<svg class="switch-glyph" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS.moon + '</svg>' +
    '</div>' +

    '<button class="btn-play" id="pdToggle" type="button" aria-label="Iniciar">' +
      '<svg id="pdIconPlay" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + ICONS.play + '</svg>' +
      '<svg id="pdIconStop" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" hidden>' + ICONS.stop + '</svg>' +
    '</button>' +
  '</header>' +

  '<main class="palavra-area">' +
    '<div class="hint" id="pdHint">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + ICONS.play + '</svg>' +
      '<span id="pdHintText">' + HINT_DEFAULT + '</span>' +
    '</div>' +

    '<div class="word-wrap" id="pdWordWrap">' +
      '<span class="word" id="pdWord"></span>' +
      '<span class="significado" id="pdSig"></span>' +
    '</div>' +

    '<div class="counter" id="pdCounter" aria-hidden="true"></div>' +

    '<button class="btn-fs" id="pdFs" type="button" aria-label="Tela cheia">' +
      '<svg id="pdIconMax" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS.fsMax + '</svg>' +
      '<svg id="pdIconMin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" hidden>' + ICONS.fsMin + '</svg>' +
    '</button>' +
  '</main>';

export function createPalavrasDesconhecidas() {
  var el; // preenchido na Montagem, quando o container já existe

  var state = { running: false, order: [], idx: 0, last: null };
  var timerWord = null;
  var timerFade = null;
  var destroyed = false;
  var mctx = document.createElement("canvas").getContext("2d");

  function lista() {
    return VOCABULARIO || [];
  }

  function populate() {
    for (var i = 1; i <= 120; i++) {
      var o = document.createElement("option");
      o.value = String(i);
      o.textContent = String(i);
      el.seg.appendChild(o);
    }
  }

  function loadPrefs() {
    var seg = readPref(LS.seg);
    var segNum = parseInt(seg, 10);
    el.seg.value = (segNum >= 1 && segNum <= 120) ? String(segNum) : "3";
    el.cs.checked = readPref(LS.cs) === "1";
    el.dark.checked = readPref(LS.theme) === "1";
  }

  function setHidden(node, hidden) {
    if (hidden) node.setAttribute("hidden", "");
    else node.removeAttribute("hidden");
  }

  function syncUI() {
    var r = state.running;
    var empty = lista().length === 0;

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
    if (state.last !== null) {
      el.word.textContent = displayWord(state.last.palavra, el.cs.checked);
      fit();
    }
  }

  function onDarkChange() {
    applyTheme(el.dark.checked);
  }

  /* ---------- Ajuste de tamanho da palavra ---------- */

  function fit() {
    var text = el.word.textContent;
    if (!text) return;

    var avail = el.wrap.clientWidth - 4;
    // o significado fica embaixo (1-2 linhas): o campo da palavra reserva
    // essa altura para a tela não estourar em tela cheia.
    var reserva = el.sig.textContent ? el.sig.offsetHeight + 18 : 0;
    var maxPx = Math.min(MAX_PX,
      Math.floor((el.area.clientHeight - reserva) * 0.55) || 110);

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
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    // não começar a rodada repetindo a que ficou parada na tela
    if (a.length > 1 && state.last && a[0] === state.last) {
      var s = a[0];
      a[0] = a[1];
      a[1] = s;
    }
    return a;
  }

  function paint(entry, n) {
    clearTimeout(timerFade);

    var apply = function () {
      el.word.textContent = displayWord(entry.palavra, el.cs.checked);
      el.sig.textContent = entry.significado;
      el.counter.textContent = n + "/" + state.order.length;
      state.last = entry; // guarda a entrada pura; a caixa é só de exibição
      fit();
      el.word.style.opacity = "1";
      el.sig.style.opacity = "1";
    };

    if (!el.word.textContent) {
      apply();
      return;
    }

    el.word.style.opacity = "0";
    el.sig.style.opacity = "0";
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
      state.order = shuffled(lista());
      state.idx = 0;
    }
    paint(state.order[state.idx], state.idx + 1);
    arm();
  }

  function start() {
    if (state.running || el.btn.disabled) return;

    // Retomada: ciclo pausado com a entrada congelada na tela
    if (state.order.length && el.word.textContent) {
      state.running = true;
      syncUI();
      arm();
      return;
    }

    var list = lista();
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

  /* ---------- Tela cheia (controlador compartilhado, ligado na Montagem) ---------- */

  var telaCheia = null;

  function sincronizaFs(ativo) {
    setHidden(el.iconMax, ativo);
    setHidden(el.iconMin, !ativo);
    el.fs.setAttribute("aria-label", ativo ? "Sair da tela cheia" : "Tela cheia");
    setTimeout(fit, 60);
  }

  /* ---------- Eventos ---------- */

  function onKeydown(e) {
    if (e.key === "Escape" && telaCheia.emFallback()) {
      telaCheia.alternar(); // sai do fallback simulado
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

    el.seg.addEventListener("change", function () {
      savePref(LS.seg, el.seg.value);
    });
    el.cs.addEventListener("change", applyCase);
    el.dark.addEventListener("change", onDarkChange);

    document.addEventListener("keydown", onKeydown);
    window.addEventListener("resize", fit);
  }

  function goHome() {
    navigate("/");
  }

  /* ---------- Montagem ---------- */

  var container = document.createElement("div");
  container.className = "screen";
  container.innerHTML = HTML;

  el = {
    back: container.querySelector("#pdBack"),
    seg: container.querySelector("#pdSegundos"),
    cs: container.querySelector("#pdCase"),
    dark: container.querySelector("#pdDark"),
    btn: container.querySelector("#pdToggle"),
    iconPlay: container.querySelector("#pdIconPlay"),
    iconStop: container.querySelector("#pdIconStop"),
    area: container.querySelector(".palavra-area"),
    hint: container.querySelector("#pdHint"),
    hintText: container.querySelector("#pdHintText"),
    wrap: container.querySelector("#pdWordWrap"),
    word: container.querySelector("#pdWord"),
    sig: container.querySelector("#pdSig"),
    counter: container.querySelector("#pdCounter"),
    fs: container.querySelector("#pdFs"),
    iconMax: container.querySelector("#pdIconMax"),
    iconMin: container.querySelector("#pdIconMin")
  };

  populate();
  loadPrefs();
  applyCase();
  applyTheme(el.dark.checked);
  syncUI();

  // controlador precisa de el.area (elemento que cresce em tela cheia)
  telaCheia = criarTelaCheia({ area: el.area, aoAlternar: sincronizaFs });
  telaCheia.ativar();

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
      telaCheia.destruir();
      document.removeEventListener("keydown", onKeydown);
      window.removeEventListener("resize", fit);
    }
  };
}
