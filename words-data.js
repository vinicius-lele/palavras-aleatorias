// Acesso central às listas de palavras.
//
// words.js continua sendo um script clássico editável à mão (const WORDS = {...}).
// `const` em script clássico cria um binding global léxico (não fica em window),
// mas módulos ES compartilham o mesmo escopo global — por isso basta referenciar
// WORDS diretamente. O typeof evita ReferenceError se o arquivo não carregou.

export function getWords() {
  return typeof WORDS !== "undefined" ? WORDS : {};
}

export function levelKeys() {
  return Object.keys(getWords()).sort(function (a, b) {
    return a.localeCompare(b, undefined, { numeric: true });
  });
}

export function levelLabel(key) {
  var m = key.match(/(\d+)\s*$/);
  return m ? "Nível de leitura " + m[1] : key;
}

// Palavras de um nível ("nivel1".."nivelN") ou de todos ("*"), achatadas.
export function wordsForLevel(level) {
  var W = getWords();
  var levels = (level === "*") ? levelKeys() : [level];
  var out = [];
  levels.forEach(function (k) {
    var lvl = W[k];
    if (!lvl) return;
    Object.keys(lvl).forEach(function (t) { out = out.concat(lvl[t]); });
  });
  return out;
}

// Igual, mas mantendo o tema de cada palavra: [{ word, theme }, ...].
// Usado pelas atividades que sorteiam distratores do mesmo tema.
export function entriesForLevel(level) {
  var W = getWords();
  var levels = (level === "*") ? levelKeys() : [level];
  var out = [];
  levels.forEach(function (k) {
    var lvl = W[k];
    if (!lvl) return;
    Object.keys(lvl).forEach(function (t) {
      lvl[t].forEach(function (w) { out.push({ word: w, theme: t }); });
    });
  });
  return out;
}
