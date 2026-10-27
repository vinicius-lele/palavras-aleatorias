// Tela inicial: cabeçalho com título + modo escuro e grade de cards.
// Os cards vêm do registro de atividades (activities/registry.js).

import { ACTIVITIES } from "./activities/registry.js";
import { navigate } from "./router.js";
import { isDark, applyTheme } from "./prefs.js";

var SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
var MOON = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';
// Livro aberto em traço (o emoji 📚 dava "produto genérico").
var BOOK =
  '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" ' +
  'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M12 6.5C10 5 7.5 4.3 4.5 4.3v13.2c3 0 5.5.7 7.5 2.2 2-1.5 4.5-2.2 7.5-2.2V4.3c-3 0-5.5.7-7.5 2.2z"/>' +
  '<path d="M12 6.5v13.2"/></svg>';

function cardHTML(a) {
  var bncc = a.bncc.join(" · ");
  if (a.pronto) {
    return '<a class="card" href="#/atividade/' + a.id + '">' +
      '<span class="card-icon" aria-hidden="true">' + a.icone + '</span>' +
      '<span class="card-nome">' + a.nome + '</span>' +
      '<span class="card-desc">' + a.descricao + '</span>' +
      '<span class="card-bncc">BNCC: ' + bncc + '</span>' +
    '</a>';
  }
  return '<div class="card card-bloqueado" aria-disabled="true">' +
    '<span class="card-icon" aria-hidden="true">' + a.icone + '</span>' +
    '<span class="card-nome">' + a.nome + '</span>' +
    '<span class="card-desc">' + a.descricao + '</span>' +
    '<span class="card-em-breve">Em breve</span>' +
  '</div>';
}

export function createHome() {
  var container = document.createElement("div");
  container.className = "screen home-screen";

  container.innerHTML =
    '<header class="home-header">' +
      '<div class="home-brand">' +
        '<span class="home-logo" aria-hidden="true">' + BOOK + '</span>' +
        '<div>' +
          '<h1 class="home-titulo">Palavras Aleatórias</h1>' +
          '<p class="home-sub">Treino de leitura por níveis</p>' +
        '</div>' +
      '</div>' +
      '<div class="ctrl ctrl-switch">' +
        '<svg class="switch-glyph" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + SUN + '</svg>' +
        '<label class="switch">' +
          '<input type="checkbox" id="homeDark" aria-label="Modo escuro">' +
          '<span class="switch-track"><span class="switch-thumb"></span></span>' +
        '</label>' +
        '<svg class="switch-glyph" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + MOON + '</svg>' +
      '</div>' +
    '</header>' +

    '<main class="home-main">' +
      '<h2 class="home-sec">Escolha uma atividade</h2>' +
      '<div class="cards">' + ACTIVITIES.map(cardHTML).join("") + '</div>' +
    '</main>';

  var dark = container.querySelector("#homeDark");
  dark.checked = isDark();
  dark.addEventListener("change", function () {
    applyTheme(dark.checked);
  });

  return { el: container };
}
