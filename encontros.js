// Encontros vocálicos — classificação de ditongo, tritongo e hiato a
// partir da divisão silábica oficial (syllables.js / Portal da Língua).
//
// Critério: a leitura ESCOLAR gráfica, com o Portal como autoridade da
// divisão:
//   - sílaba com 2 vogais           -> ditongo  (pai, bei-jo, stru, ção)
//   - sílaba com 3 vogais           -> tritongo (u-ru-guai)
//   - fronteira entre sílabas       -> hiato    (sa-ú-de, po-e-ma, ra-iz)
//     caindo entre duas vogais
//   - qualquer outro arranjo        -> nenhum   (ca-mi-sa, lin-gui-ça)
//
// Vogais que NÃO contam (letras mudas, como a escola ensina):
//   - o u de "qu": quase, qui-lo, pe-ri-qui-to (nunca tem som);
//   - o u de "gu" diante de e/i: guei-ra, guer-ra, gui-ça;
//   - o u de "gu" diante de a/o conta SÓ quando sustenta um tritongo
//     com as outras duas vogais da sílaba (u-ru-guai); em "á-gua" ele
//     é parte do onset e a palavra fica sem encontro.
//
// Uma palavra que junta tipos diferentes (ex.: ditongo + hiato) é
// "misto": fica fora do pool das questões — teria duas respostas certas.
//
// Exceções pontuais (glide de paróxina etc.) vão em EXCECOES, no mesmo
// espírito de EXCEPTIONS em syllables.js.
//
// Uso:
//   classificar("saúde")  -> "hiato"
//   analisar("uruguai")   -> { silabas: [...], ocorrencias: [{tipo, silaba, indice}] }

import { syllables } from "./syllables.js";

var VOWELS = "aeiouáéíóúâêôàãõü";

// Decisões pedagógicas pontuais ("palavra": classificação manual).
var EXCECOES = {
  // "joão": o "o" de "jo" é glide na fala (paróxina em -ão, /ʒwɐ̃w/),
  // não forma hiato com o ditongo nasal "ão".
  "joão": "nenhum"
};

// Tritongos curados — o corpus dos níveis 3–5 não tem nenhum utilizável:
// no português o tritongo é raríssimo (os exemplos dos livros didáticos
// são estes). Os nomes de países vêm de words.js como nomes próprios e
// por isso não aparecem no pool automático; "uau" é onomatopeia.
// Editável à mão; `node scripts/validar-palavras.mjs` confere a lista.
//   silabas: como a palavra se divide na leitura escolar (exibição).
export var TRITONGOS = [
  { palavra: "uruguai", proprio: true,  silabas: ["u", "ru", "guai"], encontro: 2 },
  { palavra: "paraguai", proprio: true, silabas: ["pa", "ra", "guai"], encontro: 2 },
  { palavra: "uau", proprio: false,     silabas: ["uau"], encontro: 0 }
];

export var TIPOS = ["ditongo", "tritongo", "hiato", "nenhum", "misto"];

function ehVogal(ch) {
  return VOWELS.indexOf(ch) !== -1;
}

// Vogais que contam de uma sílaba (v. cabeçalho: letras mudas de fora).
function vogais(silaba) {
  var s = silaba.toLowerCase().normalize("NFC");
  var idxs = [];
  for (var i = 0; i < s.length; i++) if (ehVogal(s[i])) idxs.push(i);

  return idxs.filter(function (idx) {
    var ch = s[idx];
    if (ch !== "u") return true;
    var prev = idx > 0 ? s[idx - 1] : "";
    if (prev === "q") return false;                      // quase, qui-lo
    if (prev === "g") {
      var next = idx + 1 < s.length ? s[idx + 1] : "";
      // diante de e/i (ou acentuadas): o u é letra muda, sempre —
      // guei-ra, guer-ra, gui-ça.
      if (next && "ei\u00e9\u00ea\u00ed".indexOf(next) !== -1) return false;
      // diante de a/o (ou no fim da sílaba): conta só se a sílaba tiver
      // 3 vogais no total (tritongo uai em u-ru-guai); em "á-gua" ele
      // é parte do onset e a palavra fica sem encontro.
      return idxs.length >= 3;
    }
    return true;
  });
}

// Ocorrências (ditongo/tritongo/hiato) da palavra, com a sílaba em que
// cada uma acontece — útil para o feedback da questão.
export function analisar(palavra) {
  var syls = syllables(palavra);
  var ocorrencias = [];

  syls.forEach(function (s, i) {
    var n = vogais(s).length;
    if (n === 2) ocorrencias.push({ tipo: "ditongo", silaba: s, indice: i });
    else if (n >= 3) ocorrencias.push({ tipo: "tritongo", silaba: s, indice: i });
  });

  // Fronteira entre sílabas caindo entre duas vogais: o Portal já decidiu
  // que são sílabas diferentes, então é hiato — inclusive o hiato tônico
  // que o algoritmo não junta ("ra-iz").
  for (var i = 0; i < syls.length - 1; i++) {
    var a = syls[i], b = syls[i + 1];
    if (ehVogal(a.charAt(a.length - 1)) && ehVogal(b.charAt(0))) {
      ocorrencias.push({ tipo: "hiato", silaba: a + "|" + b, indice: i });
    }
  }

  return { silabas: syls, ocorrencias: ocorrencias };
}

// Classificação da palavra inteira: um tipo só, "nenhum" ou "misto".
export function classificar(palavra) {
  var k = palavra.toLowerCase();
  if (EXCECOES[k]) return EXCECOES[k];
  for (var i = 0; i < TRITONGOS.length; i++) {
    if (TRITONGOS[i].palavra === k) return "tritongo";
  }

  var tipos = [];
  analisar(palavra).ocorrencias.forEach(function (o) {
    if (tipos.indexOf(o.tipo) === -1) tipos.push(o.tipo);
  });

  if (tipos.length === 0) return "nenhum";
  if (tipos.length === 1) return tipos[0];
  return "misto";
}
