// Descritores dos níveis de leitura — o professor usia para escolher o nível
// certo. O texto descreve O QUE as palavras daquele nível cobrem, sem prometer
// ano escolar (a criança progride por nível de leitura, não por idade).
//
// Baseado na distribuição real das listas em words.js (validator imprime a
// atualização — 45.002 palavras, médias 2.0 / 3.0 / 3.9 / 4.9 / 5.9 sílabas):
//   nível 1: 559 mono, 7839 di, 260 tri, 56 de 4
//   nível 2: 8453 tri, 205 de 4, 49 de 5
//   nível 3: 8298 de 4, 83 de 5, 30 de 6
//   nível 4: 8160 de 5, 57 de 6, 14 de 7
//   nível 5: 7598 de 6, 613 de 7, 49 de 8, 16 de 9, 4+ de 10
// Se as listas mudarem muito, revise estes textos.

export var LEVEL_NOTES = {
  nivel1: "Palavras curtas, do dia a dia: 1 a 2 sílabas (gato, mesa, bola).",
  nivel2: "Frases curtas: sílabas simples e sílabas com l/r (cobrinha, cadeira).",
  nivel3: "Palavras maiores: 4 sílabas, encontros consonantais (trabalho, bicicleta).",
  nivel4: "Vocabulário amplo: 5 sílabas, ditongos e acentuação (universidade, verdade).",
  nivel5: "Palavras longas e desafiantes: 6+ sílabas, prefixos e acentuação (otorrinolaringologista, interdisciplinaridade)."
};

export function noteFor(levelKey) {
  return LEVEL_NOTES[levelKey] || "";
}
