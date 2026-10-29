// Encontre o Intruso — 3 palavras de um tema + 1 palavra de outro tema.
//
// O filtro "Tema" escolhe o campo semântico das 3 palavras legítimas. Em
// "Todos os temas", o nível e o tema são sorteados entre combinações que
// tenham pelo menos 3 palavras no tema e outro tema com pelo menos 1 palavra.
// O intruso vem sempre de um tema diferente e do mesmo nível.

import { createQuiz } from "../quiz.js";
import { getWords, levelKeys } from "../words-data.js";
import { ICONE_INTRUSO } from "./icones.js";

var TEMAS = ["animais", "alimentos", "cores", "numerais", "cidades", "nomes",
  "verbos", "natureza", "corpo", "objetos", "emoções", "outros"];

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

function rotuloTema(tema) {
  return tema.charAt(0).toUpperCase() + tema.slice(1);
}

function opcoesTema() {
  return [{ valor: "*", texto: "Todos os temas" }].concat(
    TEMAS.map(function (t) { return { valor: t, texto: rotuloTema(t) }; })
  );
}

// Combinações nível+tema em que o tema tem 3+ palavras e existe outro tema
// com pelo menos 1 palavra no mesmo nível.
function combinacoes(nivel, temaFiltro) {
  var W = getWords();
  var niveis = nivel === "*" ? levelKeys() : [nivel];
  var saida = [];

  niveis.forEach(function (n) {
    var lvl = W[n];
    if (!lvl) return;
    var temas = Object.keys(lvl);

    temas.forEach(function (tema) {
      if (temaFiltro !== "*" && tema !== temaFiltro) return;
      if ((lvl[tema] || []).length < 3) return;

      var temOutro = temas.some(function (outro) {
        return outro !== tema && (lvl[outro] || []).length > 0;
      });
      if (temOutro) saida.push({ nivel: n, tema: tema });
    });
  });

  return saida;
}

export function createEncontreIntruso() {
  return createQuiz({
    id: "encontre-intruso",
    nome: "Encontre o Intruso",
    icone: ICONE_INTRUSO,
    bncc: ["EF03LP05"],
    filtros: [{ id: "tema", label: "Tema", padrao: "*", opcoes: opcoesTema() }],

    createQuestion: function (nivel, round, filtros) {
      round = round || {};
      var temaFiltro = (filtros && filtros.tema) || "*";
      var opcoesCombo = combinacoes(nivel, temaFiltro);

      if (!opcoesCombo.length) {
        return { erro: "Não há tema com 3 palavras e outro tema no mesmo nível." };
      }

      var combo = opcoesCombo[Math.floor(Math.random() * opcoesCombo.length)];
      var lvl = getWords()[combo.nivel];
      var legitimas = (lvl[combo.tema] || []).slice();

      if (legitimas.length < 3) {
        return { erro: "Este tema tem menos de 3 palavras neste nível." };
      }

      var tres = embaralhar(legitimas).slice(0, 3);
      var legais = {};
      tres.forEach(function (w) { legais[chave(w)] = true; });

      var outrosTemas = Object.keys(lvl).filter(function (t) {
        return t !== combo.tema && (lvl[t] || []).length > 0;
      });

      if (!outrosTemas.length) {
        return { erro: "Não há outro tema com palavras neste nível." };
      }

      var intruso = null;
      var temaIntruso = null;
      var temasEmbaralhados = embaralhar(outrosTemas);
      for (var i = 0; i < temasEmbaralhados.length && !intruso; i++) {
        var palavras = embaralhar(lvl[temasEmbaralhados[i]] || []);
        for (var j = 0; j < palavras.length; j++) {
          if (!legais[chave(palavras[j])]) {
            intruso = palavras[j];
            temaIntruso = temasEmbaralhados[i];
            break;
          }
        }
      }

      if (!intruso) {
        return { erro: "Não foi possível sortear uma palavra intrusa." };
      }

      var opcoes = embaralhar(tres.concat([intruso])).map(function (w) {
        return { html: esc(w), correct: chave(w) === chave(intruso) };
      });

      return {
        prompt: '<span class="enunciado-palavra">Qual é o intruso?</span>' +
                '<span class="enunciado-dica">Três palavras são do tema <strong>' +
                esc(rotuloTema(combo.tema)) +
                "</strong>. Qual não pertence a ele?</span>",
        options: opcoes,
        feedbackHTML: '<div class="enunciado-dica">O intruso era <strong>' +
          esc(intruso) + "</strong> (tema " + esc(rotuloTema(temaIntruso)) +
          ").</div>"
      };
    }
  });
}
