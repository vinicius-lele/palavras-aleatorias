(function () {
  "use strict";

  var LS = { nivel: "pa.nivel", seg: "pa.seg", cs: "pa.cs" };
  var FADE_MS = 160;
  var MAX_PX = 180;

  var el = {
    nivel: document.getElementById("selNivel"),
    seg: document.getElementById("selSegundos"),
    cs: document.getElementById("caseToggle"),
    btn: document.getElementById("btnToggle"),
    iconPlay: document.getElementById("iconPlay"),
    iconStop: document.getElementById("iconStop"),
    area: document.getElementById("palavraArea"),
    hint: document.getElementById("hint"),
    wrap: document.getElementById("wordWrap"),
    word: document.getElementById("word"),
    counter: document.getElementById("counter"),
    fs: document.getElementById("btnFs"),
    iconMax: document.getElementById("iconMax"),
    iconMin: document.getElementById("iconMin")
  };

  var state = { running: false, order: [], idx: 0, last: null };
  var timerWord = null;
  var timerFade = null;
  var mctx = document.createElement("canvas").getContext("2d");

  /* ---------- Setup ---------- */

  function levelKeys() {
    return Object.keys(WORDS).sort(function (a, b) {
      return a.localeCompare(b, undefined, { numeric: true });
    });
  }

  function levelLabel(key) {
    var m = key.match(/(\d+)\s*$/);
    return m ? "Nível " + m[1] : key;
  }

  function populate() {
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

  function loadPrefs() {
    var nivel = readPref(LS.nivel);
    var seg = readPref(LS.seg);
    var cs = readPref(LS.cs);

    if (nivel && WORDS[nivel]) el.nivel.value = nivel;
    else el.nivel.value = levelKeys()[0];

    var segNum = parseInt(seg, 10);
    el.seg.value = (segNum >= 1 && segNum <= 120) ? String(segNum) : "3";

    el.cs.checked = cs === "1";
  }

  function readPref(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function savePref(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* modo privado */ }
  }

  /* ---------- Estado da UI ---------- */

  function setHidden(node, hidden) {
    if (hidden) node.setAttribute("hidden", "");
    else node.removeAttribute("hidden");
  }

  function syncUI() {
    var r = state.running;
    el.nivel.disabled = r;
    el.seg.disabled = r;
    el.cs.disabled = r;
    setHidden(el.iconPlay, r);
    setHidden(el.iconStop, !r);
    el.btn.setAttribute("aria-label", r ? "Parar" : "Iniciar");
    setHidden(el.hint, r || el.word.textContent !== "");
  }

  function applyCase() {
    var up = el.cs.checked;
    el.word.style.textTransform = up ? "uppercase" : "lowercase";
    savePref(LS.cs, up ? "1" : "0");
    fit();
  }

  /* ---------- Ajuste de tamanho da palavra ---------- */

  function fit() {
    var text = el.word.textContent;
    if (!text) return;

    var avail = el.wrap.clientWidth - 4;
    var maxPx = Math.min(MAX_PX, Math.floor(el.area.clientHeight * 0.6) || 120);
    var mtext = el.cs.checked ? text.toUpperCase() : text.toLowerCase();

    mctx.font = '700 ' + maxPx + 'px "Atkinson Hyperlegible", sans-serif';
    var w = mctx.measureText(mtext).width;

    var size = maxPx;
    if (w > 0 && w > avail) {
      size = Math.max(20, Math.floor(maxPx * (avail / w)));
    }
    el.word.style.fontSize = size + "px";
  }

  /* ---------- Ciclo das palavras ---------- */

  function currentList() {
    return WORDS[el.nivel.value] || [];
  }

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
      el.word.textContent = text;
      el.counter.textContent = n + "/" + state.order.length;
      state.last = text;
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
    if (!state.running) return;
    state.idx++;
    if (state.idx >= state.order.length) {
      state.order = shuffled(currentList());
      state.idx = 0;
    }
    paint(state.order[state.idx], state.idx + 1);
    arm();
  }

  function start() {
    if (state.running) return;

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

  /* ---------- Tela cheia ---------- */

  function fsElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function toggleFs() {
    if (!fsElement()) {
      var req = el.area.requestFullscreen || el.area.webkitRequestFullscreen;
      if (req) req.call(el.area);
    } else {
      var exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) exit.call(document);
    }
  }

  function onFsChange() {
    var on = !!fsElement();
    setHidden(el.iconMax, on);
    setHidden(el.iconMin, !on);
    el.fs.setAttribute("aria-label", on ? "Sair da tela cheia" : "Tela cheia");
    setTimeout(fit, 60);
  }

  /* ---------- Eventos ---------- */

  el.btn.addEventListener("click", toggle);
  el.fs.addEventListener("click", toggleFs);

  el.nivel.addEventListener("change", function () {
    state.order = []; // próximo Play inicia ciclo novo no nível escolhido
    savePref(LS.nivel, el.nivel.value);
  });

  el.seg.addEventListener("change", function () {
    savePref(LS.seg, el.seg.value);
  });

  el.cs.addEventListener("change", applyCase);

  document.addEventListener("keydown", function (e) {
    if (e.code !== "Space" && e.key !== " ") return;
    var t = e.target;
    if (t && (t.tagName === "SELECT" || t.tagName === "BUTTON" ||
              t.tagName === "INPUT" || t.tagName === "A" || t.isContentEditable)) {
      return;
    }
    e.preventDefault();
    toggle();
  });

  document.addEventListener("fullscreenchange", onFsChange);
  document.addEventListener("webkitfullscreenchange", onFsChange);
  window.addEventListener("resize", fit);

  /* ---------- Início ---------- */

  populate();
  loadPrefs();
  applyCase();
  syncUI();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fit);
  }
})();
