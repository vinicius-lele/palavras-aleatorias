// Descritores dos níveis de leitura — o professor usia para escolher o nível
// certo. O texto descreve O QUE as palavras daquele nível cobrem, sem prometer
// ano escolar (a criança progride por nível de leitura, não por idade).
//
// Baseado na distribuição real das listas em words.js:
//   nível 1: 49 monossílabas, 179 dissílabas, 17 trissílabas, 2 de 4 sílabas
//   nível 2: 2 dissílabas, 72 trissílabas, 139 de 4..., etc. (ver README)
// Se as listas mudarem muito, revise estes textos.

export var LEVEL_NOTES = {
  nivel1: "Palavras curtas, do dia a dia: 1 a 3 sílabas (gato, mesa, banana).",
  nivel2: "Frases curtas: 2 a 4 sílabas com sílabas simples (cobrinha, cadeira).",
  nivel3: "Palavras maiores: 3 a 5 sílabas com sílabas complexas (trabalho, bicicleta).",
  nivel4: "Vocabulário amplo: 4 a 6 sílabas, ditongos e encontros consonantais (universidade, verdade).",
  nivel5: "Palavras longas e desafiantes: 5+ sílabas, acentuação e prefixos (otorrinolaringologista, interdisciplinaridade)."
};

export function noteFor(levelKey) {
  return LEVEL_NOTES[levelKey] || "";
}
