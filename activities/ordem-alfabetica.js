// Ordem Alfabética — 4 palavras, clique na ordem de A a Z.
//
// A ordenação usa localeCompare(pt-BR, sensitivity: "base") para que acentos
// não quebrem a ordem. O desempate (quando duas palavras empatam sem acento,
// ex.: "avo"/"avô") usa localeCompare padrão, mantendo a ordem determinística.
//
// A interação é sequencial: o quiz só libera o "Continuar" depois que as 4
// palavras forem clicadas. A ordem clicada é comparada com o gabarito.

import { createQuiz } from "../quiz.js";
import { entriesForLevel } from "../words-data.js";
import { ICONE_ORDEM } from "./icones.js";

var TEMAS = ["animais", "alimentos", "cores", "numerais", "cidades", "nomes",
  "verbos", "natureza", "corpo", "objetos", "emoções", "outros"];
var TOTAL = 4;

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

function opcoesTema() {
  return [{ valor: "*", texto: "Todos os temas" }].concat(
    TEMAS.map(function (t) {
      return { valor: t, texto: t.charAt(0).toUpperCase() + t.slice(1) };
    })
  );
}

// Ordena em pt-BR ignorando acentos/caixa. O segundo localeCompare só desempata
// palavras que a comparação "base" considera iguais.
function compararAlfabeto(a, b) {
  var c = a.localeCompare(b, "pt-BR", { sensitivity: "base" });
  return c !== 0 ? c : a.localeCompare(b, "pt-BR");
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

export function createOrdemAlfabetica() {
  return createQuiz({
    id: "ordem-alfabetica",
    nome: "Ordem Alfabética",
    icone: ICONE_ORDEM,
    bncc: ["EF01LP10", "EF02LP05"],
    filtros: [{ id: "tema", label: "Tema", padrao: "*", opcoes: opcoesTema() }],

    createQuestion: function (nivel, round, filtros) {
      round = round || {};
      var tema = (filtros && filtros.tema) || "*";
      var palavras = palavrasDoFiltro(nivel, tema);

      if (palavras.length < TOTAL) {
        return { erro: "Este filtro tem menos de 4 palavras. Escolha outro nível ou tema." };
      }

      // Pool por filtro: evita repetir as mesmas 4 palavras até esgotar.
      var chaveFiltro = nivel + "|" + tema;
      if (round.ordemChave !== chaveFiltro || !round.ordemPool ||
          round.ordemPool.length < TOTAL) {
        round.ordemChave = chaveFiltro;
        round.ordemPool = embaralhar(palavras);
      }

      var sorteadas = round.ordemPool.splice(0, TOTAL);
      var gabarito = sorteadas.slice().sort(compararAlfabeto);

      return {
        prompt: '<span class="enunciado-dica">Clique nas palavras em ordem alfabética (de A a Z).</span>',

        feedbackHTML: '<div class="ordem-gabarito">Ordem certa: <strong>' +
          gabarito.map(function (w) { return esc(w); }).join(" → ") +
          "</strong></div>",

        custom: function (host, report) {
          var cliques = [];
          var encerrado = false;
          host.textContent = "";

          function onClick(ev) {
            if (encerrado) return;
            var alvo = ev.target;
            var btn = alvo && alvo.closest ? alvo.closest(".ordem-item") : null;
            if (!btn || btn.disabled) return;

            btn.disabled = true;
            btn.classList.add("ordem-escolhida");
            btn.setAttribute("aria-pressed", "true");

            var marca = document.createElement("span");
            marca.className = "opcao-marca ordem-numero";
            marca.textContent = String(cliques.length + 1);
            marca.setAttribute("aria-hidden", "true");
            btn.appendChild(marca);

            cliques.push(btn.dataset.palavra);

            if (cliques.length < TOTAL) return;

            encerrado = true;
            var acertou = cliques.every(function (w, i) {
              return w === gabarito[i];
            });

            Array.prototype.forEach.call(
              host.querySelectorAll(".ordem-item"),
              function (b) {
                var i = cliques.indexOf(b.dataset.palavra);
                if (i !== -1) {
                  b.classList.add(b.dataset.palavra === gabarito[i]
                    ? "opcao-certa" : "opcao-errada");
                }
                b.disabled = true;
              }
            );

            report(acertou);
          }

          host.addEventListener("click", onClick);

          embaralhar(sorteadas).forEach(function (w) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "quiz-opcao ordem-item";
            b.dataset.palavra = w;
            b.textContent = w;
            host.appendChild(b);
          });

          return function () { host.removeEventListener("click", onClick); };
        }
      };
    }
  });
}
