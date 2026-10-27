// Contar Sílabas — a palavra aparece SEM blocos (a criança conta sozinha,
// Q21a) e ela escolhe entre 4 números. Após responder, os blocos silábicos
// coloridos entram como feedback, ensinando na correção.

import { createQuiz } from "../quiz.js";
import { syllables } from "../syllables.js";
import { wordsForLevel, isProperNoun, initialUpper } from "../words-data.js";
import { ICONE_CONTAR } from "./icones.js";

function pickUnused(pool, round) {
  if (round.pool.length === 0) round.pool = pool.slice();
  var i = Math.floor(Math.random() * round.pool.length);
  return round.pool.splice(i, 1)[0];
}

// Números plausíveis em volta do certo (ex.: 4 -> 2, 3, 5, 6).
// Para 1 sílaba, oferece 2, 3, 4; para 19, oferece 18, 20, 17.
function numberOptions(correct) {
  var max = Math.max(correct + 2, 4);
  var cands = [];
  for (var n = 1; n <= max; n++) {
    if (n !== correct) cands.push(n);
  }
  // Mais próximos primeiro; sorteia entre os 2 mais próximos a cada passo
  // para as opções não ficarem sempre na mesma ordem crescente.
  cands.sort(function (a, b) { return Math.abs(a - correct) - Math.abs(b - correct); });

  var dists = [];
  while (dists.length < 3 && cands.length > 0) {
    var i = Math.floor(Math.random() * Math.min(2, cands.length));
    dists.push(cands.splice(i, 1)[0]);
  }
  return dists;
}

// Blocos coloridos por sílaba: <span class="bloco">bor</span>...
// Em nomes próprios, o primeiro bloco mantém a inicial maiúscula
// (syllables() normaliza para minúsculas — a caixa é só de exibição).
function blocksHTML(syls, word) {
  var shown = syls.map(function (s, i) {
    return (i === 0 && isProperNoun(word)) ? initialUpper(s) : s;
  });
  return '<div class="blocos" aria-hidden="true">' +
    shown.map(function (s) {
      return '<span class="bloco">' + s + "</span>";
    }).join("") +
    "</div>";
}

export function createContarSilabas() {
  return createQuiz({
    id: "contar-silabas",
    nome: "Contar Sílabas",
    icone: ICONE_CONTAR,
    bncc: ["EF03LP05"],

    createQuestion: function (nivel, round) {
      var pool = wordsForLevel(nivel);
      if (pool.length < 4) return null;

      var word = pickUnused(pool, round);
      var syls = syllables(word);
      var correct = syls.length;

      var dists = numberOptions(correct);
      if (dists.length < 3) return null; // não deve acontecer (mín. 1 sílaba)

      return {
        prompt: '<span class="enunciado-palavra">' + word + "</span>" +
                '<span class="enunciado-dica">Quantas sílabas tem?</span>',
        // Blocos só depois do clique (Q21a); a criança vê o tempo que
        // precisar — o avanço é pelo "Continuar".
        feedbackHTML: blocksHTML(syls, word),
        options: [{ html: String(correct), correct: true }].concat(
          dists.map(function (d) { return { html: String(d), correct: false }; })
        )
      };
    }
  });
}
