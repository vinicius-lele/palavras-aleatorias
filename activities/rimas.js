// Caça-Rimas — a palavra-alvo aparece com emoji e a criança escolhe, entre
// 4 palavras, a que rima com ela (Q17). Distratores: palavras reais do mesmo
// nível que NÃO rimam com o alvo (filtradas pela chave de rima), priorizando
// o mesmo tema (Q19a). Se o nível não tiver nenhuma rima para o alvo, a
// busca cai para todos os níveis antes de desistir do alvo.

import { createQuiz } from "../quiz.js";
import { IMAGES } from "../images.js";
import { rhymeKey } from "../syllables.js";
import { entriesForLevel } from "../words-data.js";

function pickRandom(list, n) {
  var a = list.slice();
  var out = [];
  while (out.length < n && a.length > 0) {
    out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
  }
  return out;
}

// Remove palavras repetidas (o mesmo word pode aparecer em 2 níveis?
// não, mas "Todos os níveis" concatena — e protege contra duplicatas).
function dedupe(entries) {
  var seen = {};
  return entries.filter(function (e) {
    var k = e.word.toLowerCase();
    if (seen[k]) return false;
    seen[k] = true;
    return true;
  });
}

export function createRimas() {
  return createQuiz({
    id: "rimas",
    nome: "Caça-Rimas",
    icone: "🎵",
    bncc: ["EF12LP07", "EF01LP09"],

    createQuestion: function (nivel, round) {
      var entries = dedupe(entriesForLevel(nivel));
      var withImg = entries.filter(function (e) { return !!IMAGES[e.word]; });
      // Mínimo de 4 alvos para a rodada não ficar repetindo a mesma palavra.
      if (entries.length < 4 || withImg.length < 4) return null;

      // Alvos sem repetição dentro da rodada.
      if (!round.poolRimas || round.poolNivelRimas !== nivel) {
        round.poolRimas = withImg.slice();
        round.poolNivelRimas = nivel;
      }

      // Tenta até 5 alvos: some não têm nenhuma rima nas listas.
      for (var attempt = 0; attempt < 5; attempt++) {
        if (round.poolRimas.length === 0) round.poolRimas = withImg.slice();
        var target = round.poolRimas.splice(
          Math.floor(Math.random() * round.poolRimas.length), 1)[0];
        var key = rhymeKey(target.word);

        var source = entries;
        var rhymes = entries.filter(function (e) {
          return e.word !== target.word && rhymeKey(e.word) === key;
        });
        if (rhymes.length === 0) {
          source = dedupe(entriesForLevel("*"));
          rhymes = source.filter(function (e) {
            return e.word !== target.word && rhymeKey(e.word) === key;
          });
        }
        if (rhymes.length === 0) continue; // alvo sem rima em lugar nenhum

        var answer = pickRandom(rhymes, 1)[0];

        // Distratores: mesmo nível (ou a mesma fonte do fallback), que não
        // rimem com o alvo; mesmo tema primeiro.
        var nonRhyme = source.filter(function (e) {
          return e.word !== target.word && e.word !== answer.word &&
                 rhymeKey(e.word) !== key;
        });
        var sameTheme = nonRhyme.filter(function (e) {
          return e.theme === target.theme;
        });

        var dists = pickRandom(sameTheme, 3);
        if (dists.length < 3) {
          var already = {};
          dists.forEach(function (d) { already[d.word] = true; });
          var rest = nonRhyme.filter(function (e) { return !already[e.word]; });
          dists = dists.concat(pickRandom(rest, 3 - dists.length));
        }
        if (dists.length < 3) continue;

        return {
          prompt: '<span class="rimas-alvo">' +
                    '<span class="enunciado-emoji rimas-emoji" aria-hidden="true">' +
                      IMAGES[target.word] +
                    "</span>" +
                    '<span class="enunciado-palavra">' + target.word + "</span>" +
                  "</span>" +
                  '<span class="enunciado-dica">Qual palavra rima com esta?</span>',
          options: [{ html: answer.word, correct: true }].concat(
            dists.map(function (d) { return { html: d.word, correct: false }; })
          )
        };
      }

      return null; // nenhum alvo do nível tem rima disponível
    }
  });
}
