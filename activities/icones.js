// Ícones em SVG (traço, grade 24, sem dependência): o emoji nos cards e
// no cabeçalho dava "produto genérico"; o traço único lê mais profissional
// e herda a cor do contexto via currentColor. width/height em 1em segue o
// font-size do .card-icon / .quiz-icone.
//
// Módulo separado do registry.js: os dois (registry e cada atividade)
// usam os mesmos ícones e nenhum importa o outro.

function icone(paths) {
  return '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" ' +
    'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true">' + paths + "</svg>";
}

export var ICONE_TREINO = icone(
  '<rect x="3" y="4.5" width="18" height="15" rx="2"/>' +
  '<path d="M10.2 9.3l4.8 2.7-4.8 2.7z"/>'
);

export var ICONE_BLOCOS = icone(
  '<rect x="3" y="6" width="7.5" height="12" rx="1.5"/>' +
  '<rect x="13.5" y="6" width="7.5" height="12" rx="1.5"/>' +
  '<path d="M12 4.5v15" stroke-dasharray="2.5 3"/>'
);

export var ICONE_IMAGEM = icone(
  '<rect x="3" y="4.5" width="18" height="15" rx="2"/>' +
  '<circle cx="9" cy="10" r="1.6"/>' +
  '<path d="M5.5 17l4.2-4.7 3 3 3.3-3.4 2.5 2.8"/>'
);

export var ICONE_CONTAR = icone(
  '<path d="M5.5 19.5V13"/><path d="M12 19.5V8.5"/><path d="M18.5 19.5V4.5"/>'
);

export var ICONE_ARRASTAR = icone(
  '<rect x="3" y="7.5" width="8.5" height="8.5" rx="1.5"/>' +
  '<path d="M14.5 11.75H20"/><path d="M17.5 8.75l3 3-3 3"/>'
);

export var ICONE_RIMAS = icone(
  '<path d="M9.5 17.5V6.2l9-1.9v11.3"/>' +
  '<ellipse cx="7" cy="17.7" rx="2.5" ry="2.2"/>' +
  '<ellipse cx="16" cy="15.9" rx="2.5" ry="2.2"/>'
);

// Palavras Desconhecidas: linhas de texto + lupa (procurar o sentido)
export var ICONE_DESCONHECIDAS = icone(
  '<path d="M3.5 6.5h9"/><path d="M3.5 11h6.5"/><path d="M3.5 15.5h5.5"/>' +
  '<circle cx="16.5" cy="14.5" r="4.2"/>' +
  '<path d="M19.7 17.7L22 20"/>'
);

// Encontros Vocálicos: vogais juntas (ditongo), a fronteira de sílaba
// (tracejada) e vogais separadas (hiato)
export var ICONE_ENCONTROS = icone(
  '<circle cx="4" cy="12" r="2"/>' +
  '<circle cx="8" cy="12" r="2"/>' +
  '<path d="M12.5 5.5v13" stroke-dasharray="2.5 3"/>' +
  '<circle cx="16" cy="12" r="2"/>' +
  '<circle cx="21.5" cy="12" r="2"/>'
);
