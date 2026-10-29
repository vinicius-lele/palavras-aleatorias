// Complete a Palavra — uma sílaba é escondida e a turma escolhe a que falta.
//
// Regras:
//   - a palavra sorteada precisa ter 2+ sílabas (syllables());
//   - a lacuna é uma sílaba aleatória, exibida como "__" entre as demais;
//   - os distratores vêm primeiro das outras sílabas da própria palavra,
//     depois de sílabas de outras palavras do mesmo nível e, por fim, de um
//     banco fixo de sílabas seguras;
//   - nomes próprios mantêm a inicial maiúscula apenas na exibição.

import { createQuiz } from "../quiz.js";
import { syllables } from "../syllables.js";
import { entriesForLevel, isProperNoun, initialUpper } from "../words-data.js";
import { ICONE_COMPLETE } from "./icones.js";

var TEMAS = ["animais", "alimentos", "cores", "numerais", "cidades", "nomes",
  "verbos", "natureza", "corpo", "objetos", "emoções", "outros"];
var FALLBACK = [
  "ba", "ca", "da", "fa", "ga", "la", "ma", "pa", "ra", "sa", "ta", "va",
  "be", "ce", "de", "fe", "ge", "le", "me", "pe", "re", "se", "te", "ve",
  "bo", "co", "do", "fo", "go", "lo", "mo", "po", "ro", "so", "to", "vo",
  "bu", "cu", "du", "fu", "gu", "lu", "mu", "pu", "ru", "su", "tu", "vu"
];

function embaralhar(lista) {
  var a = lista.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function chave(s) {
  return String(s).toLowerCase().normalize("NFC");
}

function opcoesTema() {
  return [{ valor: "*", texto: "Todos os temas" }].concat(
    TEMAS.map(function (t) {
      return { valor: t, texto: t.charAt(0).toUpperCase() + t.slice(1) };
    })
  );
}

// Caixa de exibição de uma sílaba: só a primeira sílaba de nome próprio
// recebe maiúscula (syllables() normaliza para minúsculas).
function rotuloSilaba(silaba, indice, palavra) {
  return indice === 0 && isProperNoun(palavra) ? initialUpper(silaba) : silaba;
}

function palavrasDoFiltro(nivel, tema) {
  var vistos = {};
  return entriesForLevel(nivel)
    .filter(function (e) {
      if (tema !== "*" && e.theme !== tema) return false;
      var k = e.word.toLowerCase();
      if (vistos[k]) return false;
      vistos[k] = true;
      return true;
    })
    .map(function (e) { return e.word; });
}

export function createCompletePalavra() {
  return createQuiz({
    id: "complete-palavra",
    nome: "Complete a Palavra",
    icone: ICONE_COMPLETE,
    bncc: ["EF01LP02", "EF01LP11"],
    filtros: [{ id: "tema", label: "Tema", padrao: "*", opcoes: opcoesTema() }],

    createQuestion: function (nivel, round, filtros) {
      round = round || {};
      var tema = (filtros && filtros.tema) || "*";
      var chaveFiltro = nivel + "|" + tema;

      // Só entram palavras com 2+ sílabas. A lista base é montada uma vez por
      // filtro; o pool da rodada é reabastecido quando esvazia.
      if (round.completeChave !== chaveFiltro || !round.completeBase) {
        round.completeChave = chaveFiltro;
        round.completeBase = palavrasDoFiltro(nivel, tema).filter(function (w) {
          return syllables(w).length >= 2;
        });
        round.completePool = embaralhar(round.completeBase);
      }

      if (!round.completeBase.length) {
        return { erro: "Não há palavras com 2 ou mais sílabas neste filtro." };
      }
      if (!round.completePool.length) {
        round.completePool = embaralhar(round.completeBase);
      }

      var palavra = round.completePool.pop();
      var silabas = syllables(palavra);
      if (silabas.length < 2) {
        return { erro: "Não foi possível dividir a palavra sorteada em sílabas." };
      }

      var escondida = Math.floor(Math.random() * silabas.length);
      var correta = silabas[escondida];
      var corretaChave = chave(correta);
      var usados = {};
      var distratores = [];
      usados[corretaChave] = true;

      function tentar(silaba) {
        if (distratores.length >= 3) return;
        var k = chave(silaba);
        if (!k || usados[k]) return;
        usados[k] = true;
        distratores.push(silaba);
      }

      // 1) outras sílabas da própria palavra
      silabas.forEach(function (s, i) {
        if (i !== escondida) tentar(s);
      });

      // 2) sílabas de outras palavras do mesmo nível (todos os temas)
      if (distratores.length < 3) {
        if (round.completeOutrasNivel !== nivel || !round.completeOutras) {
          var vistosOutras = {};
          round.completeOutrasNivel = nivel;
          round.completeOutras = embaralhar(
            entriesForLevel(nivel).map(function (e) { return e.word; })
              .filter(function (w) {
                var k = chave(w);
                if (vistosOutras[k]) return false;
                vistosOutras[k] = true;
                return true;
              })
          );
        }

        var outras = round.completeOutras;
        for (var i = 0; i < outras.length && distratores.length < 3; i++) {
          if (chave(outras[i]) === chave(palavra)) continue;
          var partes = syllables(outras[i]);
          for (var j = 0; j < partes.length && distratores.length < 3; j++) {
            tentar(partes[j]);
          }
        }
      }

      // 3) banco fixo de segurança (sem laço infinito)
      for (var f = 0; f < FALLBACK.length && distratores.length < 3; f++) {
        tentar(FALLBACK[f]);
      }

      if (distratores.length < 3) {
        return { erro: "Não foi possível montar alternativas para esta palavra." };
      }

      var partesExibicao = silabas.map(function (s, i) {
        if (i === escondida) return '<strong class="complete-lacuna">__</strong>';
        return esc(rotuloSilaba(s, i, palavra));
      });

      var blocos = silabas.map(function (s, i) {
        return '<span class="bloco">' + esc(rotuloSilaba(s, i, palavra)) + "</span>";
      }).join("");

      var opcoes = [{
        html: esc(rotuloSilaba(correta, escondida, palavra)),
        correct: true
      }].concat(distratores.map(function (s) {
        return { html: esc(s), correct: false };
      }));

      return {
        prompt: '<span class="enunciado-palavra complete-palavra">' +
                  partesExibicao.join(" - ") +
                "</span>" +
                '<span class="enunciado-dica">Qual sílaba completa a palavra?</span>',
        options: opcoes,
        feedbackHTML: '<div class="blocos" aria-hidden="true">' + blocos + "</div>"
      };
    }
  });
}
