// Sílabas Complexas — a palavra aparece inteira e a criança escolhe onde
// ela se divide. As 2 divisões erradas são geradas pelo próprio algoritmo
// (juntar sílabas ou mover um limite 1 letra), então sempre parecem plausíveis.

import { createQuiz } from "../quiz.js";
import { syllables, wrongDivisions } from "../syllables.js";
import { wordsForLevel } from "../words-data.js";

function pickUnused(pool, round) {
  if (round.pool.length === 0) round.pool = pool.slice();
  var i = Math.floor(Math.random() * round.pool.length);
  return round.pool.splice(i, 1)[0];
}

export function createSilabasComplexas() {
  return createQuiz({
    id: "silabas-complexas",
    nome: "Sílabas em Blocos",
    icone: "🧱",
    bncc: ["EF01LP06", "EF02LP02"],

    createQuestion: function (nivel, round) {
      // Só dá pra dividir palavras com 2+ sílabas.
      var pool = wordsForLevel(nivel).filter(function (w) {
        return syllables(w).length >= 2;
      });
      if (pool.length < 3) return null; // material insuficiente para 3 opções

      var word = pickUnused(pool, round);
      var syls = syllables(word);
      var correct = syls.join("-");

      // Distratores: divisões plausíveis erradas; se faltarem, a palavra
      // inteira sem dividir é um erro infantil comum e plausível.
      var cands = wrongDivisions(syls).filter(function (c) { return c !== correct; });
      if (cands.length < 2) cands.push(word);
      cands = cands.filter(function (c, i, arr) { return arr.indexOf(c) === i; });

      var dists = [];
      while (dists.length < 2 && cands.length > 0) {
        var d = cands.splice(Math.floor(Math.random() * cands.length), 1)[0];
        if (d !== correct) dists.push(d);
      }

      return {
        prompt: '<span class="enunciado-palavra">' + word + "</span>" +
                '<span class="enunciado-dica">Onde a palavra se divide?</span>',
        options: [
          { html: correct, correct: true }
        ].concat(dists.map(function (d) {
          return { html: d, correct: false };
        }))
      };
    }
  });
}
