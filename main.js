// Entrypoint: registra as rotas e liga o roteador no #app do index.html.

import { start, register } from "./router.js";
import { createHome } from "./home.js";
import { byId } from "./activities/registry.js";

function createEmBreve(id) {
  var a = byId(id);
  var container = document.createElement("div");
  container.className = "screen center-screen";
  container.innerHTML =
    '<a class="btn-voltar" href="#/">← Voltar</a>' +
    '<p class="em-breve-icone" aria-hidden="true">' + (a ? a.icone : "🚧") + '</p>' +
    '<h2 class="em-breve-titulo">' + (a ? a.nome : "Atividade desconhecida") + '</h2>' +
    '<p class="em-breve-texto">Esta atividade ainda está sendo preparada. Volte em breve!</p>';
  return { el: container };
}

function createActivity(params) {
  var a = byId(params.id);
  if (!a || !a.pronto) return createEmBreve(params.id);
  return a.create();
}

register("/", createHome);
register(/^\/atividade\/(?<id>[\w-]+)$/, createActivity);

start(document.getElementById("app"));
