// Silabificação do português — algoritmo + gerador de divisões erradas.
//
// Objetivo pedagógico: contar e dividir sílabas de palavras do ensino
// fundamental. Não é um silabificador acadêmico: usa as regras práticas
// do português (ditongos, encontros consonantais com l/r, dígrafos ch/lh/nh)
// e um mapa de exceções para as palavras que o algoritmo erra.
//
// Como usar:
//   syllables("borboleta")  -> ["bor", "bo", "le", "ta"]
//   countSyllables("mesa")  -> 2
//   wrongDivisions(["me","sa"]) -> ["mesa", "mes-a"]   (divisões plausíveis erradas)
//
// Se uma palavra do words.js sair errada, adicione-a em EXCEPTIONS abaixo:
//   "saída": ["sa", "í", "da"]

var VOWELS = "aeiouáéíóúâêôàãõü";
var STRESS = "áéíóúâêôà";      // vogais com marca de tônica: quebram ditongo
var NASAL = "ãõ";
var WEAK = "iuü";              // vogais fracas (glides)

var EXCEPTIONS = {
  // Preencher sob demanda: "palavra": ["si", "la", "ba"]
};

function isVowel(ch) {
  return VOWELS.indexOf(ch) !== -1;
}

function hasVowel(s) {
  return /[aeiouáéíóúâêôàãõü]/.test(s);
}

// Divide o word em tokens {t:"C"|"V", s:letra}. Dígrafos ch/lh/nh contam
// como UMA consoante. Acentos são preservados (marcam tônica/ditongo nasal).
function tokenize(word) {
  var w = word.toLowerCase().normalize("NFC");
  var toks = [];
  for (var i = 0; i < w.length; i++) {
    var ch = w[i];
    if (VOWELS.indexOf(ch) === -1 && !/[a-zç]/.test(ch)) continue; // ignora hífen etc.
    var two = w.substr(i, 2);
    if (two === "ch" || two === "lh" || two === "nh") {
      toks.push({ t: "C", s: two });
      i++;
      continue;
    }
    toks.push({ t: isVowel(ch) ? "V" : "C", s: ch });
  }
  return toks;
}

// Dois sons vogais formam um ditongo (mesma sílaba) quando:
//   - um é forte (a/e/o) e o outro fraco (i/u), em qualquer ordem;
//   - os dois são fracos (iu, ui — "viu", "fui");
//   - nasal + o/e (ão, ãe, õe — "pão", "mães", "pões").
// Forte + forte ("poema") e qualquer vogal acentuada ("saída", "miúdo")
// ficam em sílabas separadas.
function canMerge(a, b) {
  if (STRESS.indexOf(b) !== -1) return false;
  var last = a[a.length - 1];
  if (STRESS.indexOf(last) !== -1) return false;
  if (NASAL.indexOf(last) !== -1 && (b === "o" || b === "e")) return true;
  var lw = WEAK.indexOf(last) !== -1;
  var nw = WEAK.indexOf(b) !== -1;
  return lw !== nw || (lw && nw);
}

// Recebe as vogais de um trecho contínuo e devolve os núcleos silábicos.
function nucleiOf(vchars) {
  var out = [];
  var cur = vchars[0];
  for (var i = 1; i < vchars.length; i++) {
    if (canMerge(cur, vchars[i])) cur += vchars[i];
    else { out.push(cur); cur = vchars[i]; }
  }
  out.push(cur);
  return out;
}

// Consoantes entre dois núcleos: as que não forem onset da sílaba seguinte
// viram coda da anterior. Onset CCV quando a última letra é l/r ("pra",
// "bla", "ca-rro" com rr junto); senão, só a última consoante vai adiante
// ("cas-ca", "pas-sa", "es-tra-da").
function pickOnset(cs) {
  if (cs.length === 0) return "";
  var lastCh = cs[cs.length - 1];
  if (cs.length >= 2 && (lastCh === "l" || lastCh === "r")) return cs.slice(-2);
  return lastCh;
}

function syllablesOfTokens(toks) {
  // Agrupa tokens em runs alternados C*/V*
  var runs = [];
  var cur = null;
  toks.forEach(function (tk) {
    if (!cur || cur.t !== tk.t) {
      cur = { t: tk.t, chars: [tk.s] };
      runs.push(cur);
    } else {
      cur.chars.push(tk.s);
    }
  });

  var result = [];
  var pending = ""; // consoantes desde o último núcleo

  runs.forEach(function (run) {
    if (run.t === "C") {
      pending += run.chars.join("");
      return;
    }
    nucleiOf(run.chars).forEach(function (nuc) {
      if (result.length === 0) {
        result.push(pending + nuc); // onset inicial: todas as consoantes
      } else {
        var onset = pickOnset(pending);
        result[result.length - 1] += pending.slice(0, pending.length - onset.length);
        result.push(onset + nuc);
      }
      pending = "";
    });
  });

  if (result.length === 0) result.push(pending); // palavra sem vogal (caso raro)
  result[result.length - 1] += pending;          // consoantes finais: coda
  return result;
}

export function syllables(word) {
  var key = word.toLowerCase();
  if (EXCEPTIONS[key]) return EXCEPTIONS[key].slice();

  // Compostos com hífen ("guarda-chuva", "bem-te-vi"): o hífen força a
  // quebra, então silabifica cada parte e concatena.
  if (word.indexOf("-") !== -1) {
    var parts = [];
    word.split("-").forEach(function (chunk) {
      if (chunk) parts = parts.concat(syllables(chunk));
    });
    return parts;
  }

  return syllablesOfTokens(tokenize(word));
}

export function countSyllables(word) {
  return syllables(word).length;
}

var RHYME_VOWELS = "aeiouáéíóúâêôàãõü";

// Chave de rima: o trecho sonoro a partir da vogal tônica. Heurística
// prática do português (sem dicionário):
//   - termina em CONSOANTE (oxítona: "amor", "farol", "sal"): inclui a
//     vogal tônica -> "or", "ol", "al" (sal NÃO rima com sol);
//   - termina em VOGAL (paroxítona: "casa", "coração", "pai"): compara a
//     partir de DEPOIS da vogal tônica -> "sa", "o", "i". Assim "casa" rima
//     com "mesa" e "pai" com "lei" (assonância, como na BNCC EF12LP07),
//     mas "cabo" não rima com "copo".
// Duas palavras rimam quando as chaves são iguais.
export function rhymeKey(word) {
  var w = word.toLowerCase().normalize("NFC");
  if (w.indexOf("-") !== -1) w = w.split("-").pop(); // "bem-te-vi" -> "vi"

  var idx = [];
  for (var i = 0; i < w.length; i++) {
    if (RHYME_VOWELS.indexOf(w[i]) !== -1) idx.push(i);
  }
  if (idx.length === 0) return w;

  var endsWithVowel = RHYME_VOWELS.indexOf(w[w.length - 1]) !== -1;
  var tonic;
  if (endsWithVowel) tonic = idx.length >= 2 ? idx[idx.length - 2] : idx[0];
  else tonic = idx[idx.length - 1];

  return w.slice(endsWithVowel ? tonic + 1 : tonic);
}

export function rhyme(a, b) {
  return rhymeKey(a) === rhymeKey(b);
}

// Divisões ERRADAS plausíveis, geradas a partir da divisão correta:
//   1) junta sílabas vizinhas (erro de contagem: "borboleta" -> "borbole-ta");
//   2) move um limite em 1 letra mantendo o número de partes, desde que
//      todas as partes continuem tendo vogal ("mesa" -> "mes-a", mas
//      "m-esa" é rejeitado por "m" não ter vogal).
// Retorna o array de candidatos (pode ter 0, 1 ou vários).
export function wrongDivisions(syls) {
  var full = syls.join("");
  var correct = syls.join("-");
  var out = [];
  var seen = {};

  function push(str) {
    if (str !== correct && !seen[str]) {
      seen[str] = true;
      out.push(str);
    }
  }

  // 1) junta pares vizinhos
  for (var i = 0; i < syls.length - 1; i++) {
    var m = syls.slice();
    m.splice(i, 2, syls[i] + syls[i + 1]);
    push(m.join("-"));
  }

  // 2) move cada limite em +1 ou -1 letra
  var bounds = [];
  var acc = 0;
  for (var j = 0; j < syls.length - 1; j++) {
    acc += syls[j].length;
    bounds.push(acc);
  }

  for (var b = 0; b < bounds.length; b++) {
    [1, -1].forEach(function (d) {
      var nb = bounds[b] + d;
      if (nb <= 0 || nb >= full.length) return;
      if (b > 0 && nb <= bounds[b - 1]) return;
      if (b < bounds.length - 1 && nb >= bounds[b + 1]) return;

      var shifted = bounds.slice();
      shifted[b] = nb;
      var pieces = [];
      var prev = 0;
      shifted.forEach(function (p) {
        pieces.push(full.slice(prev, p));
        prev = p;
      });
      pieces.push(full.slice(prev));

      if (pieces.every(hasVowel)) push(pieces.join("-"));
    });
  }

  return out;
}
