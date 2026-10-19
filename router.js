// Roteador por hash — sem build, sem dependências.
//
// Rotas:
//   #/                        -> tela inicial (cards)
//   #/atividade/<id>          -> uma atividade do registro
//
// Cada handler devolve uma instância { el, destroy? }. O router monta o `el`
// dentro do #app e chama `destroy` ao sair (limpa timers e listeners).

var root = null;
var current = null;
var routes = [];

export function register(matcher, handler) {
  routes.push({ matcher: matcher, handler: handler });
}

function resolve(path) {
  for (var i = 0; i < routes.length; i++) {
    var r = routes[i];
    if (typeof r.matcher === "string") {
      if (path === r.matcher) return { handler: r.handler, params: {} };
    } else {
      var m = path.match(r.matcher);
      if (m) return { handler: r.handler, params: m.groups || {} };
    }
  }
  return null;
}

function currentPath() {
  return location.hash.replace(/^#/, "") || "/";
}

function render() {
  if (current && current.destroy) current.destroy();
  current = null;
  root.innerHTML = "";

  var path = currentPath();
  var match = resolve(path) || resolve("/");
  var instance = match.handler(match.params) || {};
  if (instance.el) root.appendChild(instance.el);
  current = instance;
  root.scrollTop = 0;
}

export function navigate(path) {
  if (currentPath() === path.replace(/^#/, "")) render(); // mesma rota: re-render
  else location.hash = path;
}

export function start(rootEl) {
  root = rootEl;
  window.addEventListener("hashchange", render);
  render();
}
