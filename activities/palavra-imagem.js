// Palavra e Imagem — associação entre palavra e emoji (Q12c: a direção
// alterna a cada questão: palavra -> escolher imagem; imagem -> escolher
// palavra). Distratores são palavras reais do mesmo nível, priorizando o
// mesmo tema (Q19a). Emojis repetidos entre alternativas são filtrados.

import { createQuiz } from "../quiz.js";
import { IMAGES } from "../images.js";
import { entriesForLevel } from "../words-data.js";

function pickRandom(list, n) {
  var a = list.slice();
  var out = [];
  while (out.length < n && a.length > 0) {
    out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
  }
  return out;
}

export function createPalavraImagem() {
  return createQuiz({
    id: "palavra-imagem",
    nome: "Palavra e Imagem",
    icone: "🖼️",
    bncc: ["EF15LP18", "EF12LP08"],

    createQuestion: function (nivel, round) {
      // Pool: palavras do nível que têm emoji (dedupe por palavra).
      var entries = entriesForLevel(nivel).filter(function (e) {
        return !!IMAGES[e.word];
      });
      var seen = {};
      entries = entries.filter(function (e) {
        var k = e.word.toLowerCase();
        if (seen[k]) return false;
        seen[k] = true;
        return true;
      });

      if (entries.length < 4) return null; // Q23a: nível com pouco material

      // Não repetir palavra dentro da mesma rodada até esgotar o pool.
      if (!round.pool || round.poolNivel !== nivel) {
        round.pool = entries.slice();
        round.poolNivel = nivel;
      }
      if (round.pool.length < 4) round.pool = entries.slice();
      var poolIdx = Math.floor(Math.random() * round.pool.length);
      var correctEntry = round.pool.splice(poolIdx, 1)[0];
      var correctEmoji = IMAGES[correctEntry.word];

      // Alterna a direção a cada questão (Q12c).
      round.palavraImagemDir = round.palavraImagemDir === "img2pal" ? "pal2img" : "img2pal";
      var img2pal = round.palavraImagemDir === "img2pal";

      // Distratores: mesmo tema primeiro; se não der, qualquer do nível.
      // Nenhum pode repetir o emoji nem a palavra da resposta.
      var sameTheme = entries.filter(function (e) {
        return e.theme === correctEntry.theme && e.word !== correctEntry.word &&
               IMAGES[e.word] !== correctEmoji;
      });
      var anyLevel = entries.filter(function (e) {
        return e.word !== correctEntry.word && IMAGES[e.word] !== correctEmoji;
      });

      var dists = pickRandom(sameTheme, 3);
      if (dists.length < 3) {
        var already = {};
        dists.forEach(function (d) { already[d.word] = true; });
        var rest = anyLevel.filter(function (e) { return !already[e.word]; });
        dists = dists.concat(pickRandom(rest, 3 - dists.length));
      }

      // Última trava: emojis distintos entre si.
      var usedEmoji = { [correctEmoji]: true };
      dists = dists.filter(function (d) {
        var em = IMAGES[d.word];
        if (usedEmoji[em]) return false;
        usedEmoji[em] = true;
        return true;
      });
      if (dists.length < 3) return null; // pool muito pequeno após filtros

      if (img2pal) {
        return {
          prompt: '<span class="enunciado-emoji">' + correctEmoji + '</span>' +
                  '<span class="enunciado-dica">Qual palavra é esta?</span>',
          options: dists.map(function (d) {
            return { html: d.word, correct: false };
          }).concat([{ html: correctEntry.word, correct: true }])
        };
      }

      return {
        prompt: '<span class="enunciado-palavra">' + correctEntry.word + '</span>' +
                '<span class="enunciado-dica">Qual é a imagem certa?</span>',
        options: dists.map(function (d) {
          return { html: '<span class="opcao-emoji">' + IMAGES[d.word] + '</span>', correct: false };
        }).concat([{
          html: '<span class="opcao-emoji">' + correctEmoji + '</span>',
          correct: true
        }])
      };
    }
  });
}
