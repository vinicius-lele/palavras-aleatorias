// Encontros Vocálicos — ditongo, tritongo e hiato (BNCC EF04LP02 +
// EF03LP02). A palavra aparece com as sílabas separadas e a criança
// classifica o encontro das vogais: ditongo (duas vogais na mesma
// sílaba), tritongo (três) ou hiato (vogais em sílabas diferentes) —
// mais "Nenhum encontro", o caso de cada sílaba ficar com uma vogal só.
//
// O filtro "Conceito" muda o MIX das questões:
//   - Ditongo / Hiato: o par didático (a mesma vogal junto ou
//     separado: "beijo" × "saúde") mais um pouco de "nenhum", para a
//     resposta não virar decoração;
//   - Tritongo: tritongo + ditongo (tritongo é raro — o material vem
//     da lista curada TRITONGOS em encontros.js);
//   - Mistura: sorteia tudo.
//
// Pool: palavras dos níveis 3–5 do corpus, sem nomes próprios, sem
// compostos com hífen e de até 5 sílabas — vocabulário condizente com
// 3º ao 5º ano; palavras "misto" (ditongo E hiato na mesma palavra)
// ficam de fora porque teriam duas respostas certas.
//
// Base de classificação: encontros.js, apoiado na divisão oficial do
// Portal (syllables.js). O feedback mostra a palavra com a sílaba do
// encontro destacada.

import { createQuiz } from "../quiz.js";
import { syllables } from "../syllables.js";
import { classificar, analisar, TRITONGOS } from "../encontros.js";
import { wordsForLevel, isProperNoun, initialUpper } from "../words-data.js";
import { ICONE_ENCONTROS } from "./icones.js";

var NIVEIS = ["nivel3", "nivel4", "nivel5"];
var MAX_SILABAS = 5; // palavras muito longas distraem do encontro que interessa

var TIPOS = ["ditongo", "tritongo", "hiato", "nenhum"];

// Mix de tipos por modo (pesos). "nenhum" entra sempre: a opção certa
// não pode ser adivinhada — a criança tem que analisar cada palavra.
var MIX = {
  ditongo:  [["ditongo", 6], ["hiato", 3], ["nenhum", 2]],
  tritongo: [["tritongo", 5], ["ditongo", 3], ["nenhum", 2]],
  hiato:    [["hiato", 6], ["ditongo", 3], ["nenhum", 2]],
  mistura:  [["ditongo", 4], ["hiato", 4], ["tritongo", 1], ["nenhum", 2]]
};

var ROTULOS = {
  ditongo:  "Ditongo",
  tritongo: "Tritongo",
  hiato:    "Hiato",
  nenhum:   "Nenhum encontro"
};

var DICAS = {
  ditongo:  "duas vogais na mesma sílaba",
  tritongo: "três vogais na mesma sílaba",
  hiato:    "vogais em sílabas diferentes",
  nenhum:   "cada sílaba com uma vogal"
};

var EXPLICACOES = {
  ditongo:  "Duas vogais juntas na mesma sílaba: o som desliza de uma para a outra.",
  tritongo: "Três vogais na mesma sílaba: a do meio é fraquinha e quase some.",
  hiato:    "As vogais ficaram em sílabas diferentes: cada uma tem seu fôlego.",
  nenhum:   "Cada sílaba ficou com uma vogal só — não houve encontro."
};

// Pools por nível, calculados uma vez (classificar é barato, mas cada
// rodada consulta o pool 10 vezes).
var POOL_CACHE = {};

function ehUtil(w) {
  if (isProperNoun(w)) return false;        // nomes próprios distraem
  if (w.indexOf("-") !== -1) return false;  // compostos: muitas partes
  var n = syllables(w).length;
  return n >= 2 && n <= MAX_SILABAS;
}

function poolsDoNivel(nivel) {
  if (POOL_CACHE[nivel]) return POOL_CACHE[nivel];

  var p = { ditongo: [], hiato: [], nenhum: [] };
  wordsForLevel(nivel).forEach(function (w) {
    if (!ehUtil(w)) return;
    var t = classificar(w);
    if (t === "misto" || t === "tritongo") return; // "misto" = 2 respostas certas
    p[t].push(w);
  });
  // Tritongo: o corpus dos níveis 3–5 não tem nenhum (é raríssimo no
  // português) — a lista curada de encontros.js dá o material, nos
  // três níveis.
  p.tritongo = TRITONGOS.map(function (t) { return t.palavra; });

  POOL_CACHE[nivel] = p;
  return p;
}

function sortearTipo(modo) {
  var pesos = MIX[modo] || MIX.mistura;
  var total = 0;
  pesos.forEach(function (p) { total += p[1]; });
  var r = Math.random() * total;
  for (var i = 0; i < pesos.length; i++) {
    r -= pesos[i][1];
    if (r < 0) return pesos[i][0];
  }
  return pesos[pesos.length - 1][0];
}

// Entrada curada de TRITONGOS (encontros.js) ou null. Os curados trazem
// a divisão à mão e a sílaba do encontro — o algoritmo e o Portal não
// cobrem estes casos (nomes de países e a onomatopeia "uau").
function curadoDe(palavra) {
  for (var i = 0; i < TRITONGOS.length; i++) {
    if (TRITONGOS[i].palavra === palavra) return TRITONGOS[i];
  }
  return null;
}

function proprioDe(palavra) {
  var c = curadoDe(palavra);
  return c ? c.proprio : isProperNoun(palavra);
}

// Feedback: a palavra com as sílabas, destacando as que têm encontro.
function silabasDestacadas(info) {
  var comEncontro = {};
  info.ocorrencias.forEach(function (o) { comEncontro[o.indice] = true; });
  return info.silabas.map(function (s, i) {
    return '<span class="' + (comEncontro[i] ? "encontro-destaque" : "") + '">' +
      s + "</span>";
  }).join("");
}

export function createEncontrosVocalicos() {
  return createQuiz({
    id: "encontros-vocalicos",
    nome: "Encontros Vocálicos",
    icone: ICONE_ENCONTROS,
    bncc: ["EF04LP02", "EF03LP02"],
    niveis: NIVEIS,
    nivelPadrao: "*",
    todosLabel: "Todos (3º ao 5º)",
    filtros: [{
      id: "conceito",
      label: "Conceito",
      padrao: "mistura",
      opcoes: [
        { valor: "mistura",  texto: "Mistura (os três)" },
        { valor: "ditongo",  texto: "Ditongo" },
        { valor: "tritongo", texto: "Tritongo" },
        { valor: "hiato",    texto: "Hiato" }
      ]
    }],

    createQuestion: function (nivel, round, filtros) {
      var modo = (filtros && filtros.conceito) || "mistura";
      var pools = poolsDoNivel(nivel);

      // O quiz zera round.pool a cada rodada: usamos isso como sinal de
      // rodada nova para esquecer os pools por tipo (sem repetição até
      // esgotar cada tipo dentro da rodada).
      if (round.pool.length === 0) round.by = {};

      var tipo = null, palavra = null;
      for (var tent = 0; tent < 6 && !palavra; tent++) {
        var t = sortearTipo(modo);
        var lista = pools[t];
        if (!lista || lista.length === 0) continue;
        if (!round.by[t] || round.by[t].length === 0) round.by[t] = lista.slice();
        var i = Math.floor(Math.random() * round.by[t].length);
        palavra = round.by[t].splice(i, 1)[0];
        tipo = t;
      }
      if (!palavra) return null; // sem material: o quiz mostra o estado vazio

      round.pool.push(palavra); // marcador de questão emitida (v. acima)

      var curado = curadoDe(palavra);
      var syls = curado ? curado.silabas.slice() : syllables(palavra);
      var show = proprioDe(palavra) ? initialUpper : function (s) { return s; };

      // Ocorrências para o feedback; nos curados elas vêm da curadoria
      // (o Portal/algoritmo não cobrem esses casos).
      var info = curado
        ? { silabas: syls, ocorrencias: [{ tipo: "tritongo", silaba: syls[curado.encontro], indice: curado.encontro }] }
        : analisar(palavra);

      return {
        prompt: '<span class="enunciado-palavra">' + show(syls.join("-")) + "</span>" +
                '<span class="enunciado-dica">O que acontece com as vogais?</span>',

        // Sempre as 4 leituras: a resposta exige analisar a palavra,
        // não decorar o modo do filtro.
        options: TIPOS.map(function (t) {
          return {
            html: '<span class="opcao-nome">' + ROTULOS[t] + "</span>" +
                  '<span class="opcao-dica">' + DICAS[t] + "</span>",
            correct: t === tipo
          };
        }),

        feedbackHTML:
          '<div class="encontros-fb">' +
            '<p class="encontros-fb-titulo">' + ROTULOS[tipo] + "</p>" +
            '<div class="encontros-fb-silabas">' + silabasDestacadas(info) + "</div>" +
            '<p class="encontros-fb-texto">' + EXPLICACOES[tipo] + "</p>" +
          "</div>"
      };
    }
  });
}
