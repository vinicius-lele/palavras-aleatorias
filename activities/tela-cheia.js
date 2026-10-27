// Tela cheia compartilhada pelas telas de palavra (Treino Livre e
// Palavras Desconhecidas).
//
// iPhone/iOS não implementa Fullscreen API para elementos comuns (só
// <video>): nesse caso caímos num modo simulado via CSS (classe
// `fs-fallback` no <html>, regra em styles.css), com o mesmo botão de
// saída e o mesmo `Esc`.
//
// Uso:
//   var tc = criarTelaCheia({ area: el.area, aoAlternar: function (ativo) { ... } });
//   tc.ativar();     // liga os listeners de fullscreenchange
//   el.fs.addEventListener("click", tc.alternar);
//   ...
//   tc.destruir();   // remove listeners, limpa o fallback, sai da tela cheia

export function criarTelaCheia(opcoes) {
  var area = opcoes.area;                                   // elemento que cresce
  var aoAlternar = opcoes.aoAlternar || function () {};     // recebe bool

  function elementoFs() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function emFallback() {
    return document.documentElement.classList.contains("fs-fallback");
  }

  function ativa() {
    return !!elementoFs() || emFallback();
  }

  // Toda transição (nativa ou simulada) passa por aqui: o módulo que chamou
  // sincroniza o ícone do botão e reajusta o tamanho do texto.
  function notificar() {
    aoAlternar(ativa());
  }

  function entrarFallback() {
    if (emFallback()) return;
    document.documentElement.classList.add("fs-fallback");
    notificar();
  }

  function sairFallback() {
    if (!emFallback()) return;
    document.documentElement.classList.remove("fs-fallback");
    notificar();
  }

  function sairNativa() {
    var fn = document.exitFullscreen || document.webkitExitFullscreen;
    if (!fn) { sairFallback(); return; }
    try {
      var p = fn.call(document);
      if (p && p.catch) p.catch(sairFallback); // navegador recusou: sai do simulado
    } catch (e) {
      sairFallback();
    }
  }

  function entrar() {
    var req = area.requestFullscreen || area.webkitRequestFullscreen;
    if (!req) { entrarFallback(); return; } // sem API: só o simulado resolve
    try {
      var p = req.call(area);
      // Sucesso nativo dispara fullscreenchange (que notifica); o .then
      // cobre o caso em que a promessa resolve sem evento imediato.
      if (p && p.then) p.then(notificar, entrarFallback);
      else notificar();
    } catch (e) {
      entrarFallback();
    }
  }

  function alternar() {
    if (ativa()) {
      if (elementoFs()) sairNativa();
      else sairFallback();
      return;
    }
    entrar();
  }

  function aoEvento() {
    notificar();
  }

  function ativar() {
    document.addEventListener("fullscreenchange", aoEvento);
    document.addEventListener("webkitfullscreenchange", aoEvento);
  }

  function destruir() {
    document.removeEventListener("fullscreenchange", aoEvento);
    document.removeEventListener("webkitfullscreenchange", aoEvento);
    if (emFallback()) document.documentElement.classList.remove("fs-fallback");
    if (elementoFs() && area.contains(document.activeElement)) {
      // área com foco em tela cheia nativa: tenta sair para não prender o foco
      try { sairNativa(); } catch (e) { /* noop */ }
    }
  }

  return { alternar: alternar, ativa: ativa, emFallback: emFallback, ativar: ativar, destruir: destruir };
}
