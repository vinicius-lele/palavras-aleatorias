// Descritores dos níveis de leitura — o professor usia para escolher o nível
// certo. O texto descreve O QUE as palavras daquele nível cobrem, sem prometer
// ano escolar (a criança progride por nível de leitura, não por idade).
//
// Baseado na distribuição real das listas em words.js (validator imprime a
// atualização — 5.295 palavras, médias 2.4 / 3.0 / 3.5 / 3.8 / 4.7 sílabas):
//   nível 1: 46 mono, 410 di, 260 tri, 56 de 4
//   nível 2: 314 di, 511 tri, 205 de 4, 49 de 5
//   nível 3: 485 tri, 357 de 4, 83 de 5, 30 de 6
//   nível 4: 336 tri, 396 de 4, 218 de 5, 57 de 6, 14 de 7
//   nível 5: 371 de 4, 235 de 5, 160 de 6, 115 de 7, 43 de 8, 25 de 9+
// Se as listas mudarem muito, revise estes textos.

export var LEVEL_NOTES = {
  nivel1: "Palavras curtas, do dia a dia: 1 a 3 sílabas (gato, mesa, banana).",
  nivel2: "Frases curtas: 2 a 4 sílabas com sílabas simples (cobrinha, cadeira).",
  nivel3: "Palavras maiores: 3 a 4 sílabas com sílabas complexas (trabalho, bicicleta).",
  nivel4: "Vocabulário amplo: 3 a 6 sílabas, ditongos e encontros consonantais (universidade, verdade).",
  nivel5: "Palavras longas e desafiantes: 4 a 8+ sílabas, acentuação e prefixos (otorrinolaringologista, interdisciplinaridade)."
};

export function noteFor(levelKey) {
  return LEVEL_NOTES[levelKey] || "";
}
