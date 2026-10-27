// Sílabas Complexas — a palavra aparece inteira e a criança escolhe onde
// ela se divide. As 2 divisões erradas são geradas pelo próprio algoritmo
// (juntar sílabas ou mover um limite 1 letra), então sempre parecem plausíveis.

import { createQuiz } from "../quiz.js";
import { syllables, wrongDivisions } from "../syllables.js";
import { wordsForLevel, isProperNoun, initialUpper } from "../words-data.js";
import { ICONE_BLOCOS } from "./icones.js";

function pickUnused(pool, round) {
  if (round.pool.length === 0) round.pool = pool.slice();
  var i = Math.floor(Math.random() * round.pool.length);
  return round.pool.splice(i, 1)[0];
}

export function createSilabasComplexas() {
  return createQuiz({
    id: "silabas-complexas",
    nome: "Sílabas em Blocos",
    icone: ICONE_BLOCOS,
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

      // Regra de exibição de nomes próprios (words-data.js): a inicial
      // maiúscula vale para TODAS as opções — certa e distratoras — para
      // a caixa não denunciar a resposta. Aplica antes do dedupe também,
      // senão "João" (palavra inteira) e "joão" virariam opções iguais.
      var show = isProperNoun(word) ? initialUpper : function (s) { return s; };
      var correctShown = show(correct);

      // Distratores: divisões plausíveis erradas; se faltarem, a palavra
      // inteira sem dividir é um erro infantil comum e plausível.
      var cands = wrongDivisions(syls).filter(function (c) { return c !== correct; });
      if (cands.length < 2) cands.push(word);
      cands = cands.map(show).filter(function (c, i, arr) { return arr.indexOf(c) === i; });
      cands = cands.filter(function (c) { return c !== correctShown; });

      var dists = [];
      while (dists.length < 2 && cands.length > 0) {
        var d = cands.splice(Math.floor(Math.random() * cands.length), 1)[0];
        if (d !== correctShown) dists.push(d);
      }

      return {
        prompt: '<span class="enunciado-palavra">' + word + "</span>" +
                '<span class="enunciado-dica">Onde a palavra se divide?</span>',
        options: [
          { html: correctShown, correct: true }
        ].concat(dists.map(function (d) {
          return { html: d, correct: false };
        }))
      };
    }
  });
}
