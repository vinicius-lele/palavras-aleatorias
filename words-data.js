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

// ---------- Nomes próprios e caixa de exibição ----------
//
// Convenção dos dados: nomes próprios (pessoas) e cidades são gravados no
// words.js com a inicial MAIÚSCULA ("Maria", "João", "Maringá"); palavras
// comuns, em minúsculas. Essa inicial é a fonte da verdade da regra de
// exibição: nome próprio aparece com a primeira letra maiúscula em
// QUALQUER circunstância — inclusive no modo MINÚSCULO do Treino Livre e
// em strings derivadas de sílabas (blocos coloridos, divisões "Jo-ão").
// Para adicionar um nome novo: basta gravá-lo com maiúscula no words.js.

export function isProperNoun(word) {
  var f = word.charAt(0);
  return f !== f.toLowerCase() && f === f.toUpperCase();
}

// Inicial maiúscula numa string derivada da palavra ("jo" -> "Jo").
export function initialUpper(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Regra completa de caixa de uma palavra na tela: com `upper`, tudo em
// caixa alta (toggle MAIÚSCULO); sem `upper`, minúsculas — exceto nomes
// próprios, que mantêm a inicial ("Maria", nunca "maria").
export function displayWord(word, upper) {
  if (upper) return word.toUpperCase();
  return isProperNoun(word) ? initialUpper(word.toLowerCase()) : word.toLowerCase();
}
