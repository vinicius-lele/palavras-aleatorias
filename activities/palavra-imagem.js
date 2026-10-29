// Palavra e Imagem — associação entre palavra e emoji (Q12c: a direção
// alterna a cada questão: palavra -> escolher imagem; imagem -> escolher
// palavra). Distratores são palavras reais do mesmo nível, priorizando o
// mesmo tema (Q19a). Emojis repetidos entre alternativas são filtrados.

import { createQuiz } from "../quiz.js";
import { temFigura, figuraHTML, figuraChave } from "../midia.js";
import { entriesForLevel } from "../words-data.js";
import { ICONE_IMAGEM } from "./icones.js";

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
    icone: ICONE_IMAGEM,
    bncc: ["EF15LP18", "EF12LP08"],

    createQuestion: function (nivel, round) {
      // Pool: palavras do nível que têm figura (emoji ou pictograma), dedupe.
      var entries = entriesForLevel(nivel).filter(function (e) {
        return temFigura(e.word);
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
      var correctKey = figuraChave(correctEntry.word);

      // Alterna a direção a cada questão (Q12c).
      round.palavraImagemDir = round.palavraImagemDir === "img2pal" ? "pal2img" : "img2pal";
      var img2pal = round.palavraImagemDir === "img2pal";

      // Distratores: mesmo tema primeiro; se não der, qualquer do nível.
      // Nenhum pode repetir a figura nem a palavra da resposta.
      var sameTheme = entries.filter(function (e) {
        return e.theme === correctEntry.theme && e.word !== correctEntry.word &&
               figuraChave(e.word) !== correctKey;
      });
      var anyLevel = entries.filter(function (e) {
        return e.word !== correctEntry.word && figuraChave(e.word) !== correctKey;
      });

      var dists = pickRandom(sameTheme, 3);
      if (dists.length < 3) {
        var already = {};
        dists.forEach(function (d) { already[d.word] = true; });
        var rest = anyLevel.filter(function (e) { return !already[e.word]; });
        dists = dists.concat(pickRandom(rest, 3 - dists.length));
      }

      // Última trava: figuras distintas entre si.
      var usedFigura = {};
      usedFigura[correctKey] = true;
      dists = dists.filter(function (d) {
        var fk = figuraChave(d.word);
        if (usedFigura[fk]) return false;
        usedFigura[fk] = true;
        return true;
      });
      if (dists.length < 3) return null; // pool muito pequeno após filtros

      if (img2pal) {
        return {
          prompt: '<span class="enunciado-emoji">' + figuraHTML(correctEntry.word) + '</span>' +
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
          return { html: '<span class="opcao-emoji">' + figuraHTML(d.word) + '</span>', correct: false };
        }).concat([{
          html: '<span class="opcao-emoji">' + figuraHTML(correctEntry.word) + '</span>',
          correct: true
        }])
      };
    }
  });
}
